import React, { useState, useEffect } from "react";
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid, 
  CircularProgress, 
  IconButton,
  Card,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Zoom,
  Fade,
  Grow,
  useTheme,
  Rating,
  Paper
} from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from "../../utils/axios";
import { useRouter } from 'next/router';
import { getWishlist, addToWishlist, removeFromWishlist } from "../../services/wishlistService";

const ProdDetailSection = ({ product, loading, error, selectedViewType, onViewTypeChange }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [wishlist, setWishlist] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('Сагсанд нэмэхийн тулд нэвтэрнэ үү');
  const [selectedImage, setSelectedImage] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingHover, setRatingHover] = useState(-1);
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (product) {
      loadWishlist();
      setSelectedImage(product.imageUrl || "/placeholder.jpg");
      
      const token = localStorage.getItem('jwt');
      const storedUserId = localStorage.getItem('userId');
      
      setIsLoggedIn(!!token);
      
      if (token && storedUserId) {
        setUserId(parseInt(storedUserId));
        getUserRating(product.id);
      }
      
      getProductRating(product.id);
    }
  }, [product]);

  // When product or selectedViewType changes, update the selected image
  useEffect(() => {
    if (product && selectedViewType) {
      // Find the appropriate image for the current view type
      if (product.productImages && Array.isArray(product.productImages) && product.productImages.length > 0) {
        const image = product.productImages.find(img => img.viewType === selectedViewType);
        if (image) {
          setSelectedImage(image.imageUrl);
        } else {
          // Fallback to the default image if the view type isn't found
          setSelectedImage(product.imageUrl);
        }
      } else {
        // If no productImages array, use the default imageUrl
        setSelectedImage(product.imageUrl);
      }
    }
  }, [product, selectedViewType]);

  // Function to get available view types from product images
  const getAvailableViewTypes = () => {
    if (!product || !product.productImages || !Array.isArray(product.productImages)) {
      return ['FRONT']; // Default to just showing FRONT if no images available
    }
    
    // Get unique view types from product images
    const viewTypes = product.productImages.map(img => img.viewType);
    // Remove duplicates and filter out empty/null values
    return [...new Set(viewTypes)].filter(Boolean);
  };

  // Function to get image URL for a specific view type
  const getImageUrlByViewType = (images, viewType) => {
    if (!images || !Array.isArray(images) || images.length === 0) return '';
    
    const image = images.find(img => img.viewType === viewType);
    return image ? image.imageUrl : '';
  };

  // Function to handle view type button click
  const handleViewTypeClick = (viewType) => {
    if (onViewTypeChange) {
      onViewTypeChange(viewType);
    }
  };

  // Create a mapping from view type codes to human-readable names in Mongolian
  const viewTypeNames = {
    'FRONT': 'Урд тал',
    'BACK': 'Ар тал',
    'LEFT': 'Зүүн тал',
    'RIGHT': 'Баруун тал'
  };
  
  const loadWishlist = async () => {
    try {
      const response = getWishlist();
      const wishlistProducts = response.products || [];
      
      if (product) {
        const productId = product.id;
        const productInWishlist = wishlistProducts.some(item => {
          const itemId = item.id;
          return itemId === productId;
        });
        setIsInWishlist(productInWishlist);
      }
    } catch (error) {
      setIsInWishlist(false);
    }
  };
  
  const handleWishlistToggle = async () => {
    if (!product) return;

    try {
        const productId = product.id;
        
        if (isInWishlist) {
            const result = await removeFromWishlist(productId);
            setIsInWishlist(false);
            setSnackbar({
                open: true,
                message: `${product.name} хүслийн жагсаалтаас хасагдлаа`,
                severity: 'success'
            });
        } else {
            const result = await addToWishlist(productId, product);
            setIsInWishlist(true);
            setSnackbar({
                open: true,
                message: `${product.name} хүслийн жагсаалтад нэмэгдлээ`,
                severity: 'success'
            });
        }

        window.dispatchEvent(new Event('wishlistUpdated'));
        
    } catch (error) {
        setSnackbar({
            open: true,
            message: 'Хүслийн жагсаалтыг шинэчлэхэд алдаа гарлаа',
            severity: 'error'
        });
    }
  };

  const handleRequireLogin = (message = 'Сагсанд нэмэхийн тулд нэвтэрнэ үү') => {
    setLoginPromptMessage(message);
    setLoginPromptOpen(true);
  };
  
  const handleNavigateToLogin = () => {
    setLoginPromptOpen(false);
    router.push('/login');
  };

  const handleAddToCart = async () => {
    // Check for authentication first
    const token = localStorage.getItem('jwt');
    if (!token) {
      handleRequireLogin('Сагсанд нэмэхийн тулд нэвтрэх шаардлагатай байна');
      return;
    }
    
    try {
      // Try to create a cart first (if it doesn't exist yet)
      try {
        // Use relative URL
        await api.post("/cart");
      } catch (err) {
        console.log("Cart exists or error occurred:", err);
        if (err.response && err.response.status === 403) {
          setIsLoggedIn(false);
          handleRequireLogin('Таны холболт дууссан байна. Дахин нэвтэрнэ үү.');
          return;
        }
      }
      
      // Always use Bearer token format for all users
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      const response = await fetch(`${api.defaults.baseURL}/cart/items/${product.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formattedToken
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setSnackbar({
        open: true,
        message: data.message || 'Бараа сагсанд амжилттай нэмэгдлээ',
        severity: 'success'
      });
      
      const cartItemsImages = JSON.parse(localStorage.getItem('cartItemsImages') || '{}');
      cartItemsImages[product.id] = product.imageUrl || "/placeholder.jpg";
      localStorage.setItem('cartItemsImages', JSON.stringify(cartItemsImages));
      
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error("Error adding to cart:", err);
      
      if (err.response && err.response.status === 403) {
        setIsLoggedIn(false);
        handleRequireLogin('Таны холболт дууссан байна. Дахин нэвтэрнэ үү.');
        return;
      }
      
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Бараа сагсанд нэмэхэд алдаа гарлаа',
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };
  
  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (product) {
        loadWishlist();
      }
    };
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, [product]);

  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };

  const handleGoBack = () => {
    router.back();
  };

  const getProductRating = async (productId) => {
    try {
      const response = await api.get(`/product/${productId}/rating`);
      if (response.data) {
        setAverageRating(response.data.averageRating || 0);
        setTotalRatings(response.data.totalRatings || 0);
        console.log("Product rating data:", response.data);
      }
    } catch (error) {
      console.error("Error getting product rating:", error);
      if (product && product.rating) {
        setAverageRating(parseFloat(product.rating));
      }
    }
  };

  const getUserRating = async (productId) => {
    try {
      const response = await api.get(`/rating/${productId}`);
      if (response.data) {
        setUserRating(response.data.userRating || 0);
      }
    } catch (error) {
      console.error("Error getting user rating:", error);
      if (error.response && error.response.status === 401) {
        setIsLoggedIn(false);
      }
    }
  };

  const handleRatingChange = async (event, newValue) => {
    if (!isLoggedIn) {
      handleRequireLogin('Бүтээгдэхүүнийг үнэлэхийн тулд нэвтэрнэ үү');
      return;
    }

    try {
      const response = await api.post('/rating', {
        productId: product.id,
        rating: newValue
      });

      if (response.data) {
        setUserRating(response.data.userRating || newValue);
        
        getProductRating(product.id);
        
        setSnackbar({
          open: true,
          message: 'Таны үнэлгээг амжилттай хадгаллаа',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      
      if (error.response && error.response.status === 401) {
        setIsLoggedIn(false);
        handleRequireLogin('Таны холболт дууссан байна. Дахин нэвтэрнэ үү.');
        return;
      }
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Үнэлгээг хадгалахад алдаа гарлаа',
        severity: 'error'
      });
    }
  };

  if (loading) return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh'}}>
      <CircularProgress size={60} thickness={4} sx={{ color: '#1e4620' }}/>
    </Container>
  );

  if (error) return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Typography color="error">{error}</Typography>
    </Container>
  );

  if (!product) return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Typography>Бүтээгдэхүүн олдсонгүй</Typography>
    </Container>
  );
  
  return (
    <Fade in timeout={800}>
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 3,
          mt: 2,
        }}
      >

        
        <Grow in timeout={1000}>
          <Card 
            elevation={3}
            sx={{ 
              p: 4, 
              borderRadius: 3,
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4,
              overflow: 'visible',
              boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0px 15px 35px rgba(0,0,0,0.15)',
                transform: 'translateY(-5px)'
              }
            }}
          >
            {/* Left side - Product Images */}
            <Box sx={{ 
              width: { xs: '100%', md: '50%' },
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {/* Main Image Container */}
              <Box sx={{
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                width: '100%'
              }}>
                {/* Thumbnails - Vertical on side */}
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'row', sm: 'column' },
                  gap: 2,
                  mb: { xs: 2, sm: 0 },
                  width: { xs: '100%', sm: '80px' },
                  maxHeight: { xs: '80px', sm: '400px' },
                  overflow: 'auto',
                  py: 1
                }}>
                  {getAvailableViewTypes().map((viewType) => {
                    // Get the image for this view type
                    const imageUrl = getImageUrlByViewType(product.productImages, viewType) || product.imageUrl;
                    return (
                      <Box 
                        key={viewType}
                        component="img"
                        src={imageUrl || "/placeholder.jpg"}
                        alt={`${product.name} - ${viewType}`}
                        onClick={() => {
                          handleViewTypeClick(viewType);
                          handleImageSelect(imageUrl);
                        }}
                        sx={{
                          width: '70px',
                          height: '70px',
                          objectFit: 'contain',
                          border: selectedViewType === viewType ? '2px solid #1e4620' : '1px solid #ccc',
                          borderRadius: 1,
                          p: 1,
                          cursor: 'pointer',
                          backgroundColor: '#f5f5f5',
                          transition: 'all 0.2s ease',
                          opacity: selectedViewType === viewType ? 1 : 0.7,
                          '&:hover': {
                            transform: 'scale(1.05)',
                            opacity: 1,
                            boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
                          },
                          position: 'relative',
                          '&::after': selectedViewType === viewType ? {
                            content: '""',
                            position: 'absolute',
                            bottom: '-5px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '10px',
                            height: '3px',
                            backgroundColor: '#1e4620',
                            borderRadius: '2px'
                          } : {}
                        }}
                      />
                    );
                  })}
                </Box>
                
                {/* Main Image */}
                <Zoom in timeout={700}>
                  <Box
                    sx={{
                      width: { xs: '100%', sm: 'calc(100% - 90px)' },
                      height: 400,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f8f9fa',
                      borderRadius: 2,
                      p: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                      '&:hover': {
                        backgroundColor: '#f0f2f5'
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={selectedImage || product.imageUrl || "/placeholder.jpg"}
                      alt={product.name}
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                  </Box>
                </Zoom>
              </Box>
              
              {/* View Type Labels */}
              <Box sx={{ 
                display: 'flex',
                gap: 1,
                justifyContent: 'center',
                mt: 1
              }}>
                {getAvailableViewTypes().map((viewType) => (
                  <Typography
                    key={viewType}
                    variant="caption"
                    sx={{
                      fontWeight: selectedViewType === viewType ? 600 : 400,
                      color: selectedViewType === viewType ? '#1e4620' : 'text.secondary',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {viewTypeNames[viewType] || viewType}
                  </Typography>
                ))}
              </Box>
            </Box>

            {/* Right side - Product Details */}
            <Box sx={{ 
              width: { xs: '100%', md: '50%' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <Box>
                <Fade in timeout={1000}>
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                      fontWeight: 600,
                      mb: 2,
                      background: 'linear-gradient(45deg, #1e4620, #2e7d32)',
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {product.name || "Бүтээгдэхүүн"}
                  </Typography>
                </Fade>
                
                {/* Rating Component */}
                <Box 
                  sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  <Rating
                    name="product-rating"
                    value={userRating}
                    precision={1}
                    onChange={handleRatingChange}
                    onChangeActive={(event, newHover) => {
                      setRatingHover(newHover);
                    }}
                    emptyIcon={<StarBorderIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                    sx={{
                      fontSize: '1.5rem',
                      color: '#1e4620',
                      '& .MuiRating-iconFilled': {
                        color: '#1e4620',
                      },
                      '& .MuiRating-iconHover': {
                        color: '#2e7d32',
                      },
                    }}
                  />
                  
                  <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" fontWeight={600} color="text.secondary">
                      {ratingHover !== -1 
                        ? `Үнэлэх: ${ratingHover}/5` 
                        : userRating > 0 
                          ? `Таны үнэлгээ: ${userRating}/5` 
                          : 'Үнэлээгүй байна'}
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      ml: { xs: 0, sm: 2 }, 
                      mt: { xs: 1, sm: 0 },
                      display: 'flex', 
                      alignItems: 'center', 
                      bgcolor: '#f5f5f5',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2
                    }}
                  >
                    <StarIcon sx={{ color: '#1e4620', fontSize: '1.2rem', mr: 0.5 }} />
                    <Typography variant="body2" fontWeight={600}>
                      {averageRating ? averageRating.toFixed(1) : '0'}/5
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({totalRatings || 0} үнэлгээ)
                    </Typography>
                  </Box>
                </Box>
                
                <Fade in timeout={1200}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 4,
                      color: '#555',
                      lineHeight: 1.7,
                      fontSize: '1.05rem',
                      textAlign: 'justify'
                    }}
                  >
                    {product.description || "Дэлгэрэнгүй мэдээлэл байхгүй байна."}
                  </Typography>
                </Fade>

                {/* Product Details Section */}
                <Zoom in timeout={1000}>
                  <Box sx={{ 
                    mb: 4,
                    p: 3,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e9ecef',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                    }
                  }}>
                    <Typography variant="h6" sx={{ 
                      mb: 3, 
                      fontWeight: 600,
                      position: 'relative',
                      pb: 1,
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        width: '60px',
                        height: '3px',
                        backgroundColor: '#1e4620',
                        bottom: 0,
                        left: 0,
                        borderRadius: '10px'
                      }
                    }}>
                      Бүтээгдэхүүний үзүүлэлтүүд
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 1.5, 
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e9ecef',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                            borderColor: '#cfd7df'
                          }
                        }}>
                          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                            Загвар
                          </Typography>
                          <Typography variant="body1">
                            {product?.model || 'Байхгүй'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 1.5, 
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e9ecef',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                            borderColor: '#cfd7df'
                          }
                        }}>
                          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                            Өнгө
                          </Typography>
                          <Typography variant="body1">
                            {product?.color || 'Байхгүй'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 1.5, 
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e9ecef',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                            borderColor: '#cfd7df'
                          }
                        }}>
                          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                            RAM
                          </Typography>
                          <Typography variant="body1">
                            {product?.ramGb || 'Байхгүй'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 1.5, 
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e9ecef',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                            borderColor: '#cfd7df'
                          }
                        }}>
                          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                            Санах ой
                          </Typography>
                          <Typography variant="body1">
                            {product?.storageGb || 'Байхгүй'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 1.5, 
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e9ecef',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                            borderColor: '#cfd7df'
                          }
                        }}>
                          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                            Дэлгэц
                          </Typography>
                          <Typography variant="body1">
                            {product?.display ? `${product.display}" Дэлгэц` : 'Байхгүй'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 1.5, 
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e9ecef',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                            borderColor: '#cfd7df'
                          }
                        }}>
                          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                            Графикийн карт
                          </Typography>
                          <Typography variant="body1">
                            {product?.graphics || 'Байхгүй'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 1.5, 
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e9ecef',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                            borderColor: '#cfd7df'
                          }
                        }}>
                          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                            Үйлдлийн систем
                          </Typography>
                          <Typography variant="body1">
                            {product?.os || 'Байхгүй'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 1.5, 
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e9ecef',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                            borderColor: '#cfd7df'
                          }
                        }}>
                          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                            Процессор
                          </Typography>
                          <Typography variant="body1">
                            {product?.processor || 'Байхгүй'}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 1.5, 
                          backgroundColor: 'white',
                          borderRadius: 1,
                          border: '1px solid #e9ecef',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                            borderColor: '#cfd7df'
                          }
                        }}>
                          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                            Үнэлгээ
                          </Typography>
                          <Typography variant="body1">
                            {product?.rating ? `${product.rating}/5` : 'Байхгүй'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Zoom>
                
                <Grow in timeout={1500}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 700,
                      mb: 4,
                      color: '#1e4620',
                      position: 'relative',
                      display: 'inline-block',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        width: '50%',
                        height: '4px',
                        backgroundColor: 'rgba(30, 70, 32, 0.3)',
                        bottom: '-8px',
                        left: 0,
                        borderRadius: '10px'
                      }
                    }}
                  >
                    ${product.price && !isNaN(parseFloat(product.price)) 
                      ? parseFloat(product.price).toFixed(2) 
                      : 'Байхгүй'}
                  </Typography>
                </Grow>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    onClick={handleAddToCart}
                    sx={{
                      bgcolor: '#1e4620',
                      py: 1.5,
                      px: 4,
                      fontSize: '1rem',
                      fontWeight: 600,
                      transition: 'all 0.3s ease !important',
                      boxShadow: '0 5px 15px rgba(30, 70, 32, 0.3)',
                      '&:hover': {
                        bgcolor: '#143314',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 20px rgba(30, 70, 32, 0.4)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                        boxShadow: '0 3px 10px rgba(30, 70, 32, 0.3)',
                      },
                      borderRadius: 2,
                      textTransform: 'none',
                      mb: 3,
                    }}
                  >
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      '& svg': {
                        transition: 'transform 0.3s ease',
                      },
                      '&:hover svg': {
                        transform: 'scale(1.2)',
                      }
                    }}>
                      <ShoppingCartIcon sx={{ mr: 1 }} />
                      Сагсанд нэмэх
                    </Box>
                  </Button>
                  
                  <IconButton 
                    sx={{ 
                      border: isInWishlist ? '1px solid #f8324526' : '1px solid #ccc', 
                      borderRadius: 2,
                      p: 1.5,
                      color: isInWishlist ? 'red' : 'inherit',
                      bgcolor: isInWishlist ? '#fff0f0' : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: isInWishlist ? '#fff0f0' : '#f5f5f5',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 5px 10px rgba(0,0,0,0.1)'
                      }
                    }}
                    onClick={handleWishlistToggle}
                  >
                    {isInWishlist ? 
                      <FavoriteIcon sx={{ color: '#e53935', transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.2)' } }} /> : 
                      <FavoriteBorderIcon sx={{ transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.2)' } }} />
                    }
                  </IconButton>
                </Box>
                
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600} 
                  sx={{ 
                    mb: 1,
                    color: product.stock > 0 ? '#388e3c' : '#d32f2f',
                    display: 'flex',
                    alignItems: 'center',
                    '&:before': {
                      content: '""',
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: product.stock > 0 ? '#388e3c' : '#d32f2f',
                      marginRight: '8px'
                    }
                  }}
                >
                  {product.stock > 0 
                    ? `Нөөцөд байгаа: ${product.stock} ширхэг` 
                    : "Дууссан"}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grow>
        
       
        
        <Dialog
          open={loginPromptOpen}
          onClose={() => setLoginPromptOpen(false)}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }
          }}
        >
          <DialogTitle>
            <Typography variant="h5" fontWeight={600}>Нэвтрэх шаардлагатай</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body1" paragraph>
                {loginPromptMessage}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setLoginPromptOpen(false)}
              variant="outlined"
              sx={{ 
                color: '#333', 
                borderColor: '#333',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#1e4620',
                  color: '#1e4620',
                  backgroundColor: 'rgba(30, 70, 32, 0.05)'
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
                bgcolor: '#1e4620',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#143314',
                  boxShadow: '0 5px 15px rgba(30, 70, 32, 0.3)'
                }
              }}
            >
              Нэвтрэх хуудас руу очих
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionProps={{ direction: 'up' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbar.severity}
            variant="filled"
            elevation={6}
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Fade>
  );
};

export default ProdDetailSection;