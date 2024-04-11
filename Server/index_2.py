from langchain.agents import create_sql_agent
from langchain.agents.agent_types import AgentType
from langchain.sql_database import SQLDatabase
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_openai import AzureChatOpenAI
from langchain.prompts.chat import ChatPromptTemplate
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin


import os
import json
from datetime import datetime
import psycopg2
from psycopg2 import sql
import time
import re
# get the names of tables in the database
def get_mes_tables(db_path):
    db = SQLDatabase.from_uri(db_path, sample_rows_in_table_info=8)
    tables = db.get_usable_table_names()
    return tables

# get the schem of the database
def get_mes_schema(db_path):
    db = SQLDatabase.from_uri(db_path, sample_rows_in_table_info=8)
    tables = db.get_usable_table_names()
    history_tables= ['conversations','users','queries_log']
    tables_final=[item for item in tables if item not in history_tables]
    schema = db.get_table_info_no_throw(tables_final)
    return schema

# get sql_query and table used in query 
def get_sql_query(step,tables): 
    inter_step = str(step[0][0])
    pattern = r'tool_input=(["\'])(.*?)\1'
    match = re.search(pattern, inter_step)
    if match:
        sql_query = match.group(2) 
    sql_query_lower = sql_query.lower()
    tables_in_query = []
    for table in tables:
        if table.lower() in sql_query_lower:
            tables_in_query.append(table)
    return sql_query,tables_in_query

# get the session_id and conv_id for the specific backend call
def get_data(user_id,new_session_flag):
    conn = psycopg2.connect(database="postgres", user='postgres', password='BatBoy124', host='127.0.0.1', port= '5432')
    cur=conn.cursor()
    cur.execute("SELECT session_data FROM Users WHERE user_id = %s", (user_id,))
    rows = cur.fetchall()
    rows = list(rows[0][0])
    length=len(rows)
    if new_session_flag > length:
        rows.append(1)
        session_data_json = json.dumps(rows)
        update_query = "UPDATE users SET session_data = %s WHERE user_id = %s"
        cur.execute(update_query, (session_data_json, user_id))
        session_id = length+1
        conv_id=1
    else :
        rows[new_session_flag-1]= rows[new_session_flag-1]+1
        session_data_json = json.dumps(rows)
        update_query = "UPDATE users SET session_data = %s WHERE user_id = %s"
        cur.execute(update_query, (session_data_json, user_id))
        session_id=new_session_flag
        conv_id=rows[new_session_flag-1]
    conn.commit()
    cur.close()
    conn.close()
    return session_id,conv_id
# furntion to insert data into the database 
def insert_data(user_id,session_id,conv_id,user_input,LLM_answer,sql_query,tables_used,response,execution_time): 
    conn = psycopg2.connect(database="postgres", user='postgres', password='BatBoy124', host='127.0.0.1', port= '5432')
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    cur = conn.cursor()
    try:
        insert_query_1 = sql.SQL("INSERT INTO conversations VALUES (%s, %s,%s, %s,%s, %s,%s)")
        data_to_insert_1 = (user_id, current_time,conv_id,session_id,user_input,LLM_answer,response)
        cur.execute(insert_query_1, data_to_insert_1)
        insert_query_2 = sql.SQL("INSERT INTO queries_log ( conversation_id,session_id ,execution_time,sql_query,tables_used) VALUES (%s, %s, %s,%s,%s)")
        data_to_insert_2 = (conv_id, session_id,execution_time,sql_query,tables_used)
        cur.execute(insert_query_2, data_to_insert_2)
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"An error occurred: {e}")
    finally:
        cur.close()
        conn.close()


