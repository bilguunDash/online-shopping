//src/components/ProdCartSection.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  IconButton, 
  Grid, 
  CircularProgress,
  Paper,
  Divider,
  Card,
  CardMedia,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Tabs,
  Tab,
  useTheme,
  Fade,
  Zoom,
  Grow,
  Badge,
  Avatar,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PaymentIcon from '@mui/icons-material/Payment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import api from "../../utils/axios";
import { useRouter } from 'next/router';

const ProdCartSection = ({ cartItems, setCartItems, loading, error, darkMode }) => {
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentTabValue, setPaymentTabValue] = useState(0);
  const [qrCodeHtml, setQrCodeHtml] = useState('');
  const [savedOrderTotal, setSavedOrderTotal] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('Please log in to view your cart');
  const [updatingProductId, setUpdatingProductId] = useState(null);
  const [removingProductId, setRemovingProductId] = useState(null);
  const router = useRouter();
  const theme = useTheme();
  
  const steps = ['Сагс харах', 'Захиалгын мэдээлэл', 'Төлбөр'];

  // Define fetchCart function before using it in useEffect
  const fetchCart = async () => {
    try {
      // Check if token exists
      const token = localStorage.getItem('jwt');
      if (!token) {
        setIsLoggedIn(false);
        setCartItems([]);
        return;
      }

      // Always use Bearer token format for all users
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      console.log('Attempting to fetch cart with standard Bearer token format');
      
      // Make API request with standard Bearer token format
      const response = await fetch(`${api.defaults.baseURL}/cart/view-cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formattedToken
        }
      });

      if (!response.ok) {
        console.log(`Cart fetch failed with status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCartItems(data || []);
      console.log("Cart items loaded:", data);
    } catch (err) {
      console.error("Error fetching cart:", err);
      
      // Handle 403 error specifically
      if (err.response && err.response.status === 403) {
        // Clear auth data
        localStorage.removeItem('jwt');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
        localStorage.removeItem('role');
        
        setIsLoggedIn(false);
        setCartItems([]);
        handleRequireLogin('Your session has expired. Please log in again.');
      } else if (err.response && err.response.status === 400) {
        // Handle 400 error - likely missing required parameters
        console.error("Bad request error details:", err.response.data);
        setError("Failed to load cart items due to invalid request. Please try again or contact support.");
      } else {
        // Handle other errors
        setError("Failed to load cart items. Please try again.");
      }
    }
  };

  // Check authentication and fetch cart on mount
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    console.log('Current token:', token ? `${token.substring(0, 20)}...` : 'No token');
    setIsLoggedIn(!!token);
    
    // Function to check if token is valid
    const validateToken = () => {
      try {
        // Check token exists and can be decoded
        const token = localStorage.getItem('jwt');
        if (!token) return false;
        
        // For now just check if token exists
        return true;
      } catch (err) {
        console.error('Token validation error:', err);
        return false;
      }
    };
    
    // Only proceed if token exists and seems valid
    if (token && validateToken()) {
      console.log('Token seems valid, fetching cart');
      // Only fetch cart if user is logged in
      fetchCart();
    } else {
      console.log('Invalid token or not logged in');
      // Clear any existing state
      setIsLoggedIn(false);
      setCartItems([]);
      // If on cart page, show appropriate message
      if (window.location.pathname.includes('/cart')) {
        handleRequireLogin('Нэвтрэхийн тулд дахин нэвтэрнэ үү');
      }
    }

    // Add listener for auth errors
    const handleAuthError = (event) => {
      console.log('Auth error in ProdCartSection:', event.detail);
      setIsLoggedIn(false);
      setCartItems([]);
      
      // Only show login prompt if it's a cart operation
      if (event.detail.isCartOperation) {
        handleRequireLogin(event.detail.message || 'Your session has expired. Please log in again.');
      }
    };

    window.addEventListener('authError', handleAuthError);
    
    // Cleanup
    return () => {
      window.removeEventListener('authError', handleAuthError);
    };
  }, []);
  
  // Load cart items from localStorage
  const loadLocalCartItems = () => {
    try {
      const localCartItems = JSON.parse(localStorage.getItem('localCartItems') || '[]');
      setCartItems(localCartItems);
      console.log('Loaded local cart items:', localCartItems);
    } catch (err) {
      console.error('Error loading local cart items:', err);
      setCartItems([]);
    }
  };
  
  // Function to update local cart in localStorage and dispatch event
  const updateLocalCart = (updatedCart) => {
    try {
      localStorage.setItem('localCartItems', JSON.stringify(updatedCart));
      window.dispatchEvent(new CustomEvent('localCartUpdated', { 
        detail: { count: updatedCart.length } 
      }));
    } catch (err) {
      console.error('Error updating local cart:', err);
    }
  };
  
  // Functions to handle cart operations locally
  const increaseLocalQuantity = (productId) => {
    const updatedCart = cartItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    );
    setCartItems(updatedCart);
    updateLocalCart(updatedCart);
    showFeedback('Барааны тоо нэмэгдлээ');
  };
  
  const decreaseLocalQuantity = (productId, currentQuantity) => {
    if (currentQuantity <= 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity: item.quantity - 1 } 
        : item
    );
    setCartItems(updatedCart);
    updateLocalCart(updatedCart);
    showFeedback('Барааны тоо багасгалаа');
  };
  
  const removeLocalItem = (productId) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    updateLocalCart(updatedCart);
    showFeedback('Бараа сагснаас хасагдлаа');
  };
  
  // Handle increase quantity (with auth check)
  const increaseQuantity = async (e, productId) => {
    if (e) e.preventDefault(); // Prevent default behavior
    
    // If not logged in, use local cart functions
    if (!isLoggedIn) {
      increaseLocalQuantity(productId);
      return;
    }
    
    setUpdating(true);
    setUpdatingProductId(productId);
    
    try {
      // Update cart item quantity through the API
      const response = await api.put(`/cart/items/${productId}/increase`);
      
      // Update local state to reflect the change
      const updatedCart = cartItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      
      setCartItems(updatedCart);
      showFeedback('Барааны тоо нэмэгдлээ');
      
    } catch (err) {
      console.error("Error increasing quantity:", err);
      
      if (err.response && err.response.status === 403) {
        // Auth error - trigger login prompt
        const event = new CustomEvent('authError', {
          detail: { message: 'Таны холболт дууссан. Дахин нэвтэрнэ үү.', isCartOperation: true }
        });
        window.dispatchEvent(event);
      } else {
        // Other error
        setSnackbar({
          open: true,
          message: err.response?.data?.message || 'Барааны тоог нэмэхэд алдаа гарлаа',
          severity: 'error'
        });
      }
    } finally {
      setUpdating(false);
      setUpdatingProductId(null);
    }
  };

  // Handle decrease quantity (with auth check)
  const decreaseQuantity = async (e, productId, currentQuantity) => {
    if (e) e.preventDefault(); // Prevent default behavior
    if (currentQuantity <= 1) return;
    
    // If not logged in, use local cart functions
    if (!isLoggedIn) {
      decreaseLocalQuantity(productId, currentQuantity);
      return;
    }
    
    setUpdating(true);
    
    try {
      await api.put(`http://localhost:8083/cart/items/${productId}/decrease`);
      
      // Update cart items locally
      setCartItems(cartItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ));
      
      // Trigger cart updated event for header to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show feedback
      showFeedback('Item quantity decreased');
    } catch (err) {
      console.error("Error decreasing item quantity:", err);
      showFeedback('Failed to decrease quantity', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Handle remove item (with auth check)
  const removeItem = async (e, productId) => {
    if (e) e.preventDefault(); // Prevent default behavior
    
    // If not logged in, use local cart functions
    if (!isLoggedIn) {
      removeLocalItem(productId);
      return;
    }
    
    setUpdating(true);
    setRemovingProductId(productId);
    
    try {
      await api.delete(`http://localhost:8083/cart/items/${productId}`);
      
      // Update cart items locally
      setCartItems(cartItems.filter(item => item.productId !== productId));
      
      // Trigger cart updated event for header to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show feedback
      showFeedback('Item removed from cart');
    } catch (err) {
      console.error("Error removing item from cart:", err);
      showFeedback('Failed to remove item', 'error');
    } finally {
      setUpdating(false);
      setRemovingProductId(null);
    }
  };

  // Handle checkout button click with auth check
  const handleCheckout = () => {
    if (!isLoggedIn) {
      // Show login prompt dialog
      setLoginPromptOpen(true);
      return;
    }
    
    setCheckoutOpen(true);
    setActiveStep(1);
  };
  
  // Handle login navigation
  const handleNavigateToLogin = () => {
    setLoginPromptOpen(false);
    // Save current cart to persist through login
    router.push('/login');
  };
  
  // Handle create order
  const handleCreateOrder = async () => {
    if (!deliveryAddress.trim()) {
      showFeedback("Please enter a delivery address", "error");
      return;
    }
    
    setProcessingOrder(true);
    
    try {
      // Call order creation API with delivery address as a request parameter
      await api.post(`http://localhost:8083/order/create?deliveryAddress=${encodeURIComponent(deliveryAddress)}`);
      
      // Save order total before clearing cart
      setSavedOrderTotal(calculateSubtotal() * 1.1);
      
      // Close checkout dialog
      setCheckoutOpen(false);
      
      // Show success message
      showFeedback("Order created successfully");
      
      // Open payment dialog
      setPaymentOpen(true);
      setActiveStep(2);
      
      try {
        // Explicitly clear the cart on the backend
        await api.delete('http://localhost:8083/cart/clear');
        console.log('Cart cleared on backend after order creation');
      } catch (clearErr) {
        console.error('Error clearing cart on backend:', clearErr);
        // Continue with the process even if clearing cart fails
      }
      
      // Clear cart items locally
      setCartItems([]);
      
      // Trigger cart updated event for header to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error("Error creating order:", err);
      showFeedback("Failed to create order. Please try again.", "error");
    } finally {
      setProcessingOrder(false);
    }
  };
  
  // Handle payment tab change
  const handlePaymentTabChange = (event, newValue) => {
    setPaymentTabValue(newValue);
    // Set payment method based on tab
    const methods = ['qrcode', 'paypal', 'card'];
    setPaymentMethod(methods[newValue]);
  };

  // Handle complete payment
  const handleCompletePayment = async () => {
    // Set loading state
    setProcessingOrder(true);
    
    try {
      if (paymentMethod === 'qrcode') {
        // Use fetch instead of axios to handle HTML response
        const response = await fetch('http://localhost:8083/payment', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Accept': 'text/html'  // Request HTML content
          }
        });
        
        if (!response.ok) {
          throw new Error(`Payment failed with status: ${response.status}`);
        }
        
        // Get HTML content
        const htmlContent = await response.text();
        setQrCodeHtml(htmlContent);
        
        // Cart should already be cleared when order was created,
        // but we still update the local state to be sure
        setCartItems([]);
        
        // Trigger cart updated event for header to update cart count
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Show success message
        showFeedback("QR code generated successfully", "success");
        return; // Don't close the dialog yet
      } else {
        // For other payment methods, process normally
        const response = await fetch('http://localhost:8083/payment', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Accept': '*/*'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Payment failed with status: ${response.status}`);
        }
        
        // Close payment dialog
        setPaymentOpen(false);
        
        // Show success message
        showFeedback("Payment successful! The claim has been sent to your email.", "success");
        
        // Reset steps
        setActiveStep(0);
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      showFeedback("Payment failed. Please try again.", "error");
    } finally {
      setProcessingOrder(false);
    }
  };

  // QR Code Payment Panel Component
  const QrCodePaymentPanel = () => {
    // Use the saved order total when available, otherwise calculate from current cart
    const totalAmount = savedOrderTotal > 0 ? savedOrderTotal.toFixed(2) : (calculateSubtotal() * 1.1).toFixed(2);
    
    if (qrCodeHtml) {
      return (
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center' 
          }}
        >
          <Box
            sx={{ width: '100%', textAlign: 'center' }}
            dangerouslySetInnerHTML={{ __html: qrCodeHtml }}
          />
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            Amount: ${totalAmount}
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box 
          sx={{ 
            width: 200, 
            height: 200, 
            bgcolor: '#f5f5f5',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2
          }}
        >
          <QrCodeIcon sx={{ fontSize: 100, color: '#555' }} />
        </Box>
        <Typography variant="body1" align="center" gutterBottom>
          Click Generate QR Code to continue
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Amount: ${totalAmount}
        </Typography>
      </Box>
    );
  };

  // Add new function to handle adding items to cart
  const addToCart = async (productId) => {
    setUpdating(true);
    try {
      const response = await api.post(`http://localhost:8083/cart/items/${productId}`);
      
      // If successful, update cart items
      if (response.status === 200) {
        showFeedback(response.data.message || 'Бараа сагсанд нэмэгдлээ', 'success');
      }
      
      // Trigger cart updated event for header to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (err) {
      console.error("Error adding item to cart:", err);
      
      if (err.response) {
        if (err.response.status === 400) {
          // Bad request - usually means out of stock
          showFeedback(err.response.data.message || 'Нөөц хүрэлцэхгүй байна', 'error');
        } else if (err.response.status === 409) {
          // Conflict - item already in cart
          showFeedback(err.response.data.message || 'Бараа аль хэдийн сонгогдсон байна', 'error');
        } else {
          // Other error cases
          showFeedback(err.response.data.message || 'Алдаа гарлаа', 'error');
        }
      }
    } finally {
      setUpdating(false);
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Get image URL for a product
  const getImageUrl = (productId, imageUrl) => {
    // Return the API provided imageUrl if available, otherwise fallback to placeholder
    return imageUrl || "/placeholder.jpg";
  };

  // Handle close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show feedback
  const showFeedback = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Handle login requirement
  const handleRequireLogin = (message = 'Үргэлжлүүлэхийн тулд нэвтэрнэ үү') => {
    setLoginPromptMessage(message);
    setLoginPromptOpen(true);
  };

  // Format price with thousand separators
  const formatPrice = (price) => {
    return price?.toLocaleString() || '0';
  };

  if (loading || updating) {
    return (
      <Container>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh'
        }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 1 }}>
      {/* Login Prompt Dialog */}
      <Dialog
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            background: darkMode ? 'linear-gradient(145deg, #1e1e2f, #272736)' : 'linear-gradient(145deg, #ffffff, #f5f5ff)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          pt: 3,
          background: darkMode ? 'linear-gradient(90deg, #2e2e45, #252538)' : 'linear-gradient(90deg, #f0f0ff, #e8e8ff)',
        }}>
          <Typography variant="h5" fontWeight={700} sx={{
            color: darkMode ? '#fff' : '#333',
            fontFamily: '"Poppins", sans-serif',
          }}>
            Нэвтрэх шаардлагатай
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3, px: 4 }}>
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem' }}>
              {loginPromptMessage}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, background: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)' }}>
          <Button
            onClick={() => setLoginPromptOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              px: 3,
              color: darkMode ? '#aaa' : '#555',
              borderColor: darkMode ? '#555' : '#ddd',
              '&:hover': {
                borderColor: darkMode ? '#777' : '#bbb',
                background: 'rgba(0,0,0,0.05)'
              }
            }}
          >
            Цуцлах
          </Button>
          <Button
            onClick={() => {
              setLoginPromptOpen(false);
              router.push('/login');
            }}
            variant="contained"
            disableElevation
            sx={{ 
              borderRadius: '8px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #6d42ff, #4b6eff)',
              boxShadow: '0 4px 15px rgba(75, 110, 255, 0.35)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a35e0, #3c5ce0)',
                boxShadow: '0 6px 20px rgba(75, 110, 255, 0.5)',
              }
            }}
          >
            Нэвтрэх хуудас руу очих
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            width: '100%' 
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Checkout Dialog */}
      <Dialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            background: darkMode ? 'linear-gradient(145deg, #1e1e2f, #272736)' : 'linear-gradient(145deg, #ffffff, #f5f5ff)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3,
          background: darkMode ? 'linear-gradient(90deg, #2e2e45, #252538)' : 'linear-gradient(90deg, #f0f0ff, #e8e8ff)',
        }}>
          <Typography 
            variant="h5" 
            fontWeight={700} 
            sx={{
              color: darkMode ? '#fff' : '#333',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <LocalShippingIcon /> Захиалгын мэдээлэл
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{
                '& .MuiStepLabel-root .Mui-completed': {
                  color: '#6039f0', 
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: '#6039f0', 
                },
                '& .MuiStepLabel-label': {
                  color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                  mt: 0.5
                }
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600,
                  color: darkMode ? '#f0f0ff' : '#303050',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Хүргэлтийн мэдээлэл
              </Typography>
              
              <TextField
                label="Хүргэлтийн хаяг"
                fullWidth
                multiline
                rows={3}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Хүргэлтийн дэлгэрэнгүй хаягаа оруулна уу"
                required
                error={!deliveryAddress.trim()}
                helperText={!deliveryAddress.trim() ? "Хүргэлтийн хаяг заавал шаардлагатай" : ""}
                sx={{ 
                  mb: 3,
                  '.MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  },
                  '.MuiInputLabel-root': {
                    color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                  },
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  },
                  input: {
                    color: darkMode ? '#fff' : '#000'
                  },
                  textarea: {
                    color: darkMode ? '#fff' : '#000'
                  }
                }}
              />
              
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel 
                  component="legend"
                  sx={{ 
                    color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                    mb: 1
                  }}
                >
                  Хүргэлтийн төрөл
                </FormLabel>
                <RadioGroup defaultValue="standard">
                  <FormControlLabel 
                    value="standard" 
                    control={
                      <Radio 
                        sx={{ 
                          color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                          '&.Mui-checked': {
                            color: '#6039f0'
                          }
                        }}
                      />
                    } 
                    label="Энгийн хүргэлт (1-3 ажлын өдөр)" 
                    sx={{ 
                      color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                      mb: 1
                    }}
                  />
                  <FormControlLabel 
                    value="express" 
                    control={
                      <Radio 
                        sx={{ 
                          color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                          '&.Mui-checked': {
                            color: '#6039f0'
                          }
                        }}
                      />
                    } 
                    label="Шуурхай хүргэлт (24 цагт)" 
                    sx={{ 
                      color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
                    }}
                  />
                </RadioGroup>
              </FormControl>
              
              <FormControl component="fieldset">
                <FormLabel 
                  component="legend"
                  sx={{ 
                    color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                    mb: 1
                  }}
                >
                  Төлбөрийн хэлбэр
                </FormLabel>
                <RadioGroup defaultValue="card">
                  <FormControlLabel 
                    value="card" 
                    control={
                      <Radio 
                        sx={{ 
                          color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                          '&.Mui-checked': {
                            color: '#6039f0'
                          }
                        }}
                      />
                    } 
                    label="Картаар төлөх" 
                    sx={{ 
                      color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                      mb: 1
                    }}
                  />
                  <FormControlLabel 
                    value="qrcode" 
                    control={
                      <Radio 
                        sx={{ 
                          color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                          '&.Mui-checked': {
                            color: '#6039f0'
                          }
                        }}
                      />
                    } 
                    label="QR кодоор төлөх" 
                    sx={{ 
                      color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                      mb: 1
                    }}
                  />
                  <FormControlLabel 
                    value="cash" 
                    control={
                      <Radio 
                        sx={{ 
                          color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                          '&.Mui-checked': {
                            color: '#6039f0'
                          }
                        }}
                      />
                    } 
                    label="Хүргэлтийн үед бэлнээр төлөх" 
                    sx={{ 
                      color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
                    }}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: darkMode 
                    ? 'linear-gradient(145deg, rgba(60, 60, 80, 0.5), rgba(45, 45, 65, 0.5))' 
                    : 'linear-gradient(145deg, rgba(250, 250, 255, 0.7), rgba(240, 240, 255, 0.7))',
                  border: darkMode 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: darkMode ? '#f0f0ff' : '#303050',
                    textAlign: 'center'
                  }}
                >
                  Захиалгын дүн
                </Typography>
                
                <List sx={{ mb: 2 }}>
                  {cartItems.map((item) => (
                    <ListItem 
                      key={item.productId}
                      sx={{ 
                        py: 1, 
                        px: 0,
                        borderBottom: darkMode 
                          ? '1px solid rgba(255,255,255,0.1)' 
                          : '1px solid rgba(0,0,0,0.05)'
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: darkMode ? '#e0e0e0' : '#303030'
                            }}
                          >
                            {item.name} x {item.quantity}
                          </Typography>
                        }
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: darkMode ? '#e0e0e0' : '#303030'
                        }}
                      >
                        {formatPrice(item.price * item.quantity)} ₮
                      </Typography>
                    </ListItem>
                  ))}
                </List>
                
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                    }}
                  >
                    Нийт дүн:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: darkMode ? '#e0e0e0' : '#303030'
                    }}
                  >
                    {formatPrice(calculateSubtotal())} ₮
                  </Typography>
                </Box>
                
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                    }}
                  >
                    Хүргэлтийн төлбөр:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: darkMode ? '#e0e0e0' : '#303030'
                    }}
                  >
                    0 ₮
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2, opacity: 0.2 }} />
                
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: darkMode ? '#f0f0ff' : '#303050'
                    }}
                  >
                    Нийт төлөх:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      color: '#6039f0'
                    }}
                  >
                    {formatPrice(calculateSubtotal())} ₮
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, background: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)' }}>
          <Button
            onClick={() => setCheckoutOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              px: 3,
              color: darkMode ? '#aaa' : '#555',
              borderColor: darkMode ? '#555' : '#ddd',
              '&:hover': {
                borderColor: darkMode ? '#777' : '#bbb',
                background: 'rgba(0,0,0,0.05)'
              },
              textTransform: 'none'
            }}
          >
            Цуцлах
          </Button>
          <Button
            onClick={handleCreateOrder}
            variant="contained"
            disabled={processingOrder || !deliveryAddress.trim()}
            disableElevation
            startIcon={processingOrder ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
            sx={{ 
              borderRadius: '8px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #6d42ff, #4b6eff)',
              boxShadow: '0 4px 15px rgba(75, 110, 255, 0.35)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a35e0, #3c5ce0)',
                boxShadow: '0 6px 20px rgba(75, 110, 255, 0.5)',
              },
              '&.Mui-disabled': {
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
              }
            }}
          >
            {processingOrder ? 'Боловсруулж байна...' : 'Захиалга хийх'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={paymentOpen}
        onClose={() => processingOrder ? null : setPaymentOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            background: darkMode ? 'linear-gradient(145deg, #1e1e2f, #272736)' : 'linear-gradient(145deg, #ffffff, #f5f5ff)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          p: 3,
          background: darkMode ? 'linear-gradient(90deg, #2e2e45, #252538)' : 'linear-gradient(90deg, #f0f0ff, #e8e8ff)',
        }}>
          <Typography 
            variant="h5" 
            fontWeight={700} 
            sx={{
              color: darkMode ? '#fff' : '#333',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <PaymentIcon /> Төлбөр төлөх
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Zoom in={true}>
              <Box 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(76, 175, 80, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <CheckCircleOutlineIcon sx={{ color: '#4caf50', fontSize: 30 }} />
              </Box>
            </Zoom>
            <Typography 
              variant="h6" 
              color="success.main" 
              sx={{ 
                fontWeight: 600,
                mb: 1
              }}
            >
              Таны захиалга амжилттай үүсгэгдлээ!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Төлбөрийн хэлбэрээ сонгоно уу.
            </Typography>
          </Box>
        
          <Box sx={{ width: '100%', mb: 4 }}>
            <Tabs 
              value={paymentTabValue} 
              onChange={handlePaymentTabChange} 
              variant="fullWidth"
              TabIndicatorProps={{
                style: {
                  backgroundColor: '#6039f0',
                }
              }}
              sx={{
                '& .MuiTab-root': {
                  color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                  textTransform: 'none',
                  minHeight: '60px'
                },
                '& .Mui-selected': {
                  color: '#6039f0',
                  fontWeight: 600
                },
                borderBottom: 1, 
                borderColor: 'divider',
                mb: 3
              }}
            >
              <Tab 
                icon={<QrCodeIcon />} 
                label="QR Код" 
                iconPosition="start"
              />
              <Tab 
                icon={<AccountBalanceIcon />} 
                label="Банк" 
                iconPosition="start"
              />
              <Tab 
                icon={<CreditCardIcon />} 
                label="Картаар" 
                iconPosition="start"
              />
            </Tabs>
            
            {/* QR Code Payment Panel */}
            {paymentTabValue === 0 && <QrCodePaymentPanel />}
            
            {/* Bank Transfer Panel */}
            {paymentTabValue === 1 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Доорх дансанд шилжүүлэг хийнэ үү
                </Typography>
                <Paper 
                  elevation={0}
                  sx={{
                    p: 2,
                    mt: 2,
                    mb: 3,
                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '12px',
                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      mb: 1
                    }}
                  >
                    Банк: Хаан Банк
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                      mb: 1
                    }}
                  >
                    Дансны дугаар: 5009998877
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                    }}
                  >
                    Хүлээн авагч: Итех И-Коммерс ХХК
                  </Typography>
                </Paper>
                <TextField
                  label="Гүйлгээний утга"
                  fullWidth
                  variant="outlined"
                  sx={{
                    mb: 3,
                    '.MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    },
                    '.MuiInputLabel-root': {
                      color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                    },
                    '.MuiOutlinedInput-notchedOutline': {
                      borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    },
                    input: {
                      color: darkMode ? '#fff' : '#000'
                    }
                  }}
                />
              </Box>
            )}
            
            {/* Card Payment Panel */}
            {paymentTabValue === 2 && (
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Карт эзэмшигчийн нэр"
                      fullWidth
                      variant="outlined"
                      sx={{
                        mb: 2,
                        '.MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        },
                        '.MuiInputLabel-root': {
                          color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        input: {
                          color: darkMode ? '#fff' : '#000'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Картын дугаар"
                      fullWidth
                      variant="outlined"
                      sx={{
                        mb: 2,
                        '.MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        },
                        '.MuiInputLabel-root': {
                          color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        input: {
                          color: darkMode ? '#fff' : '#000'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Хүчинтэй хугацаа"
                      placeholder="MM/YY"
                      fullWidth
                      variant="outlined"
                      sx={{
                        '.MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        },
                        '.MuiInputLabel-root': {
                          color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        input: {
                          color: darkMode ? '#fff' : '#000'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="CVV"
                      fullWidth
                      variant="outlined"
                      sx={{
                        '.MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        },
                        '.MuiInputLabel-root': {
                          color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                        },
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        },
                        input: {
                          color: darkMode ? '#fff' : '#000'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: '12px',
              background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="body1" fontWeight={600}>
              Нийт төлөх
            </Typography>
            <Typography variant="h6" fontWeight={700} color="#6039f0">
              {formatPrice(savedOrderTotal > 0 ? savedOrderTotal : calculateSubtotal())} ₮
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, background: darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)' }}>
          <Button
            onClick={() => setPaymentOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              px: 3,
              color: darkMode ? '#aaa' : '#555',
              borderColor: darkMode ? '#555' : '#ddd',
              '&:hover': {
                borderColor: darkMode ? '#777' : '#bbb',
                background: 'rgba(0,0,0,0.05)'
              },
              textTransform: 'none'
            }}
            disabled={processingOrder}
          >
            Хаах
          </Button>
          <Button
            onClick={handleCompletePayment}
            variant="contained"
            disabled={processingOrder}
            disableElevation
            sx={{ 
              borderRadius: '8px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #6d42ff, #4b6eff)',
              boxShadow: '0 4px 15px rgba(75, 110, 255, 0.35)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a35e0, #3c5ce0)',
                boxShadow: '0 6px 20px rgba(75, 110, 255, 0.5)',
              },
              minWidth: '150px'
            }}
          >
            {processingOrder ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              paymentTabValue === 0 ? 
                (qrCodeHtml ? 'Хаах' : 'QR код үүсгэх') : 
                paymentTabValue === 1 ? 'Шилжүүлэг хийх' : 
                'Төлбөр төлөх'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Main Cart Content */}
      <Fade in={true} timeout={800}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, md: 4 }, 
            borderRadius: '16px',
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
              : '0 8px 32px rgba(0, 0, 0, 0.08)',
            background: darkMode 
              ? 'rgba(40, 40, 60, 0.9)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: darkMode 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* If cart is empty */}
          {cartItems.length === 0 && !loading && (
            <Box 
              sx={{ 
                textAlign: 'center', 
                py: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3
              }}
            >
              <Zoom in={true} timeout={500}>
                <Box 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    borderRadius: '50%', 
                    background: darkMode 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <ShoppingCartIcon sx={{ 
                    fontSize: 60, 
                    color: darkMode 
                      ? 'rgba(255,255,255,0.3)' 
                      : 'rgba(0,0,0,0.2)' 
                  }} />
                </Box>
              </Zoom>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 600, 
                  color: darkMode ? '#f0f0ff' : '#303050',
                  mb: 1
                }}
              >
                Таны сагс хоосон байна
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                  maxWidth: '600px',
                  mb: 4
                }}
              >
                Бүтээгдэхүүнүүдээс сонирхон сагсандаа нэмээрэй. Танд тохирох олон сонголтууд байгаа.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => router.push('/Products')}
                sx={{ 
                  py: 1.5,
                  px: 4,
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #6d42ff, #4b6eff)',
                  boxShadow: '0 4px 15px rgba(75, 110, 255, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a35e0, #3c5ce0)',
                    boxShadow: '0 6px 20px rgba(75, 110, 255, 0.5)',
                  }
                }}
              >
                Бүтээгдэхүүн харах
              </Button>
            </Box>
          )}

          {/* Cart items list */}
          {cartItems.length > 0 && (
            <Box>
              <Grid container spacing={4}>
                {/* Cart Items Column */}
                <Grid item xs={12} md={8}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 600,
                      color: darkMode ? '#f0f0ff' : '#303050',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <ShoppingCartIcon sx={{ mr: 1.5 }} /> 
                    Сагсны бараанууд 
                    <Chip 
                      label={cartItems.length} 
                      size="small" 
                      sx={{ 
                        ml: 2, 
                        bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', 
                        color: darkMode ? '#fff' : '#333',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    {cartItems.map((item) => (
                      <Grow key={item.productId} in={true} timeout={500}>
                        <Paper
                          elevation={0}
                          sx={{
                            mb: 2,
                            p: 2,
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'center', sm: 'flex-start' },
                            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                              transform: 'translateY(-3px)'
                            }
                          }}
                        >
                          {/* Product Image */}
                          <Box
                            sx={{
                              width: { xs: '100%', sm: 100 },
                              height: { xs: 160, sm: 100 },
                              mr: { xs: 0, sm: 3 },
                              mb: { xs: 2, sm: 0 },
                              borderRadius: '8px',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: darkMode ? '#1a1a2e' : '#f8f9fa'
                            }}
                          >
                            <Box
                              component="img"
                              src={getImageUrl(item.productId, item.imageUrl)}
                              alt={item.name}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          </Box>

                          {/* Product Details */}
                          <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                flexDirection: { xs: 'column', sm: 'row' },
                                mb: 1
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 600,
                                  mb: { xs: 1, sm: 0 },
                                  color: darkMode ? '#e0e0e0' : '#303030'
                                }}
                              >
                                {item.name}
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  color: '#6039f0'
                                }}
                              >
                                {formatPrice(item.price)} ₮
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                flexDirection: { xs: 'column', sm: 'row' },
                                mt: 1.5
                              }}
                            >
                              {/* Quantity Controls */}
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: { xs: 2, sm: 0 }
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) => decreaseQuantity(e, item.productId, item.quantity)}
                                  disabled={updating || item.quantity <= 1 || updatingProductId === item.productId}
                                  sx={{
                                    bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                    '&:hover': {
                                      bgcolor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                                    }
                                  }}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    mx: 2,
                                    fontWeight: 'bold',
                                    minWidth: '36px',
                                    textAlign: 'center',
                                    color: darkMode ? '#e0e0e0' : '#303030'
                                  }}
                                >
                                  {updatingProductId === item.productId ? (
                                    <CircularProgress size={16} thickness={6} sx={{ color: darkMode ? '#aaa' : '#666' }} />
                                  ) : (
                                    item.quantity
                                  )}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={(e) => increaseQuantity(e, item.productId)}
                                  disabled={updating || updatingProductId === item.productId}
                                  sx={{
                                    bgcolor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                    '&:hover': {
                                      bgcolor: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'
                                    }
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>

                              {/* Remove Button */}
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={removingProductId === item.productId ? (
                                  <CircularProgress size={16} thickness={6} />
                                ) : (
                                  <DeleteIcon />
                                )}
                                onClick={(e) => removeItem(e, item.productId)}
                                disabled={updating || removingProductId === item.productId}
                                sx={{
                                  borderRadius: '8px',
                                  borderColor: darkMode ? 'rgba(244, 67, 54, 0.5)' : 'rgba(244, 67, 54, 0.3)',
                                  color: darkMode ? '#f44336' : '#d32f2f',
                                  '&:hover': {
                                    borderColor: '#f44336',
                                    background: 'rgba(244, 67, 54, 0.08)'
                                  },
                                  textTransform: 'none'
                                }}
                              >
                                Устгах
                              </Button>
                            </Box>
                          </Box>
                        </Paper>
                      </Grow>
                    ))}
                  </Box>
                  
                  <Box sx={{ mt: 4, textAlign: 'left' }}>
                    <Button
                      variant="outlined"
                      startIcon={<KeyboardBackspaceIcon />}
                      onClick={() => router.push('/products')}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                        color: darkMode ? '#aaa' : '#666',
                        px: 3,
                        py: 1,
                        '&:hover': {
                          borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                        }
                      }}
                    >
                      Худалдаа үргэлжлүүлэх
                    </Button>
                  </Box>
                </Grid>

                {/* Order Summary Column */}
                <Grid item xs={12} md={4}>
                  <Fade in={true} timeout={1000}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: darkMode 
                          ? 'linear-gradient(145deg, rgba(60, 60, 80, 0.8), rgba(45, 45, 65, 0.8))' 
                          : 'linear-gradient(145deg, rgba(250, 250, 255, 0.9), rgba(240, 240, 255, 0.9))',
                        border: darkMode 
                          ? '1px solid rgba(255, 255, 255, 0.1)' 
                          : '1px solid rgba(0, 0, 0, 0.05)',
                        boxShadow: darkMode 
                          ? '0 10px 30px rgba(0, 0, 0, 0.25)' 
                          : '0 10px 30px rgba(0, 0, 0, 0.08)',
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          mb: 3,
                          fontWeight: 700,
                          color: darkMode ? '#f0f0ff' : '#303050',
                          textAlign: 'center'
                        }}
                      >
                        Захиалгын дүн
                      </Typography>

                      <Divider sx={{ mb: 3, opacity: 0.2 }} />

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 2
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                          }}
                        >
                          Нийт бараа:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: darkMode ? '#e0e0e0' : '#303030'
                          }}
                        >
                          {cartItems.reduce((total, item) => total + item.quantity, 0)} ширхэг
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 2
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                          }}
                        >
                          Нийт дүн:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: darkMode ? '#e0e0e0' : '#303030'
                          }}
                        >
                          {formatPrice(calculateSubtotal())} ₮
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 3
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
                          }}
                        >
                          Хүргэлтийн төлбөр:
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: darkMode ? '#e0e0e0' : '#303030'
                          }}
                        >
                          0 ₮
                        </Typography>
                      </Box>

                      <Divider sx={{ mb: 3, opacity: 0.2 }} />

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 3
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: darkMode ? '#f0f0ff' : '#303050'
                          }}
                        >
                          Нийт төлөх:
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: '#6039f0'
                          }}
                        >
                          {formatPrice(calculateSubtotal())} ₮
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => setCheckoutOpen(true)}
                        sx={{
                          mt: 2,
                          py: 1.5,
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 600,
                          background: 'linear-gradient(45deg, #6d42ff, #4b6eff)',
                          boxShadow: '0 4px 15px rgba(75, 110, 255, 0.35)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5a35e0, #3c5ce0)',
                            boxShadow: '0 6px 20px rgba(75, 110, 255, 0.5)',
                          }
                        }}
                      >
                        Захиалга хийх
                      </Button>

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mt: 3,
                          gap: 1
                        }}
                      >
                        <InfoOutlinedIcon
                          sx={{
                            fontSize: '0.9rem',
                            color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                            textAlign: 'center'
                          }}
                        >
                          Захиалга хийснээр худалдан авалтын нөхцөлийг зөвшөөрнө.
                        </Typography>
                      </Box>
                    </Paper>
                  </Fade>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Fade>
    </Container>
  );
};

export default ProdCartSection;
