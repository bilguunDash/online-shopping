import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  Tabs,
  Tab,
  Divider,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from '../../components/AdminHeader';
import SaveIcon from '@mui/icons-material/Save';
import ResetIcon from '@mui/icons-material/RestartAlt';
import ImageIcon from '@mui/icons-material/Image';

// Default banner data from Banner.js
const defaultBannerData = [
  {
    id: "computers",
    tagline: "Хамгийн Шинэ Технологи",
    title: "Компьютер",
    description: "Тоглоом, загвар дизайн, оффисын ажлын хэрэгцээнд тохирсон, хамгийн сүүлийн үеийн үзүүлэлт бүхий компьютеруудыг сонгоорой.",
    image: "/images/pc.png",
    primaryCta: "Худалдан Авах",
    secondaryCta: "Дэлгэрэнгүй"
  },
  {
    id: "laptops",
    tagline: "Хүчирхэг Үзүүлэлт",
    title: "Лаптоп",
    description: "Удаан цэнэг барих чадвартай, авсаархан загвартай, өндөр хүчин чадалтай лаптопуудыг санал болгож байна.",
    image: "/images/notebook.png",
    primaryCta: "Худалдан Авах",
    secondaryCta: "Дэлгэрэнгүй"
  },
  {
    id: "phones",
    tagline: "Ухаалаг Төхөөрөмжүүд",
    title: "Утас",
    description: "Шинэлэг загвар, ухаалаг шийдлүүдтэй, өндөр хүчин чадалтай ухаалаг гар утаснуудыг сонгон аваарай.",
    image: "/images/nice.png",
    primaryCta: "Худалдан Авах",
    secondaryCta: "Дэлгэрэнгүй"
  },
  {
    id: "tablets",
    tagline: "Хөнгөн Хөдөлгөөнт Байдал",
    title: "Таблет",
    description: "Ажил, амралтыг хослуулсан өндөр үзүүлэлттэй таблетууд таны өдөр тутмын туслах байх болно.",
    image: "/images/tablets.png",
    primaryCta: "Худалдан Авах",
    secondaryCta: "Дэлгэрэнгүй"
  },
  {
    id: "headphones",
    tagline: "Дээд Зэргийн Дуугаралт",
    title: "Чихэвч",
    description: "Утасгүй, дуу тусгаарлагчтай, дээд зэрэглэлийн чихэвчнүүдээр хөгжим сонсох шинэ түвшинд хүрээрэй.",
    image: "/images/headphones.png",
    primaryCta: "Худалдан Авах",
    secondaryCta: "Дэлгэрэнгүй"
  },
  {
    id: "smarttvs",
    tagline: "Төгс Зугаа Цэнгэл",
    title: "Смарт ТВ",
    description: "HD болон 4K нягтралтай, интернэт холболттой, ухаалаг функцүүд бүхий телевизүүд таны гэрийн энтертайнмент төв байх болно.",
    image: "/images/smartv.png",
    primaryCta: "Худалдан Авах",
    secondaryCta: "Дэлгэрэнгүй"
  }
];

// Custom styled input field
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    height: '23px',
    transform: 'translate(14px, 16px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
    }
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputBase-input.MuiOutlinedInput-input': {
    padding: '12px 14px',
  },
  '& .MuiInputBase-inputMultiline': {
    height: 'auto',
  }
}));

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  marginLeft: 0,
  marginTop: 0,
  width: '100%',
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

// Component to display image
const BannerImage = styled('div')(({ theme, url }) => ({
  width: '100%',
  height: 180,
  backgroundImage: `url(${url})`,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  borderRadius: 4,
  marginBottom: 16,
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.8)',
}));

// Preview component
const BannerPreview = styled(Card)(({ theme }) => ({
  marginTop: 16,
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 8,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 8px 24px rgba(0, 0, 0, 0.2)' 
    : '0 2px 14px rgba(0, 0, 0, 0.1)',
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
  }
}));

