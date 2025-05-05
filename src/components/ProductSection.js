// components/ProductSection.js
import React from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";

const ProductSection = ({ products, loading, error }) => {
  const router = useRouter();
  
  // Category mapping array
  const categoryPages = [
    "/CatPhone",    // 0 - Утас
    "/CatLaptop",   // 1 - Зөөврийн компьютер
    "/CatPc",       // 2 - Суурин компьютер
    "/CatTablet",   // 3 - Таблет
    "/CatHeadphone", // 4 - Чихэвч
    "/CatSmartTv"   // 5 - Ухаалаг дэлгэц
  ];
  
  // Navigate to category page
  const handleCategoryClick = (index) => {
    const targetPath = categoryPages[index];
    if (targetPath) {
      console.log(`Navigating to category: ${targetPath}`);
      router.push(targetPath);
    } else {
      console.error(`Invalid category index: ${index}`);
    }
  };
  
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
                          {products.slice(0, 3).map((product, index) => (
                            <div key={product.id} className="col-md-4">
                              <div className={styles.productCard}>
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className={styles.productImage}
                                  width={200}
                                  height={200}
                                />
                                <button 
                                  className={styles.addToCartButton}
                                  onClick={() => handleCategoryClick(index)}
                                >
                                  {product.title}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Second Row - 3 products */}
                        {products.length > 3 && (
                          <div className="row justify-content-center">
                            {products.slice(3, 6).map((product, index) => (
                              <div key={product.id} className="col-md-4">
                                <div className={styles.productCard}>
                                  <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className={styles.productImage}
                                    width={200}
                                    height={200}
                                  />
                                  <button 
                                    className={styles.addToCartButton}
                                    onClick={() => handleCategoryClick(index + 3)}
                                  >
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
                  <Link href="/Products" className="read_more">
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