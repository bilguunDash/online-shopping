import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/ProductSection.module.css";

const ProductSection = ({ products, loading, error }) => {
  return (
   
      <div className="container">
        {/* Section Title */}
        <div className="row">
        
            <div className={styles.titlepage}>
              <h2>Бүтээгдэхүүн</h2>
            </div>
        
        </div>

        {/* Products Grid */}
        <div className="row">
          <div className="col-md-12">
          <div className="row">
        
        <div className={styles.titlepage}>
          <h2>Бүтээгдэхүүн</h2>
        </div>
    
    </div>
        
              <div className="row justify-content-center">
                <div className={styles.contentContainer}>
                  <section className={styles.dealsSection}>
                    {loading && <p>Loading products...</p>}
                    {error && <p className={styles.error}>{error}</p>}
                    {!loading && !error && (
                      <div className={styles.productsGrid}>
                        {products.map((product) => (
                          <div key={product.id} className={styles.productCard}>
                            <div className={styles.imageWrapper}>
                              <Image
                                src={product.imageUrl || "/placeholder.jpg"}
                                alt={product.name}
                                className={styles.productImage}
                                width={150}
                                height={150}
                              />
                            </div>
                            <h3 className={styles.productName}>
                              {product.name}
                            </h3>
                            <p
                              className={styles.productDescription}
                              title={product.description}
                            >
                              {/* {product.description} */}
                            </p>
                            <button className={styles.addToCartButton}>
                              {product.price ? `Сонгох $${product.price.toFixed(2)}` : 'Сонгох'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
        
          </div>
        </div>
      </div>
  
  );
};

export default ProductSection;