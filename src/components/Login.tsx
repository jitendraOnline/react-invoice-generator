import React, { FC, useState } from "react";
import { companyName } from "../data/initialData";

interface Props {
  className?: string;
  login?: any;
  googleSignIn?: any;
  setShowScreen?: any;
}

const LoginPage: FC<Props> = ({ login, googleSignIn, setShowScreen }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const loginHandle = () => {
    login(userName, password, true);
  };
  const SignInWithGoole = () => {
    googleSignIn();
  };

  return (
    <>
      <div className="loginPage">
        <div className="loginMessage"></div>
        <div className="loginForm">
          <h1>{companyName}</h1>
          <input
            type="text"
            onChange={(event) => {
              setUserName(event.target.value);
            }}
          ></input>
          <input
            type="password"
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          ></input>
          <button className="btn" onClick={loginHandle}>
            Login
          </button>

          {/* <button className="btn" onClick={() => setShowScreen("signUp")}>
            Sign Up
          </button> */}
        </div>
      </div>
    </>
  );
};

export default LoginPage;