def writedata(user_input,user_id,session_id_flag):
    start_time=time.time()

    with open('prompt.json', 'r') as file:
         credentials = json.load(file)
    prompt1 = credentials['p1']
    prompt2 = credentials['p2']
    prompt3 = credentials['p3']
    

    # Load environment variables
    Cred_path = os.getcwd() + "/Config.env"
    load_dotenv(Cred_path)
    db_path = os.getenv("DB_PATH")

    schema = get_mes_schema(db_path)
    tables =get_mes_tables(db_path)

    # Retrieve environment variables
    
    deployment_name = os.getenv("AZURE_DEPLOYMENT_NAME")
    model_name = os.getenv("AZURE_MODEL_NAME")
    temperature = float(os.getenv("AZURE_TEMPERATURE"))  # Assuming temperature needs to be a float
    api_key = os.getenv("AZURE_API_KEY")
    api_version = os.getenv("AZURE_API_VERSION")
    azure_endpoint = os.getenv("AZURE_ENDPOINT")
    db = SQLDatabase.from_uri(db_path, sample_rows_in_table_info=8)

    llm = AzureChatOpenAI(
    deployment_name=deployment_name,
    model_name=model_name,
    temperature=temperature,
    api_key=api_key,
    api_version=api_version,
    azure_endpoint=azure_endpoint
    )

    toolkit = SQLDatabaseToolkit(db=db, llm=llm)

    db_agent = create_sql_agent(
        llm=llm,
        # db=db,
        toolkit=toolkit,
        agent_executor_kwargs={"return_intermediate_steps": True},
        verbose=False,
        agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION
        
    )
    
    final_prompt = prompt1 + schema + prompt2 + prompt3

    prompt_template = ChatPromptTemplate.from_messages(
        [
            ("system", final_prompt),
            ("user", "{query}\n Question: "),
        ]
    )
    try:
        result = db_agent.invoke(prompt_template.format(query=user_input))
        end_time=time.time()
        execution_time = end_time-start_time
        inter = result['intermediate_steps']
        # print(inter)
        sql_query,tables_used=get_sql_query(inter,tables)
        output=result['output']
        response_flag=True
        session_id,conv_id = get_data(user_id,session_id_flag)
        insert_data(user_id,session_id,conv_id,user_input,output,sql_query,tables_used,response_flag,execution_time)

    except ValueError as e:
        response = str(e)
        response = response.removeprefix("An output parsing error occurred. In order to pass this error back to the agent and have it try again, pass `handle_parsing_errors=True` to the AgentExecutor. This is the error: Could not parse LLM output: `")
        response = response.removesuffix("`")
        response_flag=False
        output = response
    
    return output

def session_specific_history(user_id, session_id):
    conn = psycopg2.connect(database="postgres", user='postgres', password='BatBoy124', host='127.0.0.1', port='5432')
    cur = conn.cursor()
    cur.execute("SELECT user_query, chatbot_response FROM conversations WHERE user_id = %s AND session_id = %s ORDER BY conversation_id DESC LIMIT 10", (user_id, session_id))
    rows = cur.fetchall()
    history = []
    for row in rows:
        history.append({'user_query': row[0], 'chatbot_response': row[1]})
    conn.commit()
    cur.close()
    conn.close()
    return history

def transform_list(input_list):
    # Transforming the input list into the specified format
    transformed_list = [
        {"id": item[2], "name": item[0], "timestamp": item[1]} for item in input_list
    ]
    return transformed_list

def session_topic_history(user_id):
    conn = psycopg2.connect(database="postgres", user='postgres', password='BatBoy124', host='127.0.0.1', port= '5432')
    cur=conn.cursor()
    cur.execute("SELECT user_query,timestamp,session_id FROM conversations WHERE user_id = %s and conversation_id = %s ORDER BY session_id DESC LIMIT 10", (user_id,1))
    Topics = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()

    return transform_list(Topics)

def get_sess_id(user_id):
    conn = psycopg2.connect(database="postgres", user='postgres', password='BatBoy124', host='127.0.0.1', port= '5432')
    cur=conn.cursor()
    cur.execute("SELECT session_id FROM conversations WHERE user_id = %s and conversation_id = %s ORDER BY session_id DESC LIMIT 1", (user_id,1))
    session_id = cur.fetchall()
    conn.commit()
    cur.close()
    conn.close()
    sess_id = [session[0] for session in session_id]

    return sess_id[0]+1


app = Flask(__name__)
CORS(app) 
@app.route('/write', methods=['POST'])
@cross_origin() 
def write():
    data = request.get_json()
    input_string = data['message']
    user_id = data['user_id']
    sessions_id= data['session_id']
    print("i am printing these things")
    print(input_string)
    print(user_id)
    print(sessions_id)
    output_string = writedata(input_string, user_id,sessions_id)
    print("Type of the output string in api:",output_string)
    answer = [
        {
        'output': output_string
    }
    ]
    print("The type of the answer file is:",answer)
    print("type of this file is:",jsonify({"output":output_string}) )
    return jsonify({'answer': output_string})

@app.route('/readtopic', methods=['POST'])
def readtopic():
    data = request.json 
    user_id =data['user_id']
    Topic_history = session_topic_history(user_id)
    print(Topic_history)
    return jsonify({'result': Topic_history})

@app.route('/readhistory', methods=['POST'])
def readhistory():
    data = request.json 
    user_id =data['userid']
    session_id=data['session_id']
    Session_history = session_specific_history(user_id,session_id)
    print(Session_history)
    return jsonify({'result': Session_history})

@app.route('/setid', methods=['POST'])
def setid():
    data = request.json 
    user_id =data['userid']
    print(user_id)
    print(type(user_id))
    session_id = get_sess_id(user_id)
    return jsonify({'sessionId': session_id})


if __name__ == '__main__':
    app.run(debug=True)

    

    
