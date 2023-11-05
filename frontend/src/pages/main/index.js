import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@mui/material';
import './style.css';

const MainPage = ({ darkMode }) => {
  const [customButtonColor, setCustomButtonColor] = useState(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light'));
  const [customButtonColor2, setCustomButtonColor2] = useState(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light2'));

  useEffect(() => {
    if (darkMode) {
      setCustomButtonColor(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-dark'));
      setCustomButtonColor2(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-dark2'));
    } else {
      setCustomButtonColor(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light'));
      setCustomButtonColor2(getComputedStyle(document.documentElement).getPropertyValue('--button-text-color-light2'));
    }
  }, [darkMode]);

  return (
    <div>
      <h3 align="center">
        Menu
      </h3>
      <div style={{ display: 'flex', justifyContent: 'center' }} className="menu-container">
        <Button 
          variant="outlined"
          style={{ borderColor: customButtonColor, color: customButtonColor }}
          className="menu-options"
          component={Link}
          to="/bead_extractor"
        >
          Bead extraction
        </Button>
        <Button 
          variant="outlined"
          style={{ borderColor: customButtonColor, color: customButtonColor }}
          className="menu-options"
          component={Link}
          to="/psf"
        >
          PSF calculation
        </Button>
        <Button
          variant="outlined"
          style={{ borderColor: customButtonColor2, color: customButtonColor2 }}
          className="menu-options"
          component={Link}
          to="/deconvolution"
        >
          Deconvolution
        </Button>
        <Button 
          variant="outlined"
          style={{ borderColor: customButtonColor, color: customButtonColor }}
          className="menu-options"
          component={Link}
          to="/network"
        >
          CNN Training ($)
        </Button>
        <Button
          variant="outlined"
          style={{ borderColor: customButtonColor2, color: customButtonColor2 }}
          className="menu-options"
          component={Link}
          to="/network"
        >
          Neural Network
        </Button>
        <Button 
          variant="outlined"
          style={{ borderColor: customButtonColor, color: customButtonColor }}
          className="menu-options"
          component={Link}
          to="/authors"
        >
          Authors
        </Button>
      </div>
      <Outlet />
    </div>
  );
};

export default MainPage;
