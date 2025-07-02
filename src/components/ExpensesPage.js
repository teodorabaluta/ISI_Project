import React from 'react';
import ExpensesForm from './ExpensesForm';
import ExpensesList from './ExpensesList';
import './ExpensesPage.css';

const ExpensesPage = () => {
  return (
    <div className="expenses-container">
      <div className="expenses-form">
        <h2>Adaugă o cheltuială</h2>
        <ExpensesForm />
      </div>
      <div className="expenses-list">
        <h2>Lista cheltuielilor</h2>
        <ExpensesList />
      </div>
    </div>
  );
};

export default ExpensesPage;