const AdminSettings = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  
  // Banner data state
  const [bannerData, setBannerData] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [editedBanner, setEditedBanner] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('jwt');
    const userRole = localStorage.getItem('role');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (userRole !== 'ADMIN') {
      router.push('/home');
      return;
    }
    
    // Load banner data
    loadBannerData();
  }, [router]);
  
  const loadBannerData = () => {
    setLoading(true);
    try {
      // Try to load from localStorage first
      const savedBannerData = localStorage.getItem('bannerData');
      
      if (savedBannerData) {
        const parsedData = JSON.parse(savedBannerData);
        setBannerData(parsedData);
        setSelectedBanner(parsedData[0]);
        setEditedBanner(parsedData[0]);
      } else {
        // Use default data if nothing in localStorage
        setBannerData(defaultBannerData);
        setSelectedBanner(defaultBannerData[0]);
        setEditedBanner(defaultBannerData[0]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load banner data. Using default data.');
      console.error('Error loading banner data:', err);
      
      // Fallback to default data on error
      setBannerData(defaultBannerData);
      setSelectedBanner(defaultBannerData[0]);
      setEditedBanner(defaultBannerData[0]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    const selected = bannerData[newValue];
    setSelectedBanner(selected);
    setEditedBanner(selected);
    setSuccess(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBanner({
      ...editedBanner,
      [name]: value
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // For simplicity, we'll just read and store the image URL
    // In a real application, you'd upload this to a server or CDN
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditedBanner({
        ...editedBanner,
        image: event.target.result
      });
    };
    reader.readAsDataURL(file);
  };
  
  const handleSaveBanner = () => {
    // Update the banner in the bannerData array
    const updatedBannerData = bannerData.map(banner => 
      banner.id === editedBanner.id ? editedBanner : banner
    );
    
    // Save to state and localStorage
    setBannerData(updatedBannerData);
    setSelectedBanner(editedBanner);
    
    // Use a special technique to trigger storage event
    // localStorage can't trigger storage event in the same window that sets it
    // We'll use a workaround to make it work
    localStorage.setItem('bannerData', JSON.stringify(updatedBannerData));
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'bannerData',
      newValue: JSON.stringify(updatedBannerData),
      storageArea: localStorage
    }));
    
    // Show success message
    setSuccess('Banner successfully updated!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const handleResetBanner = () => {
    // Reset to original default data for this banner
    const defaultBanner = defaultBannerData.find(banner => banner.id === selectedBanner.id);
    setEditedBanner(defaultBanner);
    
    // Update in the bannerData array
    const updatedBannerData = bannerData.map(banner => 
      banner.id === defaultBanner.id ? defaultBanner : banner
    );
    
    // Save to state and localStorage
    setBannerData(updatedBannerData);
    setSelectedBanner(defaultBanner);
    localStorage.setItem('bannerData', JSON.stringify(updatedBannerData));
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'bannerData',
      newValue: JSON.stringify(updatedBannerData),
      storageArea: localStorage
    }));
    
    // Show success message
    setSuccess('Banner reset to default!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const handleResetAllBanners = () => {
    if (confirm('Are you sure you want to reset all banners to default?')) {
      // Reset all banners to default
      setBannerData(defaultBannerData);
      setSelectedBanner(defaultBannerData[currentTab]);
      setEditedBanner(defaultBannerData[currentTab]);
      localStorage.setItem('bannerData', JSON.stringify(defaultBannerData));
      
      // Dispatch a storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'bannerData',
        newValue: JSON.stringify(defaultBannerData),
        storageArea: localStorage
      }));
      
      // Show success message
      setSuccess('All banners reset to default!');
      setTimeout(() => setSuccess(null), 3000);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      overflow: 'hidden',
      width: '100%',
      position: 'relative'
    }}>
      <AdminHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <Main>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Banner Settings
            </Typography>
            <Button 
              variant="outlined" 
              color="warning" 
              onClick={handleResetAllBanners}
              startIcon={<ResetIcon />}
            >
              Reset All Banners
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="banner tabs"
            >
              {bannerData.map((banner, index) => (
                <Tab label={banner.title} key={banner.id} id={`banner-tab-${index}`} />
              ))}
            </Tabs>
          </Box>
          
          {editedBanner && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Edit Banner
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Banner Image
                    </Typography>
                    <BannerImage url={editedBanner.image}>
                      {!editedBanner.image && <Typography>No image selected</Typography>}
                    </BannerImage>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<ImageIcon />}
                    >
                      Change Image
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Banner Text
                    </Typography>
                    
                    <StyledTextField
                      fullWidth
                      margin="normal"
                      label="Tagline"
                      name="tagline"
                      value={editedBanner.tagline}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                    />
                    
                    <StyledTextField
                      fullWidth
                      margin="normal"
                      label="Title"
                      name="title"
                      value={editedBanner.title}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                    />
                    
                    <StyledTextField
                      fullWidth
                      margin="normal"
                      label="Description"
                      name="description"
                      value={editedBanner.description}
                      onChange={handleInputChange}
                      multiline
                      rows={4}
                      sx={{ mb: 2 }}
                    />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <StyledTextField
                          fullWidth
                          margin="normal"
                          label="Primary CTA"
                          name="primaryCta"
                          value={editedBanner.primaryCta}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <StyledTextField
                          fullWidth
                          margin="normal"
                          label="Secondary CTA"
                          name="secondaryCta"
                          value={editedBanner.secondaryCta}
                          onChange={handleInputChange}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      onClick={handleResetBanner}
                      startIcon={<ResetIcon />}
                    >
                      Reset to Default
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleSaveBanner}
                      startIcon={<SaveIcon />}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Banner Preview
                  </Typography>
                  
                  <BannerPreview>
                    <CardContent>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        gap: 3
                      }}>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                          <img 
                            src={editedBanner.image} 
                            alt={editedBanner.title}
                            style={{ maxWidth: '100%', height: 'auto', maxHeight: 200 }}
                          />
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="overline" color="primary" gutterBottom>
                            {editedBanner.tagline}
                          </Typography>
                          <Typography variant="h4" component="h2" gutterBottom>
                            {editedBanner.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {editedBanner.description}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Button variant="contained" color="primary" size="small" sx={{ mr: 1 }}>
                              {editedBanner.primaryCta}
                            </Button>
                            <Button variant="outlined" color="primary" size="small">
                              {editedBanner.secondaryCta}
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </BannerPreview>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Banner JSON Data
                    </Typography>
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: 1, 
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        overflowX: 'auto',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      <pre>{JSON.stringify(editedBanner, null, 2)}</pre>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          )}
        </Container>
      </Main>
    </Box>
  );
};

export default AdminSettings;
