//src/components/GroupPage.js
import React, { useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../firebase';
import './GroupPage.css';

const GroupPage = () => {
  const [groupName, setGroupName] = useState(''); // Numele grupului
  const [groupPassword, setGroupPassword] = useState(''); // Parola grupului
  const [error, setError] = useState('');
  const db = getFirestore();

  // Funcție pentru a verifica și a te alătura grupului
  const joinGroup = async () => {
    if (!groupName || !groupPassword) {
      setError('Completează toate câmpurile.');
      return;
    }

    const groupsRef = collection(db, 'groups');
    const q = query(groupsRef, where("name", "==", groupName));

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setError('Grupul nu există.');
        return;
      }

      let groupExists = false;
      querySnapshot.forEach((doc) => {
        if (doc.data().password === groupPassword) {
          alert('Te-ai alăturat cu succes grupului!');
          groupExists = true;
        }
      });

      if (!groupExists) {
        setError('Parola este incorectă.');
      }
    } catch (error) {
      console.error("Error joining group:", error);
      setError('A apărut o problemă la alăturarea la grup.');
    }
  };

  return (
    <div className="group-page">
      <h1>Alătură-te unui grup</h1>
      <div className="join-group-form">
        <input
          type="text"
          placeholder="Numele grupului"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Parola grupului"
          value={groupPassword}
          onChange={(e) => setGroupPassword(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button onClick={joinGroup}>Alătură-te grupului</button>
      </div>
    </div>
  );
};

export default GroupPage;
