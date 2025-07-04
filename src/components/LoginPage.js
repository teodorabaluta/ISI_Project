// src/components/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Folosim useNavigate
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import './LoginPage.css';

import { auth } from '../firebase'; 


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/profile'); 
    } catch (err) {
      setError('Login invalid. Please check your credentials.');
    }
  };

  return (
    <div className="login-page">
      <h2 className="login-title"></h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Parolă:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Conectează-te</button>
      </form>
      <p>
        Nu ai un cont? <a href="/register">Înregistrează-te aici</a>
      </p>
    </div>
  );
  
};


export default LoginPage;
