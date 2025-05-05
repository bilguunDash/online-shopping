import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Card, CardContent, CardMedia, Typography, Button, Container, Box, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import api from "../utils/axios";

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

const PhoneSection = ({ products, loading, error, darkMode, onAddToCart }) => {
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  
  // Only take first 5 products for display
  const displayProducts = products?.slice(0, 5) || [];

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
    
    try {
      // First check if we need to create a cart (first item)
      try {
        await api.post("http://localhost:8083/cart");
      } catch (err) {
        // Cart likely already exists, continue
        console.log("Cart exists or error occurred:", err);
      }
      
      // Add item to cart
      await api.post(`http://localhost:8083/cart/items/${product.id || product.productId}`);
      
      // Store product image in localStorage for cart display
      const cartItemsImages = JSON.parse(localStorage.getItem('cartItemsImages') || '{}');
      cartItemsImages[product.id || product.productId] = product.imageUrl || "/placeholder.jpg";
      localStorage.setItem('cartItemsImages', JSON.stringify(cartItemsImages));
      
      // Trigger cart updated event for header to update cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (err) {
      console.error("Error adding item to cart:", err);
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
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'baseline',
        mb: 4,
        width: '100%',
        marginTop: { xs: 4, sm: 5, md: 5 },
        mx: 'auto'
      }}>
        <Typography 
          variant="h4" 
          component="h2" 
          sx={{ 
            color: '#000',
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
          }}
        >
          Ухаалаг утас
        </Typography>
        <Link href="/CatPhone" style={{ textDecoration: 'none', marginLeft: '12px' }}>
          {/* Link content if needed */}
        </Link>
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
          gap: { xs: 1, sm: 2 },
          width: '100%',
          mx: 'auto'
        }}
      >
        {displayProducts.map((product) => (
          <Box 
            key={product.id}
            sx={{
              width: '100%',
              minWidth: 0 // Allow shrinking below minWidth
            }}
          >
            <Card 
              sx={{ 
                height: { xs: '220px', sm: '250px', md: '280px', lg: '300px' },
                backgroundColor: '#fff',
                borderRadius: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'relative',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
              onClick={() => handleProductClick(product)}
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
                  }
                }}
                onClick={(e) => handleWishlistToggle(e, product)}
              >
                {isInWishlist(product) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
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
                    height: { xs: '100px', sm: '120px', md: '140px' },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1
                  }}
                >
                  <CardMedia
                    component="img"
                    alt={product.name}
                    image={product.imageUrl || "/placeholder.jpg"}
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
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '0.9rem' },
                    fontWeight: 500,
                    mb: 0.5,
                    height: { xs: '32px', sm: '36px', md: '40px' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {product.name}
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
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    ${product.price}
                  </Typography>
                  <Button 
                    variant="outlined"
                    sx={{ 
                      borderColor: '#333',
                      color: '#333',
                      fontSize: { xs: '0.6rem', sm: '0.7rem' },
                      py: 0.25,
                      px: { xs: 0.5, sm: 1 },
                      minWidth: { xs: '60px', sm: '80px' },
                      height: { xs: '24px', sm: '28px' },
                      '&:hover': {
                        borderColor: '#000',
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                    onClick={(e) => onAddToCart(e, product)}
                  >
                    Add to cart
                  </Button>
                </Box>
              </Box>
            </Card>
          </Box>
        ))}

        {/* Show All Card */}
        <Box 
          sx={{
            width: '100%',
            minWidth: 0
          }}
        >
          <Card 
            sx={{ 
              height: { xs: '220px', sm: '250px', md: '280px', lg: '300px' },
              backgroundColor: '#f5f5f5',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
            component={Link}
            href="/CatPhone"
          >
            <Box 
              sx={{ 
                textAlign: 'center',
                p: { xs: 1, sm: 2 }
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#666',
                  mb: 1,
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                }}
              >
                Show all
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }, color: '#666' }} />
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Bottom Show All Link */}
      <Box 
        sx={{ 
          display: 'flex',
          justifyContent: 'center',
          mt: 4
        }}
      >
        <Link href="/CatPhone" style={{ textDecoration: 'none' }}>
          <Button 
            variant="outlined" 
            endIcon={<ArrowForwardIcon />}
            sx={{ 
              color: '#333',
              borderColor: '#333',
              '&:hover': {
                borderColor: '#000',
                backgroundColor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            View all phones
          </Button>
        </Link>
      </Box>
    </Container>
  );
};

export default PhoneSection;