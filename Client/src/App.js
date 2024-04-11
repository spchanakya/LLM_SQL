import React, { useState } from 'react';
import './App.css';
import ChatAppContainer from './components/chatApp/chatAppContainer';
import Authentication from './components/Login/Authentication';


function App() {
  const [login, setLogin] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const userLogin = () => {
    setLogin(true)
  }

  const showLoginProfileUser = () => {
    setShowProfile(true)
    setLogin(false)
  }

  return (
    <div>
      {login ?
        <Authentication
          userLogin={showLoginProfileUser}
        /> :
        <ChatAppContainer
          userLogin={userLogin}
          showProfile={showProfile}
          showLoginProfileUser={setShowProfile}
        />}
    </div>
  );
}
export default App;
