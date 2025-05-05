import React, { useState, useEffect, useRef } from "react";
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import Carousel from 'react-material-ui-carousel';

const defaultBannerData = [
  {
    id: "computers",
    tagline: "Хамгийн Шинэ Технологи",
    title: "Компьютер",
    description: "Тоглоом, загвар дизайн, оффисын ажлын хэрэгцээнд тохирсон, хамгийн сүүлийн үеийн үзүүлэлт бүхий компьютеруудыг сонгоорой.",
    image: "/images/pc.png",
    primaryCta: "Худалдан Авах",
    secondaryCta: "Дэлгэрэнгүй"
  },
  {
    id: "laptops",
    tagline: "Хүчирхэг Үзүүлэлт",
    title: "Лаптоп",
    description: "Удаан цэнэг барих чадвартай, авсаархан загвартай, өндөр хүчин чадалтай лаптопуудыг санал болгож байна.",
    image: "/images/notebook.png",
    primaryCta: "Худалдан Авах",
    secondaryCta: "Дэлгэрэнгүй"
  },
  {
    id: "phones",
    tagline: "Ухаалаг Төхөөрөмжүүд",
    title: "Утас",
    description: "Шинэлэг загвар, ухаалаг шийдлүүдтэй, өндөр хүчин чадалтай ухаалаг гар утаснуудыг сонгон аваарай.",
    image: "/images/nice.png",
    primaryCta: "Худалдан Авах",
    secondaryCta: "Дэлгэрэнгүй"
  },
  {
    id: "tablets",
    tagline: "Хөнгөн Хөдөлгөөнт Байдал",
    title: "Таблет",
    description: "Ажил, амралтыг хослуулсан өндөр үзүүлэлттэй таблетууд таны өдөр тутмын туслах байх болно.",
    image: "/images/tablets.png",
    primaryCta: "Худалдан Авах",
    secondaryCta: "Дэлгэрэнгүй"
  },
  {
    id: "headphones",
    tagline: "Дээд Зэргийн Дуугаралт",
    title: "Чихэвч",
    description: "Утасгүй, дуу тусгаарлагчтай, дээд зэрэглэлийн чихэвчнүүдээр хөгжим сонсох шинэ түвшинд хүрээрэй.",
    image: "/images/headphones.png",
    primaryCta: "Худалдан Авах",
    secondaryCta: "Дэлгэрэнгүй"
  },
  {
    id: "smarttvs",
    tagline: "Төгс Зугаа Цэнгэл",
    title: "Смарт ТВ",
    description: "HD болон 4K нягтралтай, интернэт холболттой, ухаалаг функцүүд бүхий телевизүүд таны гэрийн энтертайнмент төв байх болно.",
    image: "/images/smartv.png",
    primaryCta: "Худалдан Авах",
    secondaryCta: "Дэлгэрэнгүй"
  }
];

