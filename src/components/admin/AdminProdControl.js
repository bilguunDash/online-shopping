import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import { 
  CheckCircleOutline as ApproveIcon,
  Cancel as RejectIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import api, { directApiCall } from '../../utils/axios';

const AdminProdControl = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null, // 'approve', 'reject', 'delete'
    productId: null
  });
  const [rejectReason, setRejectReason] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch all pending products on load
  useEffect(() => {
    fetchPendingProducts();
    fetchCategories();
  }, []);

  // Fetch all pending products
  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const data = await directApiCall('/api/admin/pending-products');
      setPendingProducts(data || []);
    } catch (error) {
      console.error('Error fetching pending products:', error);
      // Set empty array to prevent UI errors
      setPendingProducts([]);
      
      // Extract error message from server response if available
      const serverErrorMsg = error.data?.message || error.message || 'Unknown error';
      
      setNotification({
        open: true,
        message: `Хүлээгдэж буй бүтээгдэхүүнүүдийг ачаалж чадсангүй: ${serverErrorMsg}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all product categories
  const fetchCategories = async () => {
    try {
      const data = await directApiCall('/api/categories');
      setCategories(data || []);
      console.log('Successfully fetched categories with directApiCall');
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set empty array or mock data for development
      setCategories([
        { id: 1, name: 'Phones' },
        { id: 2, name: 'Laptops' },
        { id: 3, name: 'TVs' },
        { id: 4, name: 'Accessories' }
      ]);
      
      setNotification({
        open: true,
        message: `Бүтээгдэхүүний төрлүүдийг ачаалж чадсангүй: ${error.message || error.status}`,
        severity: 'warning'  // Use warning instead of error since we're providing fallback data
      });
    }
  };

  // Filter products by category
  const handleCategoryFilter = async () => {
    if (!selectedCategory) {
      fetchPendingProducts();
      return;
    }
    
    setLoading(true);
    try {
      const data = await directApiCall(`/api/admin/pending-products/by-category/${selectedCategory}`);
      setPendingProducts(data || []);
      console.log('Successfully filtered products by category with directApiCall');
    } catch (error) {
      console.error('Error filtering products:', error);
      setNotification({
        open: true,
        message: `Бүтээгдэхүүнүүдийг шүүж чадсангүй: ${error.message || error.status}`,
        severity: 'error'
      });
      // Fallback to all products
      fetchPendingProducts();
    } finally {
      setLoading(false);
    }
  };

  // View product details
  const handleViewDetails = async (productId) => {
    setLoading(true);
    try {
      const data = await directApiCall(`/api/admin/pending-products/${productId}`);
      setProductDetails(data.product);
      setCurrentImageIndex(0); // Reset image index when viewing a new product
      setDetailsDialog(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      
      // Extract error message from server response if available
      const serverErrorMsg = error.data?.message || error.message || 'Unknown error';
      
      setNotification({
        open: true,
        message: `Бүтээгдэхүүний дэлгэрэнгүй мэдээллийг ачаалж чадсангүй: ${serverErrorMsg}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Approve product
  const handleApproveProduct = async () => {
    setLoading(true);
    try {
      const response = await directApiCall(`/api/admin/pending-products/${confirmDialog.productId}/approve`, 'POST');
      
      setNotification({
        open: true,
        message: response.message || 'Бүтээгдэхүүн амжилттай зөвшөөрөгдлөө',
        severity: 'success'
      });
      
      // Close dialogs first
      setConfirmDialog({ open: false, type: null, productId: null });
      setDetailsDialog(false);
      
      // Wait a moment before refreshing the list to give server time to process
      setTimeout(() => {
        fetchPendingProducts();
      }, 1000);
    } catch (error) {
      console.error('Error approving product:', error);
      
      // Extract error message
      const errorMsg = error.data || error.message || 'Бүтээгдэхүүн зөвшөөрөхөд алдаа гарлаа';
      
      setNotification({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Reject product
  const handleRejectProduct = async () => {
    setLoading(true);
    try {
      // Send rejection with reason as a query parameter
      const response = await directApiCall(
        `/api/admin/pending-products/${confirmDialog.productId}/reject?reason=${encodeURIComponent(rejectReason)}`,
        'POST'
      );
      
      setNotification({
        open: true,
        message: response.message || 'Бүтээгдэхүүн амжилттай татгалзагдлаа',
        severity: 'success'
      });
      
      // Reset and close dialogs first
      setRejectReason('');
      setConfirmDialog({ open: false, type: null, productId: null });
      setDetailsDialog(false);
      
      // Wait a moment before refreshing the list to give server time to process
      setTimeout(() => {
        fetchPendingProducts();
      }, 1000);
    } catch (error) {
      console.error('Error rejecting product:', error);
      
      // Extract error message
      const errorMsg = error.data || error.message || 'Бүтээгдэхүүн татгалзахад алдаа гарлаа';
      
      setNotification({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    setLoading(true);
    try {
      const response = await directApiCall(`/api/admin/pending-products/${confirmDialog.productId}`, 'DELETE');
      
      setNotification({
        open: true,
        message: response.message || 'Бүтээгдэхүүн амжилттай устгагдлаа',
        severity: 'success'
      });
      
      // Close dialog first
      setConfirmDialog({ open: false, type: null, productId: null });
      
      // Wait a moment before refreshing the list to give server time to process
      setTimeout(() => {
        fetchPendingProducts();
      }, 1000);
    } catch (error) {
      console.error('Error deleting product:', error);
      
      // Extract error message
      const errorMsg = error.data || error.message || 'Бүтээгдэхүүн устгахад алдаа гарлаа';
      
      setNotification({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle opening confirm dialog
  const openConfirmDialog = (type, productId) => {
    setConfirmDialog({
      open: true,
      type,
      productId
    });
  };

  // Close confirm dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      type: null,
      productId: null
    });
    setRejectReason('');
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return '#f59e0b'; // Amber
      case 'APPROVED':
        return '#10b981'; // Green
      case 'REJECTED':
        return '#ef4444'; // Red
      default:
        return '#94a3b8'; // Gray
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Бүтээгдэхүүний хяналт
      </Typography>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Хүлээгдэж буй бүтээгдэхүүнүүд
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={fetchPendingProducts}
              disabled={loading}
            >
              Дахин ачаалах
            </Button>
          </Box>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="category-filter-label">Төрлөөр шүүх</InputLabel>
              <Select
                labelId="category-filter-label"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Төрлөөр шүүх"
              >
                <MenuItem value="">
                  <em>Бүгд</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={handleCategoryFilter}
              fullWidth
            >
              Шүүх
            </Button>
          </Grid>
        </Grid>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : pendingProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Хүлээгдэж буй бүтээгдэхүүн байхгүй байна
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Нэр</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Хэрэглэгчийн ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Огноо</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Төрөл</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Үнэ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Төлөв</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Үйлдэл</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingProducts.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.userId}</TableCell>
                    <TableCell>{formatDate(product.submittedAt)}</TableCell>
                    <TableCell>
                      {categories.find(c => c.id === product.categoryId)?.name || 'N/A'}
                    </TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.status}
                        sx={{
                          backgroundColor: getStatusColor(product.status),
                          color: '#fff',
                          fontWeight: 500
                        }}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Дэлгэрэнгүй харах">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewDetails(product.id)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {product.status === 'PENDING' && (
                          <>
                            <Tooltip title="Зөвшөөрөх">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => openConfirmDialog('approve', product.id)}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Татгалзах">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => openConfirmDialog('reject', product.id)}
                              >
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        
                        <Tooltip title="Устгах">
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => openConfirmDialog('delete', product.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Product Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {productDetails ? (
          <>
            <DialogTitle>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Бүтээгдэхүүний дэлгэрэнгүй
              </Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {productDetails.images && productDetails.images.length > 0 ? (
                    <>
                      <Card variant="outlined">
                        <CardMedia
                          component="img"
                          height="300"
                          image={productDetails.images[currentImageIndex]?.imageUrl || "/placeholder.jpg"}
                          alt={`${productDetails.name} - ${productDetails.images[currentImageIndex]?.viewType || 'View'}`}
                          sx={{ objectFit: "contain", p: 2 }}
                        />
                      </Card>
                      
                      {/* Image thumbnails with view type indicators */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, justifyContent: 'center' }}>
                        {productDetails.images.map((image, index) => (
                          <Box 
                            key={index}
                            sx={{ 
                              position: 'relative',
                              border: index === currentImageIndex ? '2px solid #1976d2' : '2px solid transparent',
                              borderRadius: 1,
                              overflow: 'hidden',
                              width: 70,
                              height: 70,
                              cursor: 'pointer'
                            }}
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <img 
                              src={image.imageUrl || "/placeholder.jpg"} 
                              alt={`View ${index + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                position: 'absolute', 
                                bottom: 0, 
                                left: 0, 
                                right: 0, 
                                backgroundColor: 'rgba(0,0,0,0.6)', 
                                color: 'white',
                                textAlign: 'center',
                                padding: '2px 0'
                              }}
                            >
                              {image.viewType || 'VIEW'}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Card variant="outlined">
                      <CardMedia
                        component="img"
                        height="240"
                        image={productDetails.imageUrl || "/placeholder.jpg"}
                        alt={productDetails.name}
                        sx={{ objectFit: "contain", p: 2 }}
                      />
                    </Card>
                  )}
                  
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    Хэрэглэгчийн мэдээлэл
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Хэрэглэгчийн ID:</strong> {productDetails.userId}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Оруулсан огноо:</strong> {formatDate(productDetails.submittedAt)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">{productDetails.name}</Typography>
                  <Chip
                    label={productDetails.status}
                    sx={{
                      backgroundColor: getStatusColor(productDetails.status),
                      color: '#fff',
                      my: 1
                    }}
                  />
                  
                  <Typography variant="h5" color="primary" sx={{ mt: 1, mb: 2 }}>
                    ${productDetails.price}
                  </Typography>
                  
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
                    Тайлбар
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {productDetails.description}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Техникийн үзүүлэлт
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    {productDetails.categoryId && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Төрөл:</strong> {categories.find(c => c.id === productDetails.categoryId)?.name || 'N/A'}
                        </Typography>
                      </Grid>
                    )}
                    {productDetails.color && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Өнгө:</strong> {productDetails.color}
                        </Typography>
                      </Grid>
                    )}
                    {productDetails.stock && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Нөөц:</strong> {productDetails.stock}
                        </Typography>
                      </Grid>
                    )}
                    {productDetails.storageGb && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Багтаамж:</strong> {productDetails.storageGb} GB
                        </Typography>
                      </Grid>
                    )}
                    {productDetails.ramGb && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>RAM:</strong> {productDetails.ramGb} GB
                        </Typography>
                      </Grid>
                    )}
                    {productDetails.processor && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Процессор:</strong> {productDetails.processor}
                        </Typography>
                      </Grid>
                    )}
                    {productDetails.graphics && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Видео карт:</strong> {productDetails.graphics}
                        </Typography>
                      </Grid>
                    )}
                    {productDetails.display && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Дэлгэц:</strong> {productDetails.display}
                        </Typography>
                      </Grid>
                    )}
                    {productDetails.os && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Үйлдлийн систем:</strong> {productDetails.os}
                        </Typography>
                      </Grid>
                    )}
                    {productDetails.model && (
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Загвар:</strong> {productDetails.model}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              {productDetails.status === 'PENDING' && (
                <>
                  <Button 
                    onClick={() => openConfirmDialog('reject', productDetails.id)} 
                    color="error" 
                    variant="outlined"
                  >
                    Татгалзах
                  </Button>
                  <Button 
                    onClick={() => openConfirmDialog('approve', productDetails.id)} 
                    color="success" 
                    variant="contained"
                    autoFocus
                  >
                    Зөвшөөрөх
                  </Button>
                </>
              )}
              <Button onClick={() => setDetailsDialog(false)} color="primary">
                Хаах
              </Button>
            </DialogActions>
          </>
        ) : (
          <DialogContent>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Confirmation Dialogs */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {confirmDialog.type === 'approve' && 'Бүтээгдэхүүн зөвшөөрөх'}
          {confirmDialog.type === 'reject' && 'Бүтээгдэхүүн татгалзах'}
          {confirmDialog.type === 'delete' && 'Бүтээгдэхүүн устгах'}
        </DialogTitle>
        <DialogContent>
          {confirmDialog.type === 'approve' && (
            <Typography>
              Та энэ бүтээгдэхүүнийг зөвшөөрөхдөө итгэлтэй байна уу? Зөвшөөрсний дараа бүтээгдэхүүн үндсэн сайтад нийтлэгдэх болно.
            </Typography>
          )}
          
          {confirmDialog.type === 'reject' && (
            <>
              <Typography sx={{ mb: 2 }}>
                Та энэ бүтээгдэхүүнийг татгалзахдаа итгэлтэй байна уу? Хэрэглэгчид яагаад татгалзсан тухай шалтгааныг оруулна уу.
              </Typography>
              <TextField
                fullWidth
                label="Татгалзсан шалтгаан"
                multiline
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </>
          )}
          
          {confirmDialog.type === 'delete' && (
            <Typography>
              Та энэ бүтээгдэхүүнийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeConfirmDialog} variant="outlined">
            Цуцлах
          </Button>
          
          {confirmDialog.type === 'approve' && (
            <Button 
              onClick={handleApproveProduct} 
              color="success" 
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Зөвшөөрч байна...' : 'Зөвшөөрөх'}
            </Button>
          )}
          
          {confirmDialog.type === 'reject' && (
            <Button 
              onClick={handleRejectProduct} 
              color="error" 
              variant="contained"
              disabled={loading || !rejectReason}
            >
              {loading ? 'Татгалзаж байна...' : 'Татгалзах'}
            </Button>
          )}
          
          {confirmDialog.type === 'delete' && (
            <Button 
              onClick={handleDeleteProduct} 
              color="error" 
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Устгаж байна...' : 'Устгах'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
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

export default AdminProdControl; 