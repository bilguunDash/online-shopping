import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children, darkMode, toggleDarkMode }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AdminHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout; 