// components/Header.js
import React from "react";
import Link from "next/link";
import styles from "../styles/Home.module.css";

const Header = () => {
  return (
    <header>
      <div
        className="header-fixed"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "80px",
          backgroundImage: `url('/images/menu.png')`, // Replace with your image path
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          zIndex: 999,
        }}
      >
        <div className="container-fluid">
          <div className="row">
            <div className="col-xl-3 col-lg-3 col-md-3 col-sm-3 col logo_section">
              <div className="full">
                <div className="center-desk">
                  <div className="logo">
                    <Link href="/">
                      <img src="/images/logo.png" alt="#" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-9 col-lg-9 col-md-9 col-sm-9">
              <nav
                className={`${styles.navigation} navbar navbar-expand-md navbar-dark`}
              >
                <button
                  className={`${styles.navbarToggler} navbar-toggler`}
                  type="button"
                  data-toggle="collapse"
                  data-target="#navbarsExample04"
                  aria-controls="navbarsExample04"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span
                    className={`${styles.navbarTogglerIcon} navbar-toggler-icon`}
                  ></span>
                </button>
                <div
                  className={`${styles.collapse} collapse navbar-collapse`}
                  id="navbarsExample04"
                >
                  <ul className={`${styles.navbarNav} navbar-nav mr-auto`}>
                    <li className={`${styles.navItem} nav-item active`}>
                      <Link href="/">Home</Link>
                    </li>
                    <li className={`${styles.navItem} nav-item`}>
                      <Link href="/Products">All products</Link>
                    </li>
                    <li className={`${styles.navItem} nav-item`}>
                      <Link href="/computer">Categories</Link>
                    </li>
                    <li className={`${styles.navItem} nav-item`}>
                      <Link href="/laptop">Account</Link>
                    </li>
                    <li className={`${styles.navItem} nav-item`}>
                      <Link href="/about">About</Link>
                    </li>
                    <li className={`${styles.navItem}  nav-item `}>
                      <Link href="#" legacyBehavior>
                        <a>
                          <i
                            className="fa fa-shopping-cart"
                            aria-hidden="true"
                          ></i>
                        </a>
                      </Link>
                    </li>
                    <li className={`${styles.navItem}  nav-item `}>
                      <Link href="#" legacyBehavior>
                        <a>
                          <i className="fa fa-search" aria-hidden="true"></i>
                        </a>
                      </Link>
                    </li>
                    <li className={`${styles.navItem} nav-item`}>
                      <Link href="#">Login</Link>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;