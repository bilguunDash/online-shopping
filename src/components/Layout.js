// components/Layout.js
import React from "react";
import Head from "next/head";
import Script from "next/script";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="main-layout">
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <title>cla</title>
        <link rel="icon" href="/images/fevicon.png" type="image/png" />
      </Head>

      {/* Loader */}
      <div className="loader_bg">
        <div className="loader">
          <img src="/images/loading.gif" alt="#" />
        </div>
      </div>

      <Header />
      
      <main>{children}</main>
      
      <Footer />

      {/* Scripts */}
      <Script src="/js/jquery.min.js" strategy="lazyOnload" />
      <Script src="/js/popper.min.js" strategy="lazyOnload" />
      <Script src="/js/bootstrap.bundle.min.js" strategy="lazyOnload" />
      <Script src="/js/jquery-3.0.0.min.js" strategy="lazyOnload" />
      <Script src="/js/jquery.mCustomScrollbar.concat.min.js" strategy="lazyOnload" />
      <Script src="/js/custom.js" strategy="lazyOnload" />
    </div>
  );
};

export default Layout;