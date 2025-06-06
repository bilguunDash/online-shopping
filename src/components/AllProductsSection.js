import React, { useState, useEffect } from "react";
import { Card, CardContent, CardMedia, Typography, Button, Container, CircularProgress, Box, IconButton, Pagination, Snackbar, Alert } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useRouter } from "next/router";
import api from "../utils/axios";

const ProductSection = ({ products, loading, error, onAddToCart }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 12; // 4 columns × 3 rows
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [wishlist, setWishlist] = useState([]);
  
  // Calculate total pages
  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return products.slice(startIndex, endIndex);
  };

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
  }, []);

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

  // Handle add to cart - local implementation if no prop is provided
  const handleAddToCartLocal = async (e, product) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    
    try {
      // First check if we need to create a cart (first item)
      try {
        await api.post("http://localhost:8083/cart");
      } catch (err) {
        // Cart likely already exists, continue
        console.log("Cart exists or error occurred:", err);
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
        message: response.data?.message || `${product.title || product.name} added to cart!`,
        severity: 'success'
      });
    } catch (err) {
      console.error("Error adding item to cart:", err);
      // Check if the error is related to stock availability
      const errorMessage = err.response?.data?.message || err.message;
      setSnackbar({
        open: true,
        message: errorMessage.includes('stock') ? errorMessage : "Failed to add item to cart. Please try again.",
        severity: 'error'
      });
    }
  };

  // Function to call either the parent's onAddToCart or local implementation
  const handleCartAction = (e, product) => {
    if (onAddToCart) {
      onAddToCart(e, product);
    } else {
      handleAddToCartLocal(e, product);
    }
  };

  // Handle adding/removing from wishlist
  const handleWishlistToggle = (e, product) => {
    e.stopPropagation();
    console.log('Toggling wishlist for product:', product.title || product.name);
    
    try {
      // Get current wishlist from localStorage to ensure we have the latest data
      const currentWishlistJson = localStorage.getItem('wishlist');
      let currentWishlist = [];
      
      if (currentWishlistJson) {
        try {
          currentWishlist = JSON.parse(currentWishlistJson);
          if (!Array.isArray(currentWishlist)) {
            console.error('Stored wishlist is not an array, resetting');
            currentWishlist = [];
          }
        } catch (parseError) {
          console.error('Error parsing wishlist from localStorage:', parseError);
        }
      }
      
      // Check if product is already in wishlist
      const productId = product.id || product.productId;
      const existingIndex = currentWishlist.findIndex(item => 
        (item.id === productId) || (item.productId === productId)
      );
      
      let newWishlist;
      let message;
      
      if (existingIndex !== -1) {
        // Remove from wishlist
        console.log('Removing product from wishlist:', productId);
        newWishlist = currentWishlist.filter((_, index) => index !== existingIndex);
        message = `${product.title || product.name} removed from wishlist`;
      } else {
        // Add to wishlist - create a clean product object with all necessary fields
        console.log('Adding product to wishlist:', productId);
        const wishlistItem = {
          id: productId,
          productId: productId,
          name: product.name || product.title || "Unknown Product",
          title: product.title || product.name || "Unknown Product",
          price: product.price || 0,
          imageUrl: product.imageUrl || "/placeholder.jpg",
          category: product.category || "general",
          description: product.description || ""
        };
        newWishlist = [...currentWishlist, wishlistItem];
        message = `${product.title || product.name} added to wishlist`;
      }
      
      // Update state
      setWishlist(newWishlist);
      
      // Save to localStorage
      try {
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        console.log('Wishlist saved to localStorage:', newWishlist);
      } catch (storageError) {
        console.error('Error saving wishlist to localStorage:', storageError);
      }
      
      // Show notification
      setSnackbar({
        open: true,
        message: message,
        severity: 'success'
      });
      
      // Dispatch event for other components to listen
      const event = new CustomEvent('wishlistUpdated', { detail: newWishlist });
      window.dispatchEvent(event);
      console.log('wishlistUpdated event dispatched');
      
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update wishlist',
        severity: 'error'
      });
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (product) => {
    const productId = product.id || product.productId;
    return wishlist.some(item => (item.id || item.productId) === productId);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (
    <Container 
     maxWidth={false} 
     sx={{ 
       backgroundColor: '#f5f5f5', 
       py: 4, 
       borderRadius: 2,
       px: { xs: 2, sm: 4, md: 6, lg: 8, xl: 10 }
     }}
   >
      <Typography 
        variant="h4" 
        component="h2" 
        gutterBottom 
        sx={{ 
          mb: 4,
          pl: 3,
          color: '#333',
          fontWeight: 600,
          display: 'block',
          position: 'relative',
          zIndex: 1,
          marginLeft: 15,
        }}
      >
        Бүтээгдэхүүн
      </Typography>
      {error && <Typography color="error">{error}</Typography>}

      {loading && <CircularProgress />}

      {!loading && !error && products.length > 0 && (
        <>
          <Box 
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0,
              justifyContent: 'center',
              alignItems: 'stretch',
              width: '100%',
              minHeight: '1200px' // Approximately 3 rows height to maintain consistent layout
            }}
          >
            {getCurrentPageItems().map((product) => (
              <Box 
                key={product.id}
                sx={{
                  width: '280px',
                  height: '400px',
                  margin: '8px',
                }}
              >
                <Card 
                  sx={{ 
                    position: 'relative',
                    height: '100%',
                    width: '100%',
                    backgroundColor: '#fff',
                    borderRadius: 4,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => handleProductClick(product)}
                >
                  {/* Favorite Icon */}
                  <IconButton 
                    sx={{ 
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      color: 'red',
                      zIndex: 1
                    }}
                    onClick={(e) => handleWishlistToggle(e, product)}
                  >
                    {isInWishlist(product) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>

                  {/* Image Container */}
                  <Box 
                    sx={{ 
                      width: '100%',
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mt: 4,
                    }}
                  >
                    <CardMedia
                      component="img"
                      alt={product.name}
                      image={product.imageUrl || "/placeholder.jpg"}
                      sx={{ 
                        width: 200,
                        height: 100,
                        objectFit: 'contain',
                      }}
                    />
                  </Box>

                  <CardContent 
                    sx={{ 
                      p: 2,
                      
                      width: '100%',
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {/* Title Container */}
                    <Box 
                      sx={{
                        width: '150px',
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                        
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: '1rem',
                          fontWeight: 500,
                          textAlign: 'center',
                      
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          color: '#333',
                        }}
                      >
                        {product.title || product.name}
                      </Typography>
                    </Box>

                    {/* Price and Add to Cart */}
                    <Box 
                      sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: '#000',
                          fontSize: '1.2rem',
                        }}
                      >
                        ${product.price ? product.price.toFixed(2) : 'N/A'}
                      </Typography>
                      <Button 
                        variant="outlined"
                        sx={{ 
                          minWidth: '120px',
                          borderRadius: 2,
                          
                          borderColor: '#333',
                          color: '#333',
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          '&:hover': {
                            borderColor: '#000',
                            backgroundColor: 'rgba(0,0,0,0.04)'
                          }
                        }}
                        onClick={(e) => handleCartAction(e, product)}
                      >
                        Add to cart
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>

          {/* Pagination Controls */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mt: 4,
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
                  fontSize: '1.1rem',
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
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductSection;