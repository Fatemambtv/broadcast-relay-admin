import React, { useEffect, useState } from "react";
import { onValue, ref, set } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import "./Login.css";
import { db, Realtimedb } from "./util/firebase";

function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
      const loggedInUsersRef = ref(Realtimedb, "loggedInUsers");
      onValue(loggedInUsersRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data["admin"] && data["admin"].login_status) {
            setIsAlreadyLoggedIn(true);
        }
      });
    }, [username]);

    const updateLoginStatus = (username, isLoggedIn, user) => {
        set(ref(Realtimedb, `loggedInUsers/${username}/login_status`), isLoggedIn);
        set(ref(Realtimedb, `loggedInUsers/${username}/login_time`), new Date().toLocaleString());
        set(ref(Realtimedb, `loggedInUsers/${username}/name`), user.name);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError("Please enter a username and password.");
            return;
        }

        if (username !== "admin") {
            setError("Unauthorized user. Please contact admin.");
            return;
        }

        setError("Logging in...");

        if (isAlreadyLoggedIn) {
            setError("Only 1 login allowed per user. Please logout from other device and refresh.");
        } else {
            const docRef = doc(db, "users", username);
            getDoc(docRef)
                .then((docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.password === password) {
                            onLogin(username);
                            updateLoginStatus(username, true, data);
                        } else {
                            setError("Invalid password.");
                        }
                    } else {
                        setError("No such user exists.");
                    }
                })
                .catch((error) => {
                    console.error("Error getting document:", error);
                });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login">
            <img 
                src="https://img.icons8.com/fluency/96/000000/broadcast.png" 
                alt="Broadcast Relay Logo" 
                className="login-logo"
            />
            <h1>Broadcast Relay Admin</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-field">
                    <label htmlFor="username">Username</label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            id="username"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="password-field">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button 
                            type="button" 
                            className="toggle-password-btn"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>
                <button type="submit">Login</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <div className="login-footer">
                <p>© 2023 Broadcast Relay System</p>
            </div>
        </div>
    );
}

export default Login;
