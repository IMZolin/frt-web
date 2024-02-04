import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from '../pages/main';
import PersonalPage from '../pages/Profile';
import LoginPage from '../pages/Auth/Login';
import SignupPage from '../pages/Auth/Signup';
import Header from '../widgets/Header/HeaderContent';
import BeadExtractor from '../pages/StepperWrapper/BeadExtractor';
import PSF from '../pages/StepperWrapper/PSF';
import Deconvolution from '../pages/StepperWrapper/Deconvolution';
import NeuralNetwork from '../pages/StepperWrapper/NeuralNetwork';
import Authors from '../pages/Authors';
import './App.css';


const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  const handleDarkModeToggle = (isDarkMode) => {
    setDarkMode(isDarkMode);
  };

  return (
    <div className={`app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <Header onDarkModeToggle={handleDarkModeToggle} />
      <Routes>
        <Route path="/" element={<MainPage darkMode={darkMode} />} />
        <Route path="/login" element={<LoginPage darkMode={darkMode} />} />
        <Route path="/signup" element={<SignupPage darkMode={darkMode} />} />
        <Route path="/profile" element={<PersonalPage darkMode={darkMode} />} />
        <Route path="/bead_extractor" element={<BeadExtractor darkMode={darkMode} />} />
        <Route path="/psf" element={<PSF darkMode={darkMode} />} />
        <Route path="/deconvolution" element={<Deconvolution darkMode={darkMode} />} />
        <Route path="/network" element={<NeuralNetwork darkMode={darkMode} />} />
        <Route path="/authors" element={<Authors />} />
      </Routes>
    </div>
  );
};

export default App;
