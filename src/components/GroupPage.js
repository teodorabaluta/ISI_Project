// src/components/GroupPage.js
import React, { useState } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './GroupPage.css';

const GroupPage = () => {
  const [groupName, setGroupName] = useState(''); // Numele grupului
  const [groupPassword, setGroupPassword] = useState(''); // Parola grupului
  const [error, setError] = useState('');
  const db = getFirestore();

  const joinGroup = async () => {
    if (!groupName || !groupPassword) {
      setError('Completează toate câmpurile.');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      setError('Trebuie să fii logat pentru a te alătura unui grup.');
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

      let groupDoc = null;
      querySnapshot.forEach((docSnap) => {
        if (docSnap.data().password === groupPassword) {
          groupDoc = docSnap;
        }
      });

      if (!groupDoc) {
        setError('Parola este incorectă.');
        return;
      }

      // Actualizăm lista participants adăugând utilizatorul
      const groupRef = doc(db, 'groups', groupDoc.id);
      await updateDoc(groupRef, {
        participants: arrayUnion(user.email)
      });

      alert('Te-ai alăturat cu succes grupului!');
      setError(''); // reset error dacă a fost vreunul
      setGroupName('');
      setGroupPassword('');
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
