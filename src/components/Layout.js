// components/Layout.js
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Header from "./Header";
import { Box } from "@mui/material";
import { useRouter } from "next/router";

const Layout = ({ children, darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const [checkedRole, setCheckedRole] = useState(false);

  // Check if user is admin and redirect them to admin home
  useEffect(() => {
    // Skip for login, register pages
    if (router.pathname === "/login" || router.pathname === "/register") {
      return;
    }

    // Check user role only once
    if (!checkedRole) {
      const userRole = localStorage.getItem("role");
      if (userRole === "ADMIN") {
        router.push("/admin/AdminHome");
      }
      setCheckedRole(true);
    }

    // Listen for changes to localStorage (for cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'role') {
        const newRole = e.newValue;
        if (newRole === "ADMIN") {
          router.push("/admin/AdminHome");
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router, checkedRole]);

  return (
    <>
      <Head>
        <title>Tech E-Commerce - Premium Technology Products</title>
        <meta name="description" content="Premium technology products for everyone - computers, laptops, tablets, phones, and more." />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </Head>
      
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: darkMode 
            ? `
              radial-gradient(circle at 25px 25px, rgba(88, 90, 228, 0.08) 2%, transparent 0%), 
              radial-gradient(circle at 75px 75px, rgba(142, 36, 170, 0.05) 2%, transparent 0%)
            `
            : `
              radial-gradient(circle at 25px 25px, rgba(88, 90, 228, 0.15) 2%, transparent 0%), 
              radial-gradient(circle at 75px 75px, rgba(142, 36, 170, 0.1) 2%, transparent 0%)
            `,
          backgroundSize: '100px 100px',
          backgroundColor: darkMode ? '#121212' : '#f8f9fa',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '500px',
            background: darkMode
              ? 'linear-gradient(135deg, rgba(88, 90, 228, 0.03) 0%, rgba(142, 36, 170, 0.03) 100%)'
              : 'linear-gradient(135deg, rgba(88, 90, 228, 0.05) 0%, rgba(142, 36, 170, 0.05) 100%)',
            zIndex: 0,
            transform: 'skewY(-3deg) translateY(-200px)',
          },
        }}
      >
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main style={{ 
          flexGrow: 1, 
          position: 'relative', 
          zIndex: 1, 
          marginTop: '32px', 
          // paddingTop: '20px',
          paddingBottom: '40px',
          width: '100%'
        }}>
          {children}
        </main>
      </Box>
    </>
  );
};

export default Layout;