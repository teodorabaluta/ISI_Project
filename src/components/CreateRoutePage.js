// src/components/CreateRoutePage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './CreateRoutePage.css'; 

const CreateRoutePage = () => {
  const [routeName, setRouteName] = useState(''); 
  const [routeDescription, setRouteDescription] = useState('');  
  const navigate = useNavigate(); 

  const handleCreateRoute = (e) => {
    e.preventDefault();

    console.log('Route created:', routeName, routeDescription);

    navigate('/profile');
  };

  return (
    <div className="create-route-page">
      <h2>Create a New Route</h2>
      <form onSubmit={handleCreateRoute}>
        <input
          type="text"
          placeholder="Route Name"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          required
        />
        <textarea
          placeholder="Route Description"
          value={routeDescription}
          onChange={(e) => setRouteDescription(e.target.value)}
          required
        />
        <button type="submit">Create Route</button>
      </form>
    </div>
  );
};

export default CreateRoutePage;
