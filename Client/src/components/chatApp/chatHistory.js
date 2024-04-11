import React, { useState, useEffect } from "react";
import logoImage from './../../Images/logo.png'
import profileImg from './../../Images/profile.png'
import axios from 'axios';

function ChatHistory({ userLogin, showProfile, showLoginProfileUser, setShowNewTab }) {

    const [charHistory, setCharHistory] = useState([]);
    const [conversationHistory, setConversationHistory] = useState([]);

    const [profileOpen, setprofileOpen] = useState(false)
    const [activeTab, setActiveTab] = useState(1); // State to manage active tab

    useEffect(() => {
        fetchChatHistory();
    }, []);

    const fetchChatHistory = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/readtopic', { user_id: 1234 });
            setCharHistory(response.data.result);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    const userClickSiginOut = () => {
        setprofileOpen(false)
        showLoginProfileUser(false)
    }

    const handleTabClick = async (session_id) => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/readhistory', { userid: 1234, session_id });
            // Handle the response here, for example, you can log it to console
            console.log(response.data.result);
        } catch (error) {
            console.error('Error fetching conversation history:', error);
        }
    };

    console.log("charHistory", charHistory)

    return (
        <div className="chatHistory">
            <div className="leftsideBar">
                <img src={logoImage} type="img" className="logo-image" />
                <h5 className="new-chat">New chat</h5>
                <div className="new-chat-open" onClick={() => setShowNewTab(false)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md">
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M16.7929 2.79289C18.0118 1.57394 19.9882 1.57394 21.2071 2.79289C22.4261 4.01184 22.4261 5.98815 21.2071 7.20711L12.7071 15.7071C12.5196 15.8946 12.2652 16 12 16H9C8.44772 16 8 15.5523 8 15V12C8 11.7348 8.10536 11.4804 8.29289 11.2929L16.7929 2.79289ZM19.7929 4.20711C19.355 3.7692 18.645 3.7692 18.2071 4.2071L10 12.4142V14H11.5858L19.7929 5.79289C20.2308 5.35499 20.2308 4.64501 19.7929 4.20711ZM6 5C5.44772 5 5 5.44771 5 6V18C5 18.5523 5.44772 19 6 19H18C18.5523 19 19 18.5523 19 18V14C19 13.4477 19.4477 13 20 13C20.5523 13 21 13.4477 21 14V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6C3 4.34314 4.34315 3 6 3H10C10.5523 3 11 3.44771 11 4C11 4.55228 10.5523 5 10 5H6Z" fill="currentColor">
                        </path>
                    </svg>
                </div>
            </div>
            <div className="chat-history-data" style={showProfile ? { height: "600px" } : {}}>
                {showProfile && <div>
                    {charHistory.map((item, index) => {
                        return (
                            <div className={activeTab === item.id ? "history-question-active" : 'history-question'} onClick={() => handleTabClick(item.id)}>{item.name}</div>
                        )
                    })}
                </div>}
            </div>
            
            {/* {conversationHistory.length > 0 && (
                <div className="conversation-history">
                    <h3>Conversation History</h3>
                    {conversationHistory.map((conversation, index) => (
                        <div key={index}>
                            <p>User: {conversation.user_query}</p>
                            <p>Chatbot: {conversation.chatbot_response}</p>
                        </div>
                    ))}
                </div>
            )} */}


            <div>
                <div className="profile-siginUp-Login" style={showProfile ? { height: "80px" } : {}} >
                    {showProfile ?
                        <div className="userProfile" onClick={() => setprofileOpen((prev) => !prev)}>
                            <img src={profileImg} alt="background" className="userProfileImg" />
                            <p className="loginUserName">Admin</p>
                        </div>
                        :
                        <div className="loginBtns">
                            <h4 className="title">Sign up or log in</h4>
                            <p className="alertDescription">Save your chat history, share chats, and personalize your experience.</p>
                            <button type="button" className="signInBtn" onClick={userLogin} >Sign up</button>
                            <button type="button" className="loginBtn" onClick={userLogin} >Log in</button>
                        </div>
                    }
                </div>
            </div>

            {profileOpen &&
                <div className="dropdown-content" >
                    <div className="customizeChat">
                        <span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md">
                                <path d="M10.663 6.3872C10.8152 6.29068 11 6.40984 11 6.59007V8C11 8.55229 11.4477 9 12 9C12.5523 9 13 8.55229 13 8V6.59007C13 6.40984 13.1848 6.29068 13.337 6.3872C14.036 6.83047 14.5 7.61105 14.5 8.5C14.5 9.53284 13.8737 10.4194 12.9801 10.8006C12.9932 10.865 13 10.9317 13 11V13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13V11C11 10.9317 11.0068 10.865 11.0199 10.8006C10.1263 10.4194 9.5 9.53284 9.5 8.5C9.5 7.61105 9.96397 6.83047 10.663 6.3872Z" fill="currentColor"></path>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M4 5V19C4 20.6569 5.34315 22 7 22H19C19.3346 22 19.6471 21.8326 19.8325 21.5541C20.0179 21.2755 20.0517 20.9227 19.9225 20.614C19.4458 19.4747 19.4458 18.5253 19.9225 17.386C19.9737 17.2637 20 17.1325 20 17V3C20 2.44772 19.5523 2 19 2H7C5.34315 2 4 3.34315 4 5ZM6 5C6 4.44772 6.44772 4 7 4H18V16H7C6.64936 16 6.31278 16.0602 6 16.1707V5ZM7 18H17.657C17.5343 18.6699 17.5343 19.3301 17.657 20H7C6.44772 20 6 19.5523 6 19C6 18.4477 6.44772 18 7 18Z" fill="currentColor"></path>
                            </svg>
                        </span>
                        <span style={{ marginLeft: "10px", color: "gray" }}>Customize MeghaAI</span>
                    </div>
                    <div className="Settingss">
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
                            </svg>
                        </span>
                        <span style={{ marginLeft: "10px", color: "gray" }}>Settings</span>
                    </div>
                    <hr />
                    <div className="logOut" onClick={userClickSiginOut}>
                        <span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-md">
                                <path d="M11 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H11" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                                <path d="M20 12H11M20 12L16 16M20 12L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
                        </span>

                        <span style={{ marginLeft: "10px", color: "gray" }}>Log Out</span>
                    </div>
                </div>}

        </div>
    )
}

export default ChatHistory;