import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logoImage from '../assets/coverv2.jpg';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/"><img src={logoImage} alt="Logo" /></Link>
            </div>
            <div className="navbar-links">
                <Link to="/profile">Grupurile Mele</Link>
                <Link to="/about-us">Despre Noi</Link>
            </div>
        </nav>
    );
};

export default Navbar;
