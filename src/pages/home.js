// pages/home.js
import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Banner from "../components/Banner";
import FeatureBoxes from "../components/FeatureBoxes";
import ProductSection from "../components/ProductSection";
import LaptopPromo from "../components/LaptopPromo";
import CustomerReviews from "../components/CustomerReviews";
import ContactForm from "../components/ContactForm";
import noAuthApi from "../utils/noAuthApi";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <Layout>
      <Banner />
      <FeatureBoxes />
      <ProductSection products={products} loading={loading} error={error} />
      <LaptopPromo />
      <CustomerReviews />
      <ContactForm />
    </Layout>
  );
};

export default Home;
