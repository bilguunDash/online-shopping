// pages/home.js
import React, { useState, useEffect } from "react";
import Banner from "../components/layout/Banner";
import FeatureBoxes from "../components/common/FeatureBoxes";
import ProductSection from "../components/products/ProductSection";
import LaptopPromo from "../components/common/LaptopPromo";
import CustomerReviews from "../components/common/CustomerReviews";
import ContactForm from "../components/common/ContactForm";
import noAuthApi from "../utils/noAuthApi";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Layout from "../components/layout/Layout";

const Home = ({ darkMode, toggleDarkMode }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await noAuthApi.get("/product/our");
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
    <Box 
      sx={{
        position: 'relative',
        overflow: 'hidden',
        
        // Homepage-specific enhanced background textures
        backgroundImage: theme.palette.mode === 'dark'
          ? `
            linear-gradient(90deg, rgba(88, 90, 228, 0.05) 0%, rgba(30, 30, 30, 0.01) 50%, rgba(142, 36, 170, 0.05) 100%),
            repeating-linear-gradient(45deg, rgba(88, 90, 228, 0.03) 0%, rgba(88, 90, 228, 0.03) 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(135deg, rgba(142, 36, 170, 0.03) 0%, rgba(142, 36, 170, 0.03) 1px, transparent 1px, transparent 20px)
          `
          : `
            linear-gradient(90deg, rgba(88, 90, 228, 0.03) 0%, rgba(255, 255, 255, 0) 50%, rgba(142, 36, 170, 0.03) 100%),
            repeating-linear-gradient(45deg, rgba(88, 90, 228, 0.01) 0%, rgba(88, 90, 228, 0.01) 1px, transparent 1px, transparent 20px),
            repeating-linear-gradient(135deg, rgba(142, 36, 170, 0.01) 0%, rgba(142, 36, 170, 0.01) 1px, transparent 1px, transparent 20px)
          `,
        
        // Floating elements effect
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          zIndex: 0,
        },
        
        // Top-right decorative element
        '&::before': {
          top: '-100px',
          right: '-100px',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(88, 90, 228, 0.15) 0%, rgba(88, 90, 228, 0) 70%)'
            : 'radial-gradient(circle, rgba(88, 90, 228, 0.1) 0%, rgba(88, 90, 228, 0) 70%)',
          animation: 'float 15s ease-in-out infinite',
        },
        
        // Bottom-left decorative element
        '&::after': {
          bottom: '10%',
          left: '-150px',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(142, 36, 170, 0.12) 0%, rgba(142, 36, 170, 0) 70%)'
            : 'radial-gradient(circle, rgba(142, 36, 170, 0.08) 0%, rgba(142, 36, 170, 0) 70%)',
          animation: 'float2 20s ease-in-out infinite',
        },
        
        // Floating animations
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-30px) scale(1.05)' },
        },
        '@keyframes float2': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(30px) scale(1.05)' },
        },
      }}
    >
        <Layout>
      <Banner darkMode={darkMode} />
      <FeatureBoxes darkMode={darkMode} />
      <ProductSection products={products} loading={loading} error={error} darkMode={darkMode} />
      <LaptopPromo darkMode={darkMode} />
      <CustomerReviews darkMode={darkMode} />
      <ContactForm darkMode={darkMode} />
      </Layout>
    </Box>
  );
};

export default Home;
