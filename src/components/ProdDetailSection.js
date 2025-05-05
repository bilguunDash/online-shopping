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
  CardMedia,
  Snackbar,
  Alert
} from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import api from "../utils/axios";

const ProdDetailSection = ({ product, loading, error }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [wishlist, setWishlist] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // At the start of the component, add logging and load wishlist
  useEffect(() => {
    if (product) {
      console.log("Rendering product details:", product);
      
      // Ensure product ID is properly set for add to cart functionality
      if (!product.id && product.productId) {
        product.id = product.productId;
      }
      
      // Load wishlist from localStorage
      loadWishlist();
    }
  }, [product]);
  
  // Load wishlist and check if current product is in it
  const loadWishlist = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        console.log('Loaded wishlist from localStorage:', parsedWishlist);
        
        if (Array.isArray(parsedWishlist)) {
          setWishlist(parsedWishlist);
          
          // Check if current product is in wishlist
          if (product) {
            const productId = product.id || product.productId;
            const productInWishlist = parsedWishlist.some(item => {
              const itemId = item.id || item.productId;
              return itemId === productId;
            });
            setIsInWishlist(productInWishlist);
            console.log(`Product ${productId} is in wishlist: ${productInWishlist}`);
          }
        } else {
          console.error('Saved wishlist is not an array, resetting');
          setWishlist([]);
          setIsInWishlist(false);
        }
      } else {
        setWishlist([]);
        setIsInWishlist(false);
      }
    } catch (error) {
      console.error('Error parsing wishlist from localStorage:', error);
      setWishlist([]);
      setIsInWishlist(false);
    }
  };
  
  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (!product) return;
    
    try {
      console.log('Toggling wishlist for product:', product.title || product.name);
      
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
        setIsInWishlist(false);
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
        setIsInWishlist(true);
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

  // Handle add to cart
  const handleAddToCart = async () => {
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
      
      // If successful, show the success message from backend
      if (response.data && response.data.message) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
      }
      
      // Store product image in localStorage for cart display
      const cartItemsImages = JSON.parse(localStorage.getItem('cartItemsImages') || '{}');
      cartItemsImages[product.id || product.productId] = product.imageUrl || "/placeholder.jpg";
      localStorage.setItem('cartItemsImages', JSON.stringify(cartItemsImages));
      
      // Trigger cart updated event for header to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (err) {
      console.error("Error adding item to cart:", err);
      
      // Display the error message from backend
      if (err.response && err.response.data && err.response.data.message) {
        setSnackbar({
          open: true,
          message: err.response.data.message,
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to add item to cart',
          severity: 'error'
        });
      }
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };
  
  // Listen for wishlist updates from other components
  useEffect(() => {
    const handleWishlistUpdate = (event) => {
      console.log('Received wishlistUpdated event in ProdDetailSection');
      
      if (product) {
        const productId = product.id || product.productId;
        const updatedWishlist = event.detail || [];
        const productInWishlist = updatedWishlist.some(item => {
          const itemId = item.id || item.productId;
          return itemId === productId;
        });
        
        setWishlist(updatedWishlist);
        setIsInWishlist(productInWishlist);
        console.log(`Updated isInWishlist to: ${productInWishlist}`);
      }
    };
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, [product]);

  if (loading) return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh'}}>
      <CircularProgress />
    </Container>
  );

  if (error) return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Typography color="error">{error}</Typography>
    </Container>
  );

  if (!product) return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Typography>Product not found</Typography>
    </Container>
  );

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: 3,
        mt: 2,
      }}
    >
      <Card 
        elevation={0}
        sx={{ 
          p: 4, 
          borderRadius: 2,
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          overflow: 'visible',
          marginTop: 10
        }}
      >
        {/* Left side - Product Images */}
        <Box sx={{ 
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {/* Main Image */}
          <Box
            sx={{
              width: '100%',
              height: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: 2,
              p: 3
            }}
          >
            <Box
              component="img"
              src={product.imageUrl || "/placeholder.jpg"}
              alt={product.title || product.name}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>
          
          {/* Thumbnails */}
          <Box sx={{ 
            display: 'flex',
            gap: 2,
            overflow: 'auto',
            pb: 1
          }}>
            <Box 
              component="img"
              src={product.imageUrl || "/placeholder.jpg"}
              alt={product.title || product.name}
              sx={{
                width: 80,
                height: 80,
                objectFit: 'contain',
                border: '2px solid #ccc',
                borderRadius: 1,
                p: 1,
                cursor: 'pointer',
                backgroundColor: '#f5f5f5',
              }}
            />
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
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                mb: 2,
              }}
            >
              {product.title || product.name || "Product"}
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4,
                color: '#555',
                lineHeight: 1.7,
              }}
            >
              {product.description || "No description available."}
            </Typography>
            
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700,
                mb: 4,
              }}
            >
              ${product.price && !isNaN(parseFloat(product.price)) 
                ? parseFloat(product.price).toFixed(2) 
                : 'N/A'}
            </Typography>

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
                  '&:hover': {
                    bgcolor: '#143314',
                  },
                  borderRadius: 1,
                  textTransform: 'none',
                  mb: 3,
                }}
              >
                Add to cart
              </Button>
              
              <IconButton 
                sx={{ 
                  border: '1px solid #ccc', 
                  borderRadius: 2,
                  p: 1.5,
                  color: isInWishlist ? 'red' : 'inherit'
                }}
                onClick={handleWishlistToggle}
              >
                {isInWishlist ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
            
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              {product.stock > 0 
                ? `In Stock: ${product.stock} available` 
                : "Out of Stock"}
            </Typography>
            
            {product.category && (
              <Typography variant="body2" color="text.secondary">
                Category: {product.category}
              </Typography>
            )}
          </Box>
        </Box>
      </Card>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProdDetailSection;
