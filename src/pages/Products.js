    // pages/home.js
    import React, { useState, useEffect } from "react";
    import Layout from "../components/Layout";
    import noAuthApi from "../utils/noAuthApi";
    import ProductSection from "../components/AllProductsSection";

    const Products = () => {
        const [products, setProducts] = useState([]);
        const [error, setError] = useState(null);
        const [loading, setLoading] = useState(true);
    
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

        return (
            <Layout>
            <ProductSection products={products} loading={loading} error={error} />
            </Layout>
        );
        };
        
        export default Products;
        