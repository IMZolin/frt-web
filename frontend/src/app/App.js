import React from 'react';
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


const App = () => {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<PersonalPage />} />
                <Route path="/bead_extractor" element={<BeadExtractor />} />
                <Route path="/psf" element={<PSF />} />
                <Route path="/deconvolution" element={<Deconvolution />} />
                <Route path="/network" element={<NeuralNetwork />} />
                <Route path="/authors" element={<Authors />} />
            </Routes>
        </>
    );
};

export default App;
