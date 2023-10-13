import React, { useEffect, useState } from "react";
import UserAvatar from '../../shared/ui/Avatar';
import CenteredTabs from '../../components/Tabs/index.js';
import Link from '@mui/material/Link';
import './personal.css';
import axios from "axios";
import ProfileEditor from "./components/ProfileEditor";
import useAxiosStore from "../../app/store/axiosStore";

const getUserData = async (axiosInstance, userId) => {
  try {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const PersonalPage = ({userId}) => {
  const [userData, setUserData] = useState(null);
  const [editing, setEditing] = useState(false);
  const axiosInstance = useAxiosStore.getState().axiosInstance;

  const handleEditClick = () => {
    setEditing(true);
  };

  if (editing) {
    return <ProfileEditor userData={userData} />;
  } else {
    return (
      <div className="page_container">
        <div className="main">
          <div className="tabs_container">
            <CenteredTabs />
          </div>
          <div className="personal_data">
            <div className="avatar_container">
              <UserAvatar firstName="Qwerty" lastName="Poiuy"/>
            </div>
            <div className="data_container">
              <label>Username:</label>
              <p className="username">Username</p>
              <label>Email:</label>
              <p className="email">email@example.com</p>
              <Link component="button" variant="body2" sx={{ marginTop: '5px' }} onClick={handleEditClick}>
                Edit profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
};


export default PersonalPage;
