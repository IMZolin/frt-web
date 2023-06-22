import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainPage from '../pages/main';
import FavouritePage from '../pages/Favourite';
import PersonalPage from '../pages/Profile';
import LoginPage from '../pages/Auth/Login';
import SignupPage from '../pages/Auth/Signup';
import Header from '../widgets/Header/HeaderContent';
import StepperPSF from '../pages/StepperFRT/StepperPSF';
import StepperDeconvolution from '../pages/StepperFRT/StepperDeconvolution';
import StepperNetwork from '../pages/StepperFRT/StepperNetwork'

const App = () => {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<PersonalPage />} />
                <Route path="/favourite" element={<FavouritePage />} />
                <Route path="/psf" element={<StepperPSF />} />
                <Route path="/deconvolution" element={<StepperDeconvolution />} />
                <Route path="/network" element={<StepperNetwork />} />
            </Routes>
        </>
    );
};

export default App;
