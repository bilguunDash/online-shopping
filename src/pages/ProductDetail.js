    // pages/ProductDetail.js
    import React, { useState, useEffect } from "react";
    import { useRouter } from "next/router";
    import Layout from "../components/Layout";
    import api from "../utils/axios";
    import ProdDetailSection from "../components/ProdDetailSection";
    import { Box, useTheme } from "@mui/material";

    const ProductDetail = ({ darkMode, toggleDarkMode }) => {
        const router = useRouter();
        const { id } = router.query;
        const [product, setProduct] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const theme = useTheme();

        useEffect(() => {
            // Exit early if router is not ready or no id is provided
            if (!router.isReady || !id) return;

            console.log("Loading product details for ID:", id);
            setLoading(true);

            // Try to get product data from localStorage first
            let foundInLocalStorage = false;
            try {
                const storedProduct = localStorage.getItem('selectedProduct');
                if (storedProduct) {
                    const parsedProduct = JSON.parse(storedProduct);
                    console.log("Product from localStorage:", parsedProduct);
                    
                    // More comprehensive ID checking - ensure we're handling all ID formats
                    const productId = String(parsedProduct.id || parsedProduct.productId || '');
                    const routerId = String(id);
                    
                    console.log(`Comparing IDs: product=${productId}, router=${routerId}`);
                    
                    if (parsedProduct && (productId === routerId)) {
                        console.log("Using product from localStorage - ID match");
                        setProduct(parsedProduct);
                        setLoading(false);
                        foundInLocalStorage = true;
                    }
                }
            } catch (err) {
                console.error("Error retrieving product from localStorage:", err);
            }

            // If product not found in localStorage or doesn't match ID, fetch from API
            if (!foundInLocalStorage) {
                fetchProductFromAPI(id);
            }
        }, [router.isReady, id]);
        
        // Separate function to fetch product from API
        const fetchProductFromAPI = async (productId) => {
            console.log("Fetching product from API for ID:", productId);
            try {
                // First try the standard product endpoint
                try {
                    const response = await api.get(`http://localhost:8083/product/${productId}`);
                    console.log("API response:", response.data);
                    if (response.data) {
                        // Ensure we have a complete product object
                        const completeProduct = {
                            ...response.data,
                            id: response.data.id || productId
                        };
                        setProduct(completeProduct);
                        localStorage.setItem('selectedProduct', JSON.stringify(completeProduct));
                        console.log("Set product from API:", completeProduct);
                        return;
                    }
                } catch (err) {
                    console.error("Error fetching from primary endpoint:", err);
                }
                
                // If that fails, try the search endpoint to find by ID
                try {
                    const searchResponse = await api.get(`/product/search?keyword=${productId}`);
                    console.log("Search API response:", searchResponse.data);
                    
                    const results = searchResponse.data.content || searchResponse.data || [];
                    // Find exact match or first result
                    const matchedProduct = results.find(p => 
                        String(p.id) === String(productId) || 
                        String(p.productId) === String(productId)
                    ) || results[0];
                    
                    if (matchedProduct) {
                        const completeProduct = {
                            ...matchedProduct,
                            id: matchedProduct.id || matchedProduct.productId || productId
                        };
                        setProduct(completeProduct);
                        localStorage.setItem('selectedProduct', JSON.stringify(completeProduct));
                        console.log("Set product from search API:", completeProduct);
                        return;
                    }
                } catch (err) {
                    console.error("Error fetching from search endpoint:", err);
                }
                
                // If we get here, no product was found
                setError("Product not found. Please try another product.");
                
            } catch (err) {
                console.error("Error in fetch process:", err);
                setError("Failed to load product details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

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
                    <ProdDetailSection 
                        product={product} 
                        loading={loading} 
                        error={error}
                        darkMode={darkMode}
                    />
                </Box>
            </Layout>
        );
    };
        
export default ProductDetail;
        