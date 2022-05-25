import React, { useState, useEffect } from "react";
import LoginPage from "./components/Login";
import Main from "./Main";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const validateLogin = (
    userNameA: string,
    passowordA: string,
    showMessage?: boolean
  ) => {
    if (userNameA === "deepak" && passowordA === "Deepak@1234") {
      localStorage.setItem("isLoggedIn", btoa(userNameA + "+" + passowordA));
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
      showMessage &&
        window.alert("Invalid username and password. Please try again");
    }
  };

  const logout = () => {
    console.log("logged out");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const userNamePassword = localStorage.getItem("isLoggedIn") || "";
    try {
      let decoded = atob(userNamePassword);
      if (decoded) {
        let userName = decoded.split("+")[0];
        let password = decoded.split("+")[1];
        validateLogin(userName, password);
      }
    } catch (e) {
      console.log("UserName");
    }
  }, []);

  return (
    <>
      {!isLoggedIn ? (
        <LoginPage login={validateLogin}></LoginPage>
      ) : (
        <Main logout={logout}></Main>
      )}
    </>
  );
}

export default App;
