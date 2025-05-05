// pages/Products.js
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import noAuthApi from "../utils/noAuthApi";
import ProductSection from "../components/AllProductsSection";
import { Box, useTheme, Snackbar, Alert } from "@mui/material";
import api from "../utils/axios";

const Products = ({ darkMode, toggleDarkMode }) => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await noAuthApi.get("/product/all-products");
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
                message: response.data?.message || `${product.title || product.name} added to cart!`,
                severity: 'success'
            });
        } catch (err) {
            console.error("Error adding item to cart:", err);
            // Check if the error is related to stock availability
            const errorMessage = err.response?.data?.message || err.message;
            setSnackbar({
                open: true,
                message: errorMessage.includes('stock') ? errorMessage : "Failed to add item to cart. Please try again.",
                severity: 'error'
            });
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
                    zIndex: 1,
                }}
            >
                <ProductSection
                    products={products}
                    loading={loading}
                    error={error}
                    darkMode={darkMode}
                    onAddToCart={handleAddToCart}
                />
            </Box>

            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={3000} 
                onClose={() => setSnackbar({...snackbar, open: false})}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbar({...snackbar, open: false})} 
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Layout>
    );
};

export default Products;