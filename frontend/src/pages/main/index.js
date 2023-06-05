import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@mui/material';
import './style.css'

const MainPage = () => {
  return (
    <div>
      <h2 variant="h4" align="center" className="menu-header">
        Menu
      </h2>
      <div style={{ display: 'flex', justifyContent: 'center' }} className="menu-container">
        <Button variant="outlined" color="secondary" className="menu-options" component={Link} to="/psf" focusVisibleClassName="">
          PSF computation
        </Button>
        <Button variant="outlined" className="menu-options" component={Link} to="/deconvolution">
          Deconvolution
        </Button>
        <Button variant="outlined" color="success" className="menu-options" component={Link} to="/network">
          Neural Networks
        </Button>
      </div>
      <Outlet />
    </div>
  );
};

export default MainPage;
