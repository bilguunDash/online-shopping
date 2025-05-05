// pages/home.js
import React, { useState, useEffect } from "react";
import api from "../utils/axios";
import PhoneSection from "../components/PhoneSection";
import TabletSection from "../components/TabletSection";
import LaptopSection from "../components/LaptopSection";
import DeskPCSection from "../components/DeskPcSection";
import HeadPhoneSection from "../components/HeadPhoneSection";
import SmartTvSection from "../components/SmartTvSection";
import { Box, useTheme, Snackbar, Alert } from "@mui/material";
import Layout from "../components/Layout";

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

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Fetch phone products
    useEffect(() => {
        const fetchPhoneProducts = async () => {
            try {
                const response = await api.get("http://localhost:8083/product/phone");
                setPhoneProducts(response.data);
            } catch (err) {
                setPhoneError("Failed to load phone products. Please try again.");
                console.error("Error fetching phone products:", err);
            } finally {
                setPhoneLoading(false);
            }
        };

        fetchPhoneProducts();
    }, []);

    // Fetch tablet products
    useEffect(() => {
        const fetchLaptopProducts = async () => {
            try {
                const response = await api.get("http://localhost:8083/product/laptop");
                setLaptopProducts(response.data);
            } catch (err) {
                setLaptopError("Failed to load tablet products. Please try again.");
                console.error("Error fetching tablet products:", err);
            } finally {
                setLaptopLoading(false);
            }
        };

        fetchLaptopProducts();
    }, []);

    //Fetch laptop products
    useEffect(() => {
        const fetchTabletProducts = async () => {
            try {
                const response = await api.get("http://localhost:8083/product/Tablet");
                setTabletProducts(response.data);
            } catch (err) {
                setTabletError("Failed to load tablet products. Please try again.");
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
                setDeskProducts(response.data);
            } catch (err) {
                setDeskError("Failed to load tablet products. Please try again.");
                console.error("Error fetching tablet products:", err);
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
                setHeadPhoneProducts(response.data);
            } catch (err) {
                setHeadPhoneError("Failed to load tablet products. Please try again.");
                console.error("Error fetching tablet products:", err);
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
                setSmartTvProducts(response.data);
            } catch (err) {
                setSmartTvError("Failed to load tablet products. Please try again.");
                console.error("Error fetching tablet products:", err);
            } finally {
                setSmartTvLoading(false);
            }
        };

        fetchSmartTvProducts();
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
                    zIndex: 1,
                }}
            >
                <PhoneSection 
                    products={phoneProducts} 
                    loading={phoneLoading} 
                    error={phoneError} 
                    darkMode={darkMode}
                    onAddToCart={handleAddToCart}
                />
                <TabletSection 
                    products={tabletProducts} 
                    loading={tabletLoading} 
                    error={tabletError} 
                    darkMode={darkMode}
                    onAddToCart={handleAddToCart}
                />
                <LaptopSection 
                    products={laptopProducts} 
                    loading={laptopLoading} 
                    error={laptopError} 
                    darkMode={darkMode}
                    onAddToCart={handleAddToCart}
                />
                <DeskPCSection 
                    products={deskProducts} 
                    loading={deskLoading} 
                    error={deskError} 
                    darkMode={darkMode}
                    onAddToCart={handleAddToCart}
                />
                <HeadPhoneSection 
                    products={headPhoneProducts} 
                    loading={headPhoneLoading} 
                    error={headPhoneError} 
                    darkMode={darkMode}
                    onAddToCart={handleAddToCart}
                />
                <SmartTvSection 
                    products={smartTvProducts} 
                    loading={smartTvLoading} 
                    error={smartTvError} 
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