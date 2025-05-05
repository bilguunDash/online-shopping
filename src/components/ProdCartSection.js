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
  Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import api from "../utils/axios";

const ProdCartSection = ({ cartItems, setCartItems, loading, error }) => {
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
  
  const steps = ['Review Cart', 'Order Summary', 'Payment'];

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

  // Handle increase quantity
  const increaseQuantity = async (e, productId) => {
    if (e) e.preventDefault(); // Prevent default behavior
    setUpdating(true);
    
    try {
      const response = await api.put(`http://localhost:8083/cart/items/${productId}/increase`);
      
      // Update cart items locally
      setCartItems(cartItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
      
      // Trigger cart updated event for header to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show feedback
      if (response.status === 200) {
        showFeedback(response.data.message || 'Бараа сагсанд нэмэгдлээ', 'success');
      }
    } catch (err) {
      console.error("Error increasing item quantity:", err);
      
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

  // Handle decrease quantity
  const decreaseQuantity = async (e, productId, currentQuantity) => {
    if (e) e.preventDefault(); // Prevent default behavior
    if (currentQuantity <= 1) return;
    
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

  // Handle remove item
  const removeItem = async (e, productId) => {
    if (e) e.preventDefault(); // Prevent default behavior
    setUpdating(true);
    
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
    }
  };

  // Handle checkout button click
  const handleCheckout = () => {
    setCheckoutOpen(true);
    setActiveStep(1);
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
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 4, 
          fontWeight: 600 
        }}
      >
        Shopping Cart
      </Typography>

      {
      cartItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Add products to your cart to see them here.
          </Typography>
          <Button 
            variant="contained" 
            href="/Products"
            sx={{ 
              bgcolor: '#1e4620',
              '&:hover': { bgcolor: '#143314' },
              borderRadius: 1,
              textTransform: 'none',
            }}
          >
            Continue Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              {cartItems.map((item, index) => (
                <React.Fragment key={item.productId}>
                  <Grid container spacing={2} sx={{ py: 2 }}>
                    {/* Product Image */}
                    <Grid item xs={3} sm={2}>
                      <Card elevation={0} sx={{ backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                        <CardMedia
                          component="img"
                          image={getImageUrl(item.productId, item.imageUrl)}
                          alt={item.name}
                          sx={{ 
                            height: 100, 
                            objectFit: 'contain',
                            p: 1
                          }}
                        />
                      </Card>
                    </Grid>
                    
                    {/* Product Details */}
                    <Grid item xs={9} sm={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.description || `Product ID: ${item.productId}`}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          size="small" 
                          onClick={(e) => decreaseQuantity(e, item.productId, item.quantity)}
                          disabled={item.quantity <= 1}
                          sx={{ border: '1px solid #ddd', borderRadius: 1 }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ mx: 2 }}>
                          {item.quantity}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={(e) => increaseQuantity(e, item.productId)}
                          sx={{ border: '1px solid #ddd', borderRadius: 1 }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                    
                    {/* Price and Remove */}
                    <Grid item xs={8} sm={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        ${item.price.toFixed(2)} each
                      </Typography>
                      <Button 
                        startIcon={<DeleteIcon />} 
                        color="error" 
                        onClick={(e) => removeItem(e, item.productId)}
                        sx={{ textTransform: 'none' }}
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                  {index < cartItems.length - 1 && (
                    <Divider sx={{ my: 2 }} />
                  )}
                </React.Fragment>
              ))}
            </Paper>
          </Grid>
          
          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Order Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Subtotal {cartItems.length > 0 ? `(${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'})` : ''}</Typography>
                <Typography fontWeight={500}>${calculateSubtotal().toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Shipping</Typography>
                <Typography fontWeight={500}>Free</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Tax</Typography>
                <Typography fontWeight={500}>${(calculateSubtotal() * 0.1).toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>Total</Typography>
                <Typography variant="h6" fontWeight={600}>
                  ${(calculateSubtotal() * 1.1).toFixed(2)}
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                fullWidth
                onClick={handleCheckout}
                sx={{ 
                  bgcolor: '#1e4620',
                  py: 1.5,
                  '&:hover': { bgcolor: '#143314' },
                  borderRadius: 1,
                  textTransform: 'none',
                  fontSize: '1rem'
                }}
              >
                Checkout
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Order Summary Dialog */}
      <Dialog 
        open={checkoutOpen} 
        onClose={() => setCheckoutOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>Order Summary</Typography>
        </DialogTitle>
        <DialogContent>
          <List>
            {cartItems.map((item) => (
              <ListItem key={item.productId} divider>
                <Grid container alignItems="center">
                  <Grid item xs={2}>
                    <CardMedia
                      component="img"
                      image={getImageUrl(item.productId, item.imageUrl)}
                      alt={item.name}
                      sx={{ height: 60, objectFit: 'contain' }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ListItemText 
                      primary={item.name} 
                      secondary={`Quantity: ${item.quantity}`} 
                    />
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>Order Details</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal {cartItems.length > 0 ? `(${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'})` : ''}</Typography>
              <Typography>${calculateSubtotal().toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tax (10%)</Typography>
              <Typography>${(calculateSubtotal() * 0.1).toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Shipping</Typography>
              <Typography>Free</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={600}>Total</Typography>
              <Typography variant="h6" fontWeight={600}>${(calculateSubtotal() * 1.1).toFixed(2)}</Typography>
            </Box>
          </Box>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>Delivery Information</Typography>
            <TextField
              label="Delivery Address"
              fullWidth
              multiline
              rows={3}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your full delivery address"
              required
              error={!deliveryAddress.trim()}
              helperText={!deliveryAddress.trim() ? "Delivery address is required" : ""}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setCheckoutOpen(false)}
            variant="outlined"
            sx={{ color: '#333', borderColor: '#333' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateOrder}
            variant="contained"
            disabled={processingOrder || !deliveryAddress.trim()}
            sx={{ 
              bgcolor: '#1e4620',
              '&:hover': { bgcolor: '#143314' },
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            {processingOrder ? 'Processing...' : 'Place Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog 
        open={paymentOpen} 
        onClose={() => setPaymentOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>Payment</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" color="success.main" gutterBottom>
              Your order has been created successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please select your preferred payment method below.
            </Typography>
          </Box>
          
          <Box sx={{ width: '100%', mb: 4 }}>
            <Tabs 
              value={paymentTabValue} 
              onChange={handlePaymentTabChange} 
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                mb: 3
              }}
            >
              <Tab 
                icon={<QrCodeIcon />} 
                label="QR Code" 
                sx={{ 
                  textTransform: 'none',
                  '&.Mui-selected': { 
                    color: '#1e4620',
                    fontWeight: 'bold' 
                  }
                }} 
              />
              <Tab 
                icon={<AccountBalanceIcon />} 
                label="PayPal" 
                sx={{ 
                  textTransform: 'none',
                  '&.Mui-selected': { 
                    color: '#1e4620',
                    fontWeight: 'bold' 
                  }
                }} 
              />
              <Tab 
                icon={<CreditCardIcon />} 
                label="Card" 
                sx={{ 
                  textTransform: 'none',
                  '&.Mui-selected': { 
                    color: '#1e4620',
                    fontWeight: 'bold' 
                  }
                }} 
              />
            </Tabs>
            
            {/* QR Code Payment Panel */}
            {paymentTabValue === 0 && <QrCodePaymentPanel />}
            
            {/* PayPal Payment Panel */}
            {paymentTabValue === 1 && (
              <Box sx={{ p: 2 }}>
                <Typography variant="body1" gutterBottom>
                  You will be redirected to PayPal to complete your payment.
                </Typography>
                <TextField
                  label="PayPal Email"
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                />
              </Box>
            )}
            
            {/* Card Payment Panel */}
            {paymentTabValue === 2 && (
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Cardholder Name"
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Card Number"
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Expiration Date"
                      placeholder="MM/YY"
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="CVV"
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={600}>Total</Typography>
              <Typography variant="h6" fontWeight={600}>
                ${savedOrderTotal > 0 ? savedOrderTotal.toFixed(2) : (calculateSubtotal() * 1.1).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setPaymentOpen(false)}
            variant="outlined"
            sx={{ color: '#333', borderColor: '#333' }}
            disabled={processingOrder}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCompletePayment}
            variant="contained"
            disabled={processingOrder}
            sx={{ 
              bgcolor: '#1e4620',
              '&:hover': { bgcolor: '#143314' },
              textTransform: 'none',
              fontSize: '1rem',
              minWidth: '150px'
            }}
          >
            {processingOrder ? 
              <CircularProgress size={24} color="inherit" /> : 
              (paymentTabValue === 0 ? 
                (qrCodeHtml ? 'Close' : 'Generate QR Code') : 
                paymentTabValue === 1 ? 'Continue to PayPal' : 'Complete Payment')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProdCartSection;
