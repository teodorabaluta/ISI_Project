import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

  useEffect(() => {
    if (!user) {
      setError('Trebuie să fii logat pentru a vizualiza grupurile.');
      navigate('/');
      return;
    }

    const fetchGroups = async () => {
      try {
        const q = query(
          collection(db, 'groups'),
          where('participants', 'array-contains', user.email)
        );
        const querySnapshot = await getDocs(q);
        const allGroups = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGroups(allGroups);
      } catch (error) {
        setError('Eroare la preluarea grupurilor');
      }
    };

    fetchGroups();
  }, [db, user, navigate]);

  const handleCreateGroup = () => {
    navigate('/create-group');
  };

  const handleJoinGroup = () => {
    navigate('/groups');
  };

  const handleDeleteGroup = async (groupId) => {
    const confirmDelete = window.confirm('Sigur vrei să ștergi acest grup?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'groups', groupId));
      setGroups(prev => prev.filter(g => g.id !== groupId));
    } catch (err) {
      alert('Eroare la ștergere: ' + err.message);
    }
  };

  return (
    <div className="profile-page">
      <h1>Bine ai venit, {user?.email}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Grupurile tale</h2>
      <div className="group-list">
        {groups.length > 0 ? (
          groups.map(group => (
            <div key={group.id} className="group-card">
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <div className="group-actions">
                  <button className="button" onClick={() => navigate(`/group-details/${group.id}`)}>
                    Accesează
                  </button>
                  <button className="button delete" onClick={() => handleDeleteGroup(group.id)}>
                    Șterge
                  </button>

</div>

            </div>
          ))
        ) : (
          <p>Nu faci parte din niciun grup încă.</p>
        )}
      </div>

      <button onClick={handleCreateGroup}>Creează un nou grup</button>
      <button onClick={handleJoinGroup}>Alătură-te unui grup</button>
    </div>
  );
};

export default ProfilePage;
