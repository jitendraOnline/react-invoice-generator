import React, { FC } from 'react'

interface Props {
  className?: string
  pdfMode?: boolean
}

const LoginPage: FC<Props> = ({ className, pdfMode, children }) => {
  return (
    <>
    <div>Login Page</div>
    </>
  )
}

export default LoginPage
