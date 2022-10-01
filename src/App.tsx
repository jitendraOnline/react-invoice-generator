import React, { useState } from "react";
import LoginPage from "./components/Login";
import Main from "./Main";

import {
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import SignUp from "./components/SignUp";
import { auth } from "./storage/serverOperation";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showScreen, setShowScreen] = useState("login");

  const validateLogin = (
    userNameA: string,
    passowordA: string,
    showMessage?: boolean
  ) => {
    signInWithEmailAndPassword(auth, userNameA, passowordA)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(userCredential, userCredential.user);
        setIsLoggedIn(true);
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        alert("Invalid username and password !");
      });
  };

  const logout = () => {
    console.log("logged out");
    localStorage.clear();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("is signout");
        setIsLoggedIn(false);
      })
      .catch((error) => {
        console.log("is error ", error);
      });
  };
  // const auth = getAuth(app);
  auth.onAuthStateChanged((authenticated) => {
    setIsLoggedIn(!!authenticated);
  });

  return (
    <>
      {!isLoggedIn ? (
        showScreen === "login" ? (
          <LoginPage
            login={validateLogin}
            setShowScreen={setShowScreen}
          ></LoginPage>
        ) : (
          // <SignUp></SignUp>
          null
        )
      ) : (
        <Main logout={logout}></Main>
      )}
    </>
  );
}

export default App;
