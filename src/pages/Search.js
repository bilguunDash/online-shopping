import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import { Grid, Typography, Container, Box, CircularProgress } from '@mui/material';
import ProductCard from '../components/products/ProductCard';
import { getFrontImageUrl } from '../utils/imageHelpers';

const Search = () => {
  const router = useRouter();
  const { q } = router.query;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q) return;

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/product/search?keyword=${encodeURIComponent(q)}&page=0&size=12`);
        
        // Get content from pagination response
        const processedProducts = response.data.content ? response.data.content.map(product => {
          // Create a copy of the product to avoid mutating the original data
          const processedProduct = { ...product };
          
          // If product has multiple images (from different angles)
          if (processedProduct.images && Array.isArray(processedProduct.images) && processedProduct.images.length > 0) {
            // Find the FRONT view image
            const frontImage = processedProduct.images.find(img => img.viewType === 'FRONT');
            
            // If found, only keep the FRONT image
            if (frontImage) {
              processedProduct.images = [frontImage];
              // Also set the main imageUrl to the FRONT view for compatibility with ProductCard
              processedProduct.imageUrl = frontImage.imageUrl;
            }
          }
          
          // If product has the newer productImages format
          if (processedProduct.productImages && Array.isArray(processedProduct.productImages) && processedProduct.productImages.length > 0) {
            // Find the FRONT view image
            const frontImage = processedProduct.productImages.find(img => img.viewType === 'FRONT');
            
            // If found, only keep the FRONT image
            if (frontImage) {
              processedProduct.productImages = [frontImage];
              // Also set the main imageUrl to the FRONT view for compatibility with ProductCard
              processedProduct.imageUrl = frontImage.imageUrl;
            }
          }
          
          return processedProduct;
        }) : [];
        
        setProducts(processedProducts);
        setLoading(false);
      } catch (err) {
        setError('Хайлтын үр дүнг татахад алдаа гарлаа');
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [q]);

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Хайлтын үр дүн: {q}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : products.length === 0 ? (
          <Typography>"{q}" гэсэн түлхүүр үгээр бүтээгдэхүүн олдсонгүй</Typography>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
};

export default Search;
