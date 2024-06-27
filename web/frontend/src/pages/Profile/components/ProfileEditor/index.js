import React, { useState } from 'react';
import useAxiosStore from "../../../../app/store/axiosStore";
import CenteredTabs from "../../../../components/Tabs";
import UserAvatar from "../../../../shared/ui/Avatar";
import Link from "@mui/material/Link";
import './personal.css'

const ProfileEditor = () => {

  return (
    <form>
      <div className="page_container">
        <div className="main">
          <div className="tabs_container">
            <CenteredTabs />
          </div>
          <div className="personal_data">
            <div className="avatar_container">
              <UserAvatar />
            </div>
            <div className="data_container">
              <label>
                <div>
                  Username:
                </div>
                <input type="text" name="username" value={"Username"} />
              </label>
              <label>
                <div>
                  Email:
                </div>
                <input type="text" name="email" value={"email@example.com"} />
              </label>
              <Link component="button" variant="body2" sx={{ marginTop: '5px' }} type="submit">
                Save
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
      
  );
};

export default ProfileEditor;