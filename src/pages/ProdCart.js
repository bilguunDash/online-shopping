    // pages/ProdCart.js
    import React, { useState, useEffect } from "react";
    import Layout from "../components/layout/Layout";
    import api from "../utils/axios";
    import ProdCartSection from "../components/pages/ProdCartSection";
    import { Box, Typography, useTheme, CircularProgress, Fade, Alert } from "@mui/material";
    import { useRouter } from 'next/router';
    import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

    const ProdCart = ({ darkMode, toggleDarkMode }) => {
        const [cartItems, setCartItems] = useState([]);
        const [error, setError] = useState(null);
        const [loading, setLoading] = useState(true);
        const theme = useTheme();
        const router = useRouter();

        useEffect(() => {
            const fetchCartItems = async () => {
                try {
                    // Check if user is logged in
                    const token = localStorage.getItem('jwt');
                    if (!token) {
                        router.push('/login');
                        return;
                    }

                    // Get cart contents
                    const response = await api.get("/cart/view-cart");
                    setCartItems(response.data || []);
                    console.log("Cart items:", response.data);
                } catch (err) {
                    setError("Сагсны мэдээллийг ачаалж чадсангүй. Дахин оролдоно уу.");
                    console.error("Error fetching cart items:", err);
                    
                    // If error is auth-related, redirect to login
                    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                        router.push('/login');
                    }
                } finally {
                    setLoading(false);
                }
            };
            
            fetchCartItems();

            // Add listener for auth errors
            const handleAuthError = () => {
                router.push('/login');
            };

            window.addEventListener('authError', handleAuthError);
            
            // Cleanup
            return () => {
                window.removeEventListener('authError', handleAuthError);
            };
        }, [router]);

        return (
            <Layout>
                <Fade in={true} timeout={800}>
                    <Box
                        sx={{
                            position: 'relative',
                            minHeight: '90vh',
                            backgroundImage: darkMode
                                ? `
                                    linear-gradient(180deg, rgba(88, 90, 228, 0.08) 0%, rgba(30, 30, 30, 0.02) 50%, rgba(142, 36, 170, 0.08) 100%),
                                    repeating-linear-gradient(45deg, rgba(88, 90, 228, 0.05) 0%, rgba(88, 90, 228, 0.05) 1px, transparent 1px, transparent 20px),
                                    repeating-linear-gradient(135deg, rgba(142, 36, 170, 0.05) 0%, rgba(142, 36, 170, 0.05) 1px, transparent 1px, transparent 20px)
                                `
                                : `
                                    linear-gradient(180deg, rgba(88, 90, 228, 0.05) 0%, rgba(255, 255, 255, 0) 50%, rgba(142, 36, 170, 0.05) 100%),
                                    repeating-linear-gradient(45deg, rgba(88, 90, 228, 0.02) 0%, rgba(88, 90, 228, 0.02) 1px, transparent 1px, transparent 20px),
                                    repeating-linear-gradient(135deg, rgba(142, 36, 170, 0.02) 0%, rgba(142, 36, 170, 0.02) 1px, transparent 1px, transparent 20px)
                                `,
                            padding: '30px 0',
                        }}
                    >
                        {/* Page Header */}
                        <Box 
                            sx={{
                                textAlign: 'center',
                                mb: 4,
                                mt: 2,
                                px: 3
                            }}
                        >
                            <Typography 
                                variant="h3" 
                                component="h1"
                                sx={{
                                    fontSize: { xs: '2rem', md: '2.5rem' },
                                    fontWeight: 700,
                                    color: darkMode ? '#f0f0ff' : '#303050',
                                    position: 'relative',
                                    display: 'inline-block',
                                    mb: 1.5,
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: '-12px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: '80px',
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #6d42ff, #4b6eff)',
                                        borderRadius: '2px'
                                    }
                                }}
                            >
                                <ShoppingCartIcon sx={{ mr: 1.5, fontSize: 'inherit', verticalAlign: 'middle' }} />
                                Миний сагс
                            </Typography>
                            <Typography 
                                variant="body1"
                                sx={{
                                    maxWidth: '600px',
                                    mx: 'auto',
                                    mt: 3,
                                    color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                    fontWeight: 400
                                }}
                            >
                                Таны сонгосон бүтээгдэхүүнүүд энд хадгалагдаж, захиалга хийх боломжтой.
                            </Typography>
                        </Box>
                        
                        {/* Loading State */}
                        {loading && (
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    height: '50vh',
                                    gap: 3
                                }}
                            >
                                <CircularProgress 
                                    size={60} 
                                    thickness={4} 
                                    sx={{ 
                                        color: '#6039f0',
                                        opacity: 0.8
                                    }} 
                                />
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                                        fontWeight: 500
                                    }}
                                >
                                    Сагсны мэдээллийг ачааллаж байна...
                                </Typography>
                            </Box>
                        )}
                        
                        {/* Error State */}
                        {!loading && error && (
                            <Box 
                                sx={{ 
                                    maxWidth: '800px', 
                                    mx: 'auto', 
                                    mt: 4, 
                                    px: 3 
                                }}
                            >
                                <Alert 
                                    severity="error" 
                                    variant="filled"
                                    sx={{ 
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                        py: 2
                                    }}
                                >
                                    {error}
                                </Alert>
                            </Box>
                        )}

                        {/* Cart Content */}
                        {!loading && !error && (
                            <ProdCartSection 
                                cartItems={cartItems} 
                                setCartItems={setCartItems}
                                loading={loading} 
                                error={error}
                                darkMode={darkMode}
                            />
                        )}
                    </Box>
                </Fade>
            </Layout>
        );
    };
        
export default ProdCart;
        