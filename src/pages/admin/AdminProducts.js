//src/pages/admin/AdminProducts.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  CircularProgress,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from '../../components/AdminHeader';
// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  backgroundColor: theme.palette.background.paper
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  height: '23px',
  transform: 'translate(14px, -9px) scale(0.75)',
  '&.MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75)',
  },
  '&.Mui-focused': {
    color: theme.palette.primary.main,
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    height: '23px',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputBase-input.MuiOutlinedInput-input': {
    height: '30px',
    padding: '10px 14px',
  },
  '& .MuiSelect-select': {
    minHeight: '30px',
  display: 'flex',
  alignItems: 'center',
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    height: '23px',
    transform: 'translate(14px, 16px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
    }
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputBase-input.MuiOutlinedInput-input': {
    height: '50px',
    padding: '10px 14px',
  },
  '& .MuiInputBase-inputMultiline': {
    height: 'auto',
  }
}));

const AdminProducts = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // For editing product
  const [editProductId, setEditProductId] = useState(null);
  const [editProductForm, setEditProductForm] = useState({
    name: '',
    desc: '',
    price: '',
    stock: '',
    catId: '',
    catItemId: '',
    color: '',
    storageGb: '',
    ramGb: '',
    imageUrl: '',
    viewType: 'FRONT'
  });
  
  // Form states
  const [basicProductForm, setBasicProductForm] = useState({
    prodName: '',
    categName: '',
    cateItemName: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    viewType: 'FRONT',
    color: '',
    storageGb: '',
    ramGb: ''
  });
  
  const [categoryItemsForm, setcategoryItemsForm] = useState({
    prodName: '',
    categoryId: '',
    cateItemName: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    viewType: 'FRONT',
    color: '',
    storageGb: '',
    ramGb: ''
  });
  
  const [productImgForm, setProductImgForm] = useState({
    prodName: '',
    categoryId: '',
    catItemId: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    viewType: 'FRONT',
    color: '',
    storageGb: '',
    ramGb: ''
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Fetch categories
    fetchCategories();
    
    // Fetch all products if on the Manage Products tab
    if (tabValue === 3) {
      fetchAllProducts();
    }
  }, [router, tabValue]);
  
  // Fetch categories when component mounts
  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/categories", {
        baseURL: 'http://localhost:8083'
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setNotification({
        open: true,
        message: 'Error loading categories: ' + error.message,
        severity: 'error'
      });
    }
  };
  
  // Fetch all products for management
  const fetchAllProducts = async () => {
    try {
      const response = await api.get("/admin/products-all", {
        baseURL: 'http://localhost:8083'
      });
      setAllProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setNotification({
        open: true,
        message: 'Error loading products: ' + error.message,
        severity: 'error'
      });
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Basic form handlers
  const handleBasicFormChange = (e) => {
    const { name, value } = e.target;
    setBasicProductForm({ ...basicProductForm, [name]: value });
  };
  
  const handleBasicFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post("/admin/create-product", basicProductForm, {
        baseURL: 'http://localhost:8083'
      });
      setNotification({
        open: true,
        message: response.data.message || 'Product created successfully',
        severity: 'success'
      });
      
      // Reset form
      setBasicProductForm({
        prodName: '',
        categName: '',
        cateItemName: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: '',
        viewType: 'FRONT',
        color: '',
        storageGb: '',
        ramGb: ''
      });
    } catch (error) {
      console.error('Error creating product:', error);
      setNotification({
        open: true,
        message: 'Error creating product: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Category ID form handlers
  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setcategoryItemsForm({ ...categoryItemsForm, [name]: value });
    
    // If category is selected, log the selection but don't fetch items
    if (name === 'categoryId' && value) {
      console.log(`Selected category ID: ${value}`);
    }
  };
  
  const handleCategoryItemsFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post("/admin/create-product-categoryItems", categoryItemsForm, {
        baseURL: 'http://localhost:8083'
      });
      setNotification({
        open: true,
        message: response.data.message || 'Product created successfully',
        severity: 'success'
      });
      
      // Reset form
      setcategoryItemsForm({
        prodName: '',
        categoryId: '',
        cateItemName: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: '',
        viewType: 'MAIN',
        color: '',
        storageGb: '',
        ramGb: ''
      });
    } catch (error) {
      console.error('Error creating product with category items:', error);
      setNotification({
        open: true,
        message: 'Error creating product: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Product Image form handlers
  const handleProductImgFormChange = (e) => {
    const { name, value } = e.target;
    setProductImgForm({ ...productImgForm, [name]: value });
  };

     // Category ID form handlers
     const handleCategoryItemIdFormChange = (e) => {
      const { name, value } = e.target;
      setcategoryItemsForm({ ...categoryItemsForm, [name]: value });
      
      // If category is selected, log the selection but don't fetch items
      if (name === 'catItemId' && value) {
        console.log(`Selected category ID: ${value}`);
      }
    };


    const handleCategoryIDByCatItemsIDFormChange = (e) => {
      const { name, value } = e.target;
      setProductImgForm({ ...productImgForm, [name]: value });
      
      // If category is selected, fetch category items
      if (name === 'categoryId' && value) {
        console.log(`Selected category ID: ${value}`);
        // Reset the catItemId when changing category
        if (productImgForm.catItemId) {
          setProductImgForm(prev => ({...prev, catItemId: ''}));
        }
        
        // Fetch category items for the selected category
        fetchCategoryItemsById(value);
      }
    };
    
    // Fetch category items for a specific category
    const fetchCategoryItemsById = async (categoryId) => {
      try {
        const response = await api.get(`/admin/category-items/${categoryId}`, {
          baseURL: 'http://localhost:8083'
        });
        setCategoryItems(response.data);
      } catch (error) {
        console.error('Error fetching category items:', error);
        setNotification({
          open: true,
          message: 'Error loading category items: ' + error.message,
          severity: 'error'
        });
      }
    };
  
  const handleProductImgFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post("/admin/create-product-productImg", productImgForm, {
        baseURL: 'http://localhost:8083'
      });
      setNotification({
        open: true,
        message: response.data.message || 'Product created successfully',
        severity: 'success'
      });
      
      // Reset form
      setProductImgForm({
        prodName: '',
        categoryId: '',
        catItemId: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: '',
        viewType: 'FRONT',
        color: '',
        storageGb: '',
        ramGb: ''
      });
    } catch (error) {
      console.error('Error creating product with image:', error);
      setNotification({
        open: true,
        message: 'Error creating product: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load product for editing
  const handleEditProduct = (product) => {
    router.push(`/admin/AdminProdEdit?id=${product.id}`);
  };
  
  // Update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put(`/admin/update-product/${editProductId}`, editProductForm, {
        baseURL: 'http://localhost:8083'
      });
      
      setNotification({
        open: true,
        message: response.data.message || 'Product updated successfully',
        severity: 'success'
      });
      
      // Refresh product list
      fetchAllProducts();
      
      // Reset form and edit state
      setEditProductId(null);
      setEditProductForm({
        name: '',
        desc: '',
        price: '',
        stock: '',
        catId: '',
        catItemId: '',
        color: '',
        storageGb: '',
        ramGb: '',
        imageUrl: '',
        viewType: 'FRONT'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      setNotification({
        open: true,
        message: 'Error updating product: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.delete(`/admin/delete-product/${productId}`, {
        baseURL: 'http://localhost:8083'
      });
      
      setNotification({
        open: true,
        message: response.data.message || 'Product deleted successfully',
        severity: 'success'
      });
      
      // Refresh product list
      fetchAllProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setNotification({
        open: true,
        message: 'Error deleting product: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Delete category
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.delete(`/admin/categories/${categoryId}`, {
        baseURL: 'http://localhost:8083'
      });
      
      setNotification({
        open: true,
        message: response.data.message || 'Category deleted successfully',
        severity: 'success'
      });
      
      // Refresh categories
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setNotification({
        open: true,
        message: 'Error deleting category: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditProductForm({ ...editProductForm, [name]: value });
  };

  return (
    <Box sx={{ 
      display: 'flex',
      backgroundColor: theme.palette.background.default, 
      minHeight: '100vh',
      overflow: 'hidden',
      width: '100%',
      position: 'relative'
    }}>
      <AdminHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <Main>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: theme.palette.text.primary }}>
            Product Management
          </Typography>
          
          <StyledPaper>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab label="Basic Product" />
              <Tab label="Product with Category Items" />
              <Tab label="Product with Image" />
              <Tab label="Manage Products" />
            </Tabs>
            
            {/* Basic Product Form */}
            {tabValue === 0 && (
              <Box component="form" onSubmit={handleBasicFormSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Product Name"
                      name="prodName"
                      value={basicProductForm.prodName}
                      onChange={handleBasicFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Category Name"
                      name="categName"
                      value={basicProductForm.categName}
                      onChange={handleBasicFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Category Item Name"
                      name="cateItemName"
                      value={basicProductForm.cateItemName}
                      onChange={handleBasicFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Price"
                      name="price"
                      type="number"
                      value={basicProductForm.price}
                      onChange={handleBasicFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Stock"
                      name="stock"
                      type="number"
                      value={basicProductForm.stock}
                      onChange={handleBasicFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Color"
                      name="color"
                      value={basicProductForm.color}
                      onChange={handleBasicFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Storage (GB)"
                      name="storageGb"
                      type="number"
                      value={basicProductForm.storageGb}
                      onChange={handleBasicFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="RAM (GB)"
                      name="ramGb"
                      type="number"
                      value={basicProductForm.ramGb}
                      onChange={handleBasicFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Image URL"
                      name="imageUrl"
                      value={basicProductForm.imageUrl}
                      onChange={handleBasicFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledFormControl fullWidth>
                      <StyledInputLabel>View Type</StyledInputLabel>
                      <Select
                        name="viewType"
                        value={basicProductForm.viewType}
                        onChange={handleBasicFormChange}
                        label="View Type"
                      >
                        <MenuItem value="FRONT">Front</MenuItem>
                        <MenuItem value="BACK">Back</MenuItem>
                        <MenuItem value="RIGHT">Right</MenuItem>
                        <MenuItem value="LEFT">Left</MenuItem>
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Description"
                      name="description"
                      value={basicProductForm.description}
                      onChange={handleBasicFormChange}
                      fullWidth
                      multiline
                      rows={4}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<AddIcon />}
                      disabled={loading}
                      sx={{ mt: 2 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Create Product'}
                    </Button>
                  </Grid>
                </Grid>
                  </Box>
            )}
            
            {/* Product with Category Items Form */}
            {tabValue === 1 && (
              <Box component="form" onSubmit={handleCategoryItemsFormSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Product Name"
                      name="prodName"
                      value={categoryItemsForm.prodName}
                      onChange={handleCategoryFormChange}
                      fullWidth
                      required
                    />  
              </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledFormControl fullWidth required>
                      <StyledInputLabel>Category</StyledInputLabel>
                      <Select
                        name="categoryId"
                        value={categoryItemsForm.categoryId}
                        onChange={handleCategoryFormChange}
                        label="Category"
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="New Category Item Name"
                      name="cateItemName"
                      value={categoryItemsForm.cateItemName}
                      onChange={handleCategoryFormChange}
                      fullWidth
                      required
                    />
                    <FormHelperText>Enter new category item name</FormHelperText>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Price"
                      name="price"
                      type="number"
                      value={categoryItemsForm.price}
                      onChange={handleCategoryFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Stock"
                      name="stock"
                      type="number"
                      value={categoryItemsForm.stock}
                      onChange={handleCategoryFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Color"
                      name="color"
                      value={categoryItemsForm.color}
                      onChange={handleCategoryFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Storage (GB)"
                      name="storageGb"
                      type="number"
                      value={categoryItemsForm.storageGb}
                      onChange={handleCategoryFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="RAM (GB)"
                      name="ramGb"
                      type="number"
                      value={categoryItemsForm.ramGb}
                      onChange={handleCategoryFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Image URL"
                      name="imageUrl"
                      value={categoryItemsForm.imageUrl}
                      onChange={handleCategoryFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledFormControl fullWidth>
                      <StyledInputLabel>View Type</StyledInputLabel>
                      <Select
                        name="viewType"
                        value={categoryItemsForm.viewType}
                        onChange={handleCategoryFormChange}
                        label="View Type"
                      >
                        <MenuItem value="FRONT">Front</MenuItem>
                        <MenuItem value="BACK">Back</MenuItem>
                        <MenuItem value="RIGHT">Right</MenuItem>
                        <MenuItem value="LEFT">Left</MenuItem>
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Description"
                      name="description"
                      value={categoryItemsForm.description}
                      onChange={handleCategoryFormChange}
                      fullWidth
                      multiline
                      rows={4}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<AddIcon />}
                      disabled={loading}
                      sx={{ mt: 2 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Create Product with Category Item'}
                    </Button>
                  </Grid>
          </Grid>
              </Box>
            )}
          
            {/* Product with Image Form */}
            {tabValue === 2 && (
              <Box component="form" onSubmit={handleProductImgFormSubmit}>
          <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Product Name"
                      name="prodName"
                      value={productImgForm.prodName}
                      onChange={handleProductImgFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledFormControl fullWidth required>
                      <StyledInputLabel>Category</StyledInputLabel>
                      <Select
                        name="categoryId"
                        value={productImgForm.categoryId}
                        onChange={handleCategoryIDByCatItemsIDFormChange}
                        label="Category"
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledFormControl fullWidth required>
                      <StyledInputLabel>Category Item</StyledInputLabel>
                      <Select
                        name="catItemId"
                        value={productImgForm.catItemId}
                        onChange={handleCategoryIDByCatItemsIDFormChange}
                        label="Category Item"
                        disabled={!productImgForm.categoryId}
                      >
                        {!productImgForm.categoryId ? 
                          <MenuItem value="">Select a category first</MenuItem>
                          : 
                          categoryItems.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.name}
                            </MenuItem>
                          ))
                        }
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Price"
                      name="price"
                      type="number"
                      value={productImgForm.price}
                      onChange={handleProductImgFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Stock"
                      name="stock"
                      type="number"
                      value={productImgForm.stock}
                      onChange={handleProductImgFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Color"
                      name="color"
                      value={productImgForm.color}
                      onChange={handleProductImgFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="Storage (GB)"
                      name="storageGb"
                      type="number"
                      value={productImgForm.storageGb}
                      onChange={handleProductImgFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <StyledTextField
                      label="RAM (GB)"
                      name="ramGb"
                      type="number"
                      value={productImgForm.ramGb}
                      onChange={handleProductImgFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Image URL"
                      name="imageUrl"
                      value={productImgForm.imageUrl}
                      onChange={handleProductImgFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <StyledFormControl fullWidth>
                      <StyledInputLabel>View Type</StyledInputLabel>
                      <Select
                        name="viewType"
                        value={productImgForm.viewType}
                        onChange={handleProductImgFormChange}
                        label="View Type"
                      >
                        <MenuItem value="FRONT">Front</MenuItem>
                        <MenuItem value="BACK">Back</MenuItem>
                        <MenuItem value="RIGHT">Right</MenuItem>
                        <MenuItem value="LEFT">Left</MenuItem>
                      </Select>
                    </StyledFormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <StyledTextField
                      label="Description"
                      name="description"
                      value={productImgForm.description}
                      onChange={handleProductImgFormChange}
                      fullWidth
                      multiline
                      rows={4}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<AddIcon />}
                      disabled={loading}
                      sx={{ mt: 2 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Create Product with Image'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Manage Products Tab */}
            {tabValue === 3 && (
              <Box>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Product List
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={fetchAllProducts}
                        startIcon={<AddIcon />}
                      >
                        Refresh Products
                      </Button>
                    </Box>
                    
                    {/* Products Table */}
                    <TableContainer component={Paper} sx={{ mb: 4 }}>
                      <Table sx={{ minWidth: 650 }} aria-label="products table">
                        <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                          <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Image</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stock</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {allProducts.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} align="center">
                                {loading ? 
                                  <CircularProgress size={24} /> : 
                                  "No products found. Click 'Refresh Products' to load products."}
                              </TableCell>
                            </TableRow>
                          ) : (
                            allProducts.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>
                                  {product.imageUrl ? (
                                    <Box
                                      component="img"
                                      src={product.imageUrl}
                                      alt={product.name}
                                      sx={{ width: 60, height: 60, objectFit: 'contain' }}
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      component="img"
                                      src="https://via.placeholder.com/60x60?text=No+Image"
                                      alt="No image"
                                      sx={{ width: 60, height: 60 }}
                                    />
                                  )}
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>${product.price}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell>
                                  <IconButton 
                                    color="primary" 
                                    onClick={() => handleEditProduct(product)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton 
                                    color="error" 
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  
                  {/* Edit Product Form */}
                  {editProductId && (
                    <Grid item xs={12}>
                      <Divider sx={{ my: 3 }} />
                      <StyledPaper elevation={3} sx={{ p: 3, mb: 4, border: `1px solid ${theme.palette.primary.main}` }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: theme.palette.primary.main }}>
                          Edit Product (ID: {editProductId})
                        </Typography>
                      
                        <Box component="form" onSubmit={handleUpdateProduct}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <StyledTextField
                                label="Product Name"
                                name="name"
                                value={editProductForm.name}
                                onChange={handleEditFormChange}
                                fullWidth
                                required
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <StyledTextField
                                label="Price"
                                name="price"
                                type="number"
                                value={editProductForm.price}
                                onChange={handleEditFormChange}
                                fullWidth
                                required
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <StyledTextField
                                label="Stock"
                                name="stock"
                                type="number"
                                value={editProductForm.stock}
                                onChange={handleEditFormChange}
                                fullWidth
                                required
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <StyledTextField
                                label="Color"
                                name="color"
                                value={editProductForm.color}
                                onChange={handleEditFormChange}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <StyledTextField
                                label="Storage (GB)"
                                name="storageGb"
                                type="number"
                                value={editProductForm.storageGb}
                                onChange={handleEditFormChange}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <StyledTextField
                                label="RAM (GB)"
                                name="ramGb"
                                type="number"
                                value={editProductForm.ramGb}
                                onChange={handleEditFormChange}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <StyledTextField
                                label="Image URL"
                                name="imageUrl"
                                value={editProductForm.imageUrl}
                                onChange={handleEditFormChange}
                                fullWidth
                                required
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <StyledFormControl fullWidth>
                                <StyledInputLabel>View Type</StyledInputLabel>
                                <Select
                                  name="viewType"
                                  value={editProductForm.viewType}
                                  onChange={handleEditFormChange}
                                  label="View Type"
                                >
                                  <MenuItem value="FRONT">Front</MenuItem>
                                  <MenuItem value="BACK">Back</MenuItem>
                                  <MenuItem value="RIGHT">Right</MenuItem>
                                  <MenuItem value="LEFT">Left</MenuItem>
                                </Select>
                              </StyledFormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              {/* Preview Image */}
                              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'grey.300' }}>
                                <CardMedia
                                  component="img"
                                  height="140"
                                  image={editProductForm.imageUrl || "https://via.placeholder.com/300x140?text=No+Image"}
                                  alt={editProductForm.name}
                                  sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/300x140?text=Invalid+URL';
                                  }}
                                />
                                <CardContent sx={{ flexGrow: 1, p: 2, pt: 1 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Image Preview
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={12}>
                              <StyledTextField
                                label="Description"
                                name="desc"
                                value={editProductForm.desc}
                                onChange={handleEditFormChange}
                                fullWidth
                                multiline
                                rows={4}
                                required
                              />
                            </Grid>
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                  type="submit"
                                  variant="contained"
                                  color="primary"
                                  size="large"
                                  startIcon={<EditIcon />}
                                  disabled={loading}
                                >
                                  {loading ? <CircularProgress size={24} /> : 'Update Product'}
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="secondary"
                                  size="large"
                                  onClick={() => setEditProductId(null)}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </StyledPaper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </StyledPaper>
        </Container>
      </Main>
      
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

AdminProducts.displayName = 'AdminProducts';

// Wrap the component with role-based protection
import roleBasedRoute from '../../utils/roleBasedRoute';
export default roleBasedRoute(AdminProducts, "ADMIN");
