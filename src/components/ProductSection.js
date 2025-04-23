// components/ProductSection.js
import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const ProductSection = ({ products, loading, error }) => {
  return (
    <div className="products">
      <div className="container">
        {/* Section Title */}
        <div className="row">
          <div className="col-md-12">
            <div className="titlepage">
              <h2>Бүтээгдэхүүн</h2>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="row">
          <div className="col-md-12">
            <div className="our_products">
              <div className="row justify-content-center">
                <div className={styles.contentContainer}>
                  <section className={styles.dealsSection}>
                    {loading && <p>Loading products...</p>}
                    {error && <p className={styles.error}>{error}</p>}
                    {!loading && !error && products.length > 0 && (
                      <div className={styles.productsWrapper}>
                        {/* First Row - 3 products */}
                        <div className="row mb-4 justify-content-center">
                          {products.slice(0, 3).map((product) => (
                            <div key={product.id} className="col-md-4">
                              <div className={styles.productCard}>
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className={styles.productImage}
                                  width={200}
                                  height={200}
                                />
                                <button className={styles.addToCartButton}>
                                  {product.title}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Second Row - 3 products */}
                        {products.length > 3 && (
                          <div className="row justify-content-center">
                            {products.slice(3, 6).map((product) => (
                              <div key={product.id} className="col-md-4">
                                <div className={styles.productCard}>
                                  <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className={styles.productImage}
                                    width={200}
                                    height={200}
                                  />
                                  <button className={styles.addToCartButton}>
                                    {product.title}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                </div>

                {/* "See More" Link */}
                <div className="col-md-12 text-center mt-4">
                  <Link href="#" className="read_more">
                    See More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSection;