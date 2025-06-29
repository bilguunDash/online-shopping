    // pages/home.js
    import React, { useState, useEffect } from "react";
    import Layout from "../components/layout/Layout";
    import api from "../utils/axios";
    import SmartTvSection from "../components/categories/CategoriesSmartTv";
    import { Box, useTheme, Container, Typography, FormControl, InputLabel, Select, MenuItem, Chip, Paper, Grid, CircularProgress, Divider, Button, Fade, Grow } from "@mui/material";
    import FilterAltIcon from '@mui/icons-material/FilterAlt';
    import TuneIcon from '@mui/icons-material/Tune';
    import RestartAltIcon from '@mui/icons-material/RestartAlt';
    import TvIcon from '@mui/icons-material/Tv';
    import Head from 'next/head';

    const CatSmartTv = ({ darkMode, toggleDarkMode }) => {
        const [products, setProducts] = useState([]);
        const [error, setError] = useState(null);
        const [loading, setLoading] = useState(true);
        const [filterOptions, setFilterOptions] = useState({
            displays: [],
            osSystems: []
        });
        const [filters, setFilters] = useState({
            categoryId: 9,
            display: '',
            os: '',
            sortDirection: 'asc'
        });
        const [activeFiltersCount, setActiveFiltersCount] = useState(0);
        const theme = useTheme();
    
        // Generate star shadow values - reduced for performance
        const generateStarShadows = (count, color) => {
            let shadows = [];
            for (let i = 0; i < count; i++) {
                const x = Math.floor(Math.random() * 2000);
                const y = Math.floor(Math.random() * 2000);
                shadows.push(`${x}px ${y}px ${color}`);
            }
            return shadows.join(', ');
        };
        
        // Generate CSS for stars based on the current theme
        const getStarStyles = () => {
            const starColor = theme.palette.mode === 'dark' ? '#FFF' : '#6d82ff';
            const starColorBright = theme.palette.mode === 'dark' ? '#FFF' : '#5a61f1';
            
            return `
                .animated-background {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                
                .bg-animation {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    overflow: hidden;
                    background: ${theme.palette.mode === 'dark' 
                        ? 'linear-gradient(125deg, #1e1e30 0%, #191927 40%, #0d0d20 70%, #16151c 100%)'
                        : 'linear-gradient(125deg, #f5f5ff 0%, #fefefe 40%, #f0f8ff 70%, #f8f8ff 100%)'};
                }
                
                #stars {
                    width: 1px;
                    height: 1px;
                    background: transparent;
                    box-shadow: ${generateStarShadows(50, starColor)};
                    animation: animateStars 20s linear infinite;
                }
                
                #stars2 {
                    width: 2px;
                    height: 2px;
                    background: transparent;
                    box-shadow: ${generateStarShadows(30, starColor)};
                    animation: animateStars 30s linear infinite;
                }
                
                #stars3 {
                    width: 3px;
                    height: 3px;
                    background: transparent;
                    box-shadow: ${generateStarShadows(20, starColorBright)};
                    animation: animateStars 40s linear infinite;
                }
                
                #stars4 {
                    width: 4px;
                    height: 4px;
                    border-radius: 2px;
                    background: transparent;
                    box-shadow: ${generateStarShadows(10, starColorBright)};
                    animation: animateBigStars 30s linear infinite;
                }
                
                @keyframes animateStars {
                    from { transform: translateY(0px); }
                    to { transform: translateY(-2000px); }
                }
                
                @keyframes animateBigStars {
                    0% {
                        box-shadow: ${generateStarShadows(10, theme.palette.mode === 'dark' ? '#FFF' : '#6d7eee')};
                    }
                    50% {
                        box-shadow: ${generateStarShadows(10, theme.palette.mode === 'dark' ? '#BBB' : '#5a68e0')};
                    }
                    100% {
                        box-shadow: ${generateStarShadows(10, theme.palette.mode === 'dark' ? '#FFF' : '#6d7eee')};
                    }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slideIn {
                    from { transform: translateX(-20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                .fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }
                
                .slide-in {
                    animation: slideIn 0.5s ease-out forwards;
                }
                
                .header-highlight {
                    position: relative;
                }
                
                .header-highlight:after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    width: 60px;
                    height: 4px;
                    border-radius: 2px;
                    background: linear-gradient(90deg, #6d42ff, #4b6eff);
                }
            `;
        };

        // Fetch filter options
        useEffect(() => {
            const fetchFilterOptions = async () => {
                try {
                    const response = await api.get("/product/filter/options");
                    console.log('Filter options response for Smart TV:', response.data);
                    
                    // Handle response based on its structure
                    if (response.data) {
                        // Check if direct access to category 9
                        if (response.data['9'] || response.data[9]) {
                            const smartTvData = response.data['9'] || response.data[9];
                            // Extract display and OS options
                            const displayValues = smartTvData?.filters?.display || [];
                            const osValues = smartTvData?.filters?.os || [];
                            
                            setFilterOptions({
                                displays: displayValues,
                                osSystems: osValues
                            });
                        } 
                        // If it's an array of categories
                        else if (Array.isArray(response.data)) {
                            const smartTvOptions = response.data.find(cat => 
                                cat.categoryId === 9 || cat.id === 9);
                            
                            if (smartTvOptions) {
                                // Extract display and OS options
                                const displayValues = smartTvOptions.filters?.display || [];
                                const osValues = smartTvOptions.filters?.os || [];
                                
                                setFilterOptions({
                                    displays: displayValues,
                                    osSystems: osValues
                                });
                            }
                        }
                        // If category data is at the top level and this is for Smart TV
                        else if (response.data.categoryName === "Smart TV") {
                            // Get required fields as potential filter options
                            const displayIncluded = response.data.required?.includes('display');
                            const osIncluded = response.data.required?.includes('os');
                            
                            setFilterOptions({
                                displays: displayIncluded ? [] : [],
                                osSystems: osIncluded ? [] : []
                            });
                        }
                    }
                } catch (err) {
                    console.error("Error fetching filter options:", err);
                }
            };
            
            fetchFilterOptions();
        }, []);

        // Fetch products with filters
        useEffect(() => {
        const fetchProducts = async () => {
                setLoading(true);
                try {
                    // Create params with categoryId always explicitly included
                    const params = {
                        categoryId: 9  // Explicitly ensure category ID is included
                    };
                    
                    // Add other non-empty filters
                    Object.keys(filters).forEach(key => {
                        if (filters[key] !== '' && key !== 'categoryId') {
                            params[key] = filters[key];
                        }
                    });
                    
                    console.log("SmartTV fetching with params:", params);
                    
                    // First try with filter endpoint
                    try {
                        console.log("Attempting filter search with params:", params);
                        const response = await api.post("/product/filter/search", params);
                        console.log("SmartTV filter response status:", response.status);
                        console.log("SmartTV response data type:", typeof response.data);
                        console.log("SmartTV response data length:", Array.isArray(response.data) ? response.data.length : "not an array");
                        
                        // If no products from filter endpoint, try direct category fetch
                        if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
                            console.log("No SmartTV products from filter API, trying direct category endpoint");
                            const directResponse = await api.get("/product/SmartTv");
                            
                            if (directResponse.data && Array.isArray(directResponse.data) && directResponse.data.length > 0) {
                                console.log(`Found ${directResponse.data.length} SmartTV products from direct API`);
                                
                                // Filter unique products
                                const uniqueProducts = [];
                                const productIds = new Set();
                                
                                directResponse.data.forEach(product => {
                                    if (!productIds.has(product.id)) {
                                        productIds.add(product.id);
                                        uniqueProducts.push(product);
                                    }
                                });
                                
                                setProducts(uniqueProducts);
                                setLoading(false);
                                return;
                            }
                        }
                        
                        // Process the response data if we got results from filter endpoint
                        const productsArray = Array.isArray(response.data) 
                            ? response.data 
                            : (response.data.content || []);
                        
                        console.log(`Found ${productsArray.length} SmartTV products from filter API`);
                        
                        // Filter unique products
                        const uniqueProducts = [];
                        const productIds = new Set();
                        
                        productsArray.forEach(product => {
                            if (!productIds.has(product.id)) {
                                productIds.add(product.id);
                                uniqueProducts.push(product);
                            }
                        });
                        
                        console.log(`Final unique SmartTV product count: ${uniqueProducts.length}`);
                        setProducts(uniqueProducts);
                    } catch (filterErr) {
                        console.error("Filter search failed, falling back to direct category endpoint:", filterErr);
                        // Fall back to direct category endpoint
                        const fallbackResponse = await api.get("/product/SmartTv");
                        console.log(`SmartTV direct API found ${fallbackResponse.data?.length || 0} products`);
                        
                        if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
                            // Filter unique products
                            const uniqueProducts = [];
                            const productIds = new Set();
                            
                            fallbackResponse.data.forEach(product => {
                                if (!productIds.has(product.id)) {
                                    productIds.add(product.id);
                                    uniqueProducts.push(product);
                                }
                            });
                            
                            setProducts(uniqueProducts);
                        } else {
                            setProducts([]);
                        }
                    }
                } catch (err) {
                    console.error("Error fetching SmartTv products:", err);
                    if (err.response) {
                        console.error("API error details:", err.response.status, err.response.data);
                    }
                    setError("Бүтээгдэхүүн ачаалахад алдаа гарлаа. Дахин оролдоно уу.");
            } finally {
            setLoading(false);
            }
        };
        
        fetchProducts();
            
            // Count active filters
            const count = Object.keys(filters).filter(key => 
                !['categoryId'].includes(key) && 
                filters[key] !== ''
            ).length;
            
            setActiveFiltersCount(count);
        }, [filters]);

        // Handle filter changes
        const handleFilterChange = (event) => {
            const { name, value } = event.target;
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        };

        // Clear all filters
        const handleResetFilters = () => {
            setFilters({
                categoryId: 9,
                display: '',
                os: '',
                sortDirection: 'asc'
            });
        };

        const getActiveFilterValue = (name) => {
            const value = filters[name];
            if (!value) return null;
            return value;
        };

        return (
            <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <Head>
                    <style>{getStarStyles()}</style>
                </Head>
                
                <div className="animated-background">
                    <div className="bg-animation">
                        <div id="stars"></div>
                        <div id="stars2"></div>
                        <div id="stars3"></div>
                        <div id="stars4"></div>
                    </div>
                    
                <Box
                    sx={{
                        position: 'relative',
                        minHeight: '100vh',
                            zIndex: 1,
                        padding: '20px 0',
                    }}
                >
                        <Fade in={true} timeout={800}>
                            <Container maxWidth="xl" sx={{ mb: 4, pt: 2 }}>
                                <Box 
                                    sx={{ 
                                        textAlign: 'center', 
                                        mb: 5, 
                                        mt: 2,
                                        position: 'relative',
                                        zIndex: 2
                                    }}
                                >
                                    <Typography 
                                        variant="h3" 
                                        component="h1" 
                                        className="header-highlight"
                                        sx={{
                                            display: 'inline-block',
                                            fontWeight: 700,
                                            mb: 2,
                                            color: darkMode ? '#fff' : '#333',
                                            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                                        }}
                                    >
                                        Ухаалаг ТВ
                                    </Typography>
                                    <Box 
                                        sx={{ 
                                            mt: 3, 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1
                                        }}
                                    >
                                       
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                                maxWidth: '800px',
                                                textAlign: 'center',
                                                mx: 'auto',
                                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                            }}
                                        >
                                            Өндөр чанартай дэлгэцтэй ухаалаг телевизүүдийг танд санал болгож байна
                                        </Typography>
                                    </Box>
                                </Box>
                            </Container>
                        </Fade>
                        
                        {/* Filters Section */}
                        <Grow in={true} timeout={1000}>
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    width: '94%', 
                                    maxWidth: '1400px',
                                    margin: '0 auto 30px auto', 
                                    p: { xs: 2, sm: 3 }, 
                                    borderRadius: 4,
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(25, 25, 35, 0.8)' 
                                        : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: theme.palette.mode === 'dark'
                                        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                                        : '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    border: theme.palette.mode === 'dark'
                                        ? '1px solid rgba(255, 255, 255, 0.1)'
                                        : '1px solid rgba(0, 0, 0, 0.05)',
                                    transition: 'all 0.3s ease-in-out',
                                    '&:hover': {
                                        boxShadow: theme.palette.mode === 'dark'
                                            ? '0 10px 40px rgba(0, 0, 0, 0.4)'
                                            : '0 10px 40px rgba(0, 0, 0, 0.15)',
                                        transform: 'translateY(-5px)'
                                    }
                                }}
                            >
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            mb: 2,
                                            justifyContent: 'space-between',
                                            flexWrap: 'wrap',
                                            gap: 2
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <TuneIcon sx={{ 
                                                    mr: 1.5, 
                                                    color: theme.palette.primary.main,
                                                    fontSize: '1.6rem'
                                                }} />
                                                <Typography 
                                                    variant="h6" 
                                                    component="h2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: darkMode ? '#fff' : '#333'
                                                    }}
                                                >
                                                    Шүүлтүүр
                                                </Typography>
                                            </Box>
                                            
                                           
                                        </Box>
                                        <Divider sx={{ 
                                            mb: 3,
                                            borderColor: darkMode 
                                                ? 'rgba(255, 255, 255, 0.1)' 
                                                : 'rgba(0, 0, 0, 0.1)'
                                        }} />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                            {['display', 'os'].map(filter => {
                                                const value = getActiveFilterValue(filter);
                                                if (!value) return null;
                                                
                                                const label = {
                                                    display: 'Дэлгэц',
                                                    os: 'Үйлдлийн систем'
                                                }[filter];
                                                
                                                return (
                                                    <Chip
                                                        key={filter}
                                                        label={`${label}: ${value}`}
                                                        onDelete={() => handleFilterChange({ target: { name: filter, value: '' } })}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: darkMode ? 'rgba(75, 110, 255, 0.15)' : 'rgba(75, 110, 255, 0.1)',
                                                            color: darkMode ? '#fff' : '#333',
                                                            fontWeight: 500,
                                                            borderRadius: '8px',
                                                            '& .MuiChip-deleteIcon': {
                                                                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)',
                                                                '&:hover': {
                                                                    color: darkMode ? '#fff' : '#000'
                                                                }
                                                            }
                                                        }}
                                                    />
                                                );
                                            })}
                                            
                                     
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6} md={4}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel id="display-filter-label">Дэлгэц</InputLabel>
                                            <Select
                                                labelId="display-filter-label"
                                                id="display-filter"
                                                name="display"
                                                value={filters.display}
                                                label="Дэлгэц"
                                                onChange={handleFilterChange}
                                                sx={{
                                                    borderRadius: '10px',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#6d42ff'
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>Бүх дэлгэц</em>
                                                </MenuItem>
                                                {filterOptions.displays.map((display, index) => (
                                                    <MenuItem key={index} value={display}>
                                                        {display}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6} md={4}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel id="os-filter-label">Үйлдлийн систем</InputLabel>
                                            <Select
                                                labelId="os-filter-label"
                                                id="os-filter"
                                                name="os"
                                                value={filters.os}
                                                label="Үйлдлийн систем"
                                                onChange={handleFilterChange}
                                                sx={{
                                                    borderRadius: '10px',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#6d42ff'
                                                    }
                                                }}
                                            >
                                                <MenuItem value="">
                                                    <em>Бүх үйлдлийн систем</em>
                                                </MenuItem>
                                                {filterOptions.osSystems.map((os, index) => (
                                                    <MenuItem key={index} value={os}>
                                                        {os}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        
                                    </Grid>


                                    <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth size="small" sx={{ mb: { xs: 1, md: 0 } }}>
                                        <InputLabel sx={{
                                            backgroundColor: theme.palette.mode === 'dark'
                                                ? 'rgba(25, 25, 35, 0.8)'
                                                : 'rgba(255, 255, 255, 0.9)',
                                            px: 1,
                                            ml: -0.5,
                                            fontWeight: 500
                                        }}>
                                            Эрэмбэлэх
                                        </InputLabel>
                                        <Select
                                            name="sortBy"
                                            value={filters.sortBy}
                                            label="Эрэмбэлэх"
                                            onChange={handleFilterChange}
                                            sx={{
                                                borderRadius: '10px',
                                                height: '45px',
                                                '& .MuiSelect-select': {
                                                    paddingTop: '8px',
                                                    paddingBottom: '8px',
                                                    fontWeight: 500
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#6d42ff'
                                                }
                                            }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        borderRadius: '10px',
                                                        mt: 1,
                                                        boxShadow: theme.palette.mode === 'dark'
                                                            ? '0 5px 15px rgba(0, 0, 0, 0.4)'
                                                            : '0 5px 15px rgba(0, 0, 0, 0.1)',
                                                        backgroundColor: theme.palette.mode === 'dark'
                                                            ? 'rgba(30, 30, 40, 0.95)'
                                                            : 'rgba(255, 255, 255, 0.95)',
                                                        backdropFilter: 'blur(10px)',
                                                    }
                                                }
                                            }}
                                        >
                                            <MenuItem value="newest">Шинэ эхэндээ</MenuItem>
                                            <MenuItem value="name">Нэрээр</MenuItem>
                                            <MenuItem value="price">Үнээр</MenuItem>
                                        </Select>

                                    </FormControl>

                                </Grid>
                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                    <InputLabel>Дараалал</InputLabel>
                                    <Select
                                        name="sortDirection"
                                        value={filters.sortDirection}
                                        label="Дараалал"
                                        onChange={handleFilterChange}
                                        sx={{
                                            borderRadius: '10px',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'
                                            }
                                        }}
                                    >
                                        <MenuItem value="asc">Өсөхөөр</MenuItem>
                                        <MenuItem value="desc">Буурахаар</MenuItem>
                                    </Select>
                                </FormControl>

                                <Button
                                    variant="outlined"
                                    onClick={handleResetFilters}
                                    startIcon={<RestartAltIcon />}
                                    sx={{
                                        borderRadius: '10px',
                                        height: '40px',
                                        borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                                        color: darkMode ? '#fff' : '#333',
                                        '&:hover': {
                                            borderColor: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
                                            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                                        }
                                    }}
                                >
                                    Цэвэрлэх
                                </Button>
                                    
                                </Grid>
                                
                                
                                <Box sx={{ 
                                    mt: 3, 
                                    pt: 3, 
                                    borderTop: '1px solid',
                                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 2
                                }}>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        {products.length} бүтээгдэхүүн олдлоо
                                    </Typography>
                          
                                    
                                 
                                </Box>
                            </Paper>
                        </Grow>
                        
                        {/* Products Section */}
                        {loading ? (
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                flexDirection: 'column',
                                gap: 3,
                                minHeight: '300px'
                            }}>
                                <CircularProgress 
                                    size={60} 
                                    thickness={4} 
                                    sx={{
                                        color: 'linear-gradient(45deg, #6d42ff, #4b6eff)'
                                    }}
                                />
                                <Typography variant="h6" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                                    Бүтээгдэхүүн ачаалж байна...
                                </Typography>
                            </Box>
                        ) : error ? (
                            <Box sx={{ 
                                textAlign: 'center', 
                                my: 5,
                                p: 4,
                                backgroundColor: darkMode ? 'rgba(255, 50, 50, 0.1)' : 'rgba(255, 50, 50, 0.05)',
                                borderRadius: 2
                            }}>
                                <Typography color="error">{error}</Typography>
                            </Box>
                        ) : products.length === 0 ? (
                            <Box sx={{ 
                                textAlign: 'center', 
                                my: 5,
                                p: 4,
                                backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                                borderRadius: 2
                            }}>
                                <Typography variant="h6" sx={{ color: darkMode ? '#fff' : '#333' }}>Бүтээгдэхүүн олдсонгүй</Typography>
                            </Box>
                        ) : (
                            <Grow in={true} timeout={1200}>
                                <Box className="fade-in">
                    <SmartTvSection 
                        products={products} 
                                        loading={false} 
                                        error={null}
                        darkMode={darkMode}
                                        categoryTitle="Ухаалаг ТВ"
                    />
                </Box>
                            </Grow>
                        )}
                    </Box>
                </div>
            </Layout>
        );
        };
        
export default CatSmartTv;
        