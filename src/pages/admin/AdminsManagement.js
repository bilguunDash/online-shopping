import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api, { API_ENDPOINTS, authApi } from "../../utils/axios";
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Alert, 
  CircularProgress,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from '../../components/admin/AdminHeader';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const drawerWidth = 0;

// Add custom styles for text fields
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
    height: '50px',
    padding: '10px 14px',
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

const AdminsManagement = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const theme = useTheme();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form state for adding new admin
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
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
    
    fetchAdmins();
  }, [router]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.admin.all);
      setAdmins(response.data);
      setError(null);
    } catch (err) {
      setError('Админ жагсаалтыг ачааллах үйлдэл амжилтгүй боллоо. Дахин оролдоно уу.');
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (id) => {
    if (window.confirm('Та энэ админыг устгахдаа итгэлтэй байна уу?')) {
      try {
        await api.delete(API_ENDPOINTS.admin.delete(id));
        // Remove from state
        setAdmins(admins.filter(admin => admin.id !== id));
      } catch (err) {
        setError('Админыг устгах үйлдэл амжилтгүй боллоо. Дахин оролдоно уу.');
        console.error('Error deleting admin:', err);
      }
    }
  };

  // Add new admin
  const handleAddAdmin = async () => {
    if (validateForm()) {
      try {
        const registrationData = {
          firstname: newAdmin.firstName,
          lastname: newAdmin.lastName,
          email: newAdmin.email,
          password: newAdmin.password,
          phone: newAdmin.phone || null,
          role: 'ADMIN' // Setting role as ADMIN
        };
        
        console.log("Sending registration data:", registrationData);
        
        try {
          // Try admin-specific endpoint pattern
          const response = await api.post(API_ENDPOINTS.admin.register, registrationData);
          console.log("Registration success response:", response.data);
          
          // Clear form and close modal
          setNewAdmin({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: ''
          });
          setShowAddModal(false);
          
          // Refresh admins list
          fetchAdmins();
        } catch (err) {
          // Fallback to auth register if admin register fails
          try {
            console.log("Trying auth register endpoint");
            const authResponse = await authApi.post("/register", registrationData);
            console.log("Auth register success:", authResponse.data);
            
            // Clear form and close modal
            setNewAdmin({
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              phone: ''
            });
            setShowAddModal(false);
            
            // Refresh admins list
            fetchAdmins();
          } catch (authErr) {
            console.error("Registration error details:", {
              status: authErr.response?.status,
              statusText: authErr.response?.statusText,
              data: authErr.response?.data,
              message: authErr.message
            });
            setError(`Failed to add admin: ${authErr.response?.data?.message || authErr.message}`);
          }
        }
      } catch (err) {
        setError(`Failed to add admin: ${err.response?.data?.message || err.message}`);
        console.error('Error adding admin:', err);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newAdmin.firstName.trim()) {
      newErrors.firstName = "Нэр оруулна уу";
    }
    
    if (!newAdmin.lastName.trim()) {
      newErrors.lastName = "Овог оруулна уу";
    }
    
    if (!newAdmin.email.trim()) {
      newErrors.email = "И-мэйл оруулна уу";
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      newErrors.email = "И-мэйл хаяг буруу байна";
    }
    
    if (!newAdmin.password) {
      newErrors.password = "Нууц үг оруулна уу";
    } else if (newAdmin.password.length < 8) {
      newErrors.password = "Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой";
    }
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      newErrors.confirmPassword = "Нууц үг таарахгүй байна";
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdmin({
      ...newAdmin,
      [name]: value
    });
  };

  const handleEditAdmin = async () => {
    if (validateEditForm()) {
      try {
        // Log what we're sending for debugging
        console.log("Original editingAdmin data:", editingAdmin);
        
        // Convert to exact format expected by backend User entity
        const adminUpdateData = {
          id: Number(editingAdmin.id),
          firstName: editingAdmin.firstName.trim(),
          lastName: editingAdmin.lastName.trim(),
          email: editingAdmin.email.trim(),
          phone: editingAdmin.phone ? editingAdmin.phone.trim() : null,
          role: 'ADMIN'
        };
        
        console.log("Formatted data for API:", adminUpdateData);
        
        // Use the API_ENDPOINTS constant
        const response = await api.post(API_ENDPOINTS.user.update, adminUpdateData);
        
        console.log("Update response:", response.data);
        
        // Update the admin in the list
        setAdmins(admins.map(admin => 
          admin.id === editingAdmin.id ? adminUpdateData : admin
        ));
        
        // Clear form and close modal
        setEditingAdmin(null);
        setShowEditModal(false);
        
        // Show success notification
        setNotification({
          open: true,
          message: response.data.message || 'Админы мэдээлэл амжилттай шинэчлэгдлээ',
          severity: 'success'
        });
        
      } catch (err) {
        console.error("Update error details:", {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: err.message,
          requestData: err.config?.data
        });
        
        setNotification({
          open: true,
          message: 'Админы мэдээлэл шинэчлэх үед алдаа гарлаа: ' + 
                   (err.response?.data?.message || err.response?.data || err.message),
          severity: 'error'
        });
      }
    }
  };

  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editingAdmin.firstName.trim()) {
      newErrors.firstName = "Нэр оруулна уу";
    }
    
    if (!editingAdmin.lastName.trim()) {
      newErrors.lastName = "Овог оруулна уу";
    }
    
    if (!editingAdmin.email.trim()) {
      newErrors.email = "И-мэйл оруулна уу";
    } else if (!/\S+@\S+\.\S+/.test(editingAdmin.email)) {
      newErrors.email = "И-мэйл хаяг буруу байна";
    }
    
    if (editingAdmin.phone && !/^\d{8}$/.test(editingAdmin.phone)) {
      newErrors.phone = "Утасны дугаар 8 оронтой байх ёстой";
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingAdmin({
      ...editingAdmin,
      [name]: value
    });
  };

  const openEditModal = (admin) => {
    setEditingAdmin({
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone || '',
      role: admin.role
    });
    setShowEditModal(true);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
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
              Админ удирдлага
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<PersonAddIcon />}
              onClick={() => setShowAddModal(true)}
              sx={{ 
                fontWeight: 600,
                boxShadow: theme.shadows[4]
              }}
            >
              Шинэ админ нэмэх
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <div style={{ 
            width: '100%', 
            overflowX: 'auto', 
            borderRadius: '10px',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
              : '0 2px 10px rgba(0,0,0,0.08)',
            backgroundColor: theme.palette.background.paper
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
              tableLayout: 'fixed'
            }}>
              <colgroup>
                <col style={{ width: '5%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr style={{ 
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1
                }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>#</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Нэр</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Овог</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>И-мэйл</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Утас</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Бүртгүүлсэн огноо</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Үйлдлүүд</th>
                </tr>
              </thead>
              <tbody>
                {admins.length > 0 ? (
                  admins.map((admin, index) => (
                    <tr key={index} style={{ 
                      backgroundColor: index % 2 === 0 ? 'transparent' : 
                        (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)'),
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
                      }
                    }}>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}`, verticalAlign: 'middle' }}>{index + 1}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}`, verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.firstName}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}`, verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.lastName}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}`, verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.email}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}`, verticalAlign: 'middle' }}>{admin.phone || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}`, verticalAlign: 'middle' }}>
                        {admin.createdAt 
                          ? new Date(admin.createdAt).toLocaleDateString() 
                          : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}`, textAlign: 'center', verticalAlign: 'middle' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Засах" arrow placement="top">
                            <IconButton
                              onClick={() => openEditModal(admin)}
                              size="small"
                              sx={{
                                color: theme.palette.primary.main,
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(25, 118, 210, 0.08)' 
                                  : 'rgba(25, 118, 210, 0.04)',
                                '&:hover': {
                                  backgroundColor: theme.palette.mode === 'dark'
                                    ? 'rgba(25, 118, 210, 0.12)'
                                    : 'rgba(25, 118, 210, 0.08)',
                                },
                                transition: 'all 0.2s ease-in-out',
                                borderRadius: '8px',
                                padding: '8px',
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Устгах" arrow placement="top">
                            <IconButton
                              onClick={() => handleDeleteAdmin(admin.id || index)}
                              size="small"
                              sx={{
                                color: theme.palette.error.main,
                                backgroundColor: theme.palette.mode === 'dark'
                                  ? 'rgba(211, 47, 47, 0.08)'
                                  : 'rgba(211, 47, 47, 0.04)',
                                '&:hover': {
                                  backgroundColor: theme.palette.mode === 'dark'
                                    ? 'rgba(211, 47, 47, 0.12)'
                                    : 'rgba(211, 47, 47, 0.08)',
                                },
                                transition: 'all 0.2s ease-in-out',
                                borderRadius: '8px',
                                padding: '8px',
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px 16px', textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                      Админ олдсонгүй
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </Main>

      {/* Add Admin Dialog */}
      <Dialog 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '10px',
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
          Шинэ админ нэмэх
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <StyledTextField
            fullWidth
            margin="dense"
            label="Нэр"
            name="firstName"
            value={newAdmin.firstName}
            onChange={handleInputChange}
            error={!!formErrors.firstName}
            helperText={formErrors.firstName}
            sx={{ mb: 2 }}
          />
          <StyledTextField
            fullWidth
            margin="dense"
            label="Овог"
            name="lastName"
            value={newAdmin.lastName}
            onChange={handleInputChange}
            error={!!formErrors.lastName}
            helperText={formErrors.lastName}
            sx={{ mb: 2 }}
          />
          <StyledTextField
            fullWidth
            margin="dense"
            label="И-мэйл"
            name="email"
            type="email"
            value={newAdmin.email}
            onChange={handleInputChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            sx={{ mb: 2 }}
          />
          <StyledTextField
            fullWidth
            margin="dense"
            label="Утас"
            name="phone"
            type="number"
            value={newAdmin.phone}
            onChange={handleInputChange}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
            sx={{ mb: 2 }}
          />
          <StyledTextField
            fullWidth
            margin="dense"
            label="Нууц үг"
            name="password"
            type="password"
            value={newAdmin.password}
            onChange={handleInputChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            sx={{ mb: 2 }}
          />
          <StyledTextField
            fullWidth
            margin="dense"
            label="Нууц үг баталгаажуулах"
            name="confirmPassword"
            type="password"
            value={newAdmin.confirmPassword}
            onChange={handleInputChange}
            error={!!formErrors.confirmPassword}
            helperText={formErrors.confirmPassword}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowAddModal(false)} 
            color="inherit"
            sx={{ 
              fontWeight: 500,
              borderRadius: '8px'
            }}
          >
            Цуцлах
          </Button>
          <Button 
            onClick={handleAddAdmin} 
            variant="contained" 
            color="primary"
            sx={{ 
              fontWeight: 600,
              borderRadius: '8px'
            }}
          >
            Админ нэмэх
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog 
        open={showEditModal} 
        onClose={() => setShowEditModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '10px',
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
          Админы мэдээлэл засах
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <StyledTextField
            fullWidth
            margin="dense"
            label="Нэр"
            name="firstName"
            value={editingAdmin?.firstName || ''}
            onChange={handleEditInputChange}
            error={!!formErrors.firstName}
            helperText={formErrors.firstName}
            sx={{ mb: 2 }}
          />
          <StyledTextField
            fullWidth
            margin="dense"
            label="Овог"
            name="lastName"
            value={editingAdmin?.lastName || ''}
            onChange={handleEditInputChange}
            error={!!formErrors.lastName}
            helperText={formErrors.lastName}
            sx={{ mb: 2 }}
          />
          <StyledTextField
            fullWidth
            margin="dense"
            label="И-мэйл"
            name="email"
            type="email"
            value={editingAdmin?.email || ''}
            onChange={handleEditInputChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            sx={{ mb: 2 }}
          />
          <StyledTextField
            fullWidth
            margin="dense"
            label="Утас"
            name="phone"
            type="tel"
            value={editingAdmin?.phone || ''}
            onChange={handleEditInputChange}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowEditModal(false)} 
            color="inherit"
            sx={{ 
              fontWeight: 500,
              borderRadius: '8px'
            }}
          >
            Цуцлах
          </Button>
          <Button 
            onClick={handleEditAdmin} 
            variant="contained" 
            color="primary"
            sx={{ 
              fontWeight: 600,
              borderRadius: '8px'
            }}
          >
            Хадгалах
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminsManagement;
