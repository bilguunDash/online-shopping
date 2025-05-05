import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  useTheme,
  Snackbar,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import api from '../utils/axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentIcon from '@mui/icons-material/Payment';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/router';

const AccountSection = () => {
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    orderId: null,
    content: null,
    loading: false
  });
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    // Fetch data based on selected tab
    if (tabValue === 0) {
      fetchOrders();
    } else if (tabValue === 1) {
      fetchWishlist();
    }

    // Create a named handler function for the wishlist updates
    const handleWishlistUpdate = () => {
      console.log('Wishlist updated event received in AccountSection');
      fetchWishlist();
    };

    // Add event listener for wishlist updates
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    // Cleanup
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, [tabValue]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('http://localhost:8083/order/orders-all');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = () => {
    setLoading(true);
    setError(null);
    try {
      // Get wishlist from localStorage
      const savedWishlist = localStorage.getItem('wishlist');
      console.log('Raw wishlist from localStorage:', savedWishlist);
      
      if (savedWishlist) {
        try {
          const parsedWishlist = JSON.parse(savedWishlist);
          console.log('Parsed wishlist:', parsedWishlist);
          
          // Validate wishlist data structure
          if (Array.isArray(parsedWishlist)) {
            // Filter out any items without valid ID and ensure all items have necessary fields
            const validWishlistItems = parsedWishlist
              .filter(item => item && (item.id || item.productId))
              .map(item => {
                const productId = item.id || item.productId;
                // Ensure item has all required fields
                return {
                  id: productId,
                  productId: productId,
                  name: item.name || item.title || "Unknown Product",
                  title: item.title || item.name || "Unknown Product",
                  price: item.price || 0,
                  imageUrl: item.imageUrl || "/placeholder.jpg",
                  // Include other fields that might be present
                  ...item
                };
              });
            
            console.log('Validated wishlist items:', validWishlistItems);
            setWishlist(validWishlistItems);
            
            // Update localStorage with validated items if needed
            if (validWishlistItems.length !== parsedWishlist.length) {
              console.log('Updating localStorage with validated wishlist items');
              localStorage.setItem('wishlist', JSON.stringify(validWishlistItems));
            }
          } else {
            console.error('Wishlist is not an array:', parsedWishlist);
            setWishlist([]);
            // Reset localStorage with an empty array
            localStorage.setItem('wishlist', JSON.stringify([]));
          }
        } catch (parseError) {
          console.error('Error parsing wishlist JSON:', parseError);
          setWishlist([]);
          // Reset localStorage with an empty array
          localStorage.setItem('wishlist', JSON.stringify([]));
        }
      } else {
        console.log('No wishlist found in localStorage');
        setWishlist([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load your wishlist. Please try again later.');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color for chip
  const getStatusColor = (status) => {
    if (!status) return theme.palette.grey[500];
    
    switch (status) {
      case 'PENDING':
        return theme.palette.warning.main;
      case 'PAID':
        return theme.palette.info.main;
      case 'SHIPPING':
        return theme.palette.primary.main;
      case 'DELIVERED':
        return theme.palette.success.main;
      case 'CANCELLED':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Order detail view (placeholder)
  const handleViewOrder = (orderId) => {
    console.log(`View order: ${orderId}`);
    // Implement navigation to order detail page if needed
  };

  // Remove from wishlist
  const handleRemoveFromWishlist = (product) => {
    const productId = product.id || product.productId;
    console.log(`Removing product from wishlist: ${productId}`, product);
    
    // Get current wishlist from localStorage to ensure we're working with latest data
    let currentWishlist = [];
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        currentWishlist = JSON.parse(savedWishlist);
        if (!Array.isArray(currentWishlist)) {
          console.error('Saved wishlist is not an array, resetting');
          currentWishlist = [];
        }
      }
    } catch (err) {
      console.error('Error parsing wishlist from localStorage:', err);
    }
    
    // Remove from wishlist
    const updatedWishlist = currentWishlist.filter(item => {
      const itemId = item.id || item.productId;
      return itemId !== productId;
    });
    
    console.log('Updated wishlist after removal:', updatedWishlist);
    
    // Update localStorage with try-catch to handle potential errors
    try {
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    } catch (err) {
      console.error('Error saving wishlist to localStorage:', err);
    }
    
    // Update state
    setWishlist(updatedWishlist);
    
    // Show notification
    setNotification({
      open: true,
      message: `${product.title || product.name} removed from wishlist`,
      severity: 'info'
    });
    
    // Dispatch event for other components to listen
    console.log('Dispatching wishlistUpdated event from handleRemoveFromWishlist');
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  // Add to cart from wishlist
  const handleAddToCartFromWishlist = async (product) => {
    console.log('Adding to cart from wishlist:', product);
    try {
      setLoading(true);
      
      // First check if we need to create a cart (first item)
      try {
        await api.post("http://localhost:8083/cart");
      } catch (err) {
        // Cart likely already exists, continue
        console.log("Cart exists or error occurred:", err);
      }
      
      // Add item to cart
      const response = await api.post(`http://localhost:8083/cart/items/${product.id || product.productId}`);
      console.log('Add to cart response:', response.data);
      
      // Store product image in localStorage for cart display
      const cartItemsImages = JSON.parse(localStorage.getItem('cartItemsImages') || '{}');
      cartItemsImages[product.id || product.productId] = product.imageUrl || "/placeholder.jpg";
      localStorage.setItem('cartItemsImages', JSON.stringify(cartItemsImages));
      
      // Trigger cart updated event for header to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success message
      setNotification({
        open: true,
        message: response.data?.message || `${product.title || product.name} added to cart!`,
        severity: 'success'
      });
    } catch (err) {
      console.error("Error adding item to cart:", err);
      // Check if the error is related to stock availability
      const errorMessage = err.response?.data?.message || err.message;
      setNotification({
        open: true,
        message: errorMessage.includes('stock') ? errorMessage : "Failed to add item to cart. Please try again.",
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await api.post(`http://localhost:8083/order/cancel-order/${orderId}`);
      
      // Show success notification
      setNotification({
        open: true,
        message: response.data?.message || 'Order cancelled successfully',
        severity: 'success'
      });
      
      // Refresh orders to show updated status
      fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Failed to cancel order. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle payment verification
  const handleVerifyPayment = async (orderId) => {
    try {
      // Open the payment dialog
      setPaymentDialog({
        open: true,
        orderId,
        content: null,
        loading: true
      });

      // Fetch the QR code HTML content from the API
      const response = await api.get(`http://localhost:8083/payment?orderId=${orderId}`, {
        headers: {
          'Accept': 'text/html'
        },
        responseType: 'text'
      });

      // Set the HTML content to display in the dialog
      setPaymentDialog(prev => ({
        ...prev, 
        content: response.data,
        loading: false
      }));

      // Set success notification for payment (this assumes payment is immediate)
      // In a real app, you might get a callback or need to poll for payment status
      setNotification({
        open: true,
        message: 'Төлбөр амжилттай төлөгдлөө. email-руу нэхэмжлэл илгээгдлээ.',
        severity: 'success'
      });

      // Refresh orders after payment to show updated status
      fetchOrders();
    } catch (err) {
      console.error('Error processing payment:', err);
      setPaymentDialog(prev => ({
        ...prev,
        loading: false
      }));
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Payment processing failed. Please try again.',
        severity: 'error'
      });
    }
  };

  // Close payment dialog
  const handleClosePaymentDialog = () => {
    setPaymentDialog({
      open: false,
      orderId: null,
      content: null,
      loading: false
    });
    
    // Refresh orders to see if status changed
    fetchOrders();
  };

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        My Account
      </Typography>
      
      <Paper sx={{ mb: 4, overflow: 'hidden', borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 500,
              fontSize: '1rem',
              py: 2
            }
          }}
        >
          <Tab label="My Orders" />
          <Tab label="Wishlist" />
        </Tabs>
        
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Orders Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Order History
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
              ) : orders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    You don't have any orders yet.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    href="/Products"
                  >
                    Start Shopping
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table sx={{ minWidth: 650 }} aria-label="orders table">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                        <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow 
                          key={order.orderId}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            #{order.orderId}
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>{order.productName}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip 
                              label={order.status} 
                              sx={{ 
                                backgroundColor: getStatusColor(order.status),
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '0.75rem'
                              }} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {/* Show payment verification for PENDING orders */}
                              {order.status === 'PENDING' && (
                                <>
                                  <Tooltip title="Verify Payment">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleVerifyPayment(order.orderId)}
                                      color="primary"
                                      disabled={loading}
                                    >
                                      <PaymentIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Tooltip title="Cancel Order">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleCancelOrder(order.orderId)}
                                      color="error"
                                      disabled={loading}
                                    >
                                      <CancelIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
          
          {/* Wishlist Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                My Wishlist
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
              ) : wishlist.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    Your wishlist is empty.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    href="/Products"
                  >
                    Browse Products
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {wishlist.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id || product.productId}>
                      <Card sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        borderRadius: 2,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[4]
                        }
                      }}>
                        <Box sx={{ 
                          height: 160, 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2,
                          position: 'relative'
                        }}>
                          <IconButton
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              color: 'error.main'
                            }}
                            onClick={() => handleRemoveFromWishlist(product)}
                          >
                            <DeleteIcon />
                          </IconButton>
                          <img 
                            src={product.imageUrl || "/placeholder.jpg"} 
                            alt={product.title || product.name}
                            style={{ 
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        </Box>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {product.title || product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            ${product.price ? product.price.toFixed(2) : 'N/A'}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1 }}>
                            <Button 
                              variant="outlined" 
                              size="small"
                              onClick={() => {
                                // Store product data and navigate to detail page
                                localStorage.setItem('selectedProduct', JSON.stringify(product));
                                router.push({
                                  pathname: `/ProductDetail`,
                                  query: { id: product.id || product.productId }
                                });
                              }}
                              sx={{ flex: 1 }}
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="contained" 
                              size="small"
                              color="primary"
                              onClick={() => handleAddToCartFromWishlist(product)}
                              disabled={loading}
                              sx={{ flex: 1 }}
                            >
                              Add to Cart
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialog.open}
        onClose={handleClosePaymentDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6">Payment for Order #{paymentDialog.orderId}</Typography>
          <IconButton onClick={handleClosePaymentDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {paymentDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : paymentDialog.content ? (
            <Box>
              {/* This is where the QR code HTML would be rendered */}
              {/* Since we can't directly render HTML string in React, you would need to use an iframe or dangerouslySetInnerHTML */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 2 
                }}
              >
                <Typography variant="body1">
                  Please scan the QR code below to complete payment
                </Typography>
                
                <Box 
                  dangerouslySetInnerHTML={{ __html: paymentDialog.content }} 
                  sx={{ 
                    border: '1px solid #eee', 
                    borderRadius: 2, 
                    p: 3,
                    my: 2,
                    width: '100%',
                    '& img': {
                      maxWidth: '100%',
                      height: 'auto'
                    }
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Typography color="error">Failed to load payment information</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            variant="contained" 
            onClick={handleClosePaymentDialog}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AccountSection;
