import React from 'react';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import './GroupDetailsPage.css';

const GroupDetailsPage = () => {
  const navigate = useNavigate();
  const { groupId } = useParams();

  const handleNavigate = (path) => {
    navigate(`/group-details/${groupId}/${path}`);
  };

  return (
    <div className="group-details">
      <h1>Opțiuni Grup</h1>
      <button onClick={() => handleNavigate('map')}>Vizualizare Hartă</button>
      <button onClick={() => handleNavigate('chat')}>Chat</button>
      <button onClick={() => handleNavigate('calendar')}>Calendar</button>
      <button onClick={() => handleNavigate('expenses')}>Cheltuieli</button>
      <Outlet /> 
    </div>
  );
};

export default GroupDetailsPage;
