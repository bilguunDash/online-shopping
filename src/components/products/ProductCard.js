import React, { useState } from 'react';
import { Card, CardMedia, Typography, Button, Box, IconButton, Snackbar, Alert } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useRouter } from 'next/router';
import api from "../../utils/axios";
import { getFrontImageUrl } from "../../utils/imageHelpers";

const ProductCard = ({ product, size = 'medium' }) => {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Define size presets
  const sizes = {
    small: {
      card: { height: { xs: '200px', sm: '220px', md: '240px' } },
      image: { height: { xs: '80px', sm: '100px', md: '110px' } },
      title: { fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.85rem' } },
      price: { fontSize: { xs: '0.8rem', sm: '0.9rem' } },
      button: { 
        fontSize: { xs: '0.55rem', sm: '0.65rem' },
        minWidth: { xs: '55px', sm: '70px' }
      }
    },
    medium: {
      card: { height: { xs: '220px', sm: '250px', md: '280px', lg: '300px' } },
      image: { height: { xs: '100px', sm: '120px', md: '140px' } },
      title: { fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.9rem' } },
      price: { fontSize: { xs: '0.875rem', sm: '1rem' } },
      button: { 
        fontSize: { xs: '0.6rem', sm: '0.7rem' },
        minWidth: { xs: '60px', sm: '80px' }
      }
    },
    large: {
      card: { height: { xs: '250px', sm: '280px', md: '320px', lg: '340px' } },
      image: { height: { xs: '120px', sm: '140px', md: '160px' } },
      title: { fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' } },
      price: { fontSize: { xs: '0.95rem', sm: '1.1rem' } },
      button: { 
        fontSize: { xs: '0.65rem', sm: '0.75rem' },
        minWidth: { xs: '65px', sm: '90px' }
      }
    }
  };

  const sizeProps = sizes[size] || sizes.medium;

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
  const handleProductClick = () => {
    // Store product data in localStorage before navigating
    localStorage.setItem('selectedProduct', JSON.stringify(product));
    
    // Navigate to product detail page with ID in query params
    router.push({
      pathname: `/ProductDetail`,
      query: { id: product.id }
    });
  };

  // Handle add to cart
  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    e.stopPropagation(); // Prevent card click when clicking the button
    
    setAdding(true);
    
    try {
      // Check for authentication first
      const token = localStorage.getItem('jwt');
      if (!token) {
        showFeedback('Та эхлээд нэвтрэх шаардлагатай', 'warning');
        
        // Wait for feedback to show then redirect
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }
      
      // First check if we need to create a cart (first item)
      try {
        // Use relative URL instead of absolute URL
        await api.post("/cart");
      } catch (err) {
        // Cart likely already exists, continue
        console.log("Cart exists or error occurred:", err);
        
        // If it's an auth error, handle it appropriately
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          showFeedback('Таны холболт дууссан байна. Дахин нэвтэрнэ үү.', 'error');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
          return;
        }
      }
      
      // Add item to cart with relative URL
      const response = await api.post(`/cart/items/${product.id || product.productId}`);
      
      // Check response status and message
      if (response.status === 200) {
        // Success case
        showFeedback(response.data.message || 'Бараа сагсанд нэмэгдлээ', 'success');
        
        // Store product image in localStorage for cart display
        const cartItemsImages = JSON.parse(localStorage.getItem('cartItemsImages') || '{}');
        cartItemsImages[product.id || product.productId] = product.imageUrl || "/placeholder.jpg";
        localStorage.setItem('cartItemsImages', JSON.stringify(cartItemsImages));
        
        // Trigger cart updated event for header to update cart count
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        // Handle unexpected success status
        showFeedback('Алдаа гарлаа', 'error');
      }
      
    } catch (err) {
      console.error("Error adding item to cart:", err);
      
      // Handle specific error cases
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          showFeedback('Таны холболт дууссан байна. Дахин нэвтэрнэ үү.', 'error');
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        } else if (err.response.status === 400) {
          // Bad request - usually means out of stock
          showFeedback(err.response.data.message || 'Нөөц хүрэлцэхгүй байна', 'error');
        } else if (err.response.status === 409) {
          // Conflict - item already in cart
          showFeedback(err.response.data.message || 'Бараа аль хэдийн сонгогдсон байна', 'error');
        } else {
          // Other error cases
          showFeedback(err.response.data.message || 'Алдаа гарлаа', 'error');
        }
      } else {
        showFeedback('Алдаа гарлаа', 'error');
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <Card 
        sx={{ 
          ...sizeProps.card,
          backgroundColor: '#fff',
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          position: 'relative',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.15)'
          }
        }}
        onClick={handleProductClick}
      >
        <IconButton 
          sx={{ 
            position: 'absolute',
            right: { xs: 4, sm: 8 },
            top: { xs: 4, sm: 8 },
            color: 'red',
            bgcolor: 'white',
            padding: { xs: '2px', sm: '4px' },
            '&:hover': {
              bgcolor: 'white'
            },
            zIndex: 1
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }} // Prevent card click
        >
          <FavoriteBorderIcon fontSize="small" />
        </IconButton>

        <Box 
          sx={{ 
            p: { xs: 1, sm: 1.5, md: 2 },
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <Box 
            sx={{ 
              ...sizeProps.image,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1
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

          <Typography 
            variant="h6" 
            sx={{ 
              ...sizeProps.title,
              fontWeight: 500,
              mb: 0.5,
              height: { xs: '32px', sm: '36px', md: '40px' },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              textAlign: 'center'
            }}
          >
            {product.title || product.name}
          </Typography>

          <Box sx={{ 
            mt: 'auto', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pt: 0.5
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                ...sizeProps.price
              }}
            >
              ${product.price ? product.price.toFixed(2) : 'N/A'}
            </Typography>
            <Button 
              variant="outlined"
              disabled={adding}
              sx={{ 
                borderColor: '#333',
                color: '#333',
                ...sizeProps.button,
                py: 0.25,
                px: { xs: 0.5, sm: 1 },
                height: { xs: '24px', sm: '28px' },
                '&:hover': {
                  borderColor: '#000',
                  backgroundColor: 'rgba(0,0,0,0.04)'
                }
              }}
              onClick={handleAddToCart}
            >
              {adding ? '...' : 'Add to cart'}
            </Button>
          </Box>
        </Box>
      </Card>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={2000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard; 