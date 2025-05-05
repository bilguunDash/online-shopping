import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { useRouter } from 'next/router';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const DeskPCSection = ({ title, deskPcs }) => {
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Only take first 5 products for display
  const limitedProducts = deskPcs?.slice(0, 5) || [];
  const deskPcCount = deskPcs?.length || 0;
  
  // Load wishlist from localStorage on component mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Error parsing wishlist:', error);
      }
    }

    // Listen for wishlist updates from other components
    const handleWishlistUpdate = (event) => {
      setWishlist(event.detail || []);
    };
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    
    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);
  
  // Helper function to check if a product is in the wishlist
  const isInWishlist = (product) => {
    const productId = product.id || product.productId;
    return wishlist.some(item => (item.id === productId) || (item.productId === productId));
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
      setSnackbarOpen(true);
      setSnackbarMessage(message);
      
      // Dispatch event for other components to listen
      const event = new CustomEvent('wishlistUpdated', { detail: newWishlist });
      window.dispatchEvent(event);
      console.log('wishlistUpdated event dispatched');
      
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setSnackbarOpen(true);
      setSnackbarMessage('Failed to update wishlist');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <Typography variant="h4" gutterBottom>
        {title || 'Desktop PCs'}
      </Typography>
      
      <Grid container spacing={3}>
        {limitedProducts.map(product => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={product.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                }
              }}
              onClick={() => router.push(`/product/${product.id}`)}
            >
              <div style={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={product.imageUrl || "/placeholder.jpg"}
                  alt={product.title}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                  onClick={(e) => handleWishlistToggle(e, product)}
                >
                  {isInWishlist(product) ? (
                    <FavoriteIcon color="error" />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </div>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                  {product.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  ${product.price?.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {product.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      {deskPcCount > 5 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => router.push('/desk-pcs')}
          >
            See All Desktop PCs
          </Button>
        </div>
      )}
    </div>
  );
};

export default DeskPCSection; 