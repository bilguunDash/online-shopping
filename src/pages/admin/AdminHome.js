import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  CircularProgress,
  useTheme,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from '../../components/AdminHeader';
// Icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
// Recharts components
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../utils/axios';

const drawerWidth = 250;

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  marginLeft: 0,
  marginTop: 0,
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
    : '0 2px 10px rgba(0,0,0,0.08)',
  borderRadius: '10px',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 8px 30px rgba(0, 0, 0, 0.4)' 
      : '0 5px 15px rgba(0,0,0,0.1)',
  }
}));

const IconContainer = styled(Box)(({ theme, bgcolor }) => ({
  width: 60,
  height: 60,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: bgcolor,
  marginBottom: theme.spacing(2),
}));

const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '10px',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
    : '0 2px 10px rgba(0,0,0,0.08)',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  overflow: 'hidden'
}));

const ProductItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.02)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)',
  }
}));

const ProductImage = styled('img')({
  width: 40,
  height: 40,
  objectFit: 'contain',
  marginRight: 12,
  borderRadius: 4
});

// Generate last 7 days with Mongolian names
const getLast7Days = () => {
  const days = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
  const result = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayName = days[date.getDay()];
    result.push({
      name: dayName,
      date: `${date.getMonth() + 1}/${date.getDate()}`
    });
  }
  
  return result;
};

