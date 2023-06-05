import * as React from 'react';
import Box from '@mui/material/Box';
//import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const CenteredTabs = () => {
  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <>
        <Tab label="Profile" />
        <Tab label="Favourites" />
      </>
    </Box>
  );
};

export default CenteredTabs;
