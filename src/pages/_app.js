import React, { useState, useEffect } from 'react';
import '../styles/globals.css';
import Head from 'next/head';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import Footer from '../components/Footer';
import rtlPlugin from 'stylis-plugin-rtl';

// Create rtl and ltr caches
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const cacheLtr = createCache({
  key: 'muiltr',
  stylisPlugins: [prefixer],
});

function MyApp({ Component, pageProps }) {
  const [isClient, setIsClient] = useState(false);
  const [darkMode, setDarkMode] = useState(false);  // Default to light mode

  useEffect(() => {
    setIsClient(true);
    // Check local storage for dark mode preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    }
  }, []);

  // Define dark theme
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#585ae4',
        light: '#7879ff',
        dark: '#4748b1',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#8e24aa',
        light: '#c158dc',
        dark: '#5c007a',
        contrastText: '#ffffff',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: 'rgba(255, 255, 255, 0.87)',
        secondary: 'rgba(255, 255, 255, 0.6)',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#1a1a2e',
            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.5)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
    },
  });

  // Define light theme
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#585ae4',
        light: '#7879ff',
        dark: '#4748b1',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#8e24aa',
        light: '#c158dc',
        dark: '#5c007a',
        contrastText: '#ffffff',
      },
      background: {
        default: '#f8f9fa',
        paper: '#ffffff',
      },
      text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 10px 0 rgba(0, 0, 0, 0.1)',
            color: '#000000',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
    },
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (isClient) {
      localStorage.setItem('darkMode', newMode);
    }
  };

  // Use appropriate cache based on direction (if needed in the future)
  const cache = 'ltr' === 'rtl' ? cacheRtl : cacheLtr;

  // Check if the current page is an admin page
  const isAdminPage = Component.displayName?.includes('Admin') || 
                      Component.name?.includes('Admin') || 
                      pageProps.isAdminPage || 
                      (typeof window !== 'undefined' && window.location.pathname.includes('/admin/'));

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Tech E-Commerce</title>
          
          {/* Load prevention script for admin pages */}
          {isAdminPage ? (
            <>
              <script src="/js/preventTemplateScripts.js" />
              <link rel="stylesheet" href="/css/bootstrap.min.css" />
            </>
          ) : (
            /* Conditionally load external stylesheets for non-admin pages only */
            <>
              <link rel="stylesheet" href="/css/bootstrap.min.css" />
              <link rel="stylesheet" href="/css/style.css" />
              <link rel="stylesheet" href="/css/responsive.css" />
              <link rel="stylesheet" href="/css/jquery.mCustomScrollbar.min.css" />
              <link rel="stylesheet" href="https://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css" />
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.css" />
            </>
          )}
        </Head>
        {/* Always render the Component with props, regardless of page type */}
        <Component {...pageProps} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        {/* Only show Footer on non-admin pages */}
        {!isAdminPage && <Footer darkMode={darkMode} />}
      </ThemeProvider>
    </CacheProvider>
  );
}

export default MyApp;