    // pages/ProdCart.js
    import React, { useState, useEffect } from "react";
    import Layout from "../components/Layout";
    import api from "../utils/axios";
    import ProdCartSection from "../components/ProdCartSection";
    import { Box, useTheme } from "@mui/material";

    const ProdCart = ({ darkMode, toggleDarkMode }) => {
        const [cartItems, setCartItems] = useState([]);
        const [error, setError] = useState(null);
        const [loading, setLoading] = useState(true);
        const theme = useTheme();

        useEffect(() => {
            const fetchCartItems = async () => {
                try {
                    // Get cart contents
                    const response = await api.get("http://localhost:8083/cart/view-cart");
                    setCartItems(response.data || []);
                    console.log("Cart items:", response.data);
                } catch (err) {
                    setError("Failed to load cart items. Please try again.");
                    console.error("Error fetching cart items:", err);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchCartItems();
        }, []);

        return (
            <Layout>
                <Box
                    sx={{
                        position: 'relative',
                        minHeight: '100vh',
                        backgroundImage: theme.palette.mode === 'dark'
                            ? `
                                linear-gradient(180deg, rgba(88, 90, 228, 0.05) 0%, rgba(30, 30, 30, 0.01) 50%, rgba(142, 36, 170, 0.05) 100%),
                                repeating-linear-gradient(45deg, rgba(88, 90, 228, 0.03) 0%, rgba(88, 90, 228, 0.03) 1px, transparent 1px, transparent 20px),
                                repeating-linear-gradient(135deg, rgba(142, 36, 170, 0.03) 0%, rgba(142, 36, 170, 0.03) 1px, transparent 1px, transparent 20px)
                            `
                            : `
                                linear-gradient(180deg, rgba(88, 90, 228, 0.03) 0%, rgba(255, 255, 255, 0) 50%, rgba(142, 36, 170, 0.03) 100%),
                                repeating-linear-gradient(45deg, rgba(88, 90, 228, 0.01) 0%, rgba(88, 90, 228, 0.01) 1px, transparent 1px, transparent 20px),
                                repeating-linear-gradient(135deg, rgba(142, 36, 170, 0.01) 0%, rgba(142, 36, 170, 0.01) 1px, transparent 1px, transparent 20px)
                            `,
                        padding: '20px 0',
                    }}
                >
                    <ProdCartSection 
                        cartItems={cartItems} 
                        setCartItems={setCartItems}
                        loading={loading} 
                        error={error}
                        darkMode={darkMode}
                    />
                </Box>
                </Layout>
        );
    };
        
export default ProdCart;
        