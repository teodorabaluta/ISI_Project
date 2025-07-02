import React from 'react';
import './AboutUs.css'; 
import teamImage from '../assets/photo2.png';

const AboutUs = () => {
  return (
    <div className="about-us">
      <div className="about-image">
        <img src={teamImage} alt="Echipa Noastra" />
      </div>
      <div className="about-us-text">
        <h1>Despre Noi</h1>
        <p>Aplicația "ITrip" este o platformă destinată facilitării planificării călătoriilor în grup, oferind diverse instrumente esențiale pentru o organizare eficientă și colaborativă, cum ar fi gestionarea itinerariilor și comunicarea eficientă între membrii grupului. Cu funcționalități de urmărire în timp real a membrilor și planificare centralizată a activităților, aplicația minimizează obstacolele logistice întâlnite în coordonarea grupurilor mari.</p>
        <h2>Date de Contact</h2>
        <p>Email: contact@itrip.com</p>
        <p>Telefon: +40 752 334 554</p>
      </div>
    </div>
  );
};

export default AboutUs;
