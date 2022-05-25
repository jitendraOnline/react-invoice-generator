import React, { FC, useState } from 'react'

interface Props {
  className?: string
  login?: any
}

const LoginPage: FC<Props> = ({ login }) => {
  const [userName,setUserName] = useState('');
  const [password,setPassword] = useState('');

  const loginHandle= ()=> {
    login(userName,password,true)
  }

  return (
    <>
    <div className='loginPage'>
      <div className='loginMessage'>

      </div>
      <div className='loginForm'>
        <h1>OM SAI KRISHI SEVA KENDRA</h1>
          <input type='text' onChange={(event)=>{setUserName(event.target.value)}}>
          </input>
          <input type='password' onChange={(event)=>{setPassword(event.target.value)}}>
          </input>
          <button className='btn' onClick={loginHandle}>
            Login
          </button>
      </div>
    </div>
    </>
  )
}

export default LoginPage
