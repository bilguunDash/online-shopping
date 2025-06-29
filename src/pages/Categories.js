// pages/home.js
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import api from "../utils/axios";
import PhoneSection from "../components/products/PhoneSection";
import TabletSection from "../components/products/TabletSection";
import LaptopSection from "../components/products/LaptopSection";
import DeskPcSection from "../components/products/DeskPcSection";
import HeadPhoneSection from "../components/products/HeadPhoneSection";
import SmartTvSection from "../components/products/SmartTvSection";
import { Box, useTheme, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton, Fade } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Layout from "../components/layout/Layout";
import { useRouter } from 'next/router';
import Head from 'next/head';

const Products = ({ darkMode, toggleDarkMode }) => {
    // Separate states for phones and tablets
    const [phoneProducts, setPhoneProducts] = useState([]);
    const [tabletProducts, setTabletProducts] = useState([]);
    const [laptopProducts, setLaptopProducts] = useState([]);
    const [deskProducts, setDeskProducts] = useState([]);
    const [headPhoneProducts, setHeadPhoneProducts] = useState([]);
    const [smartTvProducts, setSmartTvProducts] = useState([]);

    const [phoneError, setPhoneError] = useState(null);
    const [tabletError, setTabletError] = useState(null);
    const [laptopError, setLaptopError] = useState(null);
    const [deskError, setDeskError] = useState(null);
    const [headPhoneError, setHeadPhoneError] = useState(null);
    const [smartTvError, setSmartTvError] = useState(null);

    const [phoneLoading, setPhoneLoading] = useState(true);
    const [deskLoading, setDeskLoading] = useState(true);
    const [headPhoneLoading, setHeadPhoneLoading] = useState(true);
    const [smartTvLoading, setSmartTvLoading] = useState(true);
    const [tabletLoading, setTabletLoading] = useState(true);
    const [laptopLoading, setLaptopLoading] = useState(true);
    const theme = useTheme();
    const router = useRouter();

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginPromptOpen, setLoginPromptOpen] = useState(false);
    const [loginPromptMessage, setLoginPromptMessage] = useState('Сагсанд бараа нэмэхийн тулд нэвтэрнэ үү');

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
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .section-container {
                animation: fadeIn 0.6s ease-out forwards;
                opacity: 0;
            }
            
            .section-container:nth-child(1) { animation-delay: 0.1s; }
            .section-container:nth-child(2) { animation-delay: 0.2s; }
            .section-container:nth-child(3) { animation-delay: 0.3s; }
            .section-container:nth-child(4) { animation-delay: 0.4s; }
            .section-container:nth-child(5) { animation-delay: 0.5s; }
            .section-container:nth-child(6) { animation-delay: 0.6s; }
        `;
    };

    // Check authentication status on component mount
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        setIsLoggedIn(!!token);
    }, []);

    // Fetch phone products
    useEffect(() => {
        const fetchPhoneProducts = async () => {
            try {
                const response = await api.get("http://localhost:8083/product/phone");
                
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
                    
                    console.log(`Filtered ${response.data.length - uniqueProducts.length} duplicate phone products`);
                    setPhoneProducts(uniqueProducts);
                } else {
                    setPhoneProducts(response.data || []);
                }
            } catch (err) {
                setPhoneError("Утасны бүтээгдэхүүн ачаалахад алдаа гарлаа. Дахин оролдоно уу.");
                console.error("Error fetching phone products:", err);
            } finally {
                setPhoneLoading(false);
            }
        };

        fetchPhoneProducts();
    }, []);

    // Fetch laptop products
    useEffect(() => {
        const fetchLaptopProducts = async () => {
            try {
                const response = await api.get("http://localhost:8083/product/laptop");
                
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
                    
                    console.log(`Filtered ${response.data.length - uniqueProducts.length} duplicate laptop products`);
                    setLaptopProducts(uniqueProducts);
                } else {
                    setLaptopProducts(response.data || []);
                }
            } catch (err) {
                setLaptopError("Зөөврийн компьютер ачаалахад алдаа гарлаа. Дахин оролдоно уу.");
                console.error("Error fetching laptop products:", err);
            } finally {
                setLaptopLoading(false);
            }
        };

        fetchLaptopProducts();
    }, []);

    //Fetch tablet products
    useEffect(() => {
        const fetchTabletProducts = async () => {
            try {
                const response = await api.get("http://localhost:8083/product/Tablet");
                
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
                    
                    console.log(`Filtered ${response.data.length - uniqueProducts.length} duplicate tablet products`);
                    setTabletProducts(uniqueProducts);
                } else {
                    setTabletProducts(response.data || []);
                }
            } catch (err) {
                setTabletError("Таблет ачаалахад алдаа гарлаа. Дахин оролдоно уу.");
                console.error("Error fetching tablet products:", err);
            } finally {
                setTabletLoading(false);
            }
        };

        fetchTabletProducts();
    }, []);

    //Fetch desktop computer products
    useEffect(() => {
        const fetchDeskProducts = async () => {
            try {
                const response = await api.get("http://localhost:8083/product/pc");
                
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
                    
                    console.log(`Filtered ${response.data.length - uniqueProducts.length} duplicate PC products`);
                    setDeskProducts(uniqueProducts);
                } else {
                    setDeskProducts(response.data || []);
                }
            } catch (err) {
                setDeskError("Суурин компьютер ачаалахад алдаа гарлаа. Дахин оролдоно уу.");
                console.error("Error fetching PC products:", err);
            } finally {
                setDeskLoading(false);
            }
        };

        fetchDeskProducts();
    }, []);


    //Fetch headPhone products
    useEffect(() => {
        const fetchHeadPhoneProducts = async () => {
            try {
                const response = await api.get("http://localhost:8083/product/Headphone");
                
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
                    
                    console.log(`Filtered ${response.data.length - uniqueProducts.length} duplicate headphone products`);
                    setHeadPhoneProducts(uniqueProducts);
                } else {
                    setHeadPhoneProducts(response.data || []);
                }
            } catch (err) {
                setHeadPhoneError("Чихэвч ачаалахад алдаа гарлаа. Дахин оролдоно уу.");
                console.error("Error fetching headphone products:", err);
            } finally {
                setHeadPhoneLoading(false);
            }
        };

        fetchHeadPhoneProducts();
    }, []);

    //Fetch smartTv products
    useEffect(() => {
        const fetchSmartTvProducts = async () => {
            try {
                const response = await api.get("http://localhost:8083/product/SmartTv");
                
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
                    
                    console.log(`Filtered ${response.data.length - uniqueProducts.length} duplicate Smart TV products`);
                    setSmartTvProducts(uniqueProducts);
                } else {
                    setSmartTvProducts(response.data || []);
                }
            } catch (err) {
                setSmartTvError("Ухаалаг ТВ ачаалахад алдаа гарлаа. Дахин оролдоно уу.");
                console.error("Error fetching Smart TV products:", err);
            } finally {
                setSmartTvLoading(false);
            }
        };

        fetchSmartTvProducts();
    }, []);

    // Handle require login
    const handleRequireLogin = (message = 'Сагсанд бараа нэмэхийн тулд нэвтэрнэ үү') => {
        setLoginPromptMessage(message);
        setLoginPromptOpen(true);
    };
    
    // Handle login navigation
    const handleNavigateToLogin = () => {
        setLoginPromptOpen(false);
        router.push('/login');
    };

    const handleAddToCart = async (e, product) => {
        e.stopPropagation(); // Prevent card click when clicking the button
        
        // Check if user is authenticated
        if (!isLoggedIn) {
            handleRequireLogin('Сагсанд бараа нэмэхийн тулд нэвтэрнэ үү');
            return;
        }
        
        try {
            // First check if we need to create a cart (first item)
            try {
                await api.post("http://localhost:8083/cart");
            } catch (err) {
                // Cart likely already exists, continue
                console.log("Cart exists or error occurred:", err);
                // If the error is 403, it means user is not authenticated
                if (err.response && err.response.status === 403) {
                    setIsLoggedIn(false);
                    handleRequireLogin('Таны холболт дууссан. Дахин нэвтэрнэ үү.');
                    return;
                }
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
                message: response.data?.message || `${product.title || product.name} сагсанд нэмэгдлээ!`,
                severity: 'success'
            });
        } catch (err) {
            console.error("Error adding item to cart:", err);
            
            // Handle 403 Forbidden specifically (authentication error)
            if (err.response && err.response.status === 403) {
                setIsLoggedIn(false);
                handleRequireLogin('Таны холболт дууссан. Дахин нэвтэрнэ үү.');
                return;
            }
            
            // Check if the error is related to stock availability
            const errorMessage = err.response?.data?.message || err.message;
            setSnackbar({
                open: true,
                message: errorMessage.includes('stock') ? errorMessage : "Сагсанд бараа нэмэхэд алдаа гарлаа. Дахин оролдоно уу.",
                severity: 'error'
            });
        }
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
                    <div className="section-container">
                <PhoneSection 
                    products={phoneProducts} 
                    loading={phoneLoading} 
                    error={phoneError} 
                    darkMode={darkMode}
                    onAddToCart={handleAddToCart}
                />
                    </div>
                    
                    <div className="section-container">
                <TabletSection 
                    products={tabletProducts} 
                    loading={tabletLoading} 
                    error={tabletError} 
                    darkMode={darkMode}
                    onAddToCart={handleAddToCart}
                />
                    </div>
                    
                    <div className="section-container">
                <LaptopSection 
                    products={laptopProducts} 
                    loading={laptopLoading} 
                    error={laptopError} 
                    darkMode={darkMode}
                    onAddToCart={handleAddToCart}
                />
                    </div>
                    
                    <div className="section-container">
                <DeskPcSection 
                    products={deskProducts} 
                    loading={deskLoading} 
                    error={deskError} 
                    darkMode={darkMode}
                    onAddToCart={handleAddToCart}
                />
                    </div>
                    
                    <div className="section-container">
                <HeadPhoneSection 
                    products={headPhoneProducts} 
                    loading={headPhoneLoading} 
                    error={headPhoneError} 
                    darkMode={darkMode}
                    onAddToCart={handleAddToCart}
                />
                    </div>
                    
                    <div className="section-container">
                <SmartTvSection 
                    products={smartTvProducts} 
                    loading={smartTvLoading} 
                    error={smartTvError} 
                    darkMode={darkMode}
                    onAddToCart={handleAddToCart}
                />
                    </div>
            </Box>
            </div>

            {/* Login Prompt Dialog */}
            <Dialog
                open={loginPromptOpen}
                onClose={() => setLoginPromptOpen(false)}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Fade}
                transitionDuration={400}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                        background: theme.palette.mode === 'dark' 
                            ? 'linear-gradient(145deg, #1e1e2f, #272736)'
                            : 'linear-gradient(145deg, #ffffff, #f5f5ff)',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    pb: 1, 
                    pt: 3,
                    background: theme.palette.mode === 'dark' 
                        ? 'linear-gradient(90deg, #2e2e45, #252538)'
                        : 'linear-gradient(90deg, #f0f0ff, #e8e8ff)',
                }}>
                    <Typography variant="h5" fontWeight={600} sx={{ 
                        color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                        fontFamily: '"Poppins", sans-serif',
                    }}>
                        Нэвтрэх шаардлагатай
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={() => setLoginPromptOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            color: theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ py: 3, px: 4 }}>
                    <Box sx={{ py: 2, textAlign: 'center' }}>
                        <Typography variant="body1" paragraph sx={{ fontSize: '1.05rem' }}>
                            {loginPromptMessage}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, background: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)' }}>
                    <Button
                        onClick={() => setLoginPromptOpen(false)}
                        variant="outlined"
                        sx={{ 
                            borderRadius: '8px',
                            px: 3,
                            color: theme.palette.mode === 'dark' ? '#aaa' : '#555',
                            borderColor: theme.palette.mode === 'dark' ? '#555' : '#ddd',
                            '&:hover': {
                                borderColor: theme.palette.mode === 'dark' ? '#777' : '#bbb',
                                background: 'rgba(0,0,0,0.05)'
                            }
                        }}
                    >
                        Цуцлах
                    </Button>
                    <Button
                        onClick={handleNavigateToLogin}
                        variant="contained"
                        color="primary"
                        sx={{ 
                            textTransform: 'none',
                            fontSize: '1rem',
                            borderRadius: '8px',
                            px: 3,
                            background: 'linear-gradient(45deg, #6d42ff, #4b6eff)',
                            boxShadow: '0 4px 15px rgba(75, 110, 255, 0.35)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #5a35e0, #3c5ce0)',
                                boxShadow: '0 6px 20px rgba(75, 110, 255, 0.5)',
                            }
                        }}
                    >
                        Нэвтрэх хуудас руу очих
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification */}
            {snackbar.open && typeof document !== 'undefined' && ReactDOM.createPortal(
                <div
                    style={{
                        position: 'fixed',
                        bottom: 30,
                        right: 30,
                        zIndex: 99999,
                        backgroundColor: 
                            snackbar.severity === 'success' ? '#3cb371' : 
                            snackbar.severity === 'error' ? '#f44336' : 
                            snackbar.severity === 'warning' ? '#ff9800' : 
                            '#2196f3',
                        color: 'white',
                        padding: '14px 20px',
                        borderRadius: '12px',
                        boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
                        maxWidth: '400px',
                        width: 'auto',
                        animation: 'slideIn 0.3s ease-out',
                    }}
            >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem', mr: 2 }}>
                    {snackbar.message}
                        </Typography>
                        <IconButton 
                            size="small" 
                            onClick={() => setSnackbar({...snackbar, open: false})} 
                            sx={{ color: 'white', mt: -0.5, mr: -0.5 }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </div>,
                document.body
            )}
        </Layout>
    );
};

export default Products;