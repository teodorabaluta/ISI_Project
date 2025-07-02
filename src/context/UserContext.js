// src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';

// Cream un context pentru utilizator
const UserContext = createContext();

// Provider pentru UserContext
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verifica daca utilizatorul este autentificat
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);