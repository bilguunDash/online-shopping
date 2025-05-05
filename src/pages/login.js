import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "../utils/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import Image from "next/image";
import logo from "../img/logo.png";
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  CircularProgress,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login = ({ darkMode, toggleDarkMode }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    setIsClient(true);
    // Only clear JWT on initial mount, not on rerenders
    const clearJwtOnInitialMount = () => {
      // We don't want to clear JWT on refresh, only on initial visit to login page
      if (!sessionStorage.getItem('loginPageVisited')) {
        localStorage.removeItem("jwt");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        localStorage.removeItem("role");
        sessionStorage.setItem('loginPageVisited', 'true');
      }
    };
    clearJwtOnInitialMount();
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error message when typing
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Simple validation
    if (!formData.email || !formData.password) {
      setErrorMsg("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("http://localhost:8083/api/auth/login", formData);
      
      // Log the response for debugging
      console.log("Login response:", response.data);
      
      // Check if we have a token
      if (response.data && response.data.token) {
        // Store user data in localStorage
        localStorage.setItem("jwt", response.data.token);
        
        // Make sure firstName and lastName are properly stored
        // Handle both direct properties and nested user object
        if (response.data.firstName) {
          localStorage.setItem("firstName", response.data.firstName);
        } else if (response.data.user && response.data.user.firstName) {
          localStorage.setItem("firstName", response.data.user.firstName);
        } else {
          localStorage.setItem("firstName", "User");
        }
        
        if (response.data.lastName) {
          localStorage.setItem("lastName", response.data.lastName);
        } else if (response.data.user && response.data.user.lastName) {
          localStorage.setItem("lastName", response.data.user.lastName);
        } else {
          localStorage.setItem("lastName", "");
        }
        
        // Store user role in localStorage
        const userRole = response.data.role || (response.data.user && response.data.user.role) || "USER";
        localStorage.setItem("role", userRole);
        
        // Force rerender of header by setting a timestamp
        localStorage.setItem("lastAuthUpdate", Date.now().toString());
        
        toast.success("🎉 Login successful!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: darkMode ? "dark" : "light",
        });

        // Short delay to ensure localStorage is updated before navigation
        setTimeout(() => {
          // Redirect based on role
          if (userRole === "ADMIN") {
            router.push("/admin/AdminHome");
          } else {
            router.push("/home");
          }
        }, 500);
      } else {
        setErrorMsg(response.data.message || "Login failed. Please check your credentials.");
        toast.error(response.data.message || "Login failed. Please check your credentials.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: darkMode ? "dark" : "light",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // More detailed error handling
      let errorMessage = "An error occurred during login. Please try again.";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        if (error.response.status === 401) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        errorMessage = "No response from server. Please check your internet connection.";
      }
      
      setErrorMsg(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: darkMode ? "dark" : "light",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
        position: 'relative',
        py: 4,
      }}
    >
      <ToastContainer theme={darkMode ? "dark" : "light"} />
      
      <Box
        sx={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'float 6s ease-in-out infinite',
          zIndex: 1,
        }}
      >
        <Image 
          src={logo} 
          alt="Tech Shopping Logo" 
          width={180} 
          height={80} 
        />
      </Box>

      <Container maxWidth="xs">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: '12px',
            background: theme.palette.mode === 'dark' 
              ? 'rgba(30, 30, 45, 0.8)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: theme.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            mt: 8,
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 3, 
              fontWeight: 700,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #5e72e4, #8a85ff)'
                : 'linear-gradient(45deg, #1e3c72, #2a5298)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
             .
          </Typography>
          
          {errorMsg && (
            <Typography 
              color="error" 
              variant="body2" 
              sx={{ 
                mb: 2, 
                textAlign: 'center',
                p: 1,
                borderRadius: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(220,20,60,0.1)' : 'rgba(220,20,60,0.05)',
                width: '100%'
              }}
            >
              {errorMsg}
            </Typography>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%'}}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleInputChange}
              InputProps={{
                sx: {
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(30, 30, 40, 0.6)' 
                    : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  height: '50px',
                }
              }}
            />
            
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              InputProps={{
                sx: {
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(30, 30, 40, 0.6)' 
                    : 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  height: '50px',
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Box sx={{ textAlign: 'right', mt: 1, mb: 2 }}>
              <Link href="/forgot-password" passHref>
                <Typography 
                  component="a" 
                  variant="body2" 
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  Forgot password?
                </Typography>
              </Link>
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: '8px',
                fontSize: '1rem',
                textTransform: 'none',
                fontWeight: 600,
                position: 'relative',
                background: 'linear-gradient(45deg, #585ae4, #8e24aa)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4a4bce, #7c1f96)',
                  boxShadow: '0 6px 25px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              {loading ? (
                <CircularProgress 
                  size={24} 
                  sx={{ 
                    color: theme.palette.primary.contrastText,
                    position: 'absolute', 
                  }} 
                />
              ) : (
                'Sign In'
              )}
            </Button>
            
            <Divider sx={{ my: 3 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ px: 1 }}
              >
                OR
              </Typography>
            </Divider>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link href="/register" passHref>
                  <Typography 
                    component="a" 
                    variant="body2" 
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    Sign Up
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Box sx={{ 
          mt: 4, 
          textAlign: 'center' 
        }}>
          <Link href="/home" passHref>
            <Typography 
              component="a" 
              variant="body2" 
              sx={{
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Return to Home Page
            </Typography>
          </Link>
          
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 2,
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
            }}
          >
            &copy; {new Date().getFullYear()} Tech Shopping. All rights reserved.
          </Typography>
        </Box>
      </Container>
      
      {/* Decoration - floating shapes */}
      <Box
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          top: '-150px',
          right: '-150px',
          borderRadius: '50%',
          background: theme.palette.mode === 'dark' 
            ? 'radial-gradient(circle, rgba(142, 36, 170, 0.05) 0%, rgba(88, 90, 228, 0.03) 70%)' 
            : 'radial-gradient(circle, rgba(142, 36, 170, 0.08) 0%, rgba(88, 90, 228, 0.05) 70%)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          bottom: '-200px',
          left: '-200px',
          borderRadius: '50%',
          background: theme.palette.mode === 'dark' 
            ? 'radial-gradient(circle, rgba(88, 90, 228, 0.05) 0%, rgba(142, 36, 170, 0.03) 70%)' 
            : 'radial-gradient(circle, rgba(88, 90, 228, 0.08) 0%, rgba(142, 36, 170, 0.05) 70%)',
          zIndex: 0,
        }}
      />
      
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px) translateX(-50%);
          }
          50% {
            transform: translateY(-10px) translateX(-50%);
          }
          100% {
            transform: translateY(0px) translateX(-50%);
          }
        }
      `}</style>
    </Box>
  );
};

export default Login;