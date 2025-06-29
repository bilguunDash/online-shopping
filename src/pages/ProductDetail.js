import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/layout/Layout";
import api, { decodeToken } from "../utils/axios";
import ProdDetailSection from "../components/pages/ProdDetailSection";
import { Box, useTheme } from "@mui/material";

const ProductDetail = ({ darkMode, toggleDarkMode }) => {
    const router = useRouter();
    const { id } = router.query;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedViewType, setSelectedViewType] = useState('FRONT');
    const theme = useTheme();

    useEffect(() => {
        // Exit early if router is not ready or no id is provided
        if (!router.isReady || !id) return;

        setLoading(true);

        // Check authentication status
        const token = localStorage.getItem('jwt');
        if (token) {
            // Decode token to make sure it's valid
            const userInfo = decodeToken(token);
            if (userInfo && !localStorage.getItem('userId')) {
                // Try to get user ID from the token and save it to localStorage
                // This is useful for rating functionality
                const idFromToken = userInfo.id || userInfo.userId || userInfo.sub;
                if (idFromToken) {
                    localStorage.setItem('userId', idFromToken.toString());
                }
            }
        }

        // Skip localStorage and directly fetch from API
        fetchProductFromAPI(id);
    }, [router.isReady, id]);
    
    // Function to get image URL for a specific view type
    const getImageUrlByViewType = (images, viewType) => {
        if (!images || !Array.isArray(images) || images.length === 0) return null;
        
        const image = images.find(img => img.viewType === viewType);
        return image ? image.imageUrl : null;
    };
    
    // Improved function to fetch product from API
    const fetchProductFromAPI = async (productId) => {
        try {
            // Try the direct product endpoint
            const response = await api.get(`/product/${productId}`);
            
            let productData;
            if (Array.isArray(response.data)) {
                productData = response.data[0]; // Get first item if it's an array
            } else {
                productData = response.data; // Use as is if it's an object
            }
            
            if (productData) {
                // Process product images if they exist
                const productImages = productData.productImages || [];
                
                // If product has productImages array, use it for different views
                // Otherwise create a simple array with just the main image as FRONT view
                const processedImages = productImages.length > 0 ? 
                    productImages : 
                    [{ imageUrl: productData.imageUrl || "/placeholder.jpg", viewType: "FRONT" }];
                
                // Get the current view's image (default to FRONT)
                const currentViewImage = getImageUrlByViewType(processedImages, 'FRONT') || productData.imageUrl || "/placeholder.jpg";
                
                // Ensure all necessary fields are defined (even if empty)
                const processedProduct = {
                    ...productData,
                    id: productData.id || productId,
                    name: productData.name || "Бүтээгдэхүүний нэр",
                    description: productData.description || "",
                    price: productData.price || 0,
                    imageUrl: currentViewImage,
                    model: productData.model || "Байхгүй",
                    color: productData.color || "Байхгүй", 
                    ramGb: productData.ramGb || "Байхгүй",
                    storageGb: productData.storageGb || "Байхгүй",
                    display: productData.display || "Байхгүй",
                    graphics: productData.graphics || "Байхгүй",
                    os: productData.os || "Байхгүй",
                    processor: productData.processor || "Байхгүй",
                    rating: productData.rating || 0,
                    productImages: processedImages
                };
                
                setProduct(processedProduct);
            } else {
                setError("Бүтээгдэхүүний мэдээлэл хоосон эсвэл буруу байна");
            }
        } catch (err) {
            console.error("Error fetching product:", err);
            setError(`Бүтээгдэхүүний дэлгэрэнгүй мэдээллийг ачаалахад алдаа гарлаа: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    // Handler for changing the view type
    const handleViewTypeChange = (viewType) => {
        setSelectedViewType(viewType);
        
        if (product && product.productImages) {
            const newImageUrl = getImageUrlByViewType(product.productImages, viewType) || product.imageUrl;
            setProduct({
                ...product,
                imageUrl: newImageUrl
            });
        }
    };

    return (
        <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
            <Box
                sx={{
                    position: 'relative',
                    minHeight: '100vh',
                    padding: '20px 0',
                }}
            >
                <ProdDetailSection 
                    product={product} 
                    loading={loading} 
                    error={error}
                    darkMode={darkMode}
                    selectedViewType={selectedViewType}
                    onViewTypeChange={handleViewTypeChange}
                />
            </Box>
        </Layout>
    );
};
    
export default ProductDetail;