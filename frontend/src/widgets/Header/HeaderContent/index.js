import React, { useState, useEffect } from 'react';
import Entry from '../Entry/index';
import { Button } from '@material-ui/core';
import { Switch, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import UserAvatar from '../../../shared/ui/Avatar/index.js';
import LogoImage from '../../../shared/assets/png/header/logo.png';
import './header.css';

import { useNavigate } from 'react-router-dom';
import useAxiosStore from '../../../app/store/axiosStore';

const Header = ({ onDarkModeToggle }) => {
  const [open_Entry, setOpen_Entry] = React.useState(false);
  const { isAuthorized, setAxiosToken } = useAxiosStore();
  const [darkMode, setDarkMode] = useState(false);
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
    onDarkModeToggle(!darkMode);
  };
  useEffect(() => {
    if (darkMode) {
      document.documentElement.style.setProperty('--background-color', 'var(--background-dark)');
      document.documentElement.style.setProperty('--color', 'var(--text-color-dark)');
    } else {
      document.documentElement.style.setProperty('--background-color', 'var(--background-light)');
      document.documentElement.style.setProperty('--color', 'var(--text-color-light)');
    }
  }, [darkMode]);

  const navigate = useNavigate();

  const getProfileIcon = () => {
    return isAuthorized() ? (
      <>
        <div onClick={() => navigate('/profile')} className="avatar">
          <UserAvatar
            width="35px"
            height="35px"
            avatar={''}
            darkMode={darkMode}
            onClick={() => navigate('/profile')}
          />
        </div>
        <Button
          onClick={() => setAxiosToken(null)}
          color="secondary"
          variant="outlined"
          className="signout"
        >
          Sign out
        </Button>
      </>
    ) : (
      <div></div>
    );
  };
  return (
    <>
      <div className="header">
        <div className="header__logo" onClick={() => navigate('/')}>
          <img src={LogoImage} alt="Logo" className='logo-image' style={{ width: '20%', marginTop: '10px', marginLeft: '10px'}} />
        </div>
        <div className="header__wrapper" style={{marginTop: '-10px'}}>
          <IconButton onClick={handleDarkModeToggle} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            <Switch
              color="default"
              checked={darkMode}
              onChange={handleDarkModeToggle}
            />
          </IconButton>
          <div onClick={() => navigate('/profile')} className="avatar">
            <UserAvatar
              width="35px"
              height="35px"
              avatar={''}
              onClick={() => navigate('/profile')}
            />
          </div>
          <Button
            onClick={() => setAxiosToken(null)}
            color="secondary"
            variant="outlined"
            className="signout"
          >
            Sign out
          </Button>
        </div>
      </div>
      {open_Entry && (
        <Entry
          open={open_Entry}
          onCloseCallback={(e) => setOpen_Entry(false)}
        />
      )}
    </>
  );
};
export default Header;
