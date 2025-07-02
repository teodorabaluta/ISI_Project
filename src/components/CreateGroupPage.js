//src//components//CreateGroupPage.js
import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import './CreateGroupPage.css';

const CreateGroupPage = () => {
  const [groupName, setGroupName] = useState(''); 
  const [description, setDescription] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState(null); 
  const navigate = useNavigate(); 
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();


  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('Trebuie să fii autentificat pentru a crea un grup.');
      return;
    }

    if (!groupName || !description || !password) {
      setError('Te rugăm să completezi toate câmpurile.');
      return;
    }

    try {
      const token = Math.random().toString(36).substring(2, 15);
      const groupData = {
        name: groupName,
        description,
        creator: user.email,
        password,
        participants: [user.email],
        token,
      };

      await addDoc(collection(db, 'groups'), groupData);

      navigate('/profile');
    } catch (error) {
      console.error("Eroare la crearea grupului: ", error);
      setError('Eroare la crearea grupului. Încearcă din nou.');
    }
  };

  return (
    <div className="create-group-page">
      <h1>Creează grup nou</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleCreateGroup}>
        <input 
          type="text" 
          placeholder="Nume grup" 
          value={groupName} 
          onChange={(e) => setGroupName(e.target.value)} 
          required 
        />
        <textarea 
          placeholder="Descriere grup" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Parolă" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Creează</button>
      </form>
    </div>
  );
};

export default CreateGroupPage;
