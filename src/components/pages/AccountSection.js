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
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormHelperText,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import api from '../../utils/axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentIcon from '@mui/icons-material/Payment';
import CloseIcon from '@mui/icons-material/Close';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CategoryIcon from '@mui/icons-material/Category';
import { useRouter } from 'next/router';
import { getWishlist, removeFromWishlist, clearWishlist } from "../../services/wishlistService";
import PhotoIcon from '@mui/icons-material/Photo';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  // New states for C2C selling
  const [categories, setCategories] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [categoryFields, setCategoryFields] = useState({});
  const [mySubmissions, setMySubmissions] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  // Add product details dialog state
  const [productDetailsDialog, setProductDetailsDialog] = useState({
    open: false,
    product: null
  });
  const [productData, setProductData] = useState({
    categoryId: '',
    categoryItemId: '',
    name: '',
    title: '',
    description: '',
    price: '',
    stock: '',
    color: '',
    storageGb: '',
    ramGb: '',
    processor: '',
    os: '',
    graphics: '',
    display: '',
    model: '',
    imageViewTypes: [],
    imageUrls: [] // Direct URLs for images
  });
  const [formErrors, setFormErrors] = useState({});
  
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('jwt');
    setIsLoggedIn(!!token);
    
    // Fetch data based on selected tab
    if (tabValue === 0) {
      fetchOrders();
    } else if (tabValue === 1 && isLoggedIn) {
      fetchWishlist();
    } else if (tabValue === 2 && isLoggedIn) {
      // Fetch categories and user submissions for the Sell tab
      fetchCategories();
      fetchUserSubmissions();
    }

    // Listen for wishlist updates from other components
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
  }, [tabValue, isLoggedIn]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('jwt');
      
      if (!token) {
        // If not logged in, just set orders to empty array
        console.log("No token found, showing empty orders list");
        setOrders([]);
        setLoading(false);
        return;
      }
      
      // Only fetch orders if user is authenticated
      const response = await api.get('http://localhost:8083/order/orders-all');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again later.');
      setOrders([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      // Only fetch wishlist if user is logged in
      if (!isLoggedIn) {
        setWishlist([]);
        return;
      }
      
      const response = getWishlist();
      console.log("Loaded wishlist in AccountSection:", response);
      const wishlistProducts = response.products || [];
      setWishlist(wishlistProducts);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setError('Failed to load your wishlist. Please try again later.');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available product categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('http://localhost:8083/api/user/products/allowed-categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setNotification({
        open: true,
        message: 'Could not load product categories',
        severity: 'error'
      });
    }
  };

  // Fetch category-specific fields
  const fetchCategoryFields = async (categoryId) => {
    try {
      console.log(`Fetching fields for category ID: ${categoryId}`);
      const response = await api.get(`http://localhost:8083/api/user/products/category-fields/${categoryId}`);
      console.log('Category fields response:', response.data);
      
      // Transform the API response to the format expected by the form
      const apiData = response.data || {};
      const transformedData = {
        fields: [],
        requiredFields: apiData.required || []
      };
      
      // Combine all fields from required and optional (if exists)
      if (apiData.required) {
        transformedData.fields = [...apiData.required];
      }
      
      if (apiData.optional) {
        transformedData.fields = [...transformedData.fields, ...apiData.optional];
      }
      
      console.log('Transformed category fields:', transformedData);
      
      // Store category fields in state
      setCategoryFields(transformedData);
      
      return transformedData;
    } catch (err) {
      console.error('Error fetching category fields:', err);
      if (err.response) {
        console.error('Server response:', err.response.data);
        console.error('Status code:', err.response.status);
      }
      
      setNotification({
        open: true,
        message: 'Төрлийн шаардлагатай талбаруудыг ачаалж чадсангүй',
        severity: 'error'
      });
      
      // Return empty object as fallback
      return { fields: [], requiredFields: [] };
    }
  };

  // Fetch user's product submissions
  const fetchUserSubmissions = async () => {
    setLoading(true);
    try {
      const response = await api.get('http://localhost:8083/api/user/products/my-submissions');
      setMySubmissions(response.data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setNotification({
        open: true,
        message: 'Could not load your product submissions',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateProductForm = () => {
    const errors = {};
    console.log("Validating form data:", productData);
    console.log("Category fields:", categoryFields);
    
    // Check common required fields
    if (!productData.categoryId) errors.categoryId = 'Ангилал заавал оруулах';
    if (!productData.name) errors.name = 'Нэр заавал оруулах';
    if (!productData.description) errors.description = 'Тайлбар заавал оруулах';
    if (!productData.price) errors.price = 'Үнэ заавал оруулах';
    if (isNaN(parseFloat(productData.price))) errors.price = 'Үнэ тоо байх ёстой';
    
    // Check if category requires a specific item
    if (categoryItems && categoryItems.length > 0 && !productData.categoryItemId) {
      errors.categoryItemId = 'Загвар сонгоно уу';
    }
    
    // Check category-specific required fields
    if (categoryFields && categoryFields.requiredFields && categoryFields.requiredFields.length > 0) {
      // Loop through required fields and validate
      categoryFields.requiredFields.forEach(field => {
        if (!productData[field] && field !== 'images') {
          errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} заавал оруулах`;
        }
      });
    }
    
    // Image validation - at least one image required
    if ((imageFiles.length === 0 && productData.imageUrls.length === 0) || 
        (productData.imageViewTypes && productData.imageViewTypes.length === 0)) {
      errors.images = 'Дор хаяж нэг зураг оруулах шаардлагатай';
    }

    // Make sure there's at least one view type for each image
    const totalImages = imageFiles.length + productData.imageUrls.filter(url => url.trim()).length;
    if (totalImages > 0 && 
        (!productData.imageViewTypes || productData.imageViewTypes.length < totalImages)) {
      errors.images = 'Зураг бүрт харагдах өнцөг сонгох шаардлагатай';
    }
    
    console.log("Form validation errors:", errors);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit new product
  const handleSubmitProduct = async () => {
    console.log("Submit product button clicked");
    
    // Check authentication first
    if (!checkAuthentication()) {
      setLoginPromptOpen(true);
      return;
    }
    
    // Validate form
    if (!validateProductForm()) {
      // Validation failed, show notification about errors
      setNotification({
        open: true,
        message: `Формд алдаа байна. Талбаруудыг шалгана уу.`,
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    try {
      // Prepare images array from both file uploads and direct URLs
      let images = [];
      
      // 1. Handle file uploads - convert to base64 strings
      if (imageFiles.length > 0) {
        // Process each file
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          try {
            // Convert file to base64
            const base64Data = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => resolve(reader.result);
              reader.onerror = error => reject(error);
            });
            
            // Add to images array with required structure
            images.push({
              imageUrl: base64Data,
              viewType: productData.imageViewTypes[i] || 'FRONT'
            });
          } catch (fileErr) {
            console.error(`Error processing file ${i}:`, fileErr);
          }
        }
      }
      
      // 2. Add direct URLs from user input
      if (productData.imageUrls && productData.imageUrls.length > 0) {
        const urlImages = productData.imageUrls
          .filter(url => url && url.trim() !== '')
          .map((url, index) => {
            const viewTypeIndex = imageFiles.length + index;
            return {
              imageUrl: url,
              viewType: productData.imageViewTypes[viewTypeIndex] || 'FRONT'
            };
          });
        images = [...images, ...urlImages];
      }
      
      // Create structured product submission object based on category
      const categoryId = parseInt(productData.categoryId);
      
      // Base object with common fields for all product types
      const productSubmission = {
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        stock: productData.stock ? parseInt(productData.stock) : 1,
        categoryId: categoryId,
        categoryItemId: parseInt(productData.categoryItemId || 1),
        title: productData.title || productData.name,
        color: productData.color || "Black",
        model: productData.model || "",
        images: images
      };
      
      // Add category-specific fields based on the category
      switch (categoryId) {
        case 4: // Phone
          productSubmission.storageGb = productData.storageGb || "128";
          productSubmission.ramGb = productData.ramGb || "4";
          productSubmission.processor = productData.processor || "";
          productSubmission.os = productData.os || "";
          productSubmission.graphics = null;
          productSubmission.display = productData.display ? parseFloat(productData.display) : null;
          break;
          
        case 5: // Laptop
          productSubmission.storageGb = productData.storageGb || "512";
          productSubmission.ramGb = productData.ramGb || "8";
          productSubmission.processor = productData.processor || "";
          productSubmission.os = productData.os || "";
          productSubmission.graphics = productData.graphics || "";
          productSubmission.display = productData.display ? parseFloat(productData.display) : null;
          break;
          
        case 6: // PC
          productSubmission.storageGb = productData.storageGb || "1000";
          productSubmission.ramGb = productData.ramGb || "16";
          productSubmission.processor = productData.processor || "";
          productSubmission.os = productData.os || "";
          productSubmission.graphics = productData.graphics || "";
          productSubmission.display = null;
          break;
          
        case 9: // Smart TV
          productSubmission.storageGb = null;
          productSubmission.ramGb = null;
          productSubmission.processor = null;
          productSubmission.os = productData.os || "";
          productSubmission.graphics = null;
          productSubmission.display = productData.display ? parseFloat(productData.display) : null;
          break;
          
        case 8: // Headphones
          productSubmission.storageGb = null;
          productSubmission.ramGb = null;
          productSubmission.processor = null;
          productSubmission.os = null;
          productSubmission.graphics = null;
          productSubmission.display = null;
          break;
          
        default:
          // For other categories, add basic fields
          productSubmission.storageGb = productData.storageGb || null;
          productSubmission.ramGb = productData.ramGb || null;
          productSubmission.processor = productData.processor || null;
          productSubmission.os = productData.os || null;
          productSubmission.graphics = productData.graphics || null;
          productSubmission.display = productData.display ? parseFloat(productData.display) : null;
      }
      
      console.log("Submitting product data:", JSON.stringify(productSubmission, null, 2));
      
      // Submit product to API
      const response = await api.post('http://localhost:8083/api/user/products/submit', productSubmission, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Show success message
      setNotification({
        open: true,
        message: response.data?.message || 'Бүтээгдэхүүн амжилттай бүртгэгдлээ',
        severity: 'success'
      });
      
      // Close dialog and refresh submissions
      setNewProductOpen(false);
      fetchUserSubmissions();
      resetProductForm();
    } catch (err) {
      console.error('Error submitting product:', err);
      
      // Log detailed error info
      if (err.response) {
        console.error("Server response data:", err.response.data);
        console.error("Server response status:", err.response.status);
      }
      
      // Handle error response
      setNotification({
        open: true,
        message: err.response?.data?.message || 'Бүтээгдэхүүн бүртгэхэд алдаа гарлаа',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset product form
  const resetProductForm = () => {
    setProductData({
      categoryId: '',
      categoryItemId: '',
      name: '',
      title: '',
      description: '',
      price: '',
      stock: '',
      color: '',
      storageGb: '',
      ramGb: '',
      processor: '',
      os: '',
      graphics: '',
      display: '',
      model: '',
      imageViewTypes: [],
      imageUrls: []
    });
    setImageFiles([]);
    setFormErrors({});
    setActiveStep(0);
  };

  // Handle category change
  const handleCategoryChange = async (event) => {
    const categoryId = event.target.value;
    setProductData({ 
      ...productData, 
      categoryId, 
      categoryItemId: '', 
      // Reset all category-specific fields
      title: '',
      storageGb: '',
      ramGb: '',
      processor: '',
      os: '',
      graphics: '',
      display: '',
      model: '',
    });
    
    if (categoryId) {
      try {
        // Fetch the category-specific fields
        const fields = await fetchCategoryFields(categoryId);
        console.log("Category fields:", fields);
        
        // Fetch category items if needed
        await fetchCategoryItems(categoryId);
        
        // If we got fields back, update the form accordingly
        if (fields) {
          setCategoryFields(fields);
        }
      } catch (err) {
        console.error("Error fetching category data:", err);
        setNotification({
          open: true,
          message: 'Ангиллын мэдээлэл авахад алдаа гарлаа',
          severity: 'error'
        });
      }
    } else {
      // Reset category fields if no category is selected
      setCategoryFields({});
      setCategoryItems([]);
    }
  };
  
  // Fetch category items for a selected category
  const fetchCategoryItems = async (categoryId) => {
    try {
      const response = await api.get(`http://localhost:8083/api/categories/${categoryId}/items`);
      setCategoryItems(response.data);
    } catch (err) {
      console.error('Error fetching category items:', err);
      setNotification({
        open: true,
        message: 'Could not load category items',
        severity: 'error'
      });
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
    
    // Clear error when field is filled
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };
  
  // Handle URL input change
  const handleUrlChange = (index, value) => {
    const newUrls = [...productData.imageUrls];
    newUrls[index] = value;
    setProductData({
      ...productData,
      imageUrls: newUrls
    });
  };
  
  // Add new URL input field
  const handleAddUrlField = () => {
    // Add new URL input field
    const newUrls = [...productData.imageUrls, ''];
    // Create a new viewType entry for this URL
    const newViewTypes = [...(productData.imageViewTypes || [])];
    // Use a default view type based on position
    const viewTypes = ['FRONT', 'BACK', 'LEFT', 'RIGHT', 'TOP', 'BOTTOM', 'DETAIL', 'PACKAGE'];
    const urlIndex = productData.imageUrls.length;
    newViewTypes[imageFiles.length + urlIndex] = viewTypes[urlIndex % viewTypes.length];
    
    setProductData({
      ...productData,
      imageUrls: newUrls,
      imageViewTypes: newViewTypes
    });
  };
  
  // Remove URL field
  const handleRemoveUrlField = (index) => {
    const newUrls = [...productData.imageUrls];
    newUrls.splice(index, 1);
    
    // Also update view types array
    const newViewTypes = [...productData.imageViewTypes];
    newViewTypes.splice(imageFiles.length + index, 1);
    
    setProductData({
      ...productData,
      imageUrls: newUrls,
      imageViewTypes: newViewTypes
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...files]);
    
    // Default view types based on index
    const viewTypes = ['FRONT', 'BACK', 'LEFT', 'RIGHT', 'TOP', 'BOTTOM'];
    const currentViewTypes = [...(productData.imageViewTypes || [])];
    
    // Add default view types for new images
    files.forEach((_, index) => {
      const newIndex = imageFiles.length + index;
      currentViewTypes[newIndex] = viewTypes[newIndex % viewTypes.length];
    });
    
    // Update product data with view types
    setProductData({
      ...productData,
      imageViewTypes: currentViewTypes
    });
  };
  
  // Handle image view type change
  const handleImageViewTypeChange = (index, viewType) => {
    const newViewTypes = [...(productData.imageViewTypes || [])];
    newViewTypes[index] = viewType;
    
    setProductData({
      ...productData,
      imageViewTypes: newViewTypes
    });
  };

  // Remove an image
  const handleRemoveImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    
    // Also update the view types array to keep indexes in sync
    const newViewTypes = [...productData.imageViewTypes];
    newViewTypes.splice(index, 1);
    
    setProductData({
      ...productData,
      imageViewTypes: newViewTypes
    });
  };

  // Get status color for submissions
  const getSubmissionStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return theme.palette.warning.main;
      case 'APPROVED':
        return theme.palette.success.main;
      case 'REJECTED':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
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

  // Handle removing from wishlist
  const handleRemoveFromWishlist = async (product) => {
    try {
        const productId = product.id || product.productId;
        const result = await removeFromWishlist(productId);
        
        setWishlist(prev => prev.filter(item => 
            (item.id || item.productId) !== productId
        ));
        
        setNotification({
            open: true,
            message: `${product.title || product.name} removed from wishlist`,
            severity: 'success'
        });

        // Dispatch event for other components to listen
        window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        setNotification({
            open: true,
            message: 'Failed to remove item from wishlist',
            severity: 'error'
        });
    }
  };

  // Utility function to check if user is authenticated
  const checkAuthentication = () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setNotification({
        open: true,
        message: 'Please log in to access this feature',
        severity: 'info'
      });
      return false;
    }
    return true;
  };

  // Add to cart from wishlist
  const handleAddToCartFromWishlist = async (product) => {
    console.log('Adding to cart from wishlist:', product);
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!checkAuthentication()) {
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        
        setLoading(false);
        return;
      }
      
      // First check if we need to create a cart (first item)
      try {
        await api.post("http://localhost:8083/cart");
      } catch (err) {
        // Cart likely already exists, continue
        console.log("Cart exists or error occurred:", err);
        
        // Check for auth errors
        if (err.response && err.response.status === 403) {
          setNotification({
            open: true,
            message: 'Your session has expired. Please log in again.',
            severity: 'warning'
          });
          setTimeout(() => {
            router.push('/login');
          }, 1500);
          setLoading(false);
          return;
        }
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
      
      // Handle authentication error
      if (err.response && err.response.status === 403) {
        setNotification({
          open: true,
          message: 'Your session has expired. Please log in again.',
          severity: 'warning'
        });
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }
      
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
    // Check authentication first
    if (!checkAuthentication()) return;
    
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
    // Check authentication first
    if (!checkAuthentication()) return;
    
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

  // Handle login navigation
  const handleNavigateToLogin = () => {
    setLoginPromptOpen(false);
    router.push('/login');
  };

  const handleSnackbarClose = () => {
    setNotification({ ...notification, open: false });
  };

  // Format price with thousand separators
  const formatPrice = (price) => {
    return price?.toLocaleString() || '0';
  };

  // Handle view product details
  const handleViewProductDetails = (product) => {
    setProductDetailsDialog({
      open: true,
      product
    });
  };

  // Close product details dialog
  const handleCloseProductDetailsDialog = () => {
    setProductDetailsDialog({
      open: false,
      product: null
    });
  };

  // Render product characteristics based on product type
  const renderProductDetails = (product) => {
    if (!product) return null;

    const details = [];

    if (product.storageGb) {
      details.push({ label: 'Санах ой', value: `${product.storageGb} GB` });
    }

    if (product.ramGb) {
      details.push({ label: 'RAM', value: `${product.ramGb} GB` });
    }

    if (product.processor) {
      details.push({ label: 'Процессор', value: product.processor });
    }

    if (product.os) {
      details.push({ label: 'Үйлдлийн систем', value: product.os });
    }

    if (product.graphics) {
      details.push({ label: 'Видео карт', value: product.graphics });
    }

    if (product.display) {
      details.push({ label: 'Дэлгэц', value: `${product.display} inch` });
    }

    if (product.color) {
      details.push({ label: 'Өнгө', value: product.color });
    }

    if (product.model) {
      details.push({ label: 'Загвар', value: product.model });
    }

    return details;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Миний бүртгэл
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
          <Tab label="Миний захиалгууд" />
          <Tab label="Хүслийн жагсаалт" />
          <Tab label="Бүтээгдэхүүн зарах" />
        </Tabs>
        
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Orders Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                Захиалгын түүх
              </Typography>
              
              {!isLoggedIn ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    Захиалгын түүхээ харахын тулд нэвтэрнэ үү.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleNavigateToLogin}
                  >
                    Нэвтрэх
                  </Button>
                </Box>
              ) : loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
              ) : orders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    Танд одоогоор захиалга байхгүй байна.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    href="/Products"
                  >
                    Худалдан авалт хийх
                  </Button>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table sx={{ minWidth: 650 }} aria-label="orders table">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                        <TableCell sx={{ fontWeight: 600 }}>Захиалгын ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Огноо</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Бүтээгдэхүүн</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Тоо хэмжээ</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Нийт дүн</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Төлөв</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Үйлдлүүд</TableCell>
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
                                  <Tooltip title="Төлбөр баталгаажуулах">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleVerifyPayment(order.orderId)}
                                      color="primary"
                                      disabled={loading}
                                    >
                                      <PaymentIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  
                                  <Tooltip title="Захиалга цуцлах">
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
                Миний хүслийн жагсаалт
              </Typography>
              
              {!isLoggedIn ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    Хүслийн жагсаалтаа харахын тулд нэвтэрнэ үү.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleNavigateToLogin}
                    sx={{ mt: 2 }}
                  >
                    Нэвтрэх
                  </Button>
                </Box>
              ) : loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error" sx={{ my: 2 }}>{error}</Typography>
              ) : wishlist.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    Таны хүслийн жагсаалт хоосон байна.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    href="/Products"
                  >
                    Бүтээгдэхүүн харах
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
                              Дэлгэрэнгүй
                            </Button>
                            <Button 
                              variant="contained" 
                              size="small"
                              color="primary"
                              onClick={() => handleAddToCartFromWishlist(product)}
                              disabled={loading}
                              sx={{ flex: 1 }}
                            >
                              Сагсанд нэмэх
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
          
          {/* Sell Products Tab */}
          {tabValue === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                  Бүтээгдэхүүн зарах
                </Typography>
                
                <Button 
                  variant="contained"
                  color="primary"
                  startIcon={<AddBusinessIcon />}
                  onClick={() => setNewProductOpen(true)}
                  disabled={!isLoggedIn}
                >
                  Шинэ бүтээгдэхүүн нэмэх
                </Button>
              </Box>
              
              {!isLoggedIn ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    Бүтээгдэхүүн оруулахын тулд нэвтэрнэ үү.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleNavigateToLogin}
                  >
                    Нэвтрэх
                  </Button>
                </Box>
              ) : loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Таны оруулсан бүтээгдэхүүнүүд:
                  </Typography>
                  
                  {mySubmissions.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                      <Typography variant="body1" color="textSecondary">
                        Таны оруулсан бүтээгдэхүүн байхгүй байна
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
                        Шинэ бүтээгдэхүүн нэмэхийн тулд дээрх товчийг дарна уу
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} elevation={0}>
                      <Table sx={{ minWidth: 650 }} aria-label="my submissions table">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                            <TableCell sx={{ fontWeight: 600 }}>Зураг</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Нэр</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Тайлбар</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Оруулсан огноо</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Үнэ</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Төлөв</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Үйлдэл</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {mySubmissions.map((submission) => (
                            <TableRow 
                              key={submission.id}
                              sx={{ 
                                '&:last-child td, &:last-child th': { border: 0 },
                                cursor: 'pointer',
                                '&:hover': {
                                  bgcolor: theme.palette.action.hover
                                }
                              }}
                              onClick={(e) => {
                                // Only trigger row click if not clicking on action buttons
                                if (!e.target.closest('button')) {
                                  handleViewProductDetails(submission);
                                }
                              }}
                            >
                              <TableCell>
                                {submission.images && submission.images.length > 0 ? (
                                  <Box
                                    sx={{
                                      width: 60,
                                      height: 60,
                                      borderRadius: 1,
                                      overflow: 'hidden',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: theme.palette.grey[100]
                                    }}
                                  >
                                    <img 
                                      src={submission.images[0]?.imageUrl || "/placeholder.svg"}
                                      alt={submission.name}
                                      style={{ 
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                      }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder.svg";
                                      }}
                                    />
                                  </Box>
                                ) : (
                                  <Box
                                    sx={{
                                      width: 60,
                                      height: 60,
                                      borderRadius: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: theme.palette.grey[100]
                                    }}
                                  >
                                    <PhotoIcon sx={{ color: theme.palette.grey[400], fontSize: 30 }} />
                                  </Box>
                                )}
                              </TableCell>
                              <TableCell component="th" scope="row">
                                {submission.name}
                              </TableCell>
                              <TableCell>
                                <Tooltip 
                                  title={submission.description || "Тайлбар байхгүй"} 
                                  placement="top"
                                  arrow
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      maxWidth: 200,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {typeof submission.description === 'string' ? submission.description : "Тайлбар байхгүй"}
                                  </Typography>
                                </Tooltip>
                              </TableCell>
                              <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                              <TableCell>{submission.price ? `${formatPrice(submission.price)} ₮` : 'N/A'}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={submission.status} 
                                  sx={{ 
                                    backgroundColor: getSubmissionStatusColor(submission.status),
                                    color: '#fff',
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                  }} 
                                  size="small" 
                                />
                              </TableCell>
                              <TableCell>
                                {submission.status === 'REJECTED' && submission.rejectionReason ? (
                                  <Tooltip title={submission.rejectionReason}>
                                    <Chip 
                                      label="Татгалзсан" 
                                      size="small"
                                      color="error"
                                      sx={{ mr: 1 }}
                                    />
                                  </Tooltip>
                                ) : null}
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<VisibilityIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click
                                    handleViewProductDetails(submission);
                                  }}
                                  sx={{ 
                                    borderRadius: 8,
                                    textTransform: 'none',
                                    minWidth: 'auto'
                                  }}
                                >
                                  Харах
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* New Product Dialog */}
      <Dialog
        open={newProductOpen}
        onClose={() => setNewProductOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h5" fontWeight={600}>Шинэ бүтээгдэхүүн оруулах</Typography>
          <IconButton onClick={() => setNewProductOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              mt: 1, 
              mb: 4, 
              py: 2, 
              px: { xs: 1, sm: 2 }, 
              bgcolor: theme.palette.background.default,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              '& .MuiStepLabel-label': {
                fontWeight: 500
              },
              '& .MuiStepLabel-label.Mui-active': {
                color: theme.palette.primary.main,
                fontWeight: 600
              },
              '& .MuiStepIcon-root.Mui-active': {
                color: theme.palette.primary.main
              },
              '& .MuiStepIcon-root.Mui-completed': {
                color: theme.palette.success.main
              }
            }}
            alternativeLabel
          >
            <Step>
              <StepLabel>Үндсэн мэдээлэл</StepLabel>
            </Step>
            <Step>
              <StepLabel>Техникийн үзүүлэлт</StepLabel>
            </Step>
            <Step>
              <StepLabel>Зураг</StepLabel>
            </Step>
          </Stepper>
          
          <Box sx={{ 
            p: { xs: 1, sm: 3 }, 
            bgcolor: theme.palette.grey[50], 
            borderRadius: 2,
            minHeight: '400px'
          }}>
            {/* Step 1: Basic Information */}
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                    Бүтээгдэхүүний үндсэн мэдээлэл
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: theme.palette.info.light, 
                    color: theme.palette.info.contrastText,
                    borderRadius: 1
                  }}>
                    <Typography variant="body2">
                      Бүтээгдэхүүний үндсэн мэдээлэлийг оруулна уу. "*" тэмдэгтэй талбарууд заавал шаардлагатай.
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!formErrors.categoryId} size="medium">
                    <InputLabel>Төрөл *</InputLabel>
                    <Select
                      name="categoryId"
                      value={productData.categoryId}
                      onChange={handleCategoryChange}
                      label="Төрөл *"
                      sx={{ height: '48px' }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300
                          }
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>Сонгоно уу</em>
                      </MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formErrors.categoryId}</FormHelperText>
                  </FormControl>
                </Grid>
                
                {categoryItems.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!formErrors.categoryItemId} size="medium">
                      <InputLabel>Загвар *</InputLabel>
                      <Select
                        name="categoryItemId"
                        value={productData.categoryItemId}
                        onChange={handleInputChange}
                        label="Загвар *"
                        sx={{ height: '48px' }}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>Сонгоно уу</em>
                        </MenuItem>
                        {categoryItems.map((item) => (
                          <MenuItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{formErrors.categoryItemId}</FormHelperText>
                    </FormControl>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Нэр *"
                    value={productData.name}
                    onChange={handleInputChange}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    size="medium"
                    InputProps={{
                      sx: { 
                        height: '48px', 
                        borderRadius: 1 
                      }
                    }}
                  />
                </Grid>
                
                {categoryFields && categoryFields.fields && categoryFields.fields.includes('title') && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="title"
                      label="Гарчиг"
                      value={productData.title}
                      onChange={handleInputChange}
                      error={!!formErrors.title}
                      helperText={formErrors.title}
                      size="medium"
                      InputProps={{
                        sx: { 
                          height: '48px', 
                          borderRadius: 1 
                        }
                      }}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="description"
                    label="Тайлбар *"
                    value={productData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    error={!!formErrors.description}
                    helperText={formErrors.description}
                    size="medium"
                    InputProps={{
                      sx: { 
                        borderRadius: 1 
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="price"
                    label="Үнэ ($) *"
                    value={productData.price}
                    onChange={handleInputChange}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      sx: { 
                        height: '48px', 
                        borderRadius: 1 
                      }
                    }}
                    error={!!formErrors.price}
                    helperText={formErrors.price}
                    size="medium"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="stock"
                    label="Нөөц хэмжээ"
                    value={productData.stock}
                    onChange={handleInputChange}
                    type="number"
                    error={!!formErrors.stock}
                    helperText={formErrors.stock}
                    size="medium"
                    InputProps={{
                      sx: { 
                        height: '48px', 
                        borderRadius: 1 
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="color"
                    label="Өнгө"
                    value={productData.color}
                    onChange={handleInputChange}
                    error={!!formErrors.color}
                    helperText={formErrors.color}
                    size="medium"
                    InputProps={{
                      sx: { 
                        height: '48px', 
                        borderRadius: 1 
                      }
                    }}
                  />
                </Grid>
                
                {categoryFields && categoryFields.fields && categoryFields.fields.includes('model') && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      name="model"
                      label="Загвар"
                      value={productData.model}
                      onChange={handleInputChange}
                      error={!!formErrors.model}
                      helperText={formErrors.model || "Жишээ: iPhone14Pro, MacBookPro16"}
                      size="medium"
                      InputProps={{
                        sx: { 
                          height: '48px', 
                          borderRadius: 1 
                        }
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            )}
            
            {/* Step 2: Technical Specifications */}
            {activeStep === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
                    Техникийн үзүүлэлт
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Таны сонгосон бүтээгдэхүүний төрөлд тохирох үзүүлэлтүүдийг оруулна уу
                  </Typography>
                </Grid>
                
                {/* Log the categoryFields to debug */}
                {console.log("Rendering tech specs with fields:", categoryFields)}
                
                {categoryFields && categoryFields.fields && categoryFields.fields.length > 0 ? (
                  <>
                    {categoryFields.fields.includes('storageGb') && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="storageGb"
                          label={categoryFields.requiredFields?.includes('storageGb') ? "Санах ой (GB) *" : "Санах ой (GB)"}
                          value={productData.storageGb}
                          onChange={handleInputChange}
                          type="text"
                          error={!!formErrors.storageGb}
                          helperText={formErrors.storageGb || "Жишээ: 128, 256, 512"}
                          required={categoryFields.requiredFields?.includes('storageGb')}
                          size="medium"
                          InputProps={{
                            sx: { 
                              height: '48px', 
                              borderRadius: 1 
                            }
                          }}
                        />
                      </Grid>
                    )}
                    
                    {categoryFields.fields.includes('ramGb') && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="ramGb"
                          label={categoryFields.requiredFields?.includes('ramGb') ? "RAM (GB) *" : "RAM (GB)"}
                          value={productData.ramGb}
                          onChange={handleInputChange}
                          type="text"
                          error={!!formErrors.ramGb}
                          helperText={formErrors.ramGb || "Жишээ: 4, 8, 16"}
                          required={categoryFields.requiredFields?.includes('ramGb')}
                          size="medium"
                          InputProps={{
                            sx: { 
                              height: '48px', 
                              borderRadius: 1 
                            }
                          }}
                        />
                      </Grid>
                    )}
                    
                    {categoryFields.fields.includes('processor') && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="processor"
                          label={categoryFields.requiredFields?.includes('processor') ? "Процессор *" : "Процессор"}
                          value={productData.processor}
                          onChange={handleInputChange}
                          error={!!formErrors.processor}
                          helperText={formErrors.processor || "Жишээ: Intel Core i7, Apple M1"}
                          required={categoryFields.requiredFields?.includes('processor')}
                          size="medium"
                          InputProps={{
                            sx: { 
                              height: '48px', 
                              borderRadius: 1 
                            }
                          }}
                        />
                      </Grid>
                    )}
                    
                    {categoryFields.fields.includes('os') && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="os"
                          label={categoryFields.requiredFields?.includes('os') ? "Үйлдлийн систем *" : "Үйлдлийн систем"}
                          value={productData.os}
                          onChange={handleInputChange}
                          error={!!formErrors.os}
                          helperText={formErrors.os || "Жишээ: Windows 11, macOS, Android 12"}
                          required={categoryFields.requiredFields?.includes('os')}
                          size="medium"
                          InputProps={{
                            sx: { 
                              height: '48px', 
                              borderRadius: 1 
                            }
                          }}
                        />
                      </Grid>
                    )}
                    
                    {categoryFields.fields.includes('graphics') && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="graphics"
                          label={categoryFields.requiredFields?.includes('graphics') ? "Видео карт *" : "Видео карт"}
                          value={productData.graphics}
                          onChange={handleInputChange}
                          error={!!formErrors.graphics}
                          helperText={formErrors.graphics || "Жишээ: NVIDIA RTX 3060, AMD Radeon"}
                          required={categoryFields.requiredFields?.includes('graphics')}
                          size="medium"
                          InputProps={{
                            sx: { 
                              height: '48px', 
                              borderRadius: 1 
                            }
                          }}
                        />
                      </Grid>
                    )}
                    
                    {categoryFields.fields.includes('display') && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name="display"
                          label={categoryFields.requiredFields?.includes('display') ? "Дэлгэц *" : "Дэлгэц"}
                          value={productData.display}
                          onChange={handleInputChange}
                          error={!!formErrors.display}
                          helperText={formErrors.display || "Жишээ: 15.6 inch, 6.1 inch OLED"}
                          required={categoryFields.requiredFields?.includes('display')}
                          size="medium"
                          InputProps={{
                            sx: { 
                              height: '48px', 
                              borderRadius: 1 
                            }
                          }}
                        />
                      </Grid>
                    )}
                  </>
                ) : (
                  <Grid item xs={12}>
                    <Box sx={{ 
                      border: '1px dashed', 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      p: 3, 
                      textAlign: 'center',
                      bgcolor: theme.palette.grey[50]
                    }}>
                      <Typography color="textSecondary">
                        {productData.categoryId ? 
                          'Энэ бүтээгдэхүүний төрөлд нэмэлт техникийн үзүүлэлт шаардлагагүй байна' :
                          'Эхлээд бүтээгдэхүүний төрлийг сонгоно уу'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
            
            {/* Step 3: Images */}
            {activeStep === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
                      Бүтээгдэхүүний зураг
                    </Typography>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.info.light, 
                      color: theme.palette.info.contrastText,
                      borderRadius: 1,
                      mb: 2
                    }}>
                      <Typography variant="body2">
                        Бүтээгдэхүүний зураг нэмнэ үү (хамгийн ихдээ 5 зураг). Та файл оруулах эсвэл зурагны URL холбоос оруулж болно.
                        Зураг бүрийн харагдах өнцгийг (Урд, Ард, Баруун, Зүүн гэх мэт) сонгоно уу.
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<CategoryIcon />}
                        sx={{ 
                          borderRadius: 8, 
                          px: 3,
                          bgcolor: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                          }
                        }}
                      >
                        Файл оруулах
                        <input
                          type="file"
                          hidden
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </Button>
                      
                      <Button 
                        variant="outlined" 
                        onClick={handleAddUrlField}
                        startIcon={<AddIcon />}
                        sx={{ 
                          borderRadius: 8, 
                          px: 3,
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          '&:hover': {
                            borderColor: theme.palette.primary.dark,
                            bgcolor: theme.palette.primary.light,
                            opacity: 0.9
                          }
                        }}
                      >
                        URL нэмэх
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Direct URL inputs */}
                  {productData.imageUrls.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
                        Зурагны URL-ууд
                      </Typography>
                      {productData.imageUrls.map((url, index) => (
                        <Paper 
                          key={`url-${index}`} 
                          elevation={0} 
                          sx={{ 
                            mb: 2, 
                            p: 2,
                            border: '1px solid',
                            borderColor: theme.palette.divider,
                            borderRadius: 2
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <TextField
                              fullWidth
                              label={`Зурагны URL ${index + 1}`}
                              value={url}
                              onChange={(e) => handleUrlChange(index, e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              size="medium"
                              InputProps={{
                                sx: { 
                                  height: '48px', 
                                  borderRadius: 1 
                                }
                              }}
                            />
                            <FormControl sx={{ minWidth: 150 }} size="medium">
                              <InputLabel>Харагдац</InputLabel>
                              <Select
                                value={productData.imageViewTypes[imageFiles.length + index] || 'FRONT'}
                                onChange={(e) => handleImageViewTypeChange(imageFiles.length + index, e.target.value)}
                                label="Харагдац"
                              >
                                <MenuItem value="FRONT">Урд</MenuItem>
                                <MenuItem value="BACK">Ард</MenuItem>
                                <MenuItem value="LEFT">Зүүн</MenuItem>
                                <MenuItem value="RIGHT">Баруун</MenuItem>
                                <MenuItem value="TOP">Дээд</MenuItem>
                                <MenuItem value="BOTTOM">Доод</MenuItem>
                                <MenuItem value="DETAIL">Дэлгэрэнгүй</MenuItem>
                                <MenuItem value="PACKAGE">Хайрцаг</MenuItem>
                              </Select>
                            </FormControl>
                            <IconButton 
                              color="error" 
                              onClick={() => handleRemoveUrlField(index)}
                              sx={{ 
                                bgcolor: theme.palette.error.light,
                                color: theme.palette.error.contrastText,
                                '&:hover': {
                                  bgcolor: theme.palette.error.main
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}

                  {/* Uploaded files */}
                  {imageFiles.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>
                        Оруулсан зурагнууд
                      </Typography>
                      <Grid container spacing={2}>
                        {imageFiles.map((file, index) => (
                          <Grid item xs={12} sm={6} md={4} key={`file-${index}`}>
                            <Card sx={{ 
                              position: 'relative',
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }
                            }}>
                              <IconButton
                                      size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 5,
                                  right: 5,
                                  bgcolor: 'background.paper',
                                  '&:hover': { bgcolor: 'error.light', color: 'white' }
                                }}
                                onClick={() => handleRemoveImage(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <CardContent sx={{ p: 2 }}>
                                <Box sx={{ 
                                  position: 'relative',
                                  width: '100%', 
                                  height: 140, 
                                  bgcolor: theme.palette.grey[100], 
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mb: 1.5
                                }}>
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Product image ${index + 1}`}
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'contain',
                                      borderRadius: '4px'
                                    }}
                                  />
                                </Box>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Харагдац</InputLabel>
                                  <Select
                                    value={productData.imageViewTypes[index] || 'FRONT'}
                                    onChange={(e) => handleImageViewTypeChange(index, e.target.value)}
                                    label="Харагдац"
                                  >
                                    <MenuItem value="FRONT">Урд</MenuItem>
                                    <MenuItem value="BACK">Ард</MenuItem>
                                    <MenuItem value="LEFT">Зүүн</MenuItem>
                                    <MenuItem value="RIGHT">Баруун</MenuItem>
                                    <MenuItem value="TOP">Дээд</MenuItem>
                                    <MenuItem value="BOTTOM">Доод</MenuItem>
                                    <MenuItem value="DETAIL">Дэлгэрэнгүй</MenuItem>
                                    <MenuItem value="PACKAGE">Хайрцаг</MenuItem>
                                  </Select>
                                </FormControl>
                                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', textAlign: 'center', fontSize: '0.7rem' }}>
                                  {file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                  
                  {/* Empty state */}
                  {imageFiles.length === 0 && productData.imageUrls.length === 0 && (
                    <Box
                      sx={{
                        border: '2px dashed',
                        borderColor: theme.palette.primary.light,
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        bgcolor: theme.palette.grey[50],
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        my: 4
                      }}
                    >
                      <PhotoIcon sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
                      <Typography color="textSecondary" variant="body1">Зураг оруулаагүй байна</Typography>
                      <Typography color="textSecondary" variant="body2">
                        Бүтээгдэхүүний зураг нэмэхийн тулд дээрх "Файл оруулах" эсвэл "URL нэмэх" товчийг дарна уу
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Show error message if any */}
                  {formErrors.images && (
                    <Typography color="error" sx={{ mt: 2, p: 2, bgcolor: theme.palette.error.light, borderRadius: 1, fontWeight: 500 }}>
                      {formErrors.images}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          {activeStep > 0 && (
            <Button 
              onClick={() => setActiveStep(activeStep - 1)}
              startIcon={<ArrowBackIcon />}
                                      sx={{ mr: 1 }}
            >
              Буцах
            </Button>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          {activeStep < 2 ? (
            <Button 
              variant="contained" 
              onClick={() => setActiveStep(activeStep + 1)}
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: 8
              }}
            >
              Дараагийн
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleSubmitProduct}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: 8,
                bgcolor: theme.palette.success.main,
                '&:hover': {
                  bgcolor: theme.palette.success.dark
                }
              }}
            >
              {loading ? 'Илгээж байна...' : 'Бүтээгдэхүүн илгээх'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

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
          <Typography variant="h6">Захиалга #{paymentDialog.orderId} төлбөр</Typography>
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
                  Төлбөр хийхийн тулд доорх QR кодыг уншуулна уу
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
            <Typography color="error">Төлбөрийн мэдээллийг ачаалж чадсангүй</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
                                <Button
            variant="contained" 
            onClick={handleClosePaymentDialog}
          >
            Хаах
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Login Prompt Dialog */}
      <Dialog
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>Нэвтрэх шаардлагатай</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="body1" paragraph>
              Энэ үйлдлийг хийхийн тулд бүртгэлдээ нэвтэрнэ үү.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setLoginPromptOpen(false)}
                                  variant="outlined"
            sx={{ color: '#333', borderColor: '#333' }}
          >
            Цуцлах
          </Button>
          <Button
            onClick={handleNavigateToLogin}
            variant="contained"
                                  sx={{ 
              bgcolor: '#1e4620',
              '&:hover': { bgcolor: '#143314' },
                                    textTransform: 'none',
              fontSize: '1rem'
                                  }}
                                >
            Нэвтрэх
                                </Button>
        </DialogActions>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog
        open={productDetailsDialog.open}
        onClose={handleCloseProductDetailsDialog}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}>
          <Typography variant="h5" fontWeight={600}>
            {productDetailsDialog.product?.name || 'Бүтээгдэхүүний дэлгэрэнгүй'}
          </Typography>
          <IconButton onClick={handleCloseProductDetailsDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {productDetailsDialog.product && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Box sx={{ 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  height: 250,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: theme.palette.grey[100],
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {productDetailsDialog.product.images && productDetailsDialog.product.images.length > 0 ? (
                    <img 
                      src={productDetailsDialog.product.images[0]?.imageUrl || "/placeholder.svg"}
                      alt={productDetailsDialog.product.name}
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.svg";
                      }}
                    />
                  ) : (
                    <PhotoIcon sx={{ fontSize: 100, color: theme.palette.grey[400] }} />
                  )}
                </Box>

                {/* Additional product images */}
                {productDetailsDialog.product.images && productDetailsDialog.product.images.length > 1 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                    {productDetailsDialog.product.images.slice(1).map((image, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          borderRadius: 1,
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1px solid',
                          borderColor: theme.palette.divider
                        }}
                      >
                        <img 
                          src={image.imageUrl || "/placeholder.svg"}
                          alt={`View ${image.viewType || 'additional'}`}
                          style={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder.svg";
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={7}>
                <Typography variant="h6" gutterBottom fontWeight={600} sx={{ color: theme.palette.primary.main }}>
                  {productDetailsDialog.product.title || productDetailsDialog.product.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: theme.palette.secondary.main }}>
                    {formatPrice(productDetailsDialog.product.price)} ₮
                  </Typography>
                  
                  <Chip 
                    label={productDetailsDialog.product.status} 
                    size="small"
                    sx={{ 
                      ml: 2,
                      backgroundColor: getSubmissionStatusColor(productDetailsDialog.product.status),
                      color: '#fff',
                      fontWeight: 500
                    }} 
                  />
                </Box>
                
                <Typography variant="body1" gutterBottom sx={{ mb: 2, color: theme.palette.text.secondary }}>
                  {typeof productDetailsDialog.product.description === 'string' 
                    ? productDetailsDialog.product.description 
                    : "Тайлбар байхгүй"}
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                  Техникийн үзүүлэлт
                </Typography>
                
                <Grid container spacing={1}>
                  {renderProductDetails(productDetailsDialog.product).map((detail, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ display: 'flex', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>
                          {detail.label}:
                        </Typography>
                        <Typography variant="body2">
                          {detail.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                    Мэдээлэл
                  </Typography>
                  
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>
                      Оруулсан огноо:
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(productDetailsDialog.product.submittedAt)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', mb: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ minWidth: 120 }}>
                      Нөөц:
                    </Typography>
                    <Typography variant="body2">
                      {productDetailsDialog.product.stock || 0} ширхэг
                    </Typography>
                  </Box>
                  
                  {productDetailsDialog.product.status === 'REJECTED' && productDetailsDialog.product.rejectionReason && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: theme.palette.error.light, borderRadius: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600} color="error">
                        Татгалзсан шалтгаан:
                      </Typography>
                      <Typography variant="body2" color="error.dark">
                        {productDetailsDialog.product.rejectionReason}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseProductDetailsDialog}
            variant="outlined"
          >
            Хаах
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AccountSection;
