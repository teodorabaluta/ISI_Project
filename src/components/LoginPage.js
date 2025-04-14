// src/components/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Folosim useNavigate
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import './LoginPage.css';
// src/components/LoginPage.js
import { auth } from '../firebase'; // Asigură-te că folosești instanța corectă de auth din firebase


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
      navigate('/profile');  // Navigăm către profil indiferent de rol
    } catch (err) {
      setError('Login invalid. Please check your credentials.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
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
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        Nu ai un cont? <a href="/register">Înregistrează-te aici</a>
      </p>
    </div>
  );
};


export default LoginPage;
