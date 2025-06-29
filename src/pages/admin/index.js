import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  useTheme,
  CardActionArea,
  Divider,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from '../../components/admin/AdminHeader';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SlideshowIcon from '@mui/icons-material/Slideshow';

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
  marginLeft: 0,
  marginTop: 0,
  width: '100%',
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[10],
  },
  borderRadius: 12,
  overflow: 'hidden',
}));

const AdminCardIcon = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(2),
}));

const AdminCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  textAlign: 'center',
}));

const AdminDashboard = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const theme = useTheme();
  const [userName, setUserName] = useState('');
  
  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('jwt');
    const userRole = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (userRole !== 'ADMIN') {
      router.push('/home');
      return;
    }
    
    if (name) {
      setUserName(name);
    }
  }, [router]);

  const adminModules = [
    {
      title: 'Dashboard',
      description: 'View site analytics and key metrics',
      icon: <DashboardIcon />,
      link: '/admin',
      color: theme.palette.primary.main,
    },
    {
      title: 'User Management',
      description: 'Manage registered users',
      icon: <PeopleAltIcon />,
      link: '/admin/AdminUsersManagement',
      color: theme.palette.success.main,
    },
    {
      title: 'Admin Management',
      description: 'Manage administrator accounts',
      icon: <AdminPanelSettingsIcon />,
      link: '/admin/AdminsManagement',
      color: theme.palette.warning.main,
    },
    {
      title: 'Banner Settings',
      description: 'Manage banners and carousels',
      icon: <SlideshowIcon />,
      link: '/admin/AdminSettings',
      color: theme.palette.info.main,
    },
    {
      title: 'Product Categories',
      description: 'Manage product categories',
      icon: <CategoryIcon />,
      link: '/admin',
      color: theme.palette.secondary.main,
    },
    {
      title: 'Product Inventory',
      description: 'Manage products and inventory',
      icon: <InventoryIcon />,
      link: '/admin',
      color: theme.palette.error.main,
    },
    {
      title: 'Reports & Analytics',
      description: 'View sales and visitor reports',
      icon: <AssessmentIcon />,
      link: '/admin',
      color: theme.palette.info.main,
    },
    {
      title: 'Site Settings',
      description: 'Configure global site settings',
      icon: <SettingsIcon />,
      link: '/admin',
      color: theme.palette.grey[700],
    },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      overflow: 'hidden',
      width: '100%',
      position: 'relative'
    }}>
      <AdminHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <Main>
        <Container maxWidth="lg">
          <Box sx={{ mb: 5 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome back, {userName || 'Admin'}! Manage your e-commerce platform.
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 5 }} />
          
          <Grid container spacing={3}>
            {adminModules.map((module, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <StyledCard>
                  <CardActionArea component={Link} href={module.link} sx={{ height: '100%' }}>
                    <AdminCardContent>
                      <AdminCardIcon sx={{ bgcolor: module.color }}>
                        {module.icon}
                      </AdminCardIcon>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {module.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {module.description}
                      </Typography>
                    </AdminCardContent>
                  </CardActionArea>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Main>
    </Box>
  );
};

export default AdminDashboard; 