const Banner = () => {
  const theme = useTheme();
  const [bannerData, setBannerData] = useState(defaultBannerData);
  const [storageUpdateKey, setStorageUpdateKey] = useState(0);
  
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bannerData') {
        setStorageUpdateKey(prev => prev + 1);
      }
    };

    loadBannerDataFromStorage();

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  useEffect(() => {
    loadBannerDataFromStorage();
  }, [storageUpdateKey]);
  
  const loadBannerDataFromStorage = () => {
    try {
      const savedBannerData = localStorage.getItem('bannerData');
      if (savedBannerData) {
        const parsedData = JSON.parse(savedBannerData);
        setBannerData(parsedData);
        console.log('Banner data loaded from localStorage:', parsedData);
      }
    } catch (err) {
      console.error('Error loading banner data from localStorage:', err);
      // Keep using default data on error
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        backgroundColor: theme.palette.mode === 'dark' ? '#000' : '#fff',
        paddingTop: 0,
        mb: 6,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark' ? 
            'linear-gradient(135deg, rgba(13, 71, 161, 0.6) 0%, rgba(25, 25, 35, 0.9) 100%)' : 
            'linear-gradient(135deg, rgba(66, 165, 245, 0.1) 0%, rgba(255, 255, 255, 0.6) 100%)',
          opacity: 0.85,
          pointerEvents: 'none',
          zIndex: 0
        }
      }}
    >
      {/* Add a modern pattern overlay */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: theme.palette.mode === 'dark' ? 0.15 : 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.mode === 'dark' ? 'ffffff' : '000000'}' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '20px 20px',
          zIndex: 1
        }}
      />

      <Carousel
        animation="fade"
        navButtonsAlwaysVisible
        autoPlay
        stopAutoPlayOnHover
        interval={4000}
        indicatorContainerProps={{
          style: {
            marginTop: '10px',
            position: 'absolute',
            bottom: '16px',
            zIndex: 10
          }
        }}
        navButtonsProps={{
          style: {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            color: theme.palette.mode === 'dark' ? '#fff' : '#000',
            borderRadius: '50%',
            padding: '8px',
            margin: '0 20px'
          }
        }}
        indicatorIconButtonProps={{
          style: {
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            padding: '5px',
            transition: 'all 0.3s ease'
          }
        }}
        activeIndicatorIconButtonProps={{
          style: {
            color: theme.palette.primary.main,
            transform: 'scale(1.2)'
          }
        }}
        sx={{
          zIndex: 2,
          position: 'relative'
        }}
      >
        {bannerData.map((item, index) => {
          // Define color schemes for each product type
          const schemes = {
            computers: {
              dark: {
                primary: '#1565C0',
                secondary: '#0D47A1', 
                accent: '#82B1FF',
                gradient: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)',
                shadow: '0 0 40px rgba(33, 150, 243, 0.4)'
              },
              light: {
                primary: '#2196F3',
                secondary: '#64B5F6',
                accent: '#1565C0',
                gradient: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                shadow: '0 10px 40px rgba(33, 150, 243, 0.2)'
              }
            },
            laptops: {
              dark: {
                primary: '#00796B',
                secondary: '#004D40',
                accent: '#80CBC4',
                gradient: 'linear-gradient(135deg, #004D40 0%, #00796B 100%)',
                shadow: '0 0 40px rgba(0, 150, 136, 0.4)'
              },
              light: {
                primary: '#009688',
                secondary: '#4DB6AC',
                accent: '#00796B',
                gradient: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)',
                shadow: '0 10px 40px rgba(0, 150, 136, 0.2)'
              }
            },
            phones: {
              dark: {
                primary: '#7B1FA2',
                secondary: '#4A148C',
                accent: '#CE93D8',
                gradient: 'linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%)',
                shadow: '0 0 40px rgba(156, 39, 176, 0.4)'
              },
              light: {
                primary: '#9C27B0',
                secondary: '#BA68C8',
                accent: '#7B1FA2',
                gradient: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
                shadow: '0 10px 40px rgba(156, 39, 176, 0.2)'
              }
            },
            tablets: {
              dark: {
                primary: '#F57C00',
                secondary: '#E65100',
                accent: '#FFB74D',
                gradient: 'linear-gradient(135deg, #E65100 0%, #F57C00 100%)',
                shadow: '0 0 40px rgba(255, 152, 0, 0.4)'
              },
              light: {
                primary: '#FF9800',
                secondary: '#FFB74D',
                accent: '#F57C00',
                gradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                shadow: '0 10px 40px rgba(255, 152, 0, 0.2)'
              }
            },
            headphones: {
              dark: {
                primary: '#D32F2F',
                secondary: '#B71C1C',
                accent: '#EF9A9A',
                gradient: 'linear-gradient(135deg, #B71C1C 0%, #D32F2F 100%)',
                shadow: '0 0 40px rgba(244, 67, 54, 0.4)'
              },
              light: {
                primary: '#F44336',
                secondary: '#EF5350',
                accent: '#D32F2F',
                gradient: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                shadow: '0 10px 40px rgba(244, 67, 54, 0.2)'
              }
            },
            smarttvs: {
              dark: {
                primary: '#303F9F',
                secondary: '#1A237E',
                accent: '#9FA8DA',
                gradient: 'linear-gradient(135deg, #1A237E 0%, #303F9F 100%)',
                shadow: '0 0 40px rgba(63, 81, 181, 0.4)'
              },
              light: {
                primary: '#3F51B5',
                secondary: '#7986CB',
                accent: '#303F9F',
                gradient: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
                shadow: '0 10px 40px rgba(63, 81, 181, 0.2)'
              }
            }
          };

          // Get color scheme for current item
          const defaultScheme = {
            dark: {
              primary: '#1976D2',
              secondary: '#0D47A1',
              accent: '#82B1FF',
              gradient: 'linear-gradient(135deg, #0D47A1 0%, #1976D2 100%)',
              shadow: '0 0 40px rgba(33, 150, 243, 0.4)'
            },
            light: {
              primary: '#2196F3',
              secondary: '#64B5F6',
              accent: '#1565C0',
              gradient: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
              shadow: '0 10px 40px rgba(33, 150, 243, 0.2)'
            }
          };

          const scheme = schemes[item.id] || defaultScheme;
          const colors = theme.palette.mode === 'dark' ? scheme.dark : scheme.light;
          
          return (
            <Box 
              key={index}
              sx={{ 
                py: { xs: 5, md: 7 },
                px: 3,
                position: 'relative',
                background: 'transparent',
                minHeight: { xs: '420px', md: '500px' },
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Large color accent for background */}
              <Box 
                sx={{
                  position: 'absolute',
                  width: { xs: '100%', md: '50%' },
                  height: { xs: '100%', md: '140%' },
                  right: { xs: '0%', md: '-10%' },
                  top: { xs: '0%', md: '-20%' },
                  background: colors.gradient,
                  opacity: theme.palette.mode === 'dark' ? 0.7 : 0.2,
                  borderRadius: theme.palette.mode === 'dark' ? '0 0 0 100%' : '0 0 0 70%',
                  transform: 'rotate(-10deg)',
                  zIndex: 1,
                  boxShadow: theme.palette.mode === 'dark' ? 'none' : 'inset 0 0 100px rgba(255,255,255,0.9)'
                }}
              />
              
              <Container 
                maxWidth="lg" 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 3
                }}
              >
                <Box 
                  sx={{ 
                    width: { xs: '100%', md: '50%' },
                    textAlign: { xs: 'center', md: 'left' },
                    order: { xs: 2, md: 1 },
                    mt: { xs: 3, md: 0 }
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Typography 
                      component="span"
                      sx={{ 
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        fontWeight: 700,
                        color: colors.primary,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        display: 'inline-block',
                        position: 'relative',
                        pb: 0.5,
                        mb: 1.5,
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          left: { xs: '50%', md: 0 },
                          bottom: 0,
                          height: '2px',
                          width: { xs: '60px', md: '40px' },
                          backgroundColor: colors.primary,
                          transform: { xs: 'translateX(-50%)', md: 'none' }
                        }
                      }}
                    >
                      {item.tagline}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="h2"
                    sx={{ 
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                      lineHeight: 1.1,
                      mb: 2,
                      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                      textShadow: theme.palette.mode === 'dark' ? '0 0 40px rgba(0,0,0,0.3)' : 'none'
                    }}
                  >
                    {item.title}
                  </Typography>
                  
                  <Typography 
                    variant="body1"
                    sx={{ 
                      fontSize: { xs: '1rem', md: '1.125rem' },
                      lineHeight: 1.6,
                      mb: 4,
                      color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                      maxWidth: { md: '90%' }
                    }}
                  >
                    {item.description}
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      flexWrap: 'wrap',
                      justifyContent: { xs: 'center', md: 'flex-start' } 
                    }}
                  >
                    <Button 
                      variant="contained"
                      size="large"
                      sx={{
                        backgroundColor: colors.primary,
                        color: '#fff',
                        borderRadius: '4px',
                        px: 4,
                        py: 1.5,
                        fontSize: { xs: '0.875rem', md: '1rem' },
                        fontWeight: 600,
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: theme.palette.mode === 'dark' ? 
                          `0 0 20px ${colors.primary}80` : 
                          `0 10px 20px ${colors.primary}40`,
                        '&:hover': {
                          backgroundColor: colors.secondary,
                          transform: 'translateY(-3px)',
                          boxShadow: theme.palette.mode === 'dark' ? 
                            `0 0 30px ${colors.primary}` : 
                            `0 15px 30px ${colors.primary}60`
                        }
                      }}
                    >
                      {item.primaryCta}
                    </Button>
                    
                    <Button 
                      variant="outlined"
                      size="large"
                      sx={{
                        color: theme.palette.mode === 'dark' ? '#fff' : colors.primary,
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : colors.primary,
                        borderRadius: '4px',
                        px: 4,
                        py: 1.5,
                        fontSize: { xs: '0.875rem', md: '1rem' },
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: colors.primary,
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      {item.secondaryCta}
                    </Button>
                  </Box>
                </Box>
                
                <Box 
                  sx={{ 
                    width: { xs: '100%', md: '50%' },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    order: { xs: 1, md: 2 },
                    py: { xs: 3, md: 0 },
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: { xs: '80%', md: '90%' },
                      maxWidth: '450px',
                      aspectRatio: '1',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    {/* Background circle */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        background: theme.palette.mode === 'dark' ? 
                          `radial-gradient(circle, ${colors.secondary}40 0%, transparent 70%)` : 
                          `radial-gradient(circle, ${colors.secondary}20 0%, transparent 70%)`,
                        boxShadow: colors.shadow,
                        animation: 'pulse 8s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.05)' },
                          '100%': { transform: 'scale(1)' }
                        }
                      }}
                    />
                    
                    {/* Product image */}
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.title}
                      sx={{
                        width: '90%',
                        height: 'auto',
                        maxHeight: '350px',
                        objectFit: 'contain',
                        filter: theme.palette.mode === 'dark' ? 
                          'drop-shadow(0 0 30px rgba(255,255,255,0.1))' : 
                          'drop-shadow(0 20px 30px rgba(0,0,0,0.1))',
                        transform: 'translateZ(0)',
                        position: 'relative',
                        zIndex: 2,
                        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        animation: 'float 6s ease-in-out infinite',
                        '@keyframes float': {
                          '0%': { transform: 'translateY(0)' },
                          '50%': { transform: 'translateY(-15px)' },
                          '100%': { transform: 'translateY(0)' }
                        },
                        '&:hover': {
                          transform: 'scale(1.05)',
                          filter: theme.palette.mode === 'dark' ? 
                            'drop-shadow(0 0 40px rgba(255,255,255,0.2)) brightness(1.1)' : 
                            'drop-shadow(0 30px 40px rgba(0,0,0,0.15)) brightness(1.05)'
                        }
                      }}
                    />
                    
                    {/* Decorative elements */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: colors.accent,
                        top: '15%',
                        right: '10%',
                        boxShadow: `0 0 15px ${colors.accent}`,
                        animation: 'moveAround 12s linear infinite',
                        '@keyframes moveAround': {
                          '0%': { transform: 'rotate(0deg) translateX(30px) rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg) translateX(30px) rotate(-360deg)' }
                        }
                      }}
                    />
                    
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '8px',
                        height: '8px',
                        borderRadius: '2px',
                        backgroundColor: colors.primary,
                        bottom: '20%',
                        left: '15%',
                        transform: 'rotate(45deg)',
                        boxShadow: `0 0 15px ${colors.primary}`,
                        animation: 'moveAround 15s linear infinite reverse'
                      }}
                    />
                  </Box>
                </Box>
              </Container>
            </Box>
          );
        })}
      </Carousel>
    </Box>
  );
};

export default Banner;