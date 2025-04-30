import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';

import { getAuth } from 'firebase/auth'; // ✅ pentru autentificare

const ExpensesList = () => {
  const { groupId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const currentUser = auth.currentUser?.email?.trim().toLowerCase();


  useEffect(() => {
    if (!groupId) return;

    const q = query(collection(db, `groups/${groupId}/expenses`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(fetched);
      setLoading(false);
    }, (error) => {
      console.error('Eroare la citirea cheltuielilor:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [groupId]);

  const totalGrup = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const totalMe = expenses.reduce((acc, expense) => {
    const payer = normalize(expense.payer);
    const split = expense.splitBetween?.map(normalize) || [];
    const isUserInSplit = split.includes(currentUser);
    const isPayer = payer === currentUser;
    const people = split.length || 1;
    const share = (parseFloat(expense.amount) || 0) / people;

    return isUserInSplit && !isPayer ? acc + share : acc;
  }, 0);

  return (
    <div className="expenses-list">
      <h2>Cheltuieli Grup</h2>

      {loading ? (
        <p>Se încarcă...</p>
      ) : expenses.length === 0 ? (
        <p>Nu există cheltuieli înregistrate.</p>
      ) : (
        <>
          <ul>
            {expenses.map((expense) => {
              const payer = normalize(expense.payer);
              const split = expense.splitBetween?.map(normalize) || [];
              const isUserInSplit = split.includes(currentUser);
              const isPayer = payer === currentUser;
              const people = split.length || 1;
              const share = (parseFloat(expense.amount) || 0) / people;

              return (
                <li key={expense.id} style={{ marginBottom: '1rem' }}>
                  <strong>{expense.description}</strong><br />
                  💸 {expense.amount} RON<br />
                  👤 Plătitor: {expense.payer}<br />
                  👥 Împărțit cu: {expense.splitBetween?.join(', ')}
                  {isUserInSplit && !isPayer && (
                    <div style={{ marginTop: '0.5rem', color: '#8a2be2' }}>
                      🔄 Tu datorezi: <strong>{share.toFixed(2)} RON</strong>
                    </div>
                  )}
                  {isPayer && (
                    <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: 'green' }}>
                      ✅ Ai plătit această cheltuială
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div style={{
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '2px dashed #ccc',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: '#4a004e',
            textAlign: 'right'
          }}>
            Total Grup: {totalGrup} RON <br />
            Totalul Meu: <span style={{ color: '#e60073' }}>{totalMe.toFixed(2)} RON</span>
          </div>
        </>
      )}
    </div>
  );
};

const normalize = (email) => email?.trim().toLowerCase();

export default ExpensesList;
