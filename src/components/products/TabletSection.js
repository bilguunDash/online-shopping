import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Container, 
  Box, 
  IconButton, 
  Snackbar, 
  Alert,
  Skeleton,
  Chip,
  Grow,
  Fade
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import api from "../../utils/axios";
import { getFrontImageUrl } from "../../utils/imageHelpers";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../services/wishlistService";

// Title Component
const SectionTitle = ({ title }) => (
  <Typography 
    variant="h4" 
    component="h2" 
    sx={{ 
      color: '#333',
      fontWeight: 600,
      marginTop: 5,
      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
    }}
  >
    {title}
  </Typography>
);

const TabletSection = ({ products, loading, error, darkMode, onAddToCart }) => {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Only take first 5 products for display
  const displayProducts = products?.slice(0, 5) || [];

  // Load wishlist and check which products are in it
  const loadWishlist = async () => {
    try {
      const response = getWishlist();
      const wishlistProducts = response.products || [];
      // Extract product IDs from the wishlist items
      const wishlistProductIds = wishlistProducts.map(item => item.id || item.productId);
      console.log("Loaded wishlist product IDs in TabletSection:", wishlistProductIds);
      setWishlistItems(wishlistProductIds);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlistItems([]);
    }
  };

  // Load wishlist on component mount and when there's an update
  useEffect(() => {
    loadWishlist();
    
    // Listen for wishlist updates from other components
    const handleWishlistUpdate = () => {
      loadWishlist();
    };
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

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

  // Handle wishlist toggle with feedback message
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
        setSnackbar({
          open: true,
          message: `${product.title || product.name} хүслийн жагсаалтад нэмэгдлээ`,
          severity: 'success'
        });
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

  // Handle add to cart
  const handleAddToCart = async (e, product) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    
    // Check if user is authenticated
    const token = localStorage.getItem('jwt');
    if (!token) {
      // User is not logged in, show message
      setSnackbar({
        open: true,
        message: 'Сагсанд бараа нэмэхийн тулд нэвтэрнэ үү',
        severity: 'warning'
      });
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);
      return;
    }
    
    try {
      // First check if we need to create a cart (first item)
      try {
        await api.post("http://localhost:8083/cart");
      } catch (err) {
        // Cart likely already exists, continue
        console.log("Cart exists or error occurred:", err);
        
        // If error is authentication related, redirect to login
        if (err.response && err.response.status === 403) {
          setSnackbar({
            open: true,
            message: 'Таны холболт дууссан. Дахин нэвтэрнэ үү.',
            severity: 'warning'
          });
          setTimeout(() => {
            router.push('/login');
          }, 1500);
          return;
        }
      }
      
      // Add item to cart
      const response = await api.post(`http://localhost:8083/cart/items/${product.id || product.productId}`);
      
      // Store product image in localStorage for cart display
      const cartItemsImages = JSON.parse(localStorage.getItem('cartItemsImages') || '{}');
      cartItemsImages[product.id || product.productId] = product.imageUrl || "/placeholder.jpg";
      localStorage.setItem('cartItemsImages', JSON.stringify(cartItemsImages));
      
      // Trigger cart updated event for header to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success message
      setSnackbar({
        open: true,
        message: `${product.title || product.name} сагсанд нэмэгдлээ!`,
        severity: 'success'
      });
      
    } catch (err) {
      console.error("Error adding item to cart:", err);
      
      // Handle authentication error
      if (err.response && err.response.status === 403) {
        setSnackbar({
          open: true,
          message: 'Your session has expired. Please log in again.',
          severity: 'warning'
        });
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }
      
      // Show error message for other errors
      setSnackbar({
        open: true,
        message: 'Failed to add item to cart',
        severity: 'error'
      });
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  if (loading) {
  return (
    <Container 
    maxWidth={false} 
    sx={{ 
          backdropFilter: "blur(10px)",
          backgroundColor: darkMode ? 'rgba(16, 16, 28, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      py: 4, 
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(8px)',
          my: 3,
      px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 10 }
    }}
  >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'baseline',
        mb: 4,
        width: '100%',
          marginTop: { xs: 2, sm: 3, md: 3 },
          mx: 'auto'
        }}>
          <Skeleton variant="text" width={150} height={50} />
        </Box>
        
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(6, 1fr)'
            },
            gap: { xs: 2, sm: 3 },
            width: '100%',
            mx: 'auto'
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Box key={item}>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={250}
                sx={{ borderRadius: 4 }} 
              />
            </Box>
          ))}
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container 
        maxWidth={false} 
        sx={{ 
          backdropFilter: "blur(10px)",
          backgroundColor: darkMode ? 'rgba(16, 16, 28, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          py: 4, 
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(8px)',
          my: 3,
          px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 10 }
        }}
      >
        <Typography 
          color="error" 
          sx={{ 
            textAlign: 'center',
            py: 5
          }}
        >
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        backdropFilter: "blur(10px)",
        backgroundColor: darkMode ? 'rgba(16, 16, 28, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        py: 4, 
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(8px)',
        my: 3,
        px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 10 },
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-5px)'
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 4,
        width: '100%',
        marginTop: { xs: 2, sm: 3, md: 3 },
        mx: 'auto'
      }}>
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            color: darkMode ? '#fff' : '#333',
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: 0,
              width: '40px',
              height: '4px',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, #6d42ff, #4b6eff)'
            }
          }}
        >
          Таблет
        </Typography>
        <Button
          component={Link}
          href="/CatTablet"
          endIcon={<ArrowForwardIcon />}
          sx={{
            color: darkMode ? '#fff' : '#333',
            '&:hover': {
              background: 'rgba(109, 66, 255, 0.1)'
            }
          }}
        >
          Бүгдийг харах
        </Button>
      </Box>

      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)', // 2 columns on mobile
            sm: 'repeat(3, 1fr)', // 3 columns on tablet
            md: 'repeat(4, 1fr)', // 4 columns on medium screens
            lg: 'repeat(6, 1fr)'  // 6 columns on large screens
          },
          gap: { xs: 2, sm: 3 },
          width: '100%',
          mx: 'auto'
        }}
      >
        {displayProducts.map((product, index) => (
          <Grow
            key={product.id}
            in={true}
            style={{ transformOrigin: '0 0 0' }}
            timeout={(index + 1) * 200}
          >
            <Box 
            sx={{
              width: '100%',
              minWidth: 0 // Allow shrinking below minWidth
            }}
          >
            <Card 
              sx={{ 
                  height: { xs: '280px', sm: '300px', md: '320px', lg: '330px' },
                  backgroundColor: 'white',
                  borderRadius: 2,
                position: 'relative',
                  transition: 'all 0.2s ease',
                cursor: 'pointer',
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                  },
                  display: 'flex',
                  flexDirection: 'column'
              }}
              onClick={() => handleProductClick(product)}
            >
                {/* Stock badge */}
                {product.stock <= 5 && product.stock > 0 && (
                  <Chip
                    label={`Зөвхөн ${product.stock} үлдсэн`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: 8,
                      zIndex: 2,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: '#ff9800',
                      color: 'white',
                      borderRadius: '4px',
                      height: '24px',
                      px: 1
                    }}
                  />
                )}

                {product.stock === 0 && (
                  <Chip
                    label="Дууссан"
                    size="small"
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: 8,
                      zIndex: 2,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: '#f44336',
                      color: 'white',
                      borderRadius: '4px',
                      height: '24px',
                      px: 1
                    }}
                  />
                )}

                {/* Wishlist Icon */}
              <IconButton 
                  aria-label={isInWishlist(product) ? "Remove from wishlist" : "Add to wishlist"}
                sx={{ 
                  position: 'absolute',
                    right: 8,
                    top: 8,
                    color: isInWishlist(product) ? '#ff3366' : '#9e9e9e',
                    bgcolor: 'transparent',
                    padding: '8px',
                    zIndex: 2,
                  '&:hover': {
                      bgcolor: 'transparent',
                  }
                }}
                onClick={(e) => handleWishlistToggle(e, product)}
                  size="small"
              >
                  {isInWishlist(product) ? (
                    <FavoriteIcon sx={{ fontSize: '1.3rem' }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ fontSize: '1.3rem' }} />
                  )}
              </IconButton>

                {/* Image Container */}
                <Box 
                  sx={{ 
                    height: '160px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    bgcolor: 'white'
                  }}
                >
                  <CardMedia
                    component="img"
                    alt={product.name}
                    image={getFrontImageUrl(product) || "/placeholder.jpg"}
                    sx={{ 
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </Box>

                {/* Product Info */}
                <Box sx={{ 
                  p: 2, 
                  pt: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1
                }}>
                <Typography 
                    variant="body1" 
                  sx={{ 
                      fontSize: '0.9rem',
                    fontWeight: 500,
                      color: '#333',
                      mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                      height: '42px'
                  }}
                >
                  {product.name}
                </Typography>

                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      color: '#6039f0',
                      mt: 'auto',
                      mb: 1
                    }}
                  >
                    {product.price} MNT
                  </Typography>
                </Box>

                {/* Footer with Add to Cart button */}
                <Box sx={{
                  mt: 'auto',
                  px: 1,
                  pb: 1,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <IconButton
                    size="small"
                    sx={{
                      color: '#9e9e9e',
                      mr: 1
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '1px solid #9e9e9e',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}
                    >
                      i
                    </Box>
                  </IconButton>
                  <Button 
                    variant="contained"
                    fullWidth
                    disabled={product.stock === 0}
                    startIcon={<AddShoppingCartIcon />}
                    sx={{ 
                      fontSize: '0.85rem',
                      py: 1,
                      textTransform: 'none',
                      backgroundColor: '#6039f0',
                      borderRadius: '8px',
                      boxShadow: 'none',
                      '&:hover': {
                        backgroundColor: '#4c2cd1',
                        boxShadow: 'none'
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#e0e0e0',
                        color: '#9e9e9e'
                      }
                    }}
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    Сагсанд нэмэх
                  </Button>
              </Box>
            </Card>
          </Box>
          </Grow>
        ))}

        {/* Show All Card */}
        <Grow
          in={true}
          style={{ transformOrigin: '0 0 0' }}
          timeout={(displayProducts.length + 1) * 200}
        >
        <Box 
          sx={{
            width: '100%',
            minWidth: 0
          }}
        >
          <Card 
            sx={{ 
                height: { xs: '280px', sm: '300px', md: '320px', lg: '330px' },
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(75, 110, 255, 0.2) 0%, rgba(109, 66, 255, 0.2) 100%)' 
                  : 'linear-gradient(135deg, rgba(75, 110, 255, 0.1) 0%, rgba(109, 66, 255, 0.1) 100%)',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                backdropFilter: 'blur(8px)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
              '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: darkMode 
                    ? '0 15px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(109, 66, 255, 0.3)' 
                    : '0 15px 30px rgba(0, 0, 0, 0.1), 0 0 15px rgba(109, 66, 255, 0.2)'
              }
            }}
            component={Link}
            href="/CatTablet"
          >
            <Box 
              sx={{ 
                textAlign: 'center',
                  p: { xs: 2, sm: 3 }
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                    color: darkMode ? '#fff' : '#555',
                    mb: 2,
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
                    fontWeight: 600,
                }}
              >
                Бүгдийг харах
              </Typography>
      <Box 
        sx={{ 
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
          display: 'flex',
                    alignItems: 'center',
          justifyContent: 'center',
                    background: 'linear-gradient(45deg, #6d42ff, #4b6eff)',
                    margin: '0 auto',
                    boxShadow: '0 4px 20px rgba(75, 110, 255, 0.4)',
                    transition: 'transform 0.3s ease',
              '&:hover': {
                      transform: 'scale(1.1)'
              }
            }}
          >
                  <ArrowForwardIcon sx={{ color: '#fff', fontSize: '1.5rem' }} />
                </Box>
              </Box>
            </Card>
          </Box>
        </Grow>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TabletSection;