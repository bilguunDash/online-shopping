//src/pages/admin/AdminProdEdit.js
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
  Card,
  CardMedia,
  CardContent,
  Breadcrumbs,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from '../../components/admin/AdminHeader';
import Link from 'next/link';
// Icons
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../utils/axios';

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

const AdminProdEdit = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Product form state
  const [productForm, setProductForm] = useState({
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
    viewType: 'FRONT',
    processor: '',
    os: '',
    graphics: '',
    display: '',
    model: '',
    productImages: [] // Add array for multiple images
  });

  // State for managing current image being added
  const [currentImage, setCurrentImage] = useState({ imageUrl: '', viewType: 'FRONT' });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Fetch categories for dropdown
    fetchCategories();
    
    // Fetch product data if id is available
    if (id) {
      fetchProductById(id);
    } else {
      setInitialLoading(false);
    }
  }, [router, id]);

  // Fetch product by ID
  const fetchProductById = async (productId) => {
    try {
      // Get all products since there's no single product endpoint
      const response = await api.get("/admin/products-all", {
        baseURL: 'http://localhost:8083'
      });
      
      // Find the specific product by ID
      const productData = response.data.find(product => product.id === Number(productId));
      
      if (!productData) {
        throw new Error("Product not found");
      }
      
      // If product has productImages array, use it
      if (productData.productImages && Array.isArray(productData.productImages) && productData.productImages.length > 0) {
        console.log("Product has multiple images:", productData.productImages);
        
        // Get main image URL (FRONT view by default)
        const mainImageUrl = getImageUrlByViewType(productData.productImages, 'FRONT') || productData.imageUrl || '';
        
        setProductForm({
          name: productData.name || '',
          desc: productData.desc || '',
          price: productData.price || '',
          stock: productData.stock || '',
          catId: productData.catId || '',
          catItemId: productData.catItemId || '',
          color: productData.color || '',
          storageGb: productData.storageGb || '',
          ramGb: productData.ramGb || '',
          imageUrl: mainImageUrl,
          viewType: 'FRONT',
          processor: productData.processor || '',
          os: productData.os || '',
          graphics: productData.graphics || '',
          display: productData.display || '',
          model: productData.model || '',
          productImages: productData.productImages || []
        });
      } else {
        // If no productImages array, use the single imageUrl
        setProductForm({
          name: productData.name || '',
          desc: productData.desc || '',
          price: productData.price || '',
          stock: productData.stock || '',
          catId: productData.catId || '',
          catItemId: productData.catItemId || '',
          color: productData.color || '',
          storageGb: productData.storageGb || '',
          ramGb: productData.ramGb || '',
          imageUrl: productData.imageUrl || '',
          viewType: productData.viewType || 'FRONT',
          processor: productData.processor || '',
          os: productData.os || '',
          graphics: productData.graphics || '',
          display: productData.display || '',
          model: productData.model || '',
          productImages: productData.imageUrl ? [{ imageUrl: productData.imageUrl, viewType: productData.viewType || 'FRONT' }] : []
        });
      }
      
      // If the product has a category, fetch its items
      if (productData.catId) {
        fetchCategoryItemsById(productData.catId);
      }
      
      setInitialLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setNotification({
        open: true,
        message: 'Error loading product: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
      setInitialLoading(false);
    }
  };
  
  // Fetch categories
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

  // Function to get image URL for a specific view type from productImages array
  const getImageUrlByViewType = (images, viewType) => {
    if (!images || !Array.isArray(images)) return '';
    
    const image = images.find(img => img.viewType === viewType);
    return image ? image.imageUrl : '';
  };

  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for viewType changes
    if (name === 'viewType') {
      const newViewType = value;
      
      // Update imageUrl field based on the selected view type
      if (productForm.productImages && productForm.productImages.length > 0) {
        const imageUrl = getImageUrlByViewType(productForm.productImages, newViewType) || '';
        
        setProductForm(prev => ({
          ...prev,
          viewType: newViewType,
          imageUrl: imageUrl
        }));
      } else {
        // Just update the view type if no images are available
        setProductForm(prev => ({
          ...prev,
          viewType: newViewType
        }));
      }
    } else {
      setProductForm({ ...productForm, [name]: value });
      
      // If category is selected, fetch its items
      if (name === 'catId' && value) {
        fetchCategoryItemsById(value);
        // Reset the catItemId when changing category
        if (productForm.catItemId) {
          setProductForm(prev => ({...prev, catItemId: ''}));
        }
      }
    }
  };

  // Add image handling functions
  const handleImageFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentImage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddImage = () => {
    if (!currentImage.imageUrl) {
      setNotification({
        open: true,
        message: 'Зургийн URL оруулна уу',
        severity: 'error'
      });
      return;
    }
    
    // Add to productImages array
    setProductForm(prev => ({
      ...prev,
      productImages: [...prev.productImages, { ...currentImage }]
    }));
    
    // Clear current image form
    setCurrentImage({ imageUrl: '', viewType: 'FRONT' });
  };

  const handleRemoveImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Format the data according to the expected ProdAllDTO structure
      const prodAllDTO = {
        id: Number(id), // Add the ID to the DTO
        ...productForm,
        // Ensure numeric fields are actually numbers
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        // Keep storageGb and ramGb as strings
        storageGb: productForm.storageGb || null,
        ramGb: productForm.ramGb || null,
        catId: productForm.catId ? Number(productForm.catId) : null,
        catItemId: productForm.catItemId ? Number(productForm.catItemId) : null,
        processor: productForm.processor || null,
        os: productForm.os || null,
        graphics: productForm.graphics || null,
        display: productForm.display ? Number(productForm.display) : null, // Convert to Number if it exists
        rating: null, // Include rating field with null value if not provided
        model: productForm.model || null,
        // Include productImages array
        productImages: productForm.productImages || []
      };
      
      console.log("Sending update request to:", `/admin/update-product/${id}`);
      console.log("Request payload:", prodAllDTO);
      
      // Call the update product API
      const response = await api.put(`/admin/update-product/${id}`, prodAllDTO, {
        baseURL: 'http://localhost:8083',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Update response:", response.data);
      
      setNotification({
        open: true,
        message: response.data.message || 'Product updated successfully',
        severity: 'success'
      });
      
      // Redirect back to product list after successful update
      setTimeout(() => {
        router.push('/admin/AdminProducts');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating product:', error);
      
      let errorMessage = 'Error updating product';
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage += ': ' + (error.response.data.message || error.response.statusText);
      } else if (error.request) {
        errorMessage += ': No response from server';
      } else {
        errorMessage += ': ' + error.message;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <AdminHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Main>
          <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
          </Container>
        </Main>
      </Box>
    );
  }

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
          <Box sx={{ mb: 4 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link href="/admin/AdminHome" passHref>
                <Box component="a" sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', textDecoration: 'none' }}>
                  <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                  Dashboard
                </Box>
              </Link>
              <Link href="/admin/AdminProducts" passHref>
                <Box component="a" sx={{ display: 'flex', alignItems: 'center', color: 'text.primary', textDecoration: 'none' }}>
                  Products
                </Box>
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                Edit Product
              </Typography>
            </Breadcrumbs>
          </Box>
          
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: theme.palette.text.primary }}>
            Edit Product
          </Typography>
          
          <StyledPaper elevation={3} sx={{ p: 3, mb: 4, border: `1px solid ${theme.palette.primary.main}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                Product Details (ID: {id})
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/admin/AdminProducts')}
              >
                Back to Products
              </Button>
            </Box>
            
            <Box component="form" onSubmit={handleUpdateProduct}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  <StyledTextField
                    label="Product Name"
                    name="name"
                    value={productForm.name}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <StyledFormControl fullWidth>
                    <StyledInputLabel>Category</StyledInputLabel>
                    <Select
                      name="catId"
                      value={productForm.catId}
                      onChange={handleFormChange}
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
                <Grid item xs={12} lg={6}>
                  <StyledFormControl fullWidth>
                    <StyledInputLabel>Category Item</StyledInputLabel>
                    <Select
                      name="catItemId"
                      value={productForm.catItemId}
                      onChange={handleFormChange}
                      label="Category Item"
                      disabled={!productForm.catId}
                    >
                      {!productForm.catId ? 
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
                <Grid item xs={12} lg={6}>
                  <StyledTextField
                    label="Price"
                    name="price"
                    type="number"
                    value={productForm.price}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <StyledTextField
                    label="Stock"
                    name="stock"
                    type="number"
                    value={productForm.stock}
                    onChange={handleFormChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <StyledTextField
                    label="Color"
                    name="color"
                    value={productForm.color}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <StyledTextField
                    label="Storage (GB)"
                    name="storageGb"
                    value={productForm.storageGb}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <StyledTextField
                    label="RAM (GB)"
                    name="ramGb"
                    value={productForm.ramGb}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Grid>
                
                {/* Technical Specifications */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1, color: theme.palette.primary.main }}>
                    Technical Specifications
                  </Typography>
                </Grid>
                
                <Grid item xs={12} lg={6}>
                  <StyledTextField
                    label="Model"
                    name="model"
                    value={productForm.model}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Grid>
         
                <Grid item xs={12} lg={6}>
                  <StyledTextField
                    label="Processor"
                    name="processor"
                    value={productForm.processor}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <StyledTextField
                    label="Operating System"
                    name="os"
                    value={productForm.os}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <StyledTextField
                    label="Graphics"
                    name="graphics"
                    value={productForm.graphics}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <StyledTextField
                    label="Display Size"
                    name="display"
                    value={productForm.display}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Grid>
             
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                    Бүтээгдэхүүний зургууд
                  </Typography>
                  <Box sx={{ mb: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems="flex-end">
                      <Grid item xs={12} md={6}>
                        <StyledTextField
                          label="Зургийн URL"
                          name="imageUrl"
                          value={currentImage.imageUrl}
                          onChange={handleImageFormChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <StyledFormControl fullWidth>
                          <StyledInputLabel>Зургийн төрөл</StyledInputLabel>
                          <Select
                            name="viewType"
                            value={currentImage.viewType}
                            onChange={handleImageFormChange}
                            label="Зургийн төрөл"
                          >
                            <MenuItem value="FRONT">Урд тал</MenuItem>
                            <MenuItem value="BACK">Ар тал</MenuItem>
                            <MenuItem value="RIGHT">Баруун тал</MenuItem>
                            <MenuItem value="LEFT">Зүүн тал</MenuItem>
                          </Select>
                        </StyledFormControl>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={handleAddImage}
                          fullWidth
                        >
                          Нэмэх
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {/* Display added images */}
                  {productForm.productImages.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Нэмсэн зургууд: {productForm.productImages.length}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {productForm.productImages.map((img, index) => (
                          <Box
                            key={index}
                            sx={{
                              position: 'relative',
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              p: 1,
                              width: 120
                            }}
                          >
                            <Box
                              component="img"
                              src={img.imageUrl}
                              alt={`Product view ${img.viewType}`}
                              sx={{ width: '100%', height: 80, objectFit: 'contain', mb: 1 }}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80x80?text=Error';
                              }}
                            />
                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center' }}>
                              {img.viewType}
                            </Typography>
                            <IconButton
                              size="small"
                              color="error"
                              sx={{ position: 'absolute', top: 0, right: 0 }}
                              onClick={() => handleRemoveImage(index)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Current view display */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" color="text.primary" sx={{ mb: 1 }}>
                      Харах зургийн төрөл сонгох
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} lg={6}>
                        <StyledFormControl fullWidth>
                          <StyledInputLabel>Харах зургийн төрөл</StyledInputLabel>
                          <Select
                            name="viewType"
                            value={productForm.viewType}
                            onChange={handleFormChange}
                            label="View Type"
                          >
                            <MenuItem value="FRONT">Урд тал</MenuItem>
                            <MenuItem value="BACK">Ар тал</MenuItem>
                            <MenuItem value="RIGHT">Баруун тал</MenuItem>
                            <MenuItem value="LEFT">Зүүн тал</MenuItem>
                          </Select>
                        </StyledFormControl>
                      </Grid>
                      <Grid item xs={12} lg={6}>
                        <StyledTextField
                          label="Одоогийн зургийн URL"
                          name="imageUrl"
                          value={productForm.imageUrl}
                          onChange={handleFormChange}
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} lg={6}>
                        {/* Preview Image */}
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'grey.300' }}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={productForm.imageUrl || "https://via.placeholder.com/300x140?text=No+Image"}
                            alt={productForm.name}
                            sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x140?text=Invalid+URL';
                            }}
                          />
                          <CardContent sx={{ flexGrow: 1, p: 2, pt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {productForm.viewType} View Preview
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    label="Description"
                    name="desc"
                    value={productForm.desc}
                    onChange={handleFormChange}
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
                      onClick={() => router.push('/admin/AdminProducts')}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
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

AdminProdEdit.displayName = 'AdminProdEdit';

// Wrap the component with role-based protection
import roleBasedRoute from '../../utils/roleBasedRoute';
export default roleBasedRoute(AdminProdEdit, "ADMIN");
