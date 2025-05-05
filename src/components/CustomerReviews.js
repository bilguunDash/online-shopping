import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Avatar,
  IconButton
} from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const CustomerReviews = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const reviews = [
    {
      id: 1,
      name: "Bat-Erdene",
      avatar: "/images/profile.png",
      text: "Би энэ дэлгүүрээс хоёр удаа захиалсан бөгөөд хоёуланд нь хүргэлт хурдан бөгөөд найдвартай байсан. Бүтээгдэхүүний чанар маш сайн, үйлчилгээ нь маш найрсаг байсан. Би заавал дахин захиалах болно!"
    },
    {
      id: 2,
      name: "Saraa",
      avatar: "/images/saraas.png",
      text: "Би зөөврийн компьютер худалдаж авсан бөгөөд 24 цагийн дотор бүрэн савласан. Би үнэхээр сэтгэл хангалуун байна. Та бүхний ажилд сайн сайхан бүхнийг хүсэн ерөөе!"
    },
    {
      id: 3,
      name: "Temujin",
      avatar: "/images/temuujin.png",
      text: "Би утас захиалсан, яг л зураг дээрх шиг сайхан байсан. Захиалга болон төлбөрийн үйл явц хялбар байсан. Энэ бол найдвартай дэлгүүр юм."
    }
  ];
  
  // Auto-rotate reviews every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const nextReview = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };
  
  const prevReview = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  return (
    <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
      <Container>
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: "bold",
              mb: 2,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '60px',
                height: '3px',
                backgroundColor: 'primary.main',
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
              }
            }}
          >
            Хэрэглэгчийн тойм
          </Typography>
        </Box>
        
        <Box sx={{ position: 'relative', maxWidth: 900, mx: 'auto' }}>
          <Paper
            elevation={2}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              position: 'relative',
              transition: 'all 0.3s ease',
              backgroundColor: 'white',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at top right, rgba(88, 90, 228, 0.05), transparent 60%)',
                zIndex: 0
              }
            }}
          >
            <FormatQuoteIcon 
              sx={{ 
                position: 'absolute', 
                top: 20, 
                left: 20, 
                fontSize: 60, 
                color: 'rgba(88, 90, 228, 0.1)',
                transform: 'scaleX(-1)'
              }} 
            />
            
            <Box
              sx={{
                height: { xs: 'auto', md: 280 },
                position: 'relative',
                zIndex: 1
              }}
            >
              {reviews.map((review, index) => (
                <Box
                  key={review.id}
                  sx={{
                    display: index === activeIndex ? 'block' : 'none',
                    opacity: index === activeIndex ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                    animation: index === activeIndex ? 'fadeIn 0.5s forwards' : 'none',
                    '@keyframes fadeIn': {
                      from: { opacity: 0, transform: 'translateY(20px)' },
                      to: { opacity: 1, transform: 'translateY(0)' }
                    }
                  }}
                >
                  <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          src={review.avatar}
                          alt={review.name}
                          sx={{
                            width: { xs: 120, md: 150 },
                            height: { xs: 120, md: 150 },
                            border: '4px solid white',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography
                        variant="h5"
                        component="h3"
                        sx={{ mb: 2, fontWeight: 600 }}
                      >
                        {review.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ 
                          color: 'text.secondary',
                          lineHeight: 1.8,
                          fontStyle: 'italic'
                        }}
                      >
                        "{review.text}"
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
            
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 4,
                gap: 1
              }}
            >
              {reviews.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: index === activeIndex ? 'primary.main' : 'rgba(88, 90, 228, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Box>
          </Paper>
          
          <IconButton
            onClick={prevReview}
            sx={{
              position: 'absolute',
              left: { xs: '5px', md: '-25px' },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'white',
              boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'white'
              }
            }}
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          
          <IconButton
            onClick={nextReview}
            sx={{
              position: 'absolute',
              right: { xs: '5px', md: '-25px' },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'white',
              boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'white'
              }
            }}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default CustomerReviews;
