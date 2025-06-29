import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Card, CardContent, CardMedia, Typography, Button, Container, CircularProgress, Box, IconButton, Pagination, Snackbar, Alert, Tooltip, Chip, useTheme, Grow, Fade, Rating } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { useRouter } from "next/router";
import api from "../../utils/axios";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { getWishlist, addToWishlist, removeFromWishlist } from "../../services/wishlistService";

// Helper function to get the front image URL from a product
const getFrontImageUrl = (product) => {
  // Return the first available image property or a fallback
  return product.imageUrl || product.image || product.images?.[0] || "/placeholder.jpg";
};

// Renamed from ProductSection to AllProductsSection for consistency with filename
const AllProductsSection = ({ products, loading, error, onAddToCart, darkMode }) => {
  const [page, setPage] = useState(1);
  const [productRatings, setProductRatings] = useState({});
  const itemsPerPage = 12; // 4 columns × 3 rows
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [wishlistItems, setWishlistItems] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const theme = useTheme();
  
  // Helper function to get product rating information
  const getProductRating = (productId) => {
    return productRatings[productId] || { averageRating: 0, totalRatings: 0 };
  };
  
  // Fetch ratings for all products
  useEffect(() => {
    const fetchProductRatings = async () => {
      if (products && products.length > 0) {
        const ratingsData = {};

        // Fetch ratings for all products in parallel
        await Promise.all(
          products.map(async (product) => {
            try {
              const response = await api.get(`/product/${product.id}/rating`);
              if (response.data) {
                ratingsData[product.id] = {
                  averageRating: response.data.averageRating || 0,
                  totalRatings: response.data.totalRatings || 0
                };
              }
            } catch (error) {
              console.error(`Error fetching rating for product ${product.id}:`, error);
              // Use fallback rating from product if available
              if (product.rating) {
                ratingsData[product.id] = {
                  averageRating: parseFloat(product.rating),
                  totalRatings: product.reviewCount || 0
                };
              }
            }
          })
        );

        setProductRatings(ratingsData);
      }
    };

    fetchProductRatings();
  }, [products]);
  
  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  };

  // Load wishlist on component mount
  useEffect(() => {
    loadWishlist();
    // Listen for wishlist updates from other components
    window.addEventListener('wishlistUpdated', loadWishlist);
    
    return () => {
      window.removeEventListener('wishlistUpdated', loadWishlist);
    };
  }, []);

  // Load wishlist and check which products are in it
  const loadWishlist = async () => {
    try {
      const response = getWishlist();
      const wishlistProducts = response.products || [];
      // Extract product IDs from the wishlist items
      const wishlistProductIds = wishlistProducts.map(item => item.id || item.productId);
      console.log("Loaded wishlist product IDs in AllProductsSection:", wishlistProductIds);
      setWishlistItems(wishlistProductIds);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle product click to navigate to detail page
  const handleProductClick = (product) => {
    // Store product data in localStorage before navigating
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    
    // Navigate to product detail page with ID in query params
    router.push({
      pathname: `/ProductDetail`,
      query: { id: product.id }
    });
  };

  // Handle login requirement
  const handleRequireLogin = (message) => {
    setLoginPromptOpen(true);
    setSnackbar({
      open: true,
      message: message || 'Сагсанд бараа нэмэхийн тулд нэвтэрнэ үү',
      severity: 'warning'
    });
  };
  
  // Handle login navigation
  const handleNavigateToLogin = () => {
    setLoginPromptOpen(false);
    router.push('/login');
  };

  // Handle add to cart
  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); // Don't open product detail when clicking add to cart
    
    // Check if user is authenticated
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      // If not logged in, show login dialog
      handleRequireLogin('Сагсанд бараа нэмэхийн тулд нэвтэрнэ үү');
      return;
    }
    
    setAddingToCart(true);
    const productId = product.id || product.productId;
    setAddingProductId(productId);
    
    try {
      // First check if we need to create a cart (first item)
      try {
        await api.post("http://localhost:8083/cart");
      } catch (err) {
        // Cart likely already exists, continue
        console.log("Cart exists or error occurred:", err);
        // If the error is 403, it means user is not authenticated
        if (err.response && err.response.status === 403) {
          handleRequireLogin('Таны холболт дууссан. Дахин нэвтэрнэ үү.');
          
          setAddingToCart(false);
          setAddingProductId(null);
          return;
        }
      }
      
      // Add item to cart using the API
      const response = await api.post(`http://localhost:8083/cart/items/${productId}`);
      
      // Store product image in localStorage for cart display
      const cartItemsImages = JSON.parse(localStorage.getItem('cartItemsImages') || '{}');
      cartItemsImages[productId] = product.imageUrl || product.image || "/placeholder.jpg";
      localStorage.setItem('cartItemsImages', JSON.stringify(cartItemsImages));
      
      // Trigger cart updated event for header to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success message from API response or default
      setSnackbar({
        open: true,
        message: response.data?.message || `${product.title || product.name} сагсанд нэмэгдлээ!`,
        severity: 'success'
      });
      
    } catch (err) {
      console.error("Error adding item to cart:", err);
      
      // Handle 403 Forbidden specifically (authentication error)
      if (err.response && err.response.status === 403) {
        handleRequireLogin('Таны холболт дууссан. Дахин нэвтэрнэ үү.');
        return;
      }
      
      // Extract error message from response if available
      const errorMessage = err.response?.data?.message || "Сагсанд бараа нэмэхэд алдаа гарлаа. Дахин оролдоно уу.";
      
      // Check for specific error types
      if (errorMessage.includes('stock') || errorMessage.includes('нөөц')) {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'warning'
        });
      } else if (errorMessage.includes('already') || errorMessage.includes('хэдийн')) {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'info'
        });
      } else {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    } finally {
      setAddingToCart(false);
      setAddingProductId(null);
    }
  };

  // Function to call either the parent's onAddToCart or local implementation
  const handleCartAction = (e, product) => {
    if (onAddToCart) {
      onAddToCart(e, product);
    } else {
      handleAddToCart(e, product);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = async (e, product) => {
    e.stopPropagation(); // Prevent card click when clicking the wishlist icon
    
    try {
      const productId = product.id || product.productId;
      const isInWishlist = wishlistItems.includes(productId);

      if (isInWishlist) {
        const result = await removeFromWishlist(productId);
        setWishlistItems(prev => prev.filter(id => id !== productId));
        setSnackbar({
          open: true,
          message: `${product.title || product.name} хүслийн жагсаалтаас хасагдлаа`,
          severity: 'success'
        });
      } else {
        const result = await addToWishlist(productId, product);
        setWishlistItems(prev => [...prev, productId]);
        
        // Check if the product is out of stock
        if (product.stock === 0) {
          setSnackbar({
            open: true,
            message: `${product.title || product.name} хүслийн жагсаалтад нэмэгдлээ. Анхааруулга: Энэ бараа дууссан байна.`,
            severity: 'warning'
          });
        } else if (product.stock <= 5) {
          setSnackbar({
            open: true,
            message: `${product.title || product.name} хүслийн жагсаалтад нэмэгдлээ. Зөвхөн ${product.stock} ширхэг үлдсэн байна.`,
            severity: 'info'
          });
        } else {
        setSnackbar({
          open: true,
          message: `${product.title || product.name} хүслийн жагсаалтад нэмэгдлээ`,
          severity: 'success'
        });
        }
      }

      // Dispatch event for other components to listen
      window.dispatchEvent(new Event('wishlistUpdated'));

    } catch (error) {
      console.error('Error updating wishlist:', error);
      setSnackbar({
        open: true,
        message: 'Хүслийн жагсаалтыг шинэчлэхэд алдаа гарлаа',
        severity: 'error'
      });
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (product) => {
    const productId = product.id || product.productId;
    const result = wishlistItems.includes(productId);
    return result;
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };
  
  // Auto-close notification after 3 seconds
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        handleSnackbarClose();
      }, 3000); // 3 seconds timeout
      
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  // Format price 
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `${parseFloat(price).toFixed(0)} MNT`;
  };

  // Portal component for global notifications
  const NotificationPortal = () => {
    if (!snackbar.open) return null;
    
    return ReactDOM.createPortal(
      <div
        style={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          zIndex: 99999, // Super high z-index
          backgroundColor: 
            snackbar.severity === 'success' ? '#3cb371' : 
            snackbar.severity === 'error' ? '#f44336' : 
            snackbar.severity === 'warning' ? '#ff9800' : 
            '#2196f3',
          color: 'white',
          padding: '14px 20px',
          borderRadius: '12px',
          boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
          maxWidth: '400px',
          width: 'auto',
          animation: 'slideIn 0.3s ease-out',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem', mr: 2 }}>
            {snackbar.message}
          </Typography>
          <IconButton 
            size="small" 
            onClick={handleSnackbarClose} 
            sx={{ color: 'white', mt: -0.5, mr: -0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <style jsx global>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>
      </div>,
      document.body
    );
  };


  return (
    <div style={{ position: 'relative' }}>
      {/* Render notification through portal */}
      <NotificationPortal />

      <Fade in={true} timeout={800}>
    <Container 
     maxWidth={false} 
     sx={{ 
            backdropFilter: "blur(10px)",
            backgroundColor: darkMode ? 'rgba(16, 16, 28, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            py: 5, 
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            my: 3,
       px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 10 }
     }}
   >
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4
          }}>
      <Typography 
        variant="h4" 
        component="h2" 
        sx={{ 
                color: darkMode ? '#fff' : '#333',
                fontWeight: 700,
          position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  width: '40px',
                  height: '4px',
                  bottom: '-8px',
                  left: '0',
                  borderRadius: '2px',
                  background: 'linear-gradient(90deg, #6d42ff, #4b6eff)'
                }
        }}
      >
              Бүх бүтээгдэхүүн
      </Typography>
            
            <Typography variant="body2" sx={{ 
              color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              fontWeight: 500,
              bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              px: 1.5,
              py: 0.5,
              borderRadius: 2
            }}>
              {products.length} {products.length === 1 ? 'бүтээгдэхүүн' : 'бүтээгдэхүүн'}
            </Typography>
          </Box>

          {error && (
            <Fade in={true} timeout={800}>
              <Box sx={{ 
                p: 4, 
                borderRadius: 4, 
                bgcolor: darkMode ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.08)', 
                color: darkMode ? '#ff8a80' : '#d32f2f',
                textAlign: 'center',
                my: 4,
                border: '1px solid',
                borderColor: darkMode ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2
              }}>
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
                <Typography variant="h6">{error}</Typography>
              </Box>
            </Fade>
          )}

          {loading && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flexDirection: 'column',
              gap: 3,
              minHeight: '50vh'
            }}>
              <CircularProgress 
                size={60} 
                thickness={4} 
                sx={{
                  color: 'linear-gradient(45deg, #6d42ff, #4b6eff)'
                }}
              />
              <Typography variant="h6" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                Бүтээгдэхүүн ачаалж байна...
              </Typography>
            </Box>
          )}

          {!loading && !error && products.length === 0 && (
            <Fade in={true} timeout={800}>
              <Box sx={{ 
                p: 6, 
                textAlign: 'center',
                borderRadius: 4,
                bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                my: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
                <InfoIcon sx={{ fontSize: 48, color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)' }} />
                <Typography variant="h5" gutterBottom sx={{ color: darkMode ? '#fff' : '#333' }}>
                  Бүтээгдэхүүн олдсонгүй
                </Typography>
                <Typography variant="body1" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                  Хайлтын хэсгээ тохируулах эсвэл дараа дахин шалгана уу.
                </Typography>
              </Box>
            </Fade>
          )}

      {!loading && !error && products.length > 0 && (
        <>
      <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                },
                gap: { xs: 2, md: 3 },
              }}
            >
              {getCurrentPageItems().map((product, index) => (
                <Grow
                  key={product.id || index}
                  in={true}
                  style={{ transformOrigin: '0 0 0' }}
                  timeout={300 + index * 50}
                >
                  <Box>
                    <Card
                      onClick={() => handleProductClick(product)}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: darkMode
                          ? '0 4px 20px rgba(0, 0, 0, 0.25)'
                          : '0 4px 20px rgba(0, 0, 0, 0.08)',
                        border: darkMode
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.05)',
                        backgroundColor: darkMode ? '#282830' : '#ffffff',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: darkMode
                            ? '0 10px 30px rgba(0, 0, 0, 0.35)'
                            : '0 10px 30px rgba(0, 0, 0, 0.15)',
                        },
                        cursor: 'pointer',
                      }}
                    >
                      {/* Wishlist button */}
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 2,
                          backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(5px)',
                          width: 36,
                          height: 36,
                          '&:hover': {
                            backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.95)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                        onClick={(e) => handleWishlistToggle(e, product)}
                      >
                        {isInWishlist(product) ? (
                          <FavoriteIcon sx={{ color: '#f06292', fontSize: '1.3rem' }} />
                        ) : (
                          <FavoriteBorderIcon sx={{ color: darkMode ? '#e0e0e0' : '#757575', fontSize: '1.3rem' }} />
                        )}
                      </IconButton>

                      {/* Image container with gradient overlay */}
                      <Box sx={{
                        pt: 4,
                        px: 4,
                        pb: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 200,
                        position: 'relative',
                        backgroundColor: darkMode ? '#1f1f28' : '#f8f9fa',
                        overflow: 'hidden',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '50%',
                          backgroundImage: darkMode
                            ? 'linear-gradient(to bottom, transparent, rgba(40, 40, 48, 0.8))'
                            : 'linear-gradient(to bottom, transparent, rgba(248, 249, 250, 0.8))'
                        }
                      }}>
                        <Box
                          component="img"
                          src={getFrontImageUrl(product)}
                          alt={product.title || product.name}
                          sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            transform: 'scale(0.9)',
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1)',
                            },
                            zIndex: 1
                          }}
                        />
                      </Box>

                      {/* Product Info */}
                      <Box sx={{
                        p: 3,
                        pt: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1
                      }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: darkMode ? '#e0e0e0' : '#303030',
                            mb: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            height: '42px',
                            lineHeight: '1.4',
                            transition: 'color 0.2s ease'
                          }}
                        >
                          {product.title || product.name}
                        </Typography>

                        {/* Rating component using API data */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, mt: 0.5 }}>
                          <Rating
                            value={getProductRating(product.id).averageRating}
                            precision={0.5}
                            size="small"
                            readOnly
                            sx={{ color: '#ffb400' }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              ml: 0.5,
                              color: darkMode ? '#aaa' : '#757575',
                              fontSize: '0.75rem'
                            }}
                          >
                            ({getProductRating(product.id).totalRatings || '0'})
                          </Typography>
                        </Box>

                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '1.25rem',
                            color: '#6039f0',
                            mt: 'auto',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'baseline'
                          }}
                        >
                          {product.price?.toLocaleString() || '0'} ₮
                          {product.originalPrice && (
                            <Typography
                              component="span"
                              sx={{
                                fontSize: '0.85rem',
                                color: darkMode ? '#999' : '#888',
                                ml: 1,
                                textDecoration: 'line-through'
                              }}
                            >
                              {product.originalPrice?.toLocaleString()} ₮
                            </Typography>
                          )}
                        </Typography>
                      </Box>

                      {/* Footer with Add to Cart button */}
                      <Box sx={{
                        px: 3,
                        pb: 3,
                        mt: 'auto',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <IconButton
                          size="small"
                          sx={{
                            color: darkMode ? '#aaa' : '#757575',
                            backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            '&:hover': {
                              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                        <Button
                          variant="contained"
                          fullWidth
                          disabled={product.stock === 0 || addingProductId === (product.id || product.productId)}
                          startIcon={<AddShoppingCartIcon />}
                          sx={{
                            fontSize: '0.9rem',
                            py: 1.2,
                            textTransform: 'none',
                            backgroundColor: '#6039f0',
                            borderRadius: '10px',
                            boxShadow: 'none',
                            fontWeight: 500,
                            '&:hover': {
                              backgroundColor: '#4c2cd1',
                              boxShadow: '0 4px 12px rgba(76, 44, 209, 0.3)'
                            },
                            '&.Mui-disabled': {
                              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#e0e0e0',
                              color: darkMode ? '#777' : '#9e9e9e'
                            },
                            transition: 'all 0.3s ease'
                          }}
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          {addingProductId === (product.id || product.productId) ? (
                            <>
                              <CircularProgress size={16} thickness={6} sx={{ mr: 1, color: 'inherit' }} />
                              Нэмж байна...
                            </>
                          ) : 'Сагсанд нэмэх'}
                        </Button>
                      </Box>

                      {/* Stock label */}
                      {product.stock === 0 && (
                        <Chip
                          label="Дууссан"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            backgroundColor: 'rgba(211, 47, 47, 0.8)',
                            color: '#fff',
                            fontWeight: 'medium',
                            fontSize: '0.7rem',
                            zIndex: 1
                          }}
                        />
                      )}

                      {/* Low stock indicator */}
                      {product.stock > 0 && product.stock <= 5 && (
                        <Chip
                          label={`Зөвхөн ${product.stock} үлдсэн`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            backgroundColor: 'rgba(255, 152, 0, 0.8)',
                            color: '#fff',
                            fontWeight: 'medium',
                            fontSize: '0.7rem',
                            zIndex: 1
                          }}
                        />
                      )}

                      {/* Sale tag */}
                      {product.originalPrice && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            backgroundColor: '#6039f0',
                            color: 'white',
                            py: 0.5,
                            px: 1.5,
                            borderBottomRightRadius: 10,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            zIndex: 1,
                            boxShadow: '2px 2px 10px rgba(0,0,0,0.1)'
                          }}
                        >
                          -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </Box>
                      )}
                    </Card>
                  </Box>
                </Grow>
              ))}
            </Box>

          {/* Pagination Controls */}
              {totalPages > 1 && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
                    mt: 5,
              mb: 2
            }}
          >
            <Pagination 
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
                    shape="rounded"
                    showFirstButton
                    showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                        fontSize: '1rem',
                        fontWeight: 500,
                        mx: 0.5,
                        borderRadius: '8px',
                        color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                      },
                      '& .MuiPaginationItem-page.Mui-selected': {
                        color: 'white',
                        background: 'linear-gradient(45deg, #6d42ff, #4b6eff)',
                        boxShadow: '0 4px 10px rgba(75, 110, 255, 0.25)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a35e0, #3c5ce0)',
                        }
                      },
                      '& .MuiPaginationItem-ellipsis': {
                        color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                }
              }}
            />
          </Box>
              )}
        </>
      )}

      {/* Login Prompt Dialog */}
      <Dialog
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        maxWidth="sm"
        fullWidth
            TransitionComponent={Fade}
            transitionDuration={400}
            PaperProps={{
              sx: {
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                background: darkMode 
                  ? 'linear-gradient(145deg, #1e1e2f, #272736)'
                  : 'linear-gradient(145deg, #ffffff, #f5f5ff)',
                overflow: 'hidden'
              }
            }}
      >
            <DialogTitle sx={{ 
              pb: 1, 
              pt: 3,
              background: darkMode 
                ? 'linear-gradient(90deg, #2e2e45, #252538)'
                : 'linear-gradient(90deg, #f0f0ff, #e8e8ff)',
            }}>
              <Typography variant="h5" fontWeight={700} sx={{
                color: darkMode ? '#fff' : '#333',
                fontFamily: '"Poppins", sans-serif',
              }}>
                Нэвтрэх шаардлагатай
              </Typography>
              <IconButton
                aria-label="close"
                onClick={() => setLoginPromptOpen(false)}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  color: theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
        </DialogTitle>
            <DialogContent sx={{ py: 3, px: 4 }}>
          <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem' }}>
              {snackbar.message}
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
            onClick={handleNavigateToLogin}
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
    </Container>
      </Fade>
    </div>
  );
};

export default AllProductsSection;