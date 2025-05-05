import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  useTheme,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from '../../components/AdminHeader';
// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import api from '../../utils/axios';

const drawerWidth = 0;

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  marginLeft: 0,
  marginTop: 0,
  width: '100%',
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '10px',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
    : '0 2px 10px rgba(0,0,0,0.08)',
  backgroundColor: theme.palette.background.paper,
  margin: '0 auto',
  width: '100%',
  overflow: 'hidden'
}));

const OrderDetailCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 10px rgba(0, 0, 0, 0.2)' 
    : '0 1px 5px rgba(0,0,0,0.05)',
  borderRadius: '8px',
}));

const StatusChip = styled(Chip)(({ theme, statuscolor }) => ({
  fontWeight: 500,
  backgroundColor: statuscolor,
  color: '#fff',
  '& .MuiChip-label': {
    padding: '0 10px',
  }
}));

const AdminOrders = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(null);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  
  // Status management
  const [tabValue, setTabValue] = useState(0);
  const tabs = ['All Orders', 'Today', 'This Week', 'This Month', 'Custom'];
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Fetch all orders
    fetchOrders();
  }, [router]);
  
  // Fetch all orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/orders-all", {
        baseURL: 'http://localhost:8083'
      });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setNotification({
        open: true,
        message: 'Error loading orders: ' + error.message,
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  // Handle tab change for filtering orders
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Get filtered orders based on selected tab
  const getFilteredOrders = () => {
    // Only show orders in the "All Orders" tab (index 0)
    if (tabValue === 0) return orders;
    
    // Return empty array for other tabs
    return [];
  };
  
  // Handle view order details
  const handleViewOrder = (order, index) => {
    setSelectedOrder(order);
    setSelectedOrderIndex(index);
    setOpenOrderDialog(true);
  };
  
  // Handle close order details dialog
  const handleCloseOrderDialog = () => {
    setOpenOrderDialog(false);
  };
  
  // Get status color for chip
  const getStatusColor = (status) => {
    if (!status) return theme.palette.grey[500];
    
    switch (status) {
      case 'PENDING':
        return theme.palette.warning.main;
      case 'SHIPPING':
        return theme.palette.info.main;
      case 'DELIVERED':
        return theme.palette.success.main;
      case 'CANCELLED':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  // Handle update order status
  const handleUpdateStatus = async (orderIndex, newStatus) => {
    if (!selectedOrder) return;
    
    setLoading(true);
    try {
      // Get the actual order from the filtered orders
      const filteredOrders = getFilteredOrders();
      const orderToUpdate = filteredOrders[orderIndex];
      
      const response = await api.put(`/admin/orders/${orderToUpdate.orderId}/status`, { 
        status: newStatus 
      }, {
        baseURL: 'http://localhost:8083'
      });
      
      setNotification({
        open: true,
        message: response.data?.message || 'Order status updated successfully',
        severity: 'success'
      });
      
      // Refresh orders
      fetchOrders();
      handleCloseOrderDialog();
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification({
        open: true,
        message: 'Error updating order status: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle cancel order
  const handleCancelOrder = async (orderIndex) => {
    if (!selectedOrder) return;
    
    setLoading(true);
    try {
      // Get the actual order from the filtered orders
      const filteredOrders = getFilteredOrders();
      const orderToCancel = filteredOrders[orderIndex];
      
      const response = await api.post(`/admin/cancel-order/${orderToCancel.orderId}`, {}, {
        baseURL: 'http://localhost:8083'
      });
      
      setNotification({
        open: true,
        message: response.data?.message || 'Order cancelled successfully',
        severity: 'success'
      });
      
      // Refresh orders
      fetchOrders();
      handleCloseOrderDialog();
    } catch (error) {
      console.error('Error cancelling order:', error);
      setNotification({
        open: true,
        message: 'Error cancelling order: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Format date 
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Handle close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ 
      display: 'flex',
      backgroundColor: theme.palette.background.default, 
      minHeight: '100vh'
    }}>
      <AdminHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <Main>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: theme.palette.text.primary}}>
            Order Management
          </Typography>
          
          <StyledPaper>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              {tabs.map((tab, index) => (
                <Tab 
                  key={index} 
                  label={tab} 
                  sx={{ 
                    fontWeight: 500,
                    minWidth: 100
                  }} 
                />
              ))}
            </Tabs>
            
            {tabValue === 0 ? (
              <div style={{ width: '100%', overflowX: 'auto', maxWidth: '100%', display: 'block' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.palette.primary.main }}>
                    <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '10%' }}>Order ID</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '10%' }}>Customer</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>Email</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>Product</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '5%' }}>Quantity</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '10%' }}>Price</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '10%' }}>Total</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>Status</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>Date</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '5%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '16px' }}>
                          <CircularProgress size={24} />
                        </td>
                      </tr>
                    ) : getFilteredOrders().length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '16px' }}>
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      getFilteredOrders().map((order, index) => (
                        <tr key={index} style={{ 
                          backgroundColor: index % 2 === 0 ? 'transparent' : theme.palette.action.hover,
                          '&:hover': { backgroundColor: theme.palette.action.hover }
                        }}>
                          <td style={{ padding: '8px 16px', textAlign: 'center' }}>{`${order.orderId}`}</td>
                          <td style={{ padding: '8px 16px', textAlign: 'center' }}>{`${order.firstName} ${order.lastName}`}</td>
                          <td style={{ padding: '8px 16px', textAlign: 'center', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.email}</td>
                          <td style={{ padding: '8px 16px', textAlign: 'center', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.productName}</td>
                          <td style={{ padding: '8px 16px', textAlign: 'center' }}>{order.quantity}</td>
                          <td style={{ padding: '8px 16px', textAlign: 'center' }}>${order.price?.toFixed(2)}</td>
                          <td style={{ padding: '8px 16px', textAlign: 'center' }}>${order.totalAmount?.toFixed(2)}</td>
                          <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                            <StatusChip 
                              label={order.status} 
                              statuscolor={getStatusColor(order.status)} 
                              size="small"
                            />
                          </td>
                          <td style={{ padding: '8px 16px', textAlign: 'center', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {formatDate(order.createdAt)}
                          </td>
                          <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                            <IconButton
                              color="info"
                              onClick={() => handleViewOrder(order, index)}
                              size="small"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary">
                  This feature is not implemented yet
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                  Please use the "All Orders" tab to view all orders
                </Typography>
              </Box>
            )}
          </StyledPaper>
        </Container>
      </Main>
      
      {/* Order Details Dialog */}
      <Dialog
        open={openOrderDialog}
        onClose={handleCloseOrderDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder ? (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Order Details
                </Typography>
                <StatusChip 
                  label={selectedOrder.status} 
                  statuscolor={getStatusColor(selectedOrder.status)} 
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  <OrderDetailCard>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Customer Information
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Name:</strong> {`${selectedOrder.firstName} ${selectedOrder.lastName}`}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Email:</strong> {selectedOrder.email}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Role:</strong> {selectedOrder.role}
                      </Typography>
                    </CardContent>
                  </OrderDetailCard>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <OrderDetailCard>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Shipping Information
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Delivery Address:</strong> {selectedOrder.deviveryAddress || 'No address provided'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}
                      </Typography>
                    </CardContent>
                  </OrderDetailCard>
                </Grid>
                <Grid item xs={12}>
                  <OrderDetailCard>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Order Details
                      </Typography>
                      <List>
                        <ListItem divider>
                          <ListItemText 
                            primary={selectedOrder.productName} 
                            secondary={`Quantity: ${selectedOrder.quantity}`} 
                          />
                          <Typography variant="body2">
                            ${selectedOrder.price?.toFixed(2)}
                          </Typography>
                        </ListItem>
                      </List>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Total: ${selectedOrder.totalAmount?.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </OrderDetailCard>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseOrderDialog} variant="outlined">
                Close
              </Button>
              {selectedOrder.status === 'PENDING' && (
                <>
                  <Button 
                    onClick={() => handleUpdateStatus(selectedOrderIndex, 'SHIPPING')}
                    color="info"
                    variant="contained"
                    startIcon={<LocalShippingIcon />}
                    disabled={loading}
                  >
                    Mark as Shipped
                  </Button>
                  <Button 
                    onClick={() => handleCancelOrder(selectedOrderIndex)}
                    color="error"
                    variant="contained"
                    startIcon={<CancelIcon />}
                    disabled={loading}
                  >
                    Cancel Order
                  </Button>
                </>
              )}
              {selectedOrder.status === 'SHIPPING' && (
                <Button 
                  onClick={() => handleUpdateStatus(selectedOrderIndex, 'DELIVERED')}
                  color="success"
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  disabled={loading}
                >
                  Mark as Delivered
                </Button>
              )}
            </DialogActions>
          </>
        ) : (
          <DialogContent>
            <CircularProgress />
          </DialogContent>
        )}
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

AdminOrders.displayName = 'AdminOrders';

// Wrap the component with role-based protection
import roleBasedRoute from '../../utils/roleBasedRoute';
export default roleBasedRoute(AdminOrders, "ADMIN");
