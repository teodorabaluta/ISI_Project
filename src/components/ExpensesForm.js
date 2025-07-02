import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';

const ExpensesForm = () => {
  const { groupId } = useParams();
  const [participants, setParticipants] = useState([]);
  const [payer, setPayer] = useState('');
  const [selected, setSelected] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!groupId) return;

    const fetchParticipants = async () => {
      try {
        const groupRef = doc(db, `groups/${groupId}`);
        const snapshot = await getDoc(groupRef);
        const data = snapshot.data();

        if (data && data.participants) {
          setParticipants(data.participants);
          setSelected(data.participants); 
        }
      } catch (err) {
        console.error("Failed to fetch group:", err.message);
        setError("Eroare la încărcarea participanților");
      }
    };

    fetchParticipants();
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !description || !payer || selected.length === 0) {
      setError("Completează toate câmpurile");
      return;
    }

    try {
      await addDoc(collection(db, `groups/${groupId}/expenses`), {
        amount: parseFloat(amount),
        description,
        payer,
        splitBetween: selected,
        timestamp: new Date(),
      });

      setAmount('');
      setDescription('');
      setPayer('');
      setSelected([]);
      setError('');
      alert('Cheltuiala a fost adăugată cu succes!');
    } catch (err) {
      setError("Eroare la salvare: " + err.message);
    }
  };

  const handleCheckbox = (email) => {
    setSelected((prev) =>
      prev.includes(email)
        ? prev.filter((p) => p !== email)
        : [...prev, email]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert">{error}</div>}

      <input
        type="text"
        placeholder="Descriere (ex: Cină în Roma)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="number"
        placeholder="Sumă (ex: 120)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <label>Plătitor:</label>
      <select value={payer} onChange={(e) => setPayer(e.target.value)}>
        <option value="">-- Alege plătitor --</option>
        {participants.map((email) => (
          <option key={email} value={email}>{email}</option>
        ))}
      </select>

      <label>Împărțit între:</label>
      <div className="checkbox-group">
        {participants.map((email) => (
          <label key={email} className="checkbox-item">
            <input
              type="checkbox"
              checked={selected.includes(email)}
              onChange={() => handleCheckbox(email)}
            />
            {email}
          </label>
        ))}
      </div>

      <button type="submit">Adaugă cheltuială</button>
    </form>
  );
};

export default ExpensesForm;