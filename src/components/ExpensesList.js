import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

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
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleConfirmPayment = async (expenseId) => {
    const expenseRef = doc(db, `groups/${groupId}/expenses`, expenseId);
    const expense = expenses.find((e) => e.id === expenseId);

    const updatedList = [...(expense.confirmedBy || []), currentUser];
    try {
      await updateDoc(expenseRef, {
        confirmedBy: updatedList,
      });
    } catch (err) {
      console.error('Eroare la confirmare:', err.message);
    }
  };

  const normalize = (email) => email?.trim().toLowerCase();

  const totalGrup = expenses.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const totalMe = expenses.reduce((acc, expense) => {
    const payer = normalize(expense.payer);
    const split = expense.splitBetween?.map(normalize) || [];
    const isUserInSplit = split.includes(currentUser);
    const isPayer = payer === currentUser;
    const confirmed = expense.confirmedBy?.includes(currentUser);
    const share = (parseFloat(expense.amount) || 0) / split.length;

    return isUserInSplit && !isPayer && !confirmed ? acc + share : acc;
  }, 0);

  return (
    <div className="expenses-list">
      {loading ? (
        <p>Se încarcă...</p>
      ) : expenses.length === 0 ? (
        <p>Nu există cheltuieli înregistrate.</p>
      ) : (
        <>
          <ul>
            {expenses
              .filter((expense) =>
                normalize(expense.payer) === currentUser ||
                (expense.splitBetween?.map(normalize) || []).includes(currentUser)
              )
              .map((expense) => {
                const payer = normalize(expense.payer);
                const split = expense.splitBetween?.map(normalize) || [];
                const isUserInSplit = split.includes(currentUser);
                const isPayer = payer === currentUser;
                const people = split.length || 1;
                const share = (parseFloat(expense.amount) || 0) / people;
                const alreadyConfirmed = expense.confirmedBy?.includes(currentUser);

                return (
                  <li key={expense.id}>
                    <strong>{expense.description}</strong><br />
                    💸 {expense.amount} RON<br />
                    👤 Plătitor: {expense.payer}<br />
                    👥 Împărțit cu: {expense.splitBetween?.join(', ')}<br />
                    {isUserInSplit && !isPayer && (
                      alreadyConfirmed ? (
                        <div style={{ color: 'gray' }}>✔️ Ai confirmat plata</div>
                      ) : (
                        <div>
                          🔄 Tu datorezi: <strong>{share.toFixed(2)} RON</strong><br />
                          <button onClick={() => handleConfirmPayment(expense.id)}>
                            Confirm că am plătit
                          </button>
                        </div>
                      )
                    )}
                    {isPayer && (
                      <div style={{ fontStyle: 'italic', color: 'green' }}>
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

export default ExpensesList;