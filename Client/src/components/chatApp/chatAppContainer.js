import React, { useState } from "react";
import ChatHistory from "./chatHistory";
import ChatWindow from "./chatRoomWindow";

function ChatAppContainer({ userLogin, showProfile, showLoginProfileUser }) {

    const [showNewTab, setShowNewTab] = useState(false)

    return (
        <div className="meghaiChat">
            <ChatHistory
                userLogin={userLogin}
                showProfile={showProfile}
                showLoginProfileUser={showLoginProfileUser}
                setShowNewTab={setShowNewTab}
                showNewTab={showNewTab}
            />
            <ChatWindow
                setShowNewTab={setShowNewTab}
                showNewTab={showNewTab}
            />
        </div>
    )

}

export default ChatAppContainer;