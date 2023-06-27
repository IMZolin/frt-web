import React from 'react';
import './header.css';
import Entry from '../Entry/index';
import './header.css';
import { Button } from '@material-ui/core';
import UserAvatar from '../../../shared/ui/Avatar/index.js';
import LogoImage from '../../../shared/assets/png/header/logo.png';

import { useNavigate } from 'react-router-dom';
import useAxiosStore from '../../../app/store/axiosStore';

const Header = () => {
  const [open_Entry, setOpen_Entry] = React.useState(false);
  const { isAuthorized, setAxiosToken } = useAxiosStore();

  const navigate = useNavigate();

  const getProfileIcon = () => {
    return isAuthorized() ? (
      <>
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
      </>
    ) : (
      <div></div>
    );
  };
  return (
    <>
      <div className="header">
        <div className="header__logo" onClick={() => navigate('/')}>
          <img src={LogoImage} alt="Logo" className='logo-image'/>
        </div>
        <div className="header__wrapper">
          {/* <IconButton onClick={() => navigate('/favourite')}>
            <Love className="love" />
          </IconButton> */}
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
