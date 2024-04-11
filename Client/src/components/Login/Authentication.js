import React, { useState } from "react";
import logoImage from './../../Images/logo1.png'
import googleLogo from './../../Images/googleLogo.png'



function Authentication({ userLogin }) {

    return (
        <div className="login-content">
            <div className="login-container">
                <div className="input-wrapper">
                    <span>
                        <img src={logoImage} alt="img" width="200px" height="200px" />
                    </span>
                    <h1 className="titleHeader">Welcome back</h1>
                </div>
                <div className="input-wrapper">
                    <input className="email-input" />
                    <label class="email-label" for="email-input">Email address</label>
                </div>
                <div className="input-wrapper">
                    <input className="email-input" />
                    <label class="email-label" for="email-input">Password</label>
                </div>
                <div className="input-wrapper">
                    <button className="continueBtn" onClick={userLogin}>Continue</button>
                </div>

                <div className="sigbUpLink">Don't have an account? <span style={{ color: "#10a37f", cursor: "pointer" }}>Sign Up</span></div>
                <div className="breakLine"><label className="breakOr">OR</label></div>

                <div className="social-section">
                    <button>
                        <span>
                            <img src={googleLogo} alt="img" width="30" height="30" />
                        </span>
                        <span className="social-text">Continue with Google</span>
                    </button>
                </div>
            </div>

        </div>
    )
}

export default Authentication;