const AdminHome = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [chartData, setChartData] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [chartType, setChartType] = useState(0);
  const [orders, setOrders] = useState([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF', '#4BC0C0'];

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Load real data instead of mock data
    fetchOrders();
  }, [router]);
  
  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/orders-all", {
        baseURL: 'http://localhost:8083'
      });
      
      const ordersData = response.data || [];
      setOrders(ordersData);
      
      // Process the orders data
      processOrdersData(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fall back to mock data if API fails
      loadMockData();
    }
  };
  
  // Process orders data to create stats and charts
  const processOrdersData = (ordersData) => {
    if (!ordersData || ordersData.length === 0) {
      loadMockData();
      return;
    }
    
    try {
      // Calculate total revenue
      const totalRevenue = ordersData.reduce((sum, order) => {
        return sum + (order.totalAmount || 0);
      }, 0);
      
      // Count orders by product categories
      const categoryCounts = {};
      const productSales = {};
      
      // Process each order
      ordersData.forEach(order => {
        const category = getCategoryFromProduct(order.productName || '');
        
        // Count for category chart
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + (order.quantity || 1);
        }
        
        // Count for product sales
        const productName = order.productName || 'Unknown Product';
        if (productName !== 'Unknown Product') {
          if (!productSales[productName]) {
            productSales[productName] = {
              name: productName,
              category: category || 'other',
              sales: 0,
              revenue: 0,
              image: getImageByCategory(category)
            };
          }
          productSales[productName].sales += (order.quantity || 1);
          productSales[productName].revenue += (order.totalAmount || 0);
        }
      });
      
      // Convert category counts to chart format
      const categoryData = Object.keys(categoryCounts).map(category => ({
        name: getCategoryDisplay(category),
        value: categoryCounts[category]
      }));
      
      // Get top selling products
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
      
      // Generate sales data for last 7 days
      const last7Days = getLast7Days();
      const salesByDay = groupOrdersByDay(ordersData);
      
      const salesData = last7Days.map(day => {
        const dayData = { ...day };
        const dayOrders = salesByDay[day.date] || [];
        
        // Count sales for each category
        const dayCategoryCounts = {};
        dayOrders.forEach(order => {
          const category = getCategoryFromProduct(order.productName || '');
          if (category) {
            dayCategoryCounts[category] = (dayCategoryCounts[category] || 0) + (order.quantity || 1);
          }
        });
        
        // Add category data to day data
        dayData.computers = dayCategoryCounts.computers || 0;
        dayData.laptops = dayCategoryCounts.laptops || 0;
        dayData.phones = dayCategoryCounts.phones || 0;
        dayData.tablets = dayCategoryCounts.tablets || 0;
        dayData.headphones = dayCategoryCounts.headphones || 0;
        dayData.smarttvs = dayCategoryCounts.smarttvs || 0;
        
        return dayData;
      });
      
      // Set state data
      setChartData(salesData);
      setTopSellingProducts(topProducts);
      setCategoryData(categoryData.length > 0 ? categoryData : generateMockCategoryData());
      setStats({
        totalOrders: ordersData.length,
        totalUsers: ordersData.reduce((acc, order) => {
          return acc.includes(order.email) ? acc : [...acc, order.email];
        }, []).length,
        totalRevenue: totalRevenue,
        totalProducts: Object.keys(productSales).length
      });
      
    } catch (error) {
      console.error('Error processing orders data:', error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get category from product name
  const getCategoryFromProduct = (productName) => {
    productName = productName.toLowerCase();
    
    if (productName.includes('laptop') || productName.includes('macbook') || productName.includes('notebook')) {
      return 'laptops';
    } else if (productName.includes('phone') || productName.includes('iphone') || productName.includes('samsung') || productName.includes('pixel')) {
      return 'phones';
    } else if (productName.includes('tablet') || productName.includes('ipad') || productName.includes('galaxy tab')) {
      return 'tablets';
    } else if (productName.includes('headphone') || productName.includes('earphone') || productName.includes('buds') || productName.includes('airpod')) {
      return 'headphones';
    } else if (productName.includes('tv') || productName.includes('television')) {
      return 'smarttvs';
    } else if (productName.includes('computer') || productName.includes('pc') || productName.includes('desktop') || productName.includes('imac')) {
      return 'computers';
    }
    
    // Default category
    return 'other';
  };
  
  // Helper function to get category display name
  const getCategoryDisplay = (category) => {
    const displayNames = {
      'laptops': 'Лаптоп',
      'phones': 'Утас',
      'tablets': 'Таблет',
      'headphones': 'Чихэвч',
      'smarttvs': 'Смарт ТВ',
      'computers': 'Компьютер',
      'other': 'Бусад'
    };
    
    return displayNames[category] || 'Бусад';
  };
  
  // Helper function to get image by category
  const getImageByCategory = (category) => {
    const images = {
      'laptops': '/images/notebook.png',
      'phones': '/images/nice.png',
      'tablets': '/images/tablets.png',
      'headphones': '/images/headphones.png',
      'smarttvs': '/images/smartv.png',
      'computers': '/images/pc.png'
    };
    
    return images[category] || '/images/nice.png';
  };
  
  // Helper function to group orders by day
  const groupOrdersByDay = (orders) => {
    const result = {};
    
    orders.forEach(order => {
      if (!order.createdAt) return;
      
      const date = new Date(order.createdAt);
      const dayKey = `${date.getMonth() + 1}/${date.getDate()}`;
      
      if (!result[dayKey]) {
        result[dayKey] = [];
      }
      
      result[dayKey].push(order);
    });
    
    return result;
  };
  
  // Fallback to mock data if API fails
  const loadMockData = () => {
    // Generate last 7 days
    const last7Days = getLast7Days();
    
    // Generate random sales data for the last 7 days
    const salesData = last7Days.map(day => {
      return {
        ...day,
        computers: Math.floor(Math.random() * 12) + 1,
        laptops: Math.floor(Math.random() * 15) + 2,
        phones: Math.floor(Math.random() * 28) + 5,
        tablets: Math.floor(Math.random() * 10) + 1,
        headphones: Math.floor(Math.random() * 20) + 3,
        smarttvs: Math.floor(Math.random() * 8) + 1
      };
    });
    
    // Mock top selling products
    const mockTopProducts = [
      { id: 1, name: 'iPhone 14 Pro', category: 'phones', sales: 48, image: '/images/nice.png' },
      { id: 2, name: 'MacBook Air M2', category: 'laptops', sales: 32, image: '/images/notebook.png' },
      { id: 3, name: 'Sony WH-1000XM5', category: 'headphones', sales: 27, image: '/images/headphones.png' },
      { id: 4, name: 'Samsung Galaxy S23', category: 'phones', sales: 24, image: '/images/nice.png' },
      { id: 5, name: 'iPad Pro 12.9"', category: 'tablets', sales: 19, image: '/images/tablets.png' }
    ];
    
    // Set mock data
    setChartData(salesData);
    setTopSellingProducts(mockTopProducts);
    setCategoryData(generateMockCategoryData());
      setStats({
        totalOrders: 142,
        totalUsers: 375,
        totalRevenue: 28500,
        totalProducts: 85
      });
    
    // Finish loading
      setLoading(false);
  };
  
  // Generate mock category data
  const generateMockCategoryData = () => {
    return [
      { name: 'Утас', value: 128 },
      { name: 'Лаптоп', value: 86 },
      { name: 'Компьютер', value: 42 },
      { name: 'Чихэвч', value: 65 },
      { name: 'Таблет', value: 37 },
      { name: 'Смарт ТВ', value: 29 }
    ];
  };

  const handleChartTypeChange = (event, newValue) => {
    setChartType(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Нийт Хэрэглэгч',
      value: stats.totalUsers,
      icon: <PeopleAltIcon sx={{ fontSize: 28, color: 'white' }} />,
      color: '#4361ee',
      path: '/admin/AdminUsersManagement'
    },
    {
      title: 'Нийт Захиалга',
      value: stats.totalOrders,
      icon: <ShoppingCartIcon sx={{ fontSize: 28, color: 'white' }} />,
      color: '#3a0ca3',
      path: '/admin/AdminOrders'
    },
    {
      title: 'Нийт Орлого',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <MonetizationOnIcon sx={{ fontSize: 28, color: 'white' }} />,
      color: '#4cc9f0',
      path: '/admin/AdminOrders'
    },
    {
      title: 'Нийт Бүтээгдэхүүн',
      value: stats.totalProducts,
      icon: <InventoryIcon sx={{ fontSize: 28, color: 'white' }} />,
      color: '#f72585',
      path: '/admin/AdminProducts'
    }
  ];

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
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: theme.palette.text.primary }}>
            Хяналтын самбар
          </Typography>
          
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <StatsCard>
                  <CardContent>
                    <IconContainer bgcolor={card.color}>
                      {card.icon}
                    </IconContainer>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, my: 1, color: theme.palette.text.primary }}>
                      {card.value}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button 
                      variant="text" 
                      size="small"
                      onClick={() => router.push(card.path)}
                      sx={{ fontWeight: 500, color: theme.palette.primary.main }}
                    >
                      Дэлгэрэнгүй
                    </Button>
                  </Box>
                </StatsCard>
              </Grid>
            ))}
          </Grid>
          
          {/* Sales Chart */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <ChartContainer>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Сүүлийн 7 хоногийн борлуулалт
                  </Typography>
                  
                  <Tabs 
                    value={chartType} 
                    onChange={handleChartTypeChange}
                    sx={{ minHeight: 'auto' }}
                  >
                    <Tab label="График" sx={{ minHeight: 'auto', py: 1 }} />
                    <Tab label="Багана" sx={{ minHeight: 'auto', py: 1 }} />
                    <Tab label="Талбай" sx={{ minHeight: 'auto', py: 1 }} />
                  </Tabs>
                </Box>
                
                <Box sx={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 0 ? (
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: theme.palette.text.secondary }}
                          tickLine={{ stroke: theme.palette.divider }}
                          axisLine={{ stroke: theme.palette.divider }}
                        />
                        <YAxis 
                          tick={{ fill: theme.palette.text.secondary }}
                          tickLine={{ stroke: theme.palette.divider }}
                          axisLine={{ stroke: theme.palette.divider }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8,
                            boxShadow: theme.shadows[3],
                            color: theme.palette.text.primary
                          }}
                          labelStyle={{ color: theme.palette.text.primary, fontWeight: 'bold', marginBottom: 5 }}
                          formatter={(value) => [`${value} ширхэг`]}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="computers" stroke="#0088FE" name="Компьютер" strokeWidth={2} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="laptops" stroke="#00C49F" name="Лаптоп" strokeWidth={2} />
                        <Line type="monotone" dataKey="phones" stroke="#FFBB28" name="Утас" strokeWidth={2} />
                        <Line type="monotone" dataKey="tablets" stroke="#FF8042" name="Таблет" strokeWidth={2} />
                        <Line type="monotone" dataKey="headphones" stroke="#A259FF" name="Чихэвч" strokeWidth={2} />
                        <Line type="monotone" dataKey="smarttvs" stroke="#4BC0C0" name="Смарт ТВ" strokeWidth={2} />
                      </LineChart>
                    ) : chartType === 1 ? (
                      <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: theme.palette.text.secondary }}
                          tickLine={{ stroke: theme.palette.divider }}
                          axisLine={{ stroke: theme.palette.divider }}
                        />
                        <YAxis 
                          tick={{ fill: theme.palette.text.secondary }}
                          tickLine={{ stroke: theme.palette.divider }}
                          axisLine={{ stroke: theme.palette.divider }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8,
                            boxShadow: theme.shadows[3],
                            color: theme.palette.text.primary
                          }}
                          labelStyle={{ color: theme.palette.text.primary, fontWeight: 'bold', marginBottom: 5 }}
                          formatter={(value) => [`${value} ширхэг`]}
                        />
                        <Legend />
                        <Bar dataKey="computers" fill="#0088FE" name="Компьютер" />
                        <Bar dataKey="laptops" fill="#00C49F" name="Лаптоп" />
                        <Bar dataKey="phones" fill="#FFBB28" name="Утас" />
                        <Bar dataKey="tablets" fill="#FF8042" name="Таблет" />
                        <Bar dataKey="headphones" fill="#A259FF" name="Чихэвч" />
                        <Bar dataKey="smarttvs" fill="#4BC0C0" name="Смарт ТВ" />
                      </BarChart>
                    ) : (
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: theme.palette.text.secondary }}
                          tickLine={{ stroke: theme.palette.divider }}
                          axisLine={{ stroke: theme.palette.divider }}
                        />
                        <YAxis 
                          tick={{ fill: theme.palette.text.secondary }}
                          tickLine={{ stroke: theme.palette.divider }}
                          axisLine={{ stroke: theme.palette.divider }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8,
                            boxShadow: theme.shadows[3],
                            color: theme.palette.text.primary
                          }}
                          labelStyle={{ color: theme.palette.text.primary, fontWeight: 'bold', marginBottom: 5 }}
                          formatter={(value) => [`${value} ширхэг`]}
                        />
                        <Legend />
                        <Area type="monotone" dataKey="computers" stackId="1" fill="#0088FE" stroke="#0088FE" name="Компьютер" />
                        <Area type="monotone" dataKey="laptops" stackId="1" fill="#00C49F" stroke="#00C49F" name="Лаптоп" />
                        <Area type="monotone" dataKey="phones" stackId="1" fill="#FFBB28" stroke="#FFBB28" name="Утас" />
                        <Area type="monotone" dataKey="tablets" stackId="1" fill="#FF8042" stroke="#FF8042" name="Таблет" />
                        <Area type="monotone" dataKey="headphones" stackId="1" fill="#A259FF" stroke="#A259FF" name="Чихэвч" />
                        <Area type="monotone" dataKey="smarttvs" stackId="1" fill="#4BC0C0" stroke="#4BC0C0" name="Смарт ТВ" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </Box>
              </ChartContainer>
            </Grid>
          </Grid>
          
          {/* Top Selling Products and Category Distribution */}
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <ChartContainer>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: theme.palette.text.primary }}>
                  Хамгийн Их Зарагдсан Бүтээгдэхүүн
                </Typography>
                
                {topSellingProducts.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      Борлуулалтын мэдээлэл байхгүй байна
                    </Typography>
                  </Box>
                ) : (
                  topSellingProducts.map((product, index) => (
                    <ProductItem key={product.id || index}>
                      <ProductImage src={product.image} alt={product.name} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getCategoryDisplay(product.category)}
                        </Typography>
                      </Box>
                      <Box 
                sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'flex-end'
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {product.sales} ширхэг
                </Typography>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: index % 2 === 0 ? 'success.main' : 'error.main'
                          }}
                        >
                          {index % 2 === 0 ? (
                            <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                          ) : (
                            <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                          )}
                          <Typography variant="caption">
                            {index % 2 === 0 ? '+' : '-'}{Math.floor(Math.random() * 20) + 5}%
                </Typography>
                        </Box>
                      </Box>
                    </ProductItem>
                  ))
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => router.push('/admin/AdminOrders')}
                    sx={{ fontWeight: 500 }}
                  >
                    Бүх захиалга харах
                  </Button>
                </Box>
              </ChartContainer>
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <ChartContainer>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: theme.palette.text.primary }}>
                  Ангилал Бүрээр Борлуулалт
                </Typography>
                
                {categoryData.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      Ангиллын мэдээлэл байхгүй байна
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8,
                              boxShadow: theme.shadows[3],
                              color: theme.palette.text.primary
                            }}
                            formatter={(value, name, props) => [`${value} ширхэг`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box>
                      {categoryData.map((category, index) => (
                        <Box 
                          key={category.name} 
                sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                mr: 1,
                                bgcolor: COLORS[index % COLORS.length]
                              }} 
                            />
                            <Typography variant="body2">
                              {category.name}
                </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {category.value} ширхэг
                </Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </ChartContainer>
            </Grid>
          </Grid>
        </Container>
      </Main>
    </Box>
  );
};

AdminHome.displayName = 'AdminHome';

// Wrap the component with role-based protection
import roleBasedRoute from '../../utils/roleBasedRoute';
export default roleBasedRoute(AdminHome, "ADMIN"); 