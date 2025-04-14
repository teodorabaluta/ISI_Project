import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfilePage from './components/ProfilePage';
import GroupPage from './components/GroupPage';
import CreateGroupPage from './components/CreateGroupPage';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import AboutUs from './components/AboutUs';
import GroupDetailsPage from './components/GroupDetailsPage';
import MapComponent from './components/MapComponent';
import ChatComponent from './components/ChatComponent';
import CalendarComponent from './components/CalendarComponent'; 

import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/groups" element={<GroupPage />} />
          <Route path="/create-group" element={<CreateGroupPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/group-details/:groupId" element={<GroupDetailsPage />} />
          <Route path="/group-details/:groupId/map" element={<MapComponent />} />
          <Route path="/group-details/:groupId/chat" element={<ChatComponent />} />
          <Route path="/group-details/:groupId/calendar" element={<CalendarComponent />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
