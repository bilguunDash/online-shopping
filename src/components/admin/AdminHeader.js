import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Typography,
  Divider,
  IconButton,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { decodeToken } from '../../utils/axios';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import StoreIcon from '@mui/icons-material/Store';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import { Users2Icon } from 'lucide-react';

const drawerWidth = 250;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  zIndex: 1,
  position: 'relative',
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(180deg, #1a1a1a 0%, #121212 100%)' 
      : 'linear-gradient(180deg, #f5f7fa 0%, #eff1f7 100%)',
    borderRight: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
  },
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  paddingLeft: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
}));

const MenuListItem = styled(ListItem)(({ theme, active }) => ({
  marginBottom: theme.spacing(0.5),
  padding: theme.spacing(1, 3),
  borderRadius: 0,
  position: 'relative',
  cursor: 'pointer',
  color: active ? theme.palette.primary.main : theme.palette.text.primary,
  fontWeight: active ? 600 : 400,
  backgroundColor: active 
    ? theme.palette.mode === 'dark' 
      ? 'rgba(114, 108, 235, 0.15)' 
      : 'rgba(114, 108, 235, 0.08)' 
    : 'transparent',
  borderLeft: active ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(114, 108, 235, 0.05)',
  },
  '& .MuiListItemIcon-root': {
    minWidth: 40,
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  },
  '& .MuiTypography-root': {
    fontWeight: active ? 600 : 500,
  },
}));

const AdminHeader = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const theme = useTheme();
  const currentPath = router.pathname;
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in and has admin role
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.log("No authentication token found, redirecting to login");
      router.push('/login');
      return;
    }
    
    // Decode token to get user info
    const userInfo = decodeToken(token);
    
    // If token is invalid or user is not admin, redirect
    if (!userInfo) {
      console.log("Invalid token, redirecting to login");
      router.push('/login');
      return;
    }
    
    console.log("User role from token:", userInfo.role);
    
    if (userInfo.role !== 'ADMIN') {
      console.log("Access denied: Only admins can access admin pages");
      router.push('/home');
      return;
    }
    
    console.log("Admin authentication successful");
    setIsAdmin(true);
  }, [router]);

  const isActive = (path) => {
    return currentPath.startsWith(path);
  };

  const handleLogout = () => {
    // Add logout confirmation
    if (confirm('Та системээс гарахдаа итгэлтэй байна уу?')) {
      // Remove user data
      localStorage.removeItem('jwt');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('role');
      
      // Redirect to login
      router.push('/login');
    }
  };

  const menuItems = [
    { 
      text: 'Хянах самбар', 
      icon: <DashboardIcon />, 
      path: '/admin/AdminHome',
      active: isActive('/admin/AdminHome')
    },
    { 
      text: 'Бүтээгдэхүүн', 
      icon: <InventoryIcon />, 
      path: '/admin/AdminProducts',
      active: isActive('/admin/AdminProducts')
    },
    { 
      text: 'Ангилал', 
      icon: <CategoryIcon />, 
      path: '/admin/AdminCategories',
      active: isActive('/admin/AdminCategories')
    },
    { 
      text: 'Захиалга', 
      icon: <ShoppingCartIcon />, 
      path: '/admin/AdminOrders',
      active: isActive('/admin/AdminOrders')
    },
    { 
      text: 'Хэрэглэгч', 
      icon: <Users2Icon />, 
      path: '/admin/AdminUsersManagement',
      active: isActive('/admin/AdminUsersManagement')
    },
    { 
      text: 'Админ', 
      icon: <AdminPanelSettingsIcon />, 
      path: '/admin/AdminsManagement',
      active: isActive('/admin/AdminsManagement')
    },
    {
      text: 'Бүтээгдэхүүн хяналт', 
      icon: <AddBusinessIcon />, 
      path: '/admin/AdminProdControl',
      active: isActive('/admin/AdminProdControl')
    },
    { 
      text: 'Тохиргоо', 
      icon: <SettingsIcon />, 
      path: '/admin/AdminSettings',
      active: isActive('/admin/AdminSettings')
    }
  ];

  return (
    <StyledDrawer
      variant="permanent"
      anchor="left"
    >
      <LogoBox>
        <StoreIcon sx={{ color: theme.palette.primary.main, fontSize: 24, mr: 1.5 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            fontSize: '1.1rem',
          }}
        >
          Админ удирдлага
        </Typography>
      </LogoBox>
      
      <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <List sx={{ py: 2, flexGrow: 1 }}>
          {menuItems.map((item) => (
            <Link href={item.path} key={item.text} passHref legacyBehavior>
              <MenuListItem active={item.active ? 1 : 0} component="a">
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </MenuListItem>
            </Link>
          ))}
        </List>
        
        <Box sx={{ mt: 'auto', mb: 2 }}>
          <Divider sx={{ mb: 2 }} />
          
          {/* Dark Mode Toggle */}
          <MenuListItem onClick={toggleDarkMode}>
            <ListItemIcon>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </ListItemIcon>
            <ListItemText primary={darkMode ? "Цайвар горим" : "Бараан горим"} />
          </MenuListItem>
          
          <MenuListItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
            <ListItemIcon>
              <LogoutIcon sx={{ color: theme.palette.error.main }} />
            </ListItemIcon>
            <ListItemText primary="Гарах" />
          </MenuListItem>
        </Box>
      </Box>
    </StyledDrawer>
  );
};

export default AdminHeader; 