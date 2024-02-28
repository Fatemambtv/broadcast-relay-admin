import React, { useEffect, useState } from "react";
import { onValue, ref, set } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import "./Login.css";
import { db, Realtimedb } from "./util/firebase";

function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isAlreadyLoggedIn, setIsAlreadyLoggedIn] = useState(false);

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
        set(ref(Realtimedb, `loggedInUsers/${username}/login_status`), isLoggedIn)
        set(ref(Realtimedb, `loggedInUsers/${username}/login_time`), new Date().toLocaleString())
        set(ref(Realtimedb, `loggedInUsers/${username}/name`), user.name)
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username || !password) {
            const loginError = document.getElementById("login-error");
            loginError.innerHTML = "Please enter a username and password.";
            return;
        }

        if (username !== "admin") {
            const loginError = document.getElementById("login-error");
            loginError.innerHTML = "Unauthorized user. Please contact admin.";
            return;
        }

        const loginError = document.getElementById("login-error");
        loginError.innerHTML = "Logging in...";

        if (isAlreadyLoggedIn) {
            loginError.innerHTML = "Only 1 login allowed per user. Please logout from other device and refresh.";
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
                            loginError.innerHTML = "Invalid password.";
                        }
                    } else {
                        loginError.innerHTML = "No such user exists.";
                    }
                })
                .catch((error) => {
                    console.error("Error getting document:", error);
                });
        }
    };

    return (
        <div className="login">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
            <p id="login-error" className="error-message"></p>
        </div>
      );
}
export default Login;
