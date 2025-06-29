import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { Card, CardMedia, Typography, Button, Container, CircularProgress, Box, IconButton, Pagination, Snackbar, Alert, Chip, Fade, Grow, Rating } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import api from "../../utils/axios";
import { getFrontImageUrl } from "../../utils/imageHelpers";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

const CategoriesHeadphone = ({ products, loading, error, darkMode }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 12; // 4 columns × 3 rows
  const router = useRouter();
  const [addingProductId, setAddingProductId] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('');
  const [productRatings, setProductRatings] = useState({});
  
  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error parsing wishlist from localStorage:", e);
        setWishlist([]);
      }
    }
    
    // Listen for wishlist updates from other components
    const handleWishlistUpdate = () => {
      const updatedWishlist = localStorage.getItem('wishlist');
      if (updatedWishlist) {
        try {
          setWishlist(JSON.parse(updatedWishlist));
        } catch (e) {
          console.error("Error parsing updated wishlist:", e);
        }
      }
    };
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

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
  
  // Check if product is in wishlist
  const isInWishlist = (product) => {
    const productId = product.id || product.productId;
    return wishlist.some(item => (item.id || item.productId) === productId);
  };
  
  // Handle adding/removing from wishlist
  const handleWishlistToggle = (e, product) => {
    e.stopPropagation(); // Prevent card click when clicking the wishlist button
    
    // Check if product is already in wishlist
    const productId = product.id || product.productId;
    const isInWishlist = wishlist.some(item => (item.id || item.productId) === productId);
    
    let updatedWishlist;
    
    if (isInWishlist) {
      // Remove from wishlist
      updatedWishlist = wishlist.filter(item => (item.id || item.productId) !== productId);
      showFeedback(`${product.title || product.name} removed from wishlist!`);
    } else {
      // Add to wishlist
      updatedWishlist = [...wishlist, product];
      showFeedback(`${product.title || product.name} added to wishlist!`);
    }
    
    // Update state and localStorage
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    // Dispatch event for other components to listen
    window.dispatchEvent(new Event('wishlistUpdated'));
  };
  
  // Get product rating
  const getProductRating = (productId) => {
    return productRatings[productId] || { averageRating: 0, totalRatings: 0 };
  };

  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Handle add to cart
  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    
    // Set the current product as adding
    setAddingProductId(product.id || product.productId);
    
    try {
      // First check if we need to create a cart (first item)
      try {
        await api.post("http://localhost:8083/cart");
      } catch (err) {
        // Cart likely already exists, continue
        console.log("Cart exists or error occurred:", err);
      }
      
      // Try to add the item first (this will create the item if it doesn't exist)
      try {
        await api.post(`http://localhost:8083/cart/items/${product.id || product.productId}`);
      } catch (err) {
        // Item might already exist, so we'll try to increase quantity
        console.log("Item might already exist, trying to increase quantity:", err);
      }
      
      // Increase the quantity of the item (this works whether the item was just created or already existed)
      await api.post(`http://localhost:8083/cart/items/${product.id || product.productId}/increase`);
      
      // Store product image in localStorage for cart display
      const cartItemsImages = JSON.parse(localStorage.getItem('cartItemsImages') || '{}');
      cartItemsImages[product.id || product.productId] = product.imageUrl || "/placeholder.jpg";
      localStorage.setItem('cartItemsImages', JSON.stringify(cartItemsImages));
      
      // Trigger cart updated event for header to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success message
      showFeedback(`${product.title || product.name} added to cart!`);
      
    } catch (err) {
      console.error("Error adding item to cart:", err);
      showFeedback("Failed to add item to cart. Please try again.", "error");
    } finally {
      // Clear the adding state
      setAddingProductId(null);
    }
  };

  // Handle navigation to login page
  const handleNavigateToLogin = () => {
    setLoginPromptOpen(false);
    router.push('/login');
  };

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="xl" sx={{ pt: 3, pb: 6 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress size={60} thickness={4} sx={{ color: '#6039f0' }} />
          </Box>
        ) : error ? (
          <Box sx={{ 
            p: 4, 
            backgroundColor: 'rgba(255, 0, 0, 0.05)', 
            borderRadius: 2,
            border: '1px solid rgba(255, 0, 0, 0.2)',
            textAlign: 'center' 
          }}>
            <Typography variant="h6" color="error">{error}</Typography>
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ 
            p: 6, 
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', 
            borderRadius: 2,
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <HeadphonesIcon sx={{ fontSize: 64, color: darkMode ? '#aaa' : '#666', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'medium', mb: 1, color: darkMode ? '#eee' : '#333' }}>
              Хүссэн хайлтад тохирох бүтээгдэхүүн олдсонгүй
            </Typography>
            <Typography variant="body1" sx={{ color: darkMode ? '#bbb' : '#666' }}>
              Шүүлтүүрийг цэвэрлэх эсвэл өөр хайлт хийж үзнэ үү.
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              pb: 2,
              borderBottom: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
            }}>
              <HeadphonesIcon sx={{ mr: 2, fontSize: 32, color: '#6039f0' }} />
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 600,
                  color: darkMode ? '#f0f0f0' : '#2d2d2d',
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: 50,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: '#6039f0'
                  }
                }}
              >
                Чихэвч
              </Typography>
              <Chip 
                label={`${products.length} бүтээгдэхүүн`} 
                size="small" 
                sx={{ 
                  ml: 2, 
                  fontSize: '0.85rem',
                  backgroundColor: darkMode ? 'rgba(96, 57, 240, 0.2)' : 'rgba(96, 57, 240, 0.1)', 
                  color: '#6039f0',
                  borderRadius: '10px',
                  fontWeight: 500
                }} 
              />
            </Box>

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
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                mt: 6,
                mb: 2
              }}
            >
              <Pagination 
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: '1rem',
                    color: darkMode ? '#e0e0e0' : undefined,
                  },
                  '& .MuiPaginationItem-page.Mui-selected': {
                    backgroundColor: '#6039f0',
                    '&:hover': {
                      backgroundColor: '#4c2cd1',
                    }
                  }
                }}
              />
            </Box>
          </>
        )}
        
        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ 
              width: '100%',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              borderRadius: '10px',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Login Prompt Dialog */}
        <Dialog
          open={loginPromptOpen}
          onClose={() => setLoginPromptOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              p: 1
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight={600} color="#6039f0">Нэвтрэх шаардлагатай</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
                {loginPromptMessage}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setLoginPromptOpen(false)}
              variant="outlined"
              sx={{ 
                color: darkMode ? '#e0e0e0' : '#333', 
                borderColor: darkMode ? '#e0e0e0' : '#333',
                borderRadius: '10px',
                px: 3,
                '&:hover': {
                  borderColor: '#6039f0',
                  color: '#6039f0'
                }
              }}
            >
              Цуцлах
            </Button>
            <Button
              onClick={handleNavigateToLogin}
              variant="contained"
              color="primary"
              sx={{ 
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: '10px',
                px: 3,
                py: 1,
                backgroundColor: '#6039f0',
                '&:hover': {
                  backgroundColor: '#4c2cd1',
                  boxShadow: '0 4px 12px rgba(76, 44, 209, 0.3)'
                }
              }}
            >
              Нэвтрэх хуудас руу очих
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Fade>
  );
};

export default CategoriesHeadphone;