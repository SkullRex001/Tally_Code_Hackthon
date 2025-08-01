import React from 'react'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  SignUpButton,
  useUser,
} from '@clerk/clerk-react';
import './Signup.css'; 
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const { user } = useUser();
    const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/projects');
  };

  return (
    <div className="signup-container">
      <h1 className="heading">Welcome To <span>SpiderScripters</span> IDE 🕷️🕸️</h1>

      <SignedOut>
        <div className="auth-buttons">
          <SignInButton mode="modal" forceRedirectUrl={"/projects"}>
            <button className="btn">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl={"/projects"}>
            <button className="btn">Sign Up</button>
          </SignUpButton>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="signed-in-info">
          <p>Hello, <strong>{user?.firstName}</strong></p>
          <div className="signed-in-buttons">
            <UserButton />
            <SignOutButton>
              <button className="btn logout">Sign Out</button>
            </SignOutButton>
            <button className='btn' onClick={handleRedirect}>Projects</button>
          </div>
        </div>
      </SignedIn>
    </div>
  )
}

export default Signup;
