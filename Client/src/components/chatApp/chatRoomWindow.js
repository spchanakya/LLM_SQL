import React, { useState, useRef, useEffect } from "react";
import logoImage from './../../Images/logo.png'

function ChatRoomWindow({ setShowNewTab, showNewTab }) {
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [sessionId, setSessionId] = useState(0); // Initialize session id state
    const [conversationHistory, setConversationHistory] = useState([]); // State to hold conversation history

    // Ref to hold the latest session id
    const latestSessionId = useRef(0);

    useEffect(() => {
        // Fetch the initial session ID when the component mounts
        const fetchSessionId = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/setid',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userid: 1234 }),
            });

                const data = await response.json();
                if (data.sessionId) {
                    latestSessionId.current = data.sessionId; // Set the latest session ID
                    setSessionId(data.sessionId); // Update the state
                } else {
                    latestSessionId.current = 0; // If no session ID is available, set it to 0
                    setSessionId(0); // Update the state
                }
            } catch (error) {
                console.error('Error fetching session ID:', error);
            }
        };

        fetchSessionId(); // Fetch the initial session ID
    }, []); // Run this effect only once when the component mounts


    const userInputQuestion = (e) => {
        setUserInput(e.target.value)
    }

    const handleMessageSubmit = async (e) => {
        e.preventDefault();
    
        // Add existing messages to state
        setMessages(prevMessages => [...prevMessages, { role: 'user', text: userInput }]);
    
        // Add messages from conversation history to state
        conversationHistory.forEach((conversation, index) => {
            setMessages(prevMessages => [...prevMessages, { role: 'user', text: conversation.user_query }]);
            setMessages(prevMessages => [...prevMessages, { role: 'assistant', text: conversation.chatbot_response }]);
        });
    
        setShowNewTab(true);
    
        try {
            const response = await fetch('http://127.0.0.1:5000/write', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userInput, user_id: 1234, session_id: sessionId }),
            });
            const data = await response.json();
            setMessages(prevMessages => [...prevMessages, { role: 'assistant', text: data.answer }]);
    
            setSessionId(prevSessionId => {
                latestSessionId.current = prevSessionId; // Increment the session id
                return latestSessionId.current; // Update the state
            });
        } catch (error) {
            console.error('Error:', error);
        }
        setUserInput('');
    };

    useEffect(() => {
        const fetchConversationHistory = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/readhistory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userid: 1234, session_id: sessionId }),
                });
                const data = await response.json();
                setConversationHistory(data.result);
            } catch (error) {
                console.error('Error fetching conversation history:', error);
            }
        };

        fetchConversationHistory(); // Fetch conversation history when session ID changes
    }, [sessionId]); // Run this effect whenever the session ID changes

    return (
        <div className="chatRoom">
            {!showNewTab ? (
                <div className="showthe-question-answer">
                    <div className="image-icon">
                        <img src={logoImage} type="img" />
                        <h4>How can I help you today ?</h4>
                    </div>

                    <div className="default-questions">
                        <div className="question-text">
                            <p className="user-question" name="question1"> Name all the employees <br /><span className="decriptionText">and more information on them</span></p>
                            <div>
                                <span className="uparrowIcon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="icon-sm text-token-text-primary">
                                        <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div className="question-text">
                            <p className="user-question"> How many unique products are present? <br /><span className="decriptionText">variety, and quantity </span></p>
                            <div>
                                <span className="uparrowIcon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="icon-sm text-token-text-primary">
                                        <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div className="question-text">
                            <p className="user-question">How many products have a quantity of over 50?<br /> <span className="decriptionText">and other product metrics</span></p>
                            <div>
                                <span className="uparrowIcon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="icon-sm text-token-text-primary">
                                        <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div className="question-text">
                            <p className="user-question"> How many workorders? <br /><span className="decriptionText">and more details</span></p>
                            <div>
                                <span className="uparrowIcon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="icon-sm text-token-text-primary">
                                        <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="showthe-questionText-answer">
                    {messages.map((message, index) => (
                        <div key={index} className={`${message.role}-textQuestion`}>
                            <img src={logoImage} type="img" /> <span className="userName">{message.role}</span>
                            <p className="answerText">{message.text}</p>
                        </div>))}
                </div>
            )
            }

            {/* <div className="conversation-history">
                {conversationHistory.map((conversation, index) => (
                    <div key={index}>
                        <p>User: {conversation.user_query}</p>
                        <p>Chatbot: {conversation.chatbot_response}</p>
                    </div>
                ))}
            </div> */}


            <div className="chatboot-search-box">
                <textarea
                    type="text"
                    placeholder="Message Meghaai Application..."
                    className="input-box"
                    name="userQuestion"
                    onChange={userInputQuestion}
                    value={userInput}
                />

                <button className={`${userInput ? 'sent-button-disabled ' : 'sent-button-enable'}`} onClick={handleMessageSubmit} disabled={!userInput}>
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-square-fill" viewBox="0 0 16 16">
                            <path d="M2 16a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2zm6.5-4.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 1 0" />
                        </svg>
                    </span>
                </button>
            </div>

        </div>
    )
}

export default ChatRoomWindow;