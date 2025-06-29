    // pages/home.js
    import React, { useState, useEffect } from "react";
    import Layout from "../components/layout/Layout";
    import api from "../utils/axios";
    import PhoneSection from "../components/categories/CategoriesLaptop";
    import { Box, useTheme, FormControl, InputLabel, Select, MenuItem, Button, Grid, Typography, Divider, Paper, Container, Fade, Grow, Chip, CircularProgress } from "@mui/material";
    import FilterAltIcon from '@mui/icons-material/FilterAlt';
    import SortIcon from '@mui/icons-material/Sort';
    import TuneIcon from '@mui/icons-material/Tune';
    import RestartAltIcon from '@mui/icons-material/RestartAlt';
    import LaptopMacIcon from '@mui/icons-material/LaptopMac';
    import Head from 'next/head';

    const CatLaptop = ({ darkMode, toggleDarkMode }) => {
        const [products, setProducts] = useState([]);
        const [error, setError] = useState(null);
        const [loading, setLoading] = useState(true);
        const [filterOptions, setFilterOptions] = useState({
            colors: [],
            storageSizes: [],
            ramSizes: [],
            displayOptions: [],
            graphicsOptions: [],
            processorOptions: []
        });
        const [filters, setFilters] = useState({
            categoryId: 5,
            color: '',
            storageGb: '',
            ramGb: '',
            display: '',
            graphics: '',
            processor: '',
            sortBy: 'newest',
            sortDirection: 'desc'
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
    
        useEffect(() => {
            fetchFilterOptions();
        }, []);

        useEffect(() => {
            fetchFilteredProducts();
            
            // Count active filters (excluding categoryId, sortBy, and sortDirection)
            const count = Object.keys(filters).filter(key => 
                !['categoryId', 'sortBy', 'sortDirection'].includes(key) && 
                filters[key] !== ''
            ).length;
            
            setActiveFiltersCount(count);
        }, [filters]);

        const fetchFilterOptions = async () => {
            try {
                const response = await api.get("/product/filter/options", {
                    params: { categoryId: 5 } // Laptop category ID
                });
                
                // Update filterOptions state with the received data
                // Make sure we handle all the fields returned by the backend
                setFilterOptions({
                    colors: response.data.colors || [],
                    storageSizes: response.data.storageSizes || [],
                    ramSizes: response.data.ramSizes || [],
                    displayOptions: response.data.displayOptions || [],
                    graphicsOptions: response.data.graphicsOptions || [],
                    processorOptions: response.data.processorOptions || []
                });
            } catch (err) {
                console.error("Error fetching filter options:", err);
                // Set default empty values if the API call fails
                setFilterOptions({
                    colors: [],
                    storageSizes: [],
                    ramSizes: [],
                    displayOptions: [],
                    graphicsOptions: [],
                    processorOptions: []
                });
                setError("Шүүлтүүрийн сонголтуудыг ачаалахад алдаа гарлаа. Дахин оролдоно уу.");
            }
        };

        const fetchFilteredProducts = async () => {
            setLoading(true);
            try {
                // Remove empty filter values
                const params = {};
                Object.keys(filters).forEach(key => {
                    if (filters[key] !== '') {
                        params[key] = filters[key];
                    }
                });
                
                // Use a try-catch with better error handling
                try {
                    // Use POST method with request body instead of GET with query params
                    const response = await api.post("/product/filter/search", params);
                    
                    // Filter out duplicate products (different views of the same product)
                    const uniqueProducts = [];
                    const productIds = new Set();
                    
                    if (Array.isArray(response.data)) {
                        response.data.forEach(product => {
                            // If we haven't seen this product ID yet, add it to our filtered list
                            if (!productIds.has(product.id)) {
                                productIds.add(product.id);
                                uniqueProducts.push(product);
                            }
                        });
                        
                        console.log(`Filtered ${response.data.length - uniqueProducts.length} duplicate products`);
                        setProducts(uniqueProducts);
                    } else {
                        setProducts(response.data || []);
                    }
                } catch (apiError) {
                    // Fallback to getting all products without filtering
                    console.error("Error with filtered search, trying to get all products:", apiError);
                    // Using a simple GET for the fallback since we're just getting all products
                    const fallbackResponse = await api.get("/product/category/5");
                    setProducts(Array.isArray(fallbackResponse.data) ? fallbackResponse.data : []);
                }
            } catch (err) {
                setError("Failed to load products. Please try again later.");
                console.error("Error fetching products:", err);
                setProducts([]); // Set empty products on error
            } finally {
                setLoading(false);
            }
        };

        const handleFilterChange = (e) => {
            const { name, value } = e.target;
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        };

        const handleResetFilters = () => {
            setFilters({
                categoryId: 5,
                color: '',
                storageGb: '',
                ramGb: '',
                display: '',
                graphics: '',
                processor: '',
                sortBy: 'newest',
                sortDirection: 'desc'
            });
        };

        const getActiveFilterValue = (name) => {
            const value = filters[name];
            if (!value) return null;
            
            // Format specific filter values
            if (name === 'storageGb' || name === 'ramGb') {
                return `${value}GB`;
            }
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
                                        Зөөврийн компьютер
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
                                            Хүчирхэг, найдвартай зөөврийн компьютерүүдийг танд санал болгож байна
                                        </Typography>
                                    </Box>
                                </Box>
                            </Container>
                        </Fade>

                    {/* Filter Section */}
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
                                            
                                            {activeFiltersCount > 0 && (
                                                <Chip 
                                                    label={`${activeFiltersCount} идэвхтэй шүүлтүүр`}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ fontWeight: 500 }}
                                                />
                                            )}
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
                                            {['color', 'storageGb', 'ramGb', 'display', 'graphics', 'processor'].map(filter => {
                                                const value = getActiveFilterValue(filter);
                                                if (!value) return null;
                                                
                                                const label = {
                                                    color: 'Өнгө',
                                                    storageGb: 'Хадгалалт',
                                                    ramGb: 'RAM',
                                                    display: 'Дэлгэц',
                                                    graphics: 'Графикс',
                                                    processor: 'Процессор'
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
                                            
                                            {activeFiltersCount > 0 && (
                                                <Chip
                                                    label="Бүгдийг арилгах"
                                                    onClick={handleResetFilters}
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                    sx={{
                                                        fontWeight: 500,
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            )}
                                </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                            <InputLabel>Өнгө</InputLabel>
                                    <Select
                                        name="color"
                                        value={filters.color}
                                                label="Өнгө"
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
                                                <MenuItem value="">Бүх өнгө</MenuItem>
                                        {filterOptions.colors.map((color, index) => (
                                            <MenuItem key={index} value={color || ''}>
                                                        {color || 'Тодорхойгүй'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                            <InputLabel>Хадгалалт (GB)</InputLabel>
                                    <Select
                                        name="storageGb"
                                        value={filters.storageGb}
                                                label="Хадгалалт (GB)"
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
                                                <MenuItem value="">Бүх хадгалалт</MenuItem>
                                        {filterOptions.storageSizes.map((size, index) => (
                                            <MenuItem key={index} value={size}>{size}GB</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>RAM (GB)</InputLabel>
                                    <Select
                                        name="ramGb"
                                        value={filters.ramGb}
                                        label="RAM (GB)"
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
                                                <MenuItem value="">Бүх RAM</MenuItem>
                                        {filterOptions.ramSizes.map((size, index) => (
                                            <MenuItem key={index} value={size}>{size}GB</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                            <InputLabel>Дэлгэц</InputLabel>
                                    <Select
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
                                                <MenuItem value="">Бүх дэлгэц</MenuItem>
                                        {filterOptions.displayOptions && filterOptions.displayOptions.map((option, index) => (
                                            <MenuItem key={index} value={option}>{option}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                            <InputLabel>Графикс</InputLabel>
                                    <Select
                                        name="graphics"
                                        value={filters.graphics}
                                                label="Графикс"
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
                                                <MenuItem value="">Бүх графикс</MenuItem>
                                        {filterOptions.graphicsOptions && filterOptions.graphicsOptions.map((option, index) => (
                                            <MenuItem key={index} value={option}>{option}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                            <InputLabel>Процессор</InputLabel>
                                    <Select
                                        name="processor"
                                        value={filters.processor}
                                                label="Процессор"
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
                                                <MenuItem value="">Бүх процессор</MenuItem>
                                        {filterOptions.processorOptions && filterOptions.processorOptions.map((option, index) => (
                                            <MenuItem key={index} value={option}>{option}</MenuItem>
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
                        ) : (
                            <Grow in={true} timeout={1200}>
                                <Box className="fade-in">
                    <PhoneSection 
                        products={products} 
                                        loading={false} 
                        error={error}
                        darkMode={darkMode}
                    />
                </Box>
                            </Grow>
                        )}
                    </Box>
                </div>
            </Layout>
        );
    };
        
export default CatLaptop;
        