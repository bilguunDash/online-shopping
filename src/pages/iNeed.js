//scr/baseHome.js
import React, { useState, useEffect } from "react";
import styles from "../styles/HomeBase.module.css";
import api from "../utils/axios";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import logo from "../img/logo.png";
import userLogo from "../img/user.png";
import locationLogo from "../img/location.png";


const Home = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    router.push("/login");
  };

  useEffect(() => {
    setFirstName(localStorage.getItem("firstName") || "");
    setLastName(localStorage.getItem("lastName") || "");
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await api.get("http://localhost:8083/product/our");
        setProducts(response.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError("Unauthorized access. Please log in again.");
          localStorage.removeItem("jwt");
          router.push("/login");
        } else {
          setError("Failed to load products. Please try again.");
        }
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Image
              src={logo}
              alt="Bilguun's Shopping Logo"
              className={styles.logo}
              width={50}
              height={50}
              priority
            />
          </div>
          <div className={styles.logoName}>
            <h1>Bilguun&apos;s Shopping</h1>
          </div>

          <Image
            src={locationLogo}
            alt="Location Icon"
            className={styles.locationLogo}
            width={20}
            height={20}
            priority
          />

          <div
            style={{
              textDecoration: "none",
              color: "#333",
              fontSize: "7px",
              fontWeight: "500",
              marginLeft: "10px",
            }}
          >
            <Link href="/location">
              <h1>Салбар Сонгох</h1>
            </Link>
          </div>

          <Image
            src={userLogo}
            alt="User Icon"
            className={styles.userLogo}
            width={20}
            height={20}
            priority
          />

          <div
            className={styles.loginName}
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ cursor: "pointer" }}
          >
            <h1>
              {firstName} {lastName}
            </h1>
            {menuOpen && (
              <div className={styles.dropdownMenu}>
                <ul>
                  <li>
                    <Link href="/profile">Миний профайл</Link>
                  </li>
                  <li>
                    <Link href="/orders">Миний захиалгууд</Link>
                  </li>
                  <li onClick={handleLogout}>Гарах</li>
                </ul>
              </div>
            )}
          </div>
        </header>



  <div className={styles.contentContainer}>
  <section className={styles.dealsSection}>
    {loading && <p>Loading products...</p>}
    {error && <p className={styles.error}>{error}</p>}
    {!loading && !error && (
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <Image
              src={product.imageUrl}
              alt={product.name}
              className={styles.productImage}
              width={200}
              height={200}
            />
          <h3 className={styles.productName}>{product.name}</h3>
            <p className={styles.productDescription} title={product.description}>
              {product.description}
            </p>
            <button className={styles.addToCartButton}>
              Сонгох ${product.price.toFixed(2)}
            </button>
          </div>
        ))}
      </div>
    )}
  </section>
</div>
        
      </div>

    </div>
  );
};

export default Home;