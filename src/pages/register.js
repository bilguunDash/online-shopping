import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api, { API_ENDPOINTS, directApiCall, authApi } from "../utils/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import Image from "next/image";
import logo from "../img/logo.png";
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  InputAdornment, 
  IconButton,
  Checkbox,
  FormControlLabel,
  Container,
  LinearProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InfoIcon from '@mui/icons-material/Info';

const Register = ({ darkMode, toggleDarkMode }) => {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "USER"
  });
  const [errors, setErrors] = useState({});
  const [isClient, setIsClient] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Password strength calculation
  useEffect(() => {
    if (!form.password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (form.password.length >= 8) strength += 25;
    
    // Contains uppercase
    if (/[A-Z]/.test(form.password)) strength += 25;
    
    // Contains lowercase
    if (/[a-z]/.test(form.password)) strength += 25;
    
    // Contains numbers or special characters
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(form.password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [form.password]);

  const getStrengthColor = () => {
    if (passwordStrength < 50) return theme.palette.error.main;
    if (passwordStrength < 75) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Medium";
    if (passwordStrength < 100) return "Strong";
    return "Very strong";
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.firstname.trim()) {
      newErrors.firstname = "First name is required";
    }
    
    if (!form.lastname.trim()) {
      newErrors.lastname = "Last name is required";
    }
    
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (passwordStrength < 50) {
      newErrors.password = "Password is too weak";
    }
    
    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the Terms of Service";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    // Remove confirmPassword field as it's not needed for the API
    const { confirmPassword, ...registrationData } = form;
    
    try {
      // Дэлгэрэнгүй лог
      console.log("Бүртгүүлэх өгөгдөл:", JSON.stringify(registrationData, null, 2));
      
      // Шууд fetch ашиглаж үзье
      try {
        console.log("Шууд дуудалт ашиглаж турших гэж байна...");
        await directApiCall(API_ENDPOINTS.auth.register, 'POST', registrationData);
        
        toast.success("🎉 Бүртгэл амжилттай! Нэвтрэх хуудас руу шилжиж байна.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: darkMode ? "dark" : "light",
        });
        
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return;
      } catch (directError) {
        console.error("Шууд дуудалт алдаа:", directError);
        // Алдаа гарвал axios-аар үргэлжлүүлнэ
      }
      
      // authApi ашиглаж үзье (auth API instance)
      console.log("authApi ашиглан турших гэж байна...");
      const axiosResponse = await authApi.post("/register", registrationData);
      console.log("Axios хариу:", axiosResponse.data);
      
      toast.success("🎉 Бүртгэл амжилттай! Нэвтрэх хуудас руу шилжиж байна.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: darkMode ? "dark" : "light",
      });
      
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Бүртгэлийн алдаа:", error);
      console.error("Алдааны дэлгэрэнгүй:", error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      } : error.message);
      
      if (error.response?.status === 409) {
        setErrors({ email: "И-мэйл хаяг бүртгэлтэй байна. Өөр и-мэйл оруулна уу." });
        toast.error("❌ И-мэйл хаяг бүртгэлтэй байна!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: darkMode ? "dark" : "light",
        });
      } else {
        toast.error(`❌ Бүртгэл амжилтгүй: ${error.response?.data?.message || error.message}`, {
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
    } finally {
      setIsSubmitting(false);
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
        backgroundColor: theme.palette.mode === 'dark' ? '#1a1c2e' : '#f5f5f7',
        backgroundImage: theme.palette.mode === 'dark' 
          ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 10px)' 
          : 'repeating-linear-gradient(45deg, rgba(0,0,0,0.025) 0px, rgba(0,0,0,0.025) 1px, transparent 1px, transparent 10px)',
        py: 4
      }}
    >
      {/* Toast notifications */}
      <ToastContainer theme={darkMode ? "dark" : "light"} />

      {/* Logo at top */}
      <Box 
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          src={logo}
          alt="Tech Shopping"
          width={80}
          height={80}
          style={{
            objectFit: 'contain',
            borderRadius: '50%',
            background: 'white',
            padding: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
          priority
        />
      </Box>

      {/* Main content */}
      <Container maxWidth="sm">
        <Box
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? '#2a2d3e' : '#e3e3e8',
            borderRadius: '16px',
            overflow: 'hidden', 
            p: 4,
            mx: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            }
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography 
              variant="h4" 
              component="h1"
              color="primary"
              align="center" 
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 4,
                fontWeight: 600
              }}
            >
              <PersonAddIcon /> Create Account
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" component="label" sx={{ mb: 1, display: 'block' }}>
                First Name *
              </Typography>
              <TextField
                fullWidth
                name="firstname"
                variant="outlined"
                value={form.firstname}
                onChange={handleInputChange}
                error={!!errors.firstname}
                helperText={errors.firstname}
                placeholder="First Name"
                InputProps={{
                  sx: {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" component="label" sx={{ mb: 1, display: 'block' }}>
                Last Name *
              </Typography>
              <TextField
                fullWidth
                name="lastname"
                variant="outlined"
                value={form.lastname}
                onChange={handleInputChange}
                error={!!errors.lastname}
                helperText={errors.lastname}
                placeholder="Last Name"
                InputProps={{
                  sx: {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" component="label" sx={{ mb: 1, display: 'block' }}>
                Email Address *
              </Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                variant="outlined"
                value={form.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                placeholder="john.doe@example.com"
                InputProps={{
                  sx: {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <InfoIcon fontSize="small" color="action" />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" component="label" sx={{ mb: 1, display: 'block' }}>
                Password *
              </Typography>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={form.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                placeholder="••••••••••"
                InputProps={{
                  sx: {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              {form.password && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Password should be at least 8 characters with uppercase, lowercase and numbers
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={passwordStrength} 
                      sx={{ 
                        flexGrow: 1, 
                        mr: 1,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(0,0,0,0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getStrengthColor(),
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: getStrengthColor() }}>
                      {getStrengthLabel()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" component="label" sx={{ mb: 1, display: 'block' }}>
                Confirm Password *
              </Typography>
              <TextField
                fullWidth
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                variant="outlined"
                value={form.confirmPassword}
                onChange={handleInputChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                placeholder="••••••••••"
                InputProps={{
                  sx: {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    color="primary"
                    sx={{ 
                      p: 0.5,
                      borderRadius: '4px', 
                      mr: 1,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      }
                    }}
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the {' '}
                    <Link href="/terms" style={{ color: theme.palette.primary.main }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" style={{ color: theme.palette.primary.main }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ ml: -1 }}
              />
              {errors.terms && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.terms}
                </Typography>
              )}
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
              }}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Already have an account?{' '}
                <Link href="/login" style={{ 
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500,
                }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-15px, 15px) scale(1.02); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}</style>
    </Box>
  );
};

export default Register;
