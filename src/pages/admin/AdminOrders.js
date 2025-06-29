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
import AdminHeader from '../../components/admin/AdminHeader';
// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RefreshIcon from '@mui/icons-material/Refresh';
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
  const tabs = ['All Orders', 'Today', 'This Week', 'This Month'];
  
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
    // Show all orders in the "All Orders" tab (index 0)
    if (tabValue === 0) return orders;
    
    // Filter by today's date for "Өнөөдөр" tab (index 1)
    if (tabValue === 1) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      return orders.filter(order => {
        if (!order.createdAt) return false;
        
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0); // Normalize to start of day
        
        // Check if order date is today
        return orderDate.getTime() === today.getTime();
      });
    }
    
    // Filter by this week for "Энэ долоо хоног" tab (index 2)
    if (tabValue === 2) {
      const today = new Date();
      const firstDayOfWeek = new Date(today);
      const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
      
      // Set to the first day of the week (Monday for Mongolia)
      // In Mongolia the week typically starts on Monday
      const mondayOffset = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days, otherwise go back to Monday
      firstDayOfWeek.setDate(today.getDate() + mondayOffset);
      firstDayOfWeek.setHours(0, 0, 0, 0);
      
      // Calculate the end of the week (Sunday)
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      lastDayOfWeek.setHours(23, 59, 59, 999);
      
      return orders.filter(order => {
        if (!order.createdAt) return false;
        
        const orderDate = new Date(order.createdAt);
        // Check if order date is within this week
        return orderDate >= firstDayOfWeek && orderDate <= lastDayOfWeek;
      });
    }
    
    // Filter by this month for "Энэ сар" tab (index 3)
    if (tabValue === 3) {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      
      return orders.filter(order => {
        if (!order.createdAt) return false;
        
        const orderDate = new Date(order.createdAt);
        // Check if order date is within this month
        return orderDate >= firstDayOfMonth && orderDate <= lastDayOfMonth;
      });
    }
    
    // Default case - should not happen as we've handled all tabs
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
  
  // Map English status to Mongolian
  const getStatusText = (status) => {
    if (!status) return 'Тодорхойгүй';
    
    switch (status) {
      case 'PENDING':
        return 'Хүлээгдэж буй';
      case 'SHIPPING':
        return 'Хүргэлтэд';
      case 'DELIVERED':
        return 'Хүргэгдсэн';
      case 'CANCELLED':
        return 'Цуцлагдсан';
      default:
        return status;
    }
  };
  
  // Handle update order status
  const handleUpdateStatus = async (orderIndex, newStatus) => {
    if (!selectedOrder) return;
    
    setLoading(true);
    try {
      // Use the selectedOrder directly instead of finding it by index
      const orderToUpdate = selectedOrder;
      
      const response = await api.put(`/admin/orders/${orderToUpdate.orderId}/status`, { 
        status: newStatus 
      }, {
        baseURL: 'http://localhost:8083'
      });
      
      setNotification({
        open: true,
        message: `Захиалгын төлөв ${getStatusText(newStatus)} болж шинэчлэгдлээ`,
        severity: 'success'
      });
      
      // Refresh orders
      fetchOrders();
      handleCloseOrderDialog();
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification({
        open: true,
        message: `Захиалгын төлөв шинэчлэхэд алдаа гарлаа: ${error.response?.data?.message || error.message}`,
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
      // Use the selectedOrder directly instead of finding it by index
      const orderToCancel = selectedOrder;
      
      const response = await api.post(`/admin/cancel-order/${orderToCancel.orderId}`, {}, {
        baseURL: 'http://localhost:8083'
      });
      
      setNotification({
        open: true,
        message: `Захиалга амжилттай цуцлагдлаа`,
        severity: 'success'
      });
      
      // Refresh orders
      fetchOrders();
      handleCloseOrderDialog();
    } catch (error) {
      console.error('Error cancelling order:', error);
      setNotification({
        open: true,
        message: `Захиалга цуцлахад алдаа гарлаа: ${error.response?.data?.message || error.message}`,
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary}}>
               Захиалгын удирдлага
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={fetchOrders}
              startIcon={<RefreshIcon />}
              disabled={loading}
            >
              Захиалга шинэчлэх
            </Button>
          </Box>
          
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
                  label={index === 0 ? "Бүх захиалга" : 
                         index === 1 ? "Өнөөдөр" : 
                         index === 2 ? "Энэ долоо хоног" : 
                         "Энэ сар"}
                  sx={{ 
                    fontWeight: 500,
                    minWidth: 100
                  }} 
                />
              ))}
            </Tabs>
            
            {tabValue >= 0 && tabValue <= 3 ? (
              <div style={{ width: '100%', overflowX: 'auto', maxWidth: '100%', display: 'block' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.palette.primary.main }}>
                    <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '10%' }}>Захиалгын ID</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '10%' }}>Захиалагч</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>И-мэйл</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>Бүтээгдэхүүн</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '5%' }}>Тоо ширхэг</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '10%' }}>Үнэ</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '10%' }}>Нийт дүн</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>Төлөв</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '15%' }}>Огноо</th>
                      <th style={{ padding: '8px 16px', color: 'white', fontWeight: 'bold', textAlign: 'center', width: '5%' }}>Үйлдлүүд</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '16px' }}>
                          <CircularProgress size={24} />
                        </td>
                      </tr>
                    ) : getFilteredOrders().length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ textAlign: 'center', padding: '16px' }}>
                          {tabValue === 0 ? 'Захиалга олдсонгүй' : 
                           tabValue === 1 ? 'Өнөөдөр бүртгэгдсэн захиалга олдсонгүй' :
                           tabValue === 2 ? 'Энэ долоо хоногт бүртгэгдсэн захиалга олдсонгүй' :
                           'Энэ сард бүртгэгдсэн захиалга олдсонгүй'}
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
                              label={getStatusText(order.status)} 
                              statuscolor={getStatusColor(order.status)} 
                              size="small"
                            />
                          </td>
                          <td style={{ padding: '8px 16px', textAlign: 'center', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {formatDate(order.createdAt)}
                          </td>
                          <td style={{ padding: '8px 16px', textAlign: 'center' }}>
                            <IconButton
                              color="primary"
                              onClick={() => handleViewOrder(order, index)}
                              title="Дэлгэрэнгүй харах"
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
                  Энэ боломж одоогоор хэрэгжээгүй байна
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                  Бусад цэсийг ашиглан захиалгыг харна уу
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
              <Typography variant="h6" component="div">
                Захиалгын #{(selectedOrder._id ? selectedOrder._id.slice(-6) : selectedOrder.orderId || 'N/A')} дэлгэрэнгүй
              </Typography>
              <StatusChip 
                label={getStatusText(selectedOrder.status)} 
                statuscolor={getStatusColor(selectedOrder.status)} 
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  <OrderDetailCard>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Захиалагчийн мэдээлэл
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Нэр:</strong> {`${selectedOrder.firstName} ${selectedOrder.lastName}`}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>И-мэйл:</strong> {selectedOrder.email}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Үүрэг:</strong> {selectedOrder.role}
                      </Typography>
                    </CardContent>
                  </OrderDetailCard>
                </Grid>
                <Grid item xs={12} lg={6}>
                  <OrderDetailCard>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Хүргэлтийн мэдээлэл
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Хүргэлтийн хаяг:</strong> {selectedOrder.deviveryAddress || 'Хаяг оруулаагүй байна'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Захиалсан огноо:</strong> {formatDate(selectedOrder.createdAt)}
                      </Typography>
                    </CardContent>
                  </OrderDetailCard>
                </Grid>
                <Grid item xs={12}>
                  <OrderDetailCard>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                        Захиалгын дэлгэрэнгүй
                      </Typography>
                      <List>
                        <ListItem divider>
                          <ListItemText 
                            primary={selectedOrder.productName} 
                            secondary={`Тоо ширхэг: ${selectedOrder.quantity}`} 
                          />
                          <Typography variant="body2">
                            ${selectedOrder.price?.toFixed(2)}
                          </Typography>
                        </ListItem>
                      </List>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Нийт дүн: ${selectedOrder.totalAmount?.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </OrderDetailCard>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleCloseOrderDialog} variant="outlined">
                Хаах
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
                    Илгээсэн гэж тэмдэглэх
                  </Button>
                  <Button 
                    onClick={() => handleCancelOrder(selectedOrderIndex)}
                    color="error"
                    variant="contained"
                    startIcon={<CancelIcon />}
                    disabled={loading}
                  >
                    Захиалга цуцлах
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
                  Хүргэгдсэн гэж тэмдэглэх
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
