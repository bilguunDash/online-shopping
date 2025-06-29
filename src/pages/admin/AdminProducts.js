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
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardActionArea,
  CardActions,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from '../../components/admin/AdminHeader';
// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import StarIcon from '@mui/icons-material/Star';
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
  const [categories, setCategories] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [allProductsCache, setAllProductsCache] = useState([]); // Cache for all products
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Dialog states
  const [openProductTypeDialog, setOpenProductTypeDialog] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [openBasicProductDialog, setOpenBasicProductDialog] = useState(false);
  const [openCategoryProductDialog, setOpenCategoryProductDialog] = useState(false);
  const [openImageProductDialog, setOpenImageProductDialog] = useState(false);
  
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
    viewType: 'FRONT',
    processor: '',
    os: '',
    graphics: '',
    display: '',
    model: '',
    weight: '',
    brand: '',
    productImages: [] // Add productImages array
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
    ramGb: '',
    processor: '',
    os: '',
    graphics: '',
    display: '',
    model: '',
    weight: '',
    brand: '',
    productImages: [] // Add array for multiple images
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
    ramGb: '',
    processor: '',
    os: '',
    graphics: '',
    display: '',
    model: '',
    productImages: [] // Add array for multiple images
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
    ramGb: '',
    processor: '',
    os: '',
    graphics: '',
    display: '',
    model: '',
    productImages: [] // Add array for multiple images
  });

  // Add search states
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    page: 0,
    size: 6
  });
  const [searchTimeout, setSearchTimeout] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStockStatus, setSelectedStockStatus] = useState('');

  // Add new function to handle adding multiple images
  const [currentImage, setCurrentImage] = useState({ imageUrl: '', viewType: 'FRONT' });
  
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
    setBasicProductForm(prev => ({
      ...prev,
      productImages: [...prev.productImages, { ...currentImage }]
    }));
    
    // Clear current image form
    setCurrentImage({ imageUrl: '', viewType: 'FRONT' });
  };
  
  const handleRemoveImage = (index) => {
    setBasicProductForm(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index)
    }));
  };
  
  const handleImageFormChange = (e) => {
    const { name, value } = e.target;
    setCurrentImage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add image handling functions for category product form
  const [categoryCurrentImage, setCategoryCurrentImage] = useState({ imageUrl: '', viewType: 'FRONT' });
  
  const handleAddCategoryImage = () => {
    if (!categoryCurrentImage.imageUrl) {
      setNotification({
        open: true,
        message: 'Зургийн URL оруулна уу',
        severity: 'error'
      });
      return;
    }
    
    // Add to productImages array
    setcategoryItemsForm(prev => ({
      ...prev,
      productImages: [...prev.productImages, { ...categoryCurrentImage }]
    }));
    
    // Clear current image form
    setCategoryCurrentImage({ imageUrl: '', viewType: 'FRONT' });
  };
  
  const handleRemoveCategoryImage = (index) => {
    setcategoryItemsForm(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index)
    }));
  };
  
  const handleCategoryImageFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryCurrentImage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add image handling functions for product image form
  const [prodImgCurrentImage, setProdImgCurrentImage] = useState({ imageUrl: '', viewType: 'FRONT' });
  
  const handleAddProdImage = () => {
    if (!prodImgCurrentImage.imageUrl) {
      setNotification({
        open: true,
        message: 'Зургийн URL оруулна уу',
        severity: 'error'
      });
      return;
    }
    
    // Add to productImages array
    setProductImgForm(prev => ({
      ...prev,
      productImages: [...prev.productImages, { ...prodImgCurrentImage }]
    }));
    
    // Clear current image form
    setProdImgCurrentImage({ imageUrl: '', viewType: 'FRONT' });
  };
  
  const handleRemoveProdImage = (index) => {
    setProductImgForm(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index)
    }));
  };
  
  const handleProdImageFormChange = (e) => {
    const { name, value } = e.target;
    setProdImgCurrentImage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Fetch categories
    fetchCategories();
    
    // Fetch all products
    fetchAllProducts();
  }, [router]);
  
  // Fetch categories when component mounts
  const fetchCategories = async () => {
    try {
      const response = await api.get("/admin/view-category", {
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
    setLoading(true);
    try {
      console.log("Fetching all products from:", `${api.defaults.baseURL}/admin/products-all`);
      
      // First try to get the authentication status
      const token = localStorage.getItem('jwt');
      console.log("Authentication token exists:", !!token);
      
      const response = await api.get("/admin/products-all", {
        baseURL: 'http://localhost:8083'
      });
      
      console.log("Products response:", response);
      
      // Remove duplicate products based on their ID
      if (Array.isArray(response.data)) {
        const uniqueProducts = [];
        const productIds = new Set();
        
        response.data.forEach(product => {
          if (!productIds.has(product.id)) {
            productIds.add(product.id);
            uniqueProducts.push(product);
          } else {
            console.log(`Duplicate product filtered out: ID ${product.id} - ${product.name}`);
          }
        });
        
        console.log(`Filtered out ${response.data.length - uniqueProducts.length} duplicate products`);
        setAllProductsCache(uniqueProducts); // Store in cache
        setAllProducts(uniqueProducts);
        setDisplayedProducts(uniqueProducts); // Set displayed products to all products initially
      } else {
        setAllProductsCache(response.data);
        setAllProducts(response.data);
        setDisplayedProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request setup error:", error.message);
      }
      
      // Load mock data as fallback if all alternatives fail
      loadMockProducts();
      
      setNotification({
        open: true,
        message: `Error loading products: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Basic form handlers
  const handleBasicFormChange = (e) => {
    const { name, value } = e.target;
    setBasicProductForm({ ...basicProductForm, [name]: value });
  };
  
  // Update the form submission function to work with multiple images
  const handleBasicFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare request data - properly format numeric values
      const requestData = {
        ...basicProductForm,
        // Convert numeric fields to proper numbers
        price: Number(basicProductForm.price),
        stock: Number(basicProductForm.stock),
        display: basicProductForm.display ? Number(basicProductForm.display) : null
        // productImages array is already in place if user added images
      };
      
      console.log("Sending product data:", requestData);
      
      const response = await api.post("/admin/create-product", requestData, {
        baseURL: 'http://localhost:8083'
      });
      
      console.log("API Response:", response.data);
      
      setNotification({
        open: true,
        message: response.data.message || 'Бүтээгдэхүүн амжилттай үүслээ',
        severity: 'success'
      });
      
      // Reset form and close dialog
      handleCloseBasicProductDialog();
      
      // Refresh product list
      fetchAllProducts();
    } catch (error) {
      console.error('Error creating product:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
      
      setNotification({
        open: true,
        message: 'Алдаа: ' + (error.response?.data?.message || error.message),
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
      // Check for required field
      if (!categoryItemsForm.categoryId) {
        setNotification({
          open: true,
          message: 'Ангилал сонгоно уу',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      console.log("Sending category items form data:", categoryItemsForm);
      
      // Format request data - ensure we're sending the right data structure
      const requestData = {
        ...categoryItemsForm,
        // Convert numeric fields to proper numbers
        price: Number(categoryItemsForm.price),
        stock: Number(categoryItemsForm.stock),
        categoryId: Number(categoryItemsForm.categoryId),
        display: categoryItemsForm.display ? Number(categoryItemsForm.display) : null
      };
      
      console.log("Prepared request data:", requestData);
      
      const response = await api.post("/admin/create-product-categoryItems", requestData, {
        baseURL: 'http://localhost:8083'
      });
      
      console.log("API Response:", response.data);
      
      setNotification({
        open: true,
        message: response.data.message || 'Бүтээгдэхүүн амжилттай үүслээ',
        severity: 'success'
      });
      
      // Reset form and close dialog
      handleCloseCategoryProductDialog();
      
      // Refresh product list
      fetchAllProducts();
    } catch (error) {
      console.error('Error creating product with category items:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
      
      setNotification({
        open: true,
        message: 'Алдаа: ' + (error.response?.data?.message || error.message),
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
      setProductImgForm({ ...productImgForm, [name]: value });
      
      // If category item is selected, log the selection
      if (name === 'catItemId' && value) {
        console.log(`Selected category item ID: ${value}`);
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
      // Check for required fields
      if (!productImgForm.categoryId || !productImgForm.catItemId) {
        setNotification({
          open: true,
          message: 'Ангилал болон дэд ангилал сонгоно уу',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      console.log("Sending product image form data:", productImgForm);
      
      // Format request data - ensure we're sending the right data structure
      const requestData = {
        ...productImgForm,
        // Convert numeric fields to proper numbers
        price: Number(productImgForm.price),
        stock: Number(productImgForm.stock),
        categoryId: Number(productImgForm.categoryId),
        catItemId: Number(productImgForm.catItemId),
        display: productImgForm.display ? Number(productImgForm.display) : null
      };
      
      // Include both productImages array and single imageUrl for backward compatibility
      // The backend will use productImages if provided, otherwise fall back to single image
      
      console.log("Prepared request data:", requestData);
      
      const response = await api.post("/admin/create-product-productImg", requestData, {
        baseURL: 'http://localhost:8083'
      });
      
      console.log("API Response:", response.data);
      
      setNotification({
        open: true,
        message: response.data.message || 'Бүтээгдэхүүн амжилттай үүслээ',
        severity: 'success'
      });
      
      // Reset form and close dialog
      handleCloseImageProductDialog();
      
      // Refresh product list
      fetchAllProducts();
    } catch (error) {
      console.error('Error creating product with image:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
      
      setNotification({
        open: true,
        message: 'Алдаа: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };


  
  // Update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Format the data according to the expected ProdAllDTO structure
      const requestData = {
        ...editProductForm,
        id: Number(editProductId), // Add the ID to the DTO
        // Ensure numeric fields are actually numbers
        price: Number(editProductForm.price),
        stock: Number(editProductForm.stock),
        catId: editProductForm.catId ? Number(editProductForm.catId) : null,
        catItemId: editProductForm.catItemId ? Number(editProductForm.catItemId) : null,
        display: editProductForm.display ? Number(editProductForm.display) : null,
        rating: editProductForm.rating ? Number(editProductForm.rating) : null
        // productImages is already included
      };
      
      console.log("Sending update request to:", `/admin/update-product/${editProductId}`);
      console.log("Request payload:", requestData);
      
      // Call the update product API
      const response = await api.put(`/admin/update-product/${editProductId}`, requestData, {
        baseURL: 'http://localhost:8083'
      });
      
      console.log("Update response:", response.data);
      
      setNotification({
        open: true,
        message: response.data.message || 'Бүтээгдэхүүн амжилттай шинэчлэгдлээ',
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
        viewType: 'FRONT',
        processor: '',
        os: '',
        graphics: '',
        display: '',
        model: '',
        weight: '',
        brand: '',
        productImages: [] // Clear productImages array
      });
    } catch (error) {
      console.error('Error updating product:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
      
      setNotification({
        open: true,
        message: 'Алдаа: ' + (error.response?.data?.message || error.message),
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

  // Dialog handlers
  const handleOpenProductTypeDialog = () => {
    setOpenProductTypeDialog(true);
    setSelectedProductType(null);
  };
  
  const handleCloseProductTypeDialog = () => {
    setOpenProductTypeDialog(false);
  };
  
  const handleSelectProductType = (type) => {
    setSelectedProductType(type);
  };
  
  // Basic product dialog handlers
  const handleOpenBasicProductDialog = () => {
    setOpenBasicProductDialog(true);
  };
  
  const handleCloseBasicProductDialog = () => {
    setOpenBasicProductDialog(false);
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
      ramGb: '',
      processor: '',
      os: '',
      graphics: '',
      display: '',
      model: '',
      weight: '',
      brand: '',
      productImages: [] // Clear productImages array
    });
  };
  
  // Category product dialog handlers
  const handleOpenCategoryProductDialog = () => {
    setOpenCategoryProductDialog(true);
  };
  
  const handleCloseCategoryProductDialog = () => {
    setOpenCategoryProductDialog(false);
    setcategoryItemsForm({
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
      ramGb: '',
      processor: '',
      os: '',
      graphics: '',
      display: '',
      model: '',
      weight: '',
      brand: '',
      productImages: [] // Clear productImages array
    });
  };
  
  // Image product dialog handlers
  const handleOpenImageProductDialog = () => {
    setOpenImageProductDialog(true);
  };
  
  const handleCloseImageProductDialog = () => {
    setOpenImageProductDialog(false);
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
      ramGb: '',
      processor: '',
      os: '',
      graphics: '',
      display: '',
      model: '',
      weight: '',
      brand: '',
      productImages: [] // Clear productImages array
    });
  };

  // Optimize filtering to work client-side
  const applyFilters = () => {
    // Start with all cached products
    let filteredProducts = [...allProductsCache];

    // Apply category filter if selected
    if (selectedCategory) {
      filteredProducts = filteredProducts.filter(product => 
        product.categoryId === selectedCategory || 
        (product.category && product.category.id === selectedCategory)
      );
    }
    
    // Apply stock filter if selected
    if (selectedStockStatus) {
      filteredProducts = filterProductsByStock(filteredProducts, selectedStockStatus);
    }
    
    // Apply search filter if there's a search term
    if (searchParams.keyword) {
      const keyword = searchParams.keyword.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        (product.name && product.name.toLowerCase().includes(keyword)) ||
        (product.description && product.description.toLowerCase().includes(keyword)) ||
        (product.model && product.model.toLowerCase().includes(keyword))
      );
    }
    
    // Update displayed products
    setDisplayedProducts(filteredProducts);
  };

  // Update the category filter to work client-side
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    // We'll apply filters in the useEffect below
  };

  // Update the stock filter to work client-side
  const handleStockStatusChange = (stockStatus) => {
    setSelectedStockStatus(stockStatus);
    // We'll apply filters in the useEffect below
  };

  // Add effect to apply filters when filter states change
  useEffect(() => {
    if (allProductsCache.length > 0) {
      applyFilters();
    }
  }, [selectedCategory, selectedStockStatus, searchParams.keyword]);

  // Modify the search handler to work client-side
  const handleSearch = (keyword) => {
    setSearchParams(prev => ({ ...prev, keyword }));
    // Filters will be applied by the useEffect
  };

  // Add debounced search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      setSearchParams(prev => ({ ...prev, keyword: value }));
    }, 500); // 500ms delay
    
    setSearchTimeout(timeout);
  };

  // Modified refresh function
  const handleRefresh = () => {
    // Reset filters
    setSelectedCategory(null);
    setSelectedStockStatus('');
    setSearchParams({ keyword: '', page: 0, size: 6 });
    
    // If we have cached data, use it immediately
    if (allProductsCache.length > 0) {
      setDisplayedProducts(allProductsCache);
    }
    
    // Then refresh from server
    fetchAllProducts();
  };

  // Add functions to handle multiple images in the edit form
  const [editCurrentImage, setEditCurrentImage] = useState({ imageUrl: '', viewType: 'FRONT' });
  
  const handleAddEditImage = () => {
    if (!editCurrentImage.imageUrl) {
      setNotification({
        open: true,
        message: 'Зургийн URL оруулна уу',
        severity: 'error'
      });
      return;
    }
    
    // Add to productImages array
    setEditProductForm(prev => ({
      ...prev,
      productImages: [...prev.productImages, { ...editCurrentImage }]
    }));
    
    // Clear current image form
    setEditCurrentImage({ imageUrl: '', viewType: 'FRONT' });
  };
  
  const handleRemoveEditImage = (index) => {
    setEditProductForm(prev => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index)
    }));
  };
  
  const handleEditImageFormChange = (e) => {
    const { name, value } = e.target;
    setEditCurrentImage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add state for selected view type in edit mode
  const [selectedViewType, setSelectedViewType] = useState('FRONT');
  
  // Function to get image URL for a specific view type from productImages array
  const getImageUrlByViewType = (images, viewType) => {
    if (!images || !Array.isArray(images)) return '';
    
    const image = images.find(img => img.viewType === viewType);
    return image ? image.imageUrl : '';
  };
  
  // Function to load product for editing with image handling
  const handleEditProduct = (product) => {
    try {
      // Set initial view type to FRONT
      setSelectedViewType('FRONT');
      
      // If product has images in productImages array
      if (product.productImages && Array.isArray(product.productImages) && product.productImages.length > 0) {
        console.log("Product has multiple images:", product.productImages);
        
        // Get main image URL (FRONT view by default)
        const mainImageUrl = getImageUrlByViewType(product.productImages, 'FRONT') || product.imageUrl || '';
        
        // Set up edit form with product data and images
        setEditProductForm({
          id: product.id,
          name: product.name || '',
          desc: product.description || '',
          price: product.price || '',
          stock: product.stock || '',
          catId: product.categoryId || '',
          catItemId: product.categoryItemId || '',
          color: product.color || '',
          storageGb: product.storageGb || '',
          ramGb: product.ramGb || '',
          processor: product.processor || '',
          os: product.os || '',
          graphics: product.graphics || '',
          display: product.display || '',
          model: product.model || '',
          rating: product.rating || '',
          viewType: 'FRONT',
          imageUrl: mainImageUrl,
          productImages: product.productImages || []
        });
      } else {
        // If product doesn't have productImages array, use single imageUrl
        setEditProductForm({
          id: product.id,
          name: product.name || '',
          desc: product.description || '',
          price: product.price || '',
          stock: product.stock || '',
          catId: product.categoryId || '',
          catItemId: product.categoryItemId || '',
          color: product.color || '',
          storageGb: product.storageGb || '',
          ramGb: product.ramGb || '',
          processor: product.processor || '',
          os: product.os || '',
          graphics: product.graphics || '',
          display: product.display || '',
          model: product.model || '',
          rating: product.rating || '',
          viewType: product.viewType || 'FRONT',
          imageUrl: product.imageUrl || '',
          productImages: []
        });
      }
      
      // Navigate to edit page
      router.push(`/admin/AdminProdEdit?id=${product.id}`);
    } catch (error) {
      console.error("Error setting up edit form:", error);
      setNotification({
        open: true,
        message: 'Бүтээгдэхүүн засварлахад алдаа гарлаа: ' + error.message,
        severity: 'error'
      });
    }
  };
  
  // Handle view type change in edit form
  const handleViewTypeChange = (e) => {
    const newViewType = e.target.value;
    setSelectedViewType(newViewType);
    
    // Update imageUrl field based on the selected view type
    if (editProductForm.productImages && editProductForm.productImages.length > 0) {
      const imageUrl = getImageUrlByViewType(editProductForm.productImages, newViewType) || '';
      
      setEditProductForm(prev => ({
        ...prev,
        viewType: newViewType,
        imageUrl: imageUrl
      }));
    } else {
      // Just update the view type if no images are available
      setEditProductForm(prev => ({
        ...prev,
        viewType: newViewType
      }));
    }
  };

  // Add function to filter products by stock status
  const filterProductsByStock = (products, stockStatus) => {
    if (!stockStatus) return products;
    
    return products.filter(product => {
      if (stockStatus === 'in_stock') {
        return product.stock > 0;
      } else if (stockStatus === 'out_of_stock') {
        return product.stock <= 0;
      }
      return true;
    });
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
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Бүтээгдэхүүн удирдлага
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleOpenProductTypeDialog}
            >
              Бүтээгдэхүүн нэмэх
            </Button>
          </Box>
          
          <StyledPaper>
            <Box>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3,
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Бүтээгдэхүүний жагсаалт
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <TextField
                        size="small"
                        placeholder="Хайх..."
                        value={searchParams.keyword}
                        onChange={handleSearchChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ minWidth: 200 }}
                      />
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Ангилал</InputLabel>
                        <Select
                          label="Ангилал"
                          value={selectedCategory || ""}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                          <MenuItem value="">Бүгд</MenuItem>
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Нөөц</InputLabel>
                        <Select
                          label="Нөөц"
                          value={selectedStockStatus}
                          onChange={(e) => handleStockStatusChange(e.target.value)}
                        >
                          <MenuItem value="">Бүгд</MenuItem>
                          <MenuItem value="in_stock">Нөөцтэй</MenuItem>
                          <MenuItem value="out_of_stock">Нөөц дууссан</MenuItem>
                        </Select>
                      </FormControl>
                      <Button 
                        variant="outlined" 
                        color="primary"
                        onClick={handleRefresh}
                        startIcon={<RefreshIcon />}
                      >
                        Сэргээх
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Products Table */}
                  <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="products table">
                      <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                        <TableRow>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '100px' }}>Зураг</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Бүтээгдэхүүний нэр</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ангилал</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Техникийн мэдээлэл</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Үнэ</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Нөөц</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Үйлдлүүд</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {displayedProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                              {loading ? 
                                <CircularProgress size={24} /> : 
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                  <Typography variant="h6" color="text.secondary" gutterBottom>
                                    Бүтээгдэхүүн олдсонгүй
                                  </Typography>
                                  <Button 
                                    variant="outlined" 
                                    startIcon={<AddIcon />}
                                    onClick={fetchAllProducts}
                                  >
                                    Бүтээгдэхүүн сэргээх
                                  </Button>
                                </Box>
                              }
                            </TableCell>
                          </TableRow>
                        ) : (
                          displayedProducts.map((product) => (
                            <TableRow 
                              key={product.id}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: theme.palette.action.hover 
                                },
                                transition: 'background-color 0.2s'
                              }}
                            >
                              <TableCell>
                                <Box
                                  component="img"
                                  src={product.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image'}
                                  alt={product.name}
                                  sx={{ 
                                    width: 80, 
                                    height: 80, 
                                    objectFit: 'contain',
                                    borderRadius: 1,
                                    border: `1px solid ${theme.palette.divider}`,
                                    p: 0.5,
                                    cursor: 'pointer',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      transition: 'transform 0.2s'
                                    }
                                  }}
                                  onClick={() => window.open(product.imageUrl, '_blank')}
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/80x80?text=Error';
                                  }}
                                />
                                {/* Show thumbnails of additional images if available */}
                                {product.productImages && product.productImages.length > 0 && (
                                  <Box sx={{ display: 'flex', mt: 1, gap: 0.5, flexWrap: 'wrap' }}>
                                    {product.productImages.slice(0, 3).map((img, index) => (
                                      <Box
                                        key={index}
                                        component="img"
                                        src={img.imageUrl || 'https://via.placeholder.com/40x40?text=No+Image'}
                                        alt={`${product.name} - ${img.viewType || index}`}
                                        sx={{ 
                                          width: 25, 
                                          height: 25, 
                                          objectFit: 'cover',
                                          borderRadius: 0.5,
                                          border: `1px solid ${theme.palette.divider}`,
                                          cursor: 'pointer',
                                          opacity: 0.8,
                                          '&:hover': {
                                            opacity: 1,
                                            transform: 'scale(1.1)',
                                            transition: 'all 0.2s'
                                          }
                                        }}
                                        onClick={() => window.open(img.imageUrl, '_blank')}
                                        title={img.viewType || `Image ${index + 1}`}
                                      />
                                    ))}
                                    {product.productImages.length > 3 && (
                                      <Typography variant="caption" sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        width: 25,
                                        height: 25,
                                        bgcolor: theme.palette.action.hover,
                                        borderRadius: 0.5,
                                        fontSize: '10px'
                                      }}>
                                        +{product.productImages.length - 3}
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {product.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {product.model || 'Загвар оруулаагүй'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {product.description?.substring(0, 50)}...
                                  </Typography>
                                  {/* Display rating */}
                                  {product.rating !== undefined && product.rating !== null && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                      <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        bgcolor: '#f0f7f0',
                                        py: 0.2,
                                        px: 0.8,
                                        borderRadius: 1,
                                        mr: 1
                                      }}>
                                        <StarIcon sx={{ fontSize: 14, color: '#1e4620', mr: 0.3 }} />
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#1e4620' }}>
                                          {product.rating}/5
                                        </Typography>
                                      </Box>
                                    </Box>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {product.category?.name || 'Ангилалгүй'}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {product.categoryItem?.name || ''}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  {product.processor && (
                                    <Typography variant="caption">
                                      CPU: {product.processor}
                                    </Typography>
                                  )}
                                  {product.ramGb && (
                                    <Typography variant="caption">
                                      RAM: {product.ramGb}GB
                                    </Typography>
                                  )}
                                  {product.storageGb && (
                                    <Typography variant="caption">
                                      Storage: {product.storageGb}GB
                                    </Typography>
                                  )}
                                  {product.display && (
                                    <Typography variant="caption">
                                      Display: {product.display}"
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                  ${product.price}
                                </Typography>
                                {product.color && (
                                  <Typography variant="caption" color="text.secondary">
                                    Өнгө: {product.color}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ 
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  backgroundColor: product.stock > 0 ? 
                                    theme.palette.success.light : 
                                    theme.palette.error.light,
                                  color: product.stock > 0 ? 
                                    theme.palette.success.dark : 
                                    theme.palette.error.dark
                                }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {product.stock > 0 ? `${product.stock} ширхэг` : 'Нөөц дууссан'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="Засварлах">
                                    <IconButton 
                                      color="primary" 
                                      onClick={() => handleEditProduct(product)}
                                      sx={{ 
                                        backgroundColor: theme.palette.primary.light,
                                        '&:hover': {
                                          backgroundColor: theme.palette.primary.main,
                                          color: 'white'
                                        }
                                      }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Устгах">
                                    <IconButton 
                                      color="error" 
                                      onClick={() => handleDeleteProduct(product.id)}
                                      sx={{ 
                                        backgroundColor: theme.palette.error.light,
                                        '&:hover': {
                                          backgroundColor: theme.palette.error.main,
                                          color: 'white'
                                        }
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          </StyledPaper>
        </Container>
      </Main>
      
      {/* Product Type Selection Dialog */}
      <Dialog 
        open={openProductTypeDialog} 
        onClose={handleCloseProductTypeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Бүтээгдэхүүний төрөл сонгох</Typography>
          <IconButton onClick={handleCloseProductTypeDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea 
                  onClick={() => handleSelectProductType('basic')}
                  sx={{ 
                    height: '100%', 
                    p: 2,
                    border: selectedProductType === 'basic' ? `2px solid ${theme.palette.primary.main}` : 'none',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <AddIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Энгийн бүтээгдэхүүн
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Хамгийн энгийн хувилбараар бүтээгдэхүүн үүсгэх
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea 
                  onClick={() => handleSelectProductType('category')}
                  sx={{ 
                    height: '100%', 
                    p: 2,
                    border: selectedProductType === 'category' ? `2px solid ${theme.palette.primary.main}` : 'none',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <AddIcon sx={{ fontSize: 60, color: theme.palette.secondary.main, mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Ангилалтай бүтээгдэхүүн
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Тодорхой ангилалд хамаарах бүтээгдэхүүн үүсгэх
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea 
                  onClick={() => handleSelectProductType('image')}
                  sx={{ 
                    height: '100%', 
                    p: 2,
                    border: selectedProductType === 'image' ? `2px solid ${theme.palette.primary.main}` : 'none',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <AddIcon sx={{ fontSize: 60, color: theme.palette.success.main, mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Зурагтай бүтээгдэхүүн
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Олон зурагтай бүтээгдэхүүн үүсгэх
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseProductTypeDialog} variant="outlined">
            Цуцлах
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            disabled={!selectedProductType}
            onClick={() => {
              handleCloseProductTypeDialog();
              // Open the appropriate form dialog based on selection
              if (selectedProductType === 'basic') {
                handleOpenBasicProductDialog();
              } else if (selectedProductType === 'category') {
                handleOpenCategoryProductDialog();
              } else if (selectedProductType === 'image') {
                handleOpenImageProductDialog();
              }
            }}
          >
            Үргэлжлүүлэх
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Basic Product Form Dialog */}
      <Dialog
        open={openBasicProductDialog}
        onClose={handleCloseBasicProductDialog}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Энгийн бүтээгдэхүүн үүсгэх</Typography>
          <IconButton onClick={handleCloseBasicProductDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="basic-product-form" onSubmit={handleBasicFormSubmit}>
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
                  value={basicProductForm.storageGb}
                  onChange={handleBasicFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="RAM (GB)"
                  name="ramGb"
                  value={basicProductForm.ramGb}
                  onChange={handleBasicFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Processor"
                  name="processor"
                  value={basicProductForm.processor}
                  onChange={handleBasicFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Operating System"
                  name="os"
                  value={basicProductForm.os}
                  onChange={handleBasicFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Graphics"
                  name="graphics"
                  value={basicProductForm.graphics}
                  onChange={handleBasicFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Display Size (inches)"
                  name="display"
                  type="number"
                  value={basicProductForm.display}
                  onChange={handleBasicFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Model"
                  name="model"
                  value={basicProductForm.model}
                  onChange={handleBasicFormChange}
                  fullWidth
                />
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
                {basicProductForm.productImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Нэмсэн зургууд: {basicProductForm.productImages.length}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {basicProductForm.productImages.map((img, index) => (
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
                
                {/* Legacy single image field - keep for backward compatibility */}
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Хуучин горимоор дан зураг нэмэх (заавал биш)
                  </Typography>
                  <StyledTextField
                    label="Үндсэн зургийн URL"
                    name="imageUrl"
                    value={basicProductForm.imageUrl}
                    onChange={handleBasicFormChange}
                    fullWidth
                  />
                  <StyledFormControl fullWidth sx={{ mt: 2 }}>
                    <StyledInputLabel>Үндсэн зургийн төрөл</StyledInputLabel>
                    <Select
                      name="viewType"
                      value={basicProductForm.viewType}
                      onChange={handleBasicFormChange}
                      label="Үндсэн зургийн төрөл"
                    >
                      <MenuItem value="FRONT">Урд тал</MenuItem>
                      <MenuItem value="BACK">Ар тал</MenuItem>
                      <MenuItem value="RIGHT">Баруун тал</MenuItem>
                      <MenuItem value="LEFT">Зүүн тал</MenuItem>
                    </Select>
                  </StyledFormControl>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseBasicProductDialog} variant="outlined">
            Цуцлах
          </Button>
          <Button 
            type="submit"
            form="basic-product-form"
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : <AddIcon />}
          >
            Бүтээгдэхүүн үүсгэх
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Category Product Form Dialog */}
      <Dialog
        open={openCategoryProductDialog}
        onClose={handleCloseCategoryProductDialog}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Ангилалтай бүтээгдэхүүн үүсгэх</Typography>
          <IconButton onClick={handleCloseCategoryProductDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="category-product-form" onSubmit={handleCategoryItemsFormSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Бүтээгдэхүүний нэр"
                  name="prodName"
                  value={categoryItemsForm.prodName}
                  onChange={handleCategoryFormChange}
                  fullWidth
                  required
                />  
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledFormControl fullWidth required>
                  <StyledInputLabel>Ангилал</StyledInputLabel>
                  <Select
                    name="categoryId"
                    value={categoryItemsForm.categoryId}
                    onChange={handleCategoryFormChange}
                    label="Ангилал"
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
                  label="Шинэ ангиллын элементийн нэр"
                  name="cateItemName"
                  value={categoryItemsForm.cateItemName}
                  onChange={handleCategoryFormChange}
                  fullWidth
                  required
                />
                <FormHelperText>Шинэ ангиллын элементийн нэр оруулна уу</FormHelperText>
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Үнэ"
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
                  label="Нөөц"
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
                  label="Өнгө"
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
                  value={categoryItemsForm.storageGb}
                  onChange={handleCategoryFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="RAM (GB)"
                  name="ramGb"
                  value={categoryItemsForm.ramGb}
                  onChange={handleCategoryFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Processor"
                  name="processor"
                  value={categoryItemsForm.processor}
                  onChange={handleCategoryFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Operating System"
                  name="os"
                  value={categoryItemsForm.os}
                  onChange={handleCategoryFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Graphics"
                  name="graphics"
                  value={categoryItemsForm.graphics}
                  onChange={handleCategoryFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Display Size (inches)"
                  name="display"
                  type="number"
                  value={categoryItemsForm.display}
                  onChange={handleCategoryFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Model"
                  name="model"
                  value={categoryItemsForm.model}
                  onChange={handleCategoryFormChange}
                  fullWidth
                />
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
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                  Бүтээгдэхүүний зургууд
                </Typography>
                <Box sx={{ mb: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="flex-end">
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        label="Зургийн URL"
                        name="imageUrl"
                        value={categoryCurrentImage.imageUrl}
                        onChange={handleCategoryImageFormChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <StyledFormControl fullWidth>
                        <StyledInputLabel>Зургийн төрөл</StyledInputLabel>
                        <Select
                          name="viewType"
                          value={categoryCurrentImage.viewType}
                          onChange={handleCategoryImageFormChange}
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
                        onClick={handleAddCategoryImage}
                        fullWidth
                      >
                        Нэмэх
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* Display added images */}
                {categoryItemsForm.productImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Нэмсэн зургууд: {categoryItemsForm.productImages.length}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {categoryItemsForm.productImages.map((img, index) => (
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
                            onClick={() => handleRemoveCategoryImage(index)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Legacy single image field - keep for backward compatibility */}
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Хуучин горимоор дан зураг нэмэх (заавал биш)
                  </Typography>
                  <StyledTextField
                    label="Үндсэн зургийн URL"
                    name="imageUrl"
                    value={categoryItemsForm.imageUrl}
                    onChange={handleCategoryFormChange}
                    fullWidth
                  />
                  <StyledFormControl fullWidth sx={{ mt: 2 }}>
                    <StyledInputLabel>Үндсэн зургийн төрөл</StyledInputLabel>
                    <Select
                      name="viewType"
                      value={categoryItemsForm.viewType}
                      onChange={handleCategoryFormChange}
                      label="Үндсэн зургийн төрөл"
                    >
                      <MenuItem value="FRONT">Урд тал</MenuItem>
                      <MenuItem value="BACK">Ар тал</MenuItem>
                      <MenuItem value="RIGHT">Баруун тал</MenuItem>
                      <MenuItem value="LEFT">Зүүн тал</MenuItem>
                    </Select>
                  </StyledFormControl>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseCategoryProductDialog} variant="outlined">
            Цуцлах
          </Button>
          <Button 
            type="submit"
            form="category-product-form"
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : <AddIcon />}
          >
            Ангилалтай бүтээгдэхүүн үүсгэх
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Image Product Form Dialog */}
      <Dialog
        open={openImageProductDialog}
        onClose={handleCloseImageProductDialog}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Зурагтай бүтээгдэхүүн үүсгэх</Typography>
          <IconButton onClick={handleCloseImageProductDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" id="image-product-form" onSubmit={handleProductImgFormSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Бүтээгдэхүүний нэр"
                  name="prodName"
                  value={productImgForm.prodName}
                  onChange={handleProductImgFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledFormControl fullWidth required>
                  <StyledInputLabel>Ангилал</StyledInputLabel>
                  <Select
                    name="categoryId"
                    value={productImgForm.categoryId}
                    onChange={handleCategoryIDByCatItemsIDFormChange}
                    label="Ангилал"
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
                  <StyledInputLabel>Ангиллын элемент</StyledInputLabel>
                  <Select
                    name="catItemId"
                    value={productImgForm.catItemId}
                    onChange={handleCategoryItemIdFormChange}
                    label="Ангиллын элемент"
                    disabled={!productImgForm.categoryId}
                  >
                    {!productImgForm.categoryId ? 
                      <MenuItem value="">Эхлээд ангилал сонгоно уу</MenuItem>
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
                  value={productImgForm.storageGb}
                  onChange={handleProductImgFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="RAM (GB)"
                  name="ramGb"
                  value={productImgForm.ramGb}
                  onChange={handleProductImgFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Processor"
                  name="processor"
                  value={productImgForm.processor}
                  onChange={handleProductImgFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Operating System"
                  name="os"
                  value={productImgForm.os}
                  onChange={handleProductImgFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Graphics"
                  name="graphics"
                  value={productImgForm.graphics}
                  onChange={handleProductImgFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Display Size (inches)"
                  name="display"
                  type="number"
                  value={productImgForm.display}
                  onChange={handleProductImgFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  label="Model"
                  name="model"
                  value={productImgForm.model}
                  onChange={handleProductImgFormChange}
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
                        value={prodImgCurrentImage.imageUrl}
                        onChange={handleProdImageFormChange}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <StyledFormControl fullWidth>
                        <StyledInputLabel>Зургийн төрөл</StyledInputLabel>
                        <Select
                          name="viewType"
                          value={prodImgCurrentImage.viewType}
                          onChange={handleProdImageFormChange}
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
                        onClick={handleAddProdImage}
                        fullWidth
                      >
                        Нэмэх
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* Display added images */}
                {productImgForm.productImages.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Нэмсэн зургууд: {productImgForm.productImages.length}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {productImgForm.productImages.map((img, index) => (
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
                            onClick={() => handleRemoveProdImage(index)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                
                {/* Legacy single image field - keep for backward compatibility */}
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Хуучин горимоор дан зураг нэмэх (заавал биш)
                  </Typography>
                  <StyledTextField
                    label="Үндсэн зургийн URL"
                    name="imageUrl"
                    value={productImgForm.imageUrl}
                    onChange={handleProductImgFormChange}
                    fullWidth
                  />
                  <StyledFormControl fullWidth sx={{ mt: 2 }}>
                    <StyledInputLabel>Үндсэн зургийн төрөл</StyledInputLabel>
                    <Select
                      name="viewType"
                      value={productImgForm.viewType}
                      onChange={handleProductImgFormChange}
                      label="Үндсэн зургийн төрөл"
                    >
                      <MenuItem value="FRONT">Урд тал</MenuItem>
                      <MenuItem value="BACK">Ар тал</MenuItem>
                      <MenuItem value="RIGHT">Баруун тал</MenuItem>
                      <MenuItem value="LEFT">Зүүн тал</MenuItem>
                    </Select>
                  </StyledFormControl>
                </Box>
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
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseImageProductDialog} variant="outlined">
            Цуцлах
          </Button>
          <Button 
            type="submit"
            form="image-product-form"
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : <AddIcon />}
          >
            Зурагтай бүтээгдэхүүн үүсгэх
          </Button>
        </DialogActions>
      </Dialog>
      
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
