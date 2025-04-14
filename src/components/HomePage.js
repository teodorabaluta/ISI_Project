import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import image1 from '../assets/home-photo1.png';  // Verifică calea către imagine
import image2 from '../assets/home-photo3.png';  // Verifică calea către imagine

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <h1>ITrip</h1>
      <div className="home-content">
        <img src={image1} alt="Descriere Imagine 1" className="home-image left-image"/>
        <div className="navigation-buttons">
          <button onClick={() => navigate('/login')}>Loghează-te la contul tău</button>
          <button onClick={() => navigate('/register')}>Creează un cont nou</button>
        </div>
        <img src={image2} alt="Descriere Imagine 2" className="home-image right-image"/>
      </div>
    </div>
  );
};

export default HomePage;
