    // pages/home.js
    import React, { useState, useEffect } from "react";
    import Layout from "../components/Layout";
    import api from "../utils/axios";
    import PhoneSection from "../components/CategoriesPhone";
    import { Box, useTheme } from "@mui/material";

    const CatPhone = ({ darkMode, toggleDarkMode }) => {
        const [products, setProducts] = useState([]);
        const [error, setError] = useState(null);
        const [loading, setLoading] = useState(true);
        const theme = useTheme();
    
        useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get("http://localhost:8083/product/pc");
            setProducts(response.data);
            } catch (err) {
            setError("Failed to load products. Please try again.");
            console.error("Error fetching products:", err);
            } finally {
            setLoading(false);
            }
        };
        
        fetchProducts();
        }, []);

        return (
            <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
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
                    <PhoneSection 
                        products={products} 
                        loading={loading} 
                        error={error}
                        darkMode={darkMode}
                    />
                </Box>
            </Layout>
        );
        };
        
export default CatPhone;
        