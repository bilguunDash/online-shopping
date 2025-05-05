import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { Card, CardContent, CardMedia, Typography, Button, Container, CircularProgress, Box, IconButton, Pagination, Snackbar, Alert } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import api from "../utils/axios";

const CategoriesPhone = ({ products, loading, error }) => {
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
  
  // Handle adding/removing from wishlist
  const handleWishlistToggle = (e, product) => {
    e.stopPropagation(); // Prevent card click when clicking the wishlist button
    
    // Check if product is already in wishlist
    const productId = product.id || product.productId;
    console.log(`Toggling wishlist for product: ${productId}`, product);
    
    // Get current wishlist from localStorage first to ensure we're working with latest data
    let currentWishlist = [];
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        currentWishlist = JSON.parse(savedWishlist);
        if (!Array.isArray(currentWishlist)) {
          console.error('Saved wishlist is not an array, resetting');
          currentWishlist = [];
        }
      }
    } catch (err) {
      console.error('Error parsing wishlist from localStorage:', err);
    }
    
    // Check if product is in current wishlist from localStorage
    const isInWishlist = currentWishlist.some(item => {
      const itemId = item.id || item.productId;
      return itemId === productId;
    });
    
    let updatedWishlist;
    
    if (isInWishlist) {
      // Remove from wishlist
      updatedWishlist = currentWishlist.filter(item => {
        const itemId = item.id || item.productId;
        return itemId !== productId;
      });
      console.log(`Removed product ${productId} from wishlist`);
      showFeedback(`${product.title || product.name} removed from wishlist!`, 'info');
    } else {
      // Create a clean product object with all necessary fields
      const cleanProduct = {
        id: productId,
        productId: productId,
        name: product.name || product.title || "Product",
        title: product.title || product.name || "Product",
        price: product.price || 0,
        imageUrl: product.imageUrl || "/placeholder.jpg",
        // Preserve other potentially useful fields
        category: product.category || null,
        description: product.description || null
      };
      
      // Add clean product to wishlist
      updatedWishlist = [...currentWishlist, cleanProduct];
      console.log(`Added product ${productId} to wishlist:`, cleanProduct);
      showFeedback(`${product.title || product.name} added to wishlist!`, 'success');
    }
    
    // Update state
    setWishlist(updatedWishlist);
    
    // Save to localStorage - use a try-catch to handle potential storage errors
    console.log('Saving wishlist to localStorage:', updatedWishlist);
    try {
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    } catch (err) {
      console.error('Error saving wishlist to localStorage:', err);
    }
    
    // Dispatch event for other components to listen
    console.log('Dispatching wishlistUpdated event');
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  // Check if product is in wishlist
  const isInWishlist = (product) => {
    const productId = product.id || product.productId;
    return wishlist.some(item => (item.id || item.productId) === productId);
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
          marginTop: 10,
          marginLeft: 15,
        }}
      >
        Ухаалаг утас
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
                      transform: 'translateY(-4px)',
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
                        disabled={addingProductId === (product.id || product.productId)}
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        {addingProductId === (product.id || product.productId) ? 'Adding...' : 'Add to cart'}
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
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CategoriesPhone;