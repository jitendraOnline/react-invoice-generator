import React, { FC, useState } from "react";
import { companyName } from "../data/initialData";

import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

interface Props {
  className?: string;
  login?: any;
  googleSignIn?: any;
}

const SignUp: FC<Props> = ({ login, googleSignIn }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const loginHandle = () => {
    createUserWithEmailAndPassword(auth, userName, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
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
          <button className="btn" style={{border:'1px solid blue'}} onClick={loginHandle}>
            Sign Up
          </button>
        </div>
      </div>
    </>
  );
};

export default SignUp;
