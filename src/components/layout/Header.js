// components/Header.js
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from 'next/router';
import { 
  Badge, 
  InputBase, 
  IconButton, 
  Paper, 
  Popper, 
  Box, 
  ClickAwayListener, 
  CircularProgress, 
  List, 
  ListItem, 
  Typography, 
  Divider, 
  Card, 
  CardMedia,
  AppBar,
  Toolbar,
  Container,
  Button,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List as MuiList,
  ListItemButton,
  ListItemText,
  Avatar,
  Switch,
  FormControlLabel,
  Tooltip,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import api, { decodeToken } from "../../utils/axios";
import { getFrontImageUrl } from "../../utils/imageHelpers";

const Header = ({ darkMode, toggleDarkMode }) => {
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSearchResults, setOpenSearchResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('Please log in to continue');
  
  const searchRef = useRef(null);
  const router = useRouter();
  const searchTimeout = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Update cart count when items are added or removed
  useEffect(() => {
    // Initial load of cart count
    updateCartCount();
    
    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    
    // Listen for local cart updates (for non-authenticated users)
    window.addEventListener('localCartUpdated', handleLocalCartUpdate);
    
    // Check if user is logged in
    checkUserAuth();
    
    // Clean up event listener
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('localCartUpdated', handleLocalCartUpdate);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  // Add a new useEffect to check auth state on route changes
  useEffect(() => {
    // Check authentication state when route changes
    checkUserAuth();
  }, [router.asPath]);

  // Add event listener for storage changes (for cross-tab synchronization)
  useEffect(() => {
    // Initial auth check
    checkUserAuth();
    
    // Listen for changes to localStorage (for cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'jwt' || e.key === 'firstName' || e.key === 'lastName' || e.key === 'lastAuthUpdate') {
        console.log('Storage changed:', e.key);
        checkUserAuth();
      }
    };
    
    // Listen for auth errors
    const handleAuthError = (event) => {
      console.log('Auth error event received:', event.detail);
      // Clear auth data
      localStorage.removeItem('jwt');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('role');
      
      // Update state
      setIsLoggedIn(false);
      setFirstName('');
      setLastName('');
      
      // Show login prompt
      handleRequireLogin(event.detail?.message || 'Your session has expired. Please log in again.');
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authError', handleAuthError);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authError', handleAuthError);
    };
  }, []);

  // Check if user is logged in
  const checkUserAuth = () => {
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      setIsLoggedIn(false);
      setFirstName('');
      setLastName('');
      console.log('User not authenticated: No token found');
      return;
    }
    
    // Decode token and extract user information
    const userInfo = decodeToken(token);
    
    if (userInfo && (userInfo.firstName || userInfo.lastName)) {
      setIsLoggedIn(true);
      setFirstName(userInfo.firstName || '');
      setLastName(userInfo.lastName || '');
      console.log('User authenticated from token:', userInfo.firstName, userInfo.lastName);
    } else {
      // Fall back to localStorage values if token decoding fails
    const storedFirstName = localStorage.getItem('firstName');
    const storedLastName = localStorage.getItem('lastName');
    
      if (storedFirstName || storedLastName) {
      setIsLoggedIn(true);
      setFirstName(storedFirstName || '');
      setLastName(storedLastName || '');
        console.log('User authenticated from localStorage:', storedFirstName, storedLastName);
    } else {
      setIsLoggedIn(false);
      setFirstName('');
      setLastName('');
        console.log('User not authenticated: No user data found');
      }
    }
  };

  // Function to handle local cart updates for non-authenticated users
  const handleLocalCartUpdate = (event) => {
    if (event.detail && typeof event.detail.count === 'number') {
      setCartCount(event.detail.count);
    } else {
      // Get count from localStorage as a fallback
      try {
        const localCartItems = JSON.parse(localStorage.getItem('localCartItems') || '[]');
        setCartCount(localCartItems.length);
      } catch (err) {
        console.error('Error parsing local cart items:', err);
        setCartCount(0);
      }
    }
  };

  // Function to update cart count
  const updateCartCount = async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('jwt');
      
      // If not logged in, use local cart count
      if (!token) {
        console.log("No token found, using local cart count");
        try {
          const localCartItems = JSON.parse(localStorage.getItem('localCartItems') || '[]');
          setCartCount(localCartItems.length);
        } catch (err) {
          console.error('Error parsing local cart items:', err);
          setCartCount(0);
        }
        return;
      }
      
      // Fetch cart count from API only if logged in
      const response = await api.get("http://localhost:8083/cart/view-cart");
      const cartItems = response.data || [];
      setCartCount(cartItems.length);
      
      console.log("Cart count updated from API:", cartItems.length);
    } catch (err) {
      console.log('Could not fetch cart count:', err.response?.status || err.message);
      
      // Fallback to local cart if API fails
      try {
        const localCartItems = JSON.parse(localStorage.getItem('localCartItems') || '[]');
        setCartCount(localCartItems.length);
        console.log("Using local cart count as fallback:", localCartItems.length);
      } catch (localErr) {
        console.error('Error parsing local cart items:', localErr);
        setCartCount(0);
      }
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (value.trim().length > 1) {
      // Set loading state
      setLoading(true);
      setOpenSearchResults(true);
      
      // Reduce debounce time for more real-time feeling
      searchTimeout.current = setTimeout(() => {
        searchProducts(value);
      }, 300);
    } else {
      setSearchResults([]);
      setOpenSearchResults(false);
    }
  };
  
  // Handle search API call
  const searchProducts = async (keyword) => {
    try {
      console.log('Searching for:', keyword);
      
      // Use the correct API endpoint and parameter structure
      const response = await api.get(`/product/search?keyword=${encodeURIComponent(keyword)}&page=0&size=5`);
      console.log('Search response:', response.data);
      
      // Handle pagination response
      let results = response.data.content || response.data || [];
      
      // Make sure results is always an array
      if (!Array.isArray(results)) {
        results = [];
      }
      
      console.log('Processed results:', results);
      setSearchResults(results);
      
      // Always show results if search was successful, even if empty
      if (results.length === 0) {
        console.log('No results found');
      }
    } catch (err) {
      console.error('Error searching products:', err);
      if (err.response) {
        console.error('Response error:', err.response.status, err.response.data);
      } else if (err.request) {
        console.error('No response received');
      }
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle product selection from search results
  const handleProductSelect = (product) => {
    // Make sure product has an id property
    const productToStore = {
      ...product,
      id: product.id || product.productId
    };
    
    console.log('Selected product:', productToStore);
    
    // Store complete product data in localStorage before navigating
    localStorage.setItem('selectedProduct', JSON.stringify(productToStore));
    
    // Close search results
    setOpenSearchResults(false);
    setSearchTerm('');
    
    // Navigate to product detail page with ID in query params
    router.push({
      pathname: `/ProductDetail`,
      query: { id: productToStore.id }
    });
  };
  
  // Handle close search results
  const handleCloseResults = () => {
    setOpenSearchResults(false);
  };
  
  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push({
        pathname: '/Products',
        query: { search: searchTerm }
      });
      setOpenSearchResults(false);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Handle user menu open
  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  
  // Handle user menu close
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setFirstName('');
    setLastName('');
    handleUserMenuClose();
    router.push('/login');
  };

  // Navigation links - dynamic based on auth state
  const getNavLinks = () => {
    const links = [
      { text: 'Нүүр', href: '/' },
      { text: 'Бараа', href: '/Products' },
      { text: 'Ангилал', href: '/Categories' },
      { text: 'Хэрэглэгч', href: '/Accounts' },
      { text: 'Бидний тухай', href: '/About' },
    ];
    
    
    // If logged in, we'll handle user menu separately
    if (!isLoggedIn) {
      links.push({ text: 'Login', href: '/login' });
    }
    
    return links;
  };

  const navLinks = getNavLinks();

  // User initials for avatar
  const getUserInitials = () => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  // Handle require login
  const handleRequireLogin = (message = 'Please log in to continue') => {
    setLoginPromptMessage(message);
    setLoginPromptOpen(true);
  };
  
  // Handle login navigation
  const handleNavigateToLogin = () => {
    setLoginPromptOpen(false);
    router.push('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        background: darkMode 
          ? 'rgba(18, 18, 28, 0.8)'  
          : 'rgba(102, 73, 231, 0.98)', 
        backdropFilter: 'blur(10px)',
        boxShadow: darkMode 
          ? '0 4px 20px 0 rgba(0,0,0,0.2)' 
          : '0 4px 20px 0 rgba(0,0,0,0.05)',
        color: theme.palette.text.primary
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/" passHref legacyBehavior>
              <Box component="a" sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  component="img" 
                  src="/images/logo.png" 
                  alt="Logo"
                  sx={{ 
                    height: { xs: '45px', md: '50px' },
                    mr: 2
                  }}
                />
              </Box>
            </Link>
          </Box>

          {/* Dark Mode Toggle for mobile */}
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
                <IconButton
                  onClick={toggleDarkMode}
                  color="inherit"
                  aria-label="toggle dark mode"
                  sx={{ color: 'white' }}
                >
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Mobile menu icon */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ mr: 2, display: { md: 'none' }, color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {navLinks.map((link, index) => (
              <Button
                key={index}
                component={Link}
                href={link.href}
                sx={{
                  mx: 1,
                  color: router.pathname === link.href ? '#fff' : 'rgba(255,255,255,0.85)',
                  fontWeight: router.pathname === link.href ? '600' : '500',
                  '&:hover': {
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  },
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                {link.text}
              </Button>
            ))}
            
            {/* Dark Mode Toggle for desktop */}
            <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
              <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
                <IconButton
                  onClick={toggleDarkMode}
                  color="inherit"
                  sx={{ 
                    color: 'rgba(255,255,255,0.85)',
                    '&:hover': {
                      color: '#fff',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* User Menu */}
            {isLoggedIn && (
              <>
                <IconButton
                  onClick={handleUserMenuOpen}
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  color="inherit"
                  sx={{ ml: 1 }}
                >
                  <Avatar sx={{ 
                    bgcolor: theme.palette.primary.main,
                    width: 35, 
                    height: 35,
                    fontSize: '0.9rem', 
                    fontWeight: 'bold',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    {getUserInitials()}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={userMenuAnchorEl}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(userMenuAnchorEl)}
                  onClose={handleUserMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                      mt: 1.5,
                      bgcolor: darkMode ? 'rgba(30, 30, 45, 0.9)' : 'rgba(220, 225, 235, 0.98)',
                      minWidth: 180,
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1.25,
                        my: 0.5,
                        mx: 0.5,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        },
                      },
                    },
                  }}
                >
                  <Box sx={{ px: 2, pt: 1, pb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {firstName} {lastName}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem onClick={() => { handleUserMenuClose(); router.push('/profile'); }}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText>My Profile</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* Search and Cart */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 2, position: 'relative' }} ref={searchRef}>
              <Paper
                component="form"
                onSubmit={handleSearchSubmit}
                sx={{ 
                  p: '2px 4px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: { xs: 150, sm: 250 },
                  borderRadius: darkMode ? 20 : 30,
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                  boxShadow: darkMode ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.1)',
                  border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.5)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: darkMode ? '0 6px 12px rgba(0,0,0,0.3)' : '0 4px 8px rgba(0,0,0,0.15)',
                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 1)',
                  }
                }}
              >
                <InputBase
                  sx={{ 
                    ml: 1, 
                    flex: 1, 
                    color: darkMode ? '#fff' : '#333',
                    '&::placeholder': {
                      color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                      opacity: 1
                    }
                  }}
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <IconButton 
                  type="submit" 
                  sx={{ 
                    p: '5px', 
                    color: darkMode ? '#8286ff' : '#585ae4',
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(130, 134, 255, 0.1)' : 'rgba(88, 90, 228, 0.1)'
                    }
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </Paper>
              
              <Popper 
                open={openSearchResults} 
                anchorEl={searchRef.current}
                placement="bottom-start"
                sx={{ 
                  width: 320, 
                  zIndex: 1500,
                  mt: 1,
                  boxShadow: darkMode 
                    ? '0 8px 25px rgba(0,0,0,0.4)' 
                    : '0 6px 20px rgba(0,0,0,0.15)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: darkMode 
                    ? '1px solid rgba(255,255,255,0.1)'
                    : '1px solid rgba(0,0,0,0.05)'
                }}
              >
                <ClickAwayListener onClickAway={handleCloseResults}>
                  <Box 
                    sx={{ 
                      bgcolor: darkMode ? '#1a1a2e' : 'rgba(220, 225, 235, 0.98)', 
                      p: 1,
                      backgroundImage: darkMode 
                        ? 'linear-gradient(to bottom, rgba(88, 90, 228, 0.05), rgba(142, 36, 170, 0.05))'
                        : 'linear-gradient(to bottom, rgba(88, 90, 228, 0.02), rgba(142, 36, 170, 0.02))'
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={30} sx={{ color: darkMode ? '#8286ff' : '#585ae4' }} />
                      </Box>
                    ) : searchResults.length > 0 ? (
                      <List sx={{ p: 0 }}>
                        {searchResults.map((product, index) => (
                          <React.Fragment key={index}>
                            <ListItem 
                              sx={{ 
                                cursor: 'pointer', 
                                '&:hover': { 
                                  bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(88, 90, 228, 0.05)',
                                  transform: 'translateY(-2px)'
                                },
                                py: 1,
                                borderRadius: '8px',
                                transition: 'all 0.2s ease',
                                my: 0.5
                              }}
                              onClick={() => handleProductSelect(product)}
                            >
                              <Box sx={{ display: 'flex', width: '100%' }}>
                                <Card 
                                  elevation={0} 
                                  sx={{ 
                                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#f0f0f0', 
                                    width: 60, 
                                    height: 60,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    border: darkMode 
                                      ? '1px solid rgba(255,255,255,0.1)'
                                      : '1px solid rgba(0,0,0,0.05)'
                                  }}
                                >
                                  <CardMedia
                                    component="img"
                                    image={getFrontImageUrl(product) || "/placeholder.jpg"}
                                    alt={product.title || product.name}
                                    sx={{ 
                                      width: 50, 
                                      height: 50, 
                                      objectFit: 'contain',
                                      p: 0.5
                                    }}
                                    onError={(e) => {
                                      // If image fails to load, replace with placeholder
                                      e.target.src = "/placeholder.jpg";
                                    }}
                                  />
                                </Card>
                                <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
                                  <Typography 
                                    variant="body1" 
                                    sx={{ 
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      color: darkMode ? '#fff' : '#333'
                                    }}
                                  >
                                    {product.title || product.name}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    color={darkMode ? "rgba(255,255,255,0.7)" : "text.secondary"}
                                    sx={{ 
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      mb: 0.5
                                    }}
                                  >
                                    {product.description?.substring(0, 40) || ''}
                                  </Typography>
                                  <Typography 
                                    variant="body2"
                                    sx={{ 
                                      fontWeight: 700,
                                      color: darkMode ? '#8286ff' : '#585ae4',
                                      display: 'inline-block',
                                      px: 1,
                                      py: 0.2,
                                      borderRadius: '4px',
                                      backgroundColor: darkMode ? 'rgba(130, 134, 255, 0.1)' : 'rgba(88, 90, 228, 0.08)'
                                    }}
                                  >
                                    ${product.price?.toFixed(2) || 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </ListItem>
                            {index < searchResults.length - 1 && 
                              <Divider sx={{ 
                                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                                mx: 1
                              }} />
                            }
                          </React.Fragment>
                        ))}
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            pt: 1.5, 
                            pb: 1 
                          }}
                        >
                          <Button
                            onClick={handleSearchSubmit}
                            variant="text"
                            size="small"
                            sx={{
                              color: darkMode ? '#8286ff' : '#585ae4',
                              fontWeight: 500,
                              textTransform: 'none',
                              '&:hover': {
                                backgroundColor: darkMode ? 'rgba(130, 134, 255, 0.1)' : 'rgba(88, 90, 228, 0.08)'
                              },
                              fontSize: '0.85rem'
                            }}
                          >
                            View all results
                          </Button>
                        </Box>
                      </List>
                    ) : searchTerm.trim().length > 1 ? (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <SearchIcon sx={{ 
                          fontSize: 40, 
                          color: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                          mb: 1
                        }} />
                        <Typography variant="body1" color={darkMode ? "rgba(255,255,255,0.7)" : "text.secondary"} sx={{ mb: 0.5 }}>
                          No products found
                        </Typography>
                        <Typography variant="body2" color={darkMode ? "rgba(255,255,255,0.5)" : "text.secondary"}>
                          Try a different search term
                        </Typography>
                      </Box>
                    ) : null}
                  </Box>
                </ClickAwayListener>
              </Popper>
            </Box>

            {/* User menu for mobile view */}
            {isLoggedIn && isMobile && (
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{ 
                  color: '#fff', 
                  mr: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <Avatar
                  sx={{ 
                    width: 28, 
                    height: 28, 
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </IconButton>
            )}

            <Button
              onClick={(e) => {
                e.preventDefault();
                if (!isLoggedIn) {
                  handleRequireLogin('Please log in to add items to your cart');
                  return;
                } else {
                  router.push('/ProdCart');
                }
              }}
              sx={{ 
                minWidth: 'auto', 
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                },
                p: 1
              }}
            >
              <Badge 
                badgeContent={cartCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    right: -3,
                    top: 5,
                    padding: '0 4px',
                    backgroundColor: '#ff4040'
                  }
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 24 }} />
              </Badge>
            </Button>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile drawer navigation */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: 250,
            boxSizing: 'border-box',
            pt: 2,
            backgroundColor: darkMode ? '#1a1a2e' : 'rgba(220, 225, 235, 0.98)',
            color: darkMode ? '#fff' : 'inherit'
          }
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            component="img"
            src="/images/logo.png"
            alt="Logo"
            sx={{ height: 40 }}
          />
        </Box>
        <Divider sx={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : undefined }} />
        
        {/* User info if logged in */}
        {isLoggedIn && (
          <>
            <Box sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: 1
            }}>
              <Avatar 
                sx={{ 
                  width: 50, 
                  height: 50, 
                  bgcolor: '#585ae4',
                  fontSize: '1.2rem'
                }}
              >
                {getUserInitials()}
              </Avatar>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {firstName} {lastName}
              </Typography>
            </Box>
            <Divider sx={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : undefined }} />
          </>
        )}
        
        {/* Dark Mode Toggle in mobile menu */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                color="primary"
              />
            }
            label={darkMode ? "Light Mode" : "Dark Mode"}
            sx={{ 
              width: '100%',
              margin: 0,
              justifyContent: 'space-between',
              '& .MuiTypography-root': {
                fontSize: '0.9rem',
                fontWeight: 500
              }
            }}
          />
        </Box>
        <Divider sx={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : undefined }} />
        
        <MuiList component="nav">
          {navLinks.map((link, index) => (
            <ListItemButton
              key={index}
              component={Link}
              href={link.href}
              onClick={toggleMobileMenu}
              selected={router.pathname === link.href}
              sx={{
                backgroundColor: router.pathname === link.href 
                  ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') 
                  : 'transparent',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'
                }
              }}
            >
              <ListItemText 
                primary={link.text} 
                primaryTypographyProps={{ 
                  fontSize: '1rem',
                  fontWeight: router.pathname === link.href ? 600 : 400
                }}
              />
            </ListItemButton>
          ))}
          {isLoggedIn && (
            <ListItemButton
              onClick={() => {
                handleLogout();
                toggleMobileMenu();
              }}
              sx={{
                color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'
                }
              }}
            >
              <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{ fontSize: '1rem' }}
              />
            </ListItemButton>
          )}
        </MuiList>
      </Drawer>

      {/* Login prompt dialog */}
      <Dialog
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>Login Required</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body1" paragraph>
              {loginPromptMessage}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setLoginPromptOpen(false)}
            variant="outlined"
            sx={{ color: '#333', borderColor: '#333' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleNavigateToLogin}
            variant="contained"
            color="primary"
            sx={{ 
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Header;