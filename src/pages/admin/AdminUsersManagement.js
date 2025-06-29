import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api, { API_ENDPOINTS, authApi } from "../../utils/axios";
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  TextField,
  Alert, 
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from '../../components/admin/AdminHeader';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';

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

const AdminUsersManagement = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Form state for adding new user
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Form state for editing user
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
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
    
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.user.all);
      
      // Log the structure of the first user to debug date fields
      if (response.data && response.data.length > 0) {
        console.log("User data structure:", response.data[0]);
      }
      
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Хэрэглэгчдийн жагсаалтыг ачааллах үйлдэл амжилтгүй боллоо. Дахин оролдоно уу.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (window.confirm('Та энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?')) {
      try {
        await api.delete(API_ENDPOINTS.user.delete(id));
        // Remove from state
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        setError('Хэрэглэгчийг устгах үйлдэл амжилтгүй боллоо. Дахин оролдоно уу.');
        console.error('Error deleting user:', err);
      }
    }
  };

  // Add new user
  const handleAddUser = async () => {
    if (validateForm()) {
      try {
        const registrationData = {
          firstname: newUser.firstName,
          lastname: newUser.lastName,
          email: newUser.email,
          password: newUser.password,
          phone: newUser.phone || null,
          role: 'USER' // Setting role as USER
        };
        
        console.log("Sending registration data:", registrationData);
        
        try {
          // Try user registration endpoint
          const response = await authApi.post("/register", registrationData);
          console.log("Registration success response:", response.data);
          
          // Clear form and close modal
          setNewUser({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: ''
          });
          setShowAddModal(false);
          
          // Refresh users list
          fetchUsers();
        } catch (err) {
          console.error("Registration error details:", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message
          });
          setError(`Failed to add user: ${err.response?.data?.message || err.message}`);
        }
      } catch (err) {
        setError(`Failed to add user: ${err.response?.data?.message || err.message}`);
        console.error('Error adding user:', err);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newUser.firstName.trim()) {
      newErrors.firstName = "Нэр оруулна уу";
    }
    
    if (!newUser.lastName.trim()) {
      newErrors.lastName = "Овог оруулна уу";
    }
    
    if (!newUser.email.trim()) {
      newErrors.email = "И-мэйл оруулна уу";
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      newErrors.email = "И-мэйл хаяг буруу байна";
    }
    
    if (!newUser.password) {
      newErrors.password = "Нууц үг оруулна уу";
    } else if (newUser.password.length < 8) {
      newErrors.password = "Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой";
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

// Update the editUser state format to match User entity fields
// Update the editUser state format to match User entity fields
const handleOpenEditModal = (user) => {
  setEditUser({
    id: user.id,
    firstName: user.firstName,  // Keep as firstName to match User entity
    lastName: user.lastName,    // Keep as lastName to match User entity
    email: user.email,
    phone: user.phone || ''
  });
  setShowEditModal(true);
};

// Update the handleEditUser function with better error handling and debugging
const handleEditUser = async () => {
  try {
    // Log what we're sending for debugging
    console.log("Original editUser data:", editUser);
    
    // Convert to exact format expected by backend User entity
    const userUpdateData = {
      id: Number(editUser.id),
      firstName: editUser.firstName.trim(),  // Changed back to firstName to match User entity
      lastName: editUser.lastName.trim(),    // Changed back to lastName to match User entity
      email: editUser.email.trim(),
      phone: editUser.phone ? editUser.phone.trim() : null,
      role: 'USER'
    };
    
    console.log("Formatted data for API:", userUpdateData);
    
    // Use the API_ENDPOINTS constant
    const response = await api.post(API_ENDPOINTS.user.update, userUpdateData);
    
    console.log("Update response:", response.data);
    
    setNotification({
      open: true,
      message: response.data.message || 'Хэрэглэгчийн мэдээлэл амжилттай шинэчлэгдлээ',
      severity: 'success'
    });
    
    // Close modal and refresh users list
    setShowEditModal(false);
    fetchUsers();
  } catch (error) {
    console.error("Update error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      requestData: error.config?.data
    });
    
    setNotification({
      open: true,
      message: 'Хэрэглэгчийн мэдээлэл шинэчлэх үед алдаа гарлаа: ' + 
               (error.response?.data?.message || error.response?.data || error.message),
      severity: 'error'
    });
  }
};

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Function to get user's registration date
  const getUserRegistrationDate = (user) => {
    // Check for different possible date field names
    const dateField = user.createdAt || user.created_at || user.registeredAt || 
                      user.registered_at || user.registrationDate || 
                      user.registration_date || user.dateCreated || 
                      user.date_created || user.createTime;
    
    if (dateField) {
      try {
        // Convert to date object and format
        const date = new Date(dateField);
        
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      } catch (error) {
        console.error("Error formatting date:", error);
      }
    }
    
    return 'N/A';
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
              Хэрэглэгчийн удирдлага
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
              Шинэ хэрэглэгч нэмэх
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
              fontSize: '0.875rem'
            }}>
              <thead>
                <tr style={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>#</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Нэр</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Овог</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>И-мэйл</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Утас</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Бүртгүүлсэн огноо</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Үйлдлүүд</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={index} style={{ 
                      backgroundColor: index % 2 === 0 ? 'transparent' : 
                        (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)')
                    }}>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>{index + 1}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>{user.id}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>{user.firstName}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>{user.lastName}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>{user.email}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>{user.phone || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                        {getUserRegistrationDate(user)}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenEditModal(user)}
                            sx={{ borderRadius: '8px' }}
                          >
                            Засах
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteUser(user.id)}
                            sx={{ borderRadius: '8px' }}
                          >
                            Устгах
                          </Button>
                        </Box>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ padding: '16px', textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                      Хэрэглэгч олдсонгүй
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </Main>

      {/* Add User Dialog */}
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
          Шинэ хэрэглэгч нэмэх
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <StyledTextField
            fullWidth
            margin="dense"
            label="Нэр"
            name="firstName"
            value={newUser.firstName}
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
            value={newUser.lastName}
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
            value={newUser.email}
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
            value={newUser.phone}
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
            value={newUser.password}
            onChange={handleInputChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            sx={{ mb: 2 }}
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
            onClick={handleAddUser} 
            variant="contained" 
            color="primary"
            sx={{ 
              fontWeight: 600,
              borderRadius: '8px'
            }}
          >
            Хэрэглэгч нэмэх
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
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
          Хэрэглэгчийн мэдээлэл засах
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <StyledTextField
            fullWidth
            margin="dense"
            label="Нэр"
            name="firstName"
            value={editUser.firstName}
            onChange={(e) => setEditUser({...editUser, firstName: e.target.value})}
            sx={{ mb: 2 }}
          />
          <StyledTextField
            fullWidth
            margin="dense"
            label="Овог"
            name="lastName"
            value={editUser.lastName}
            onChange={(e) => setEditUser({...editUser, lastName: e.target.value})}
            sx={{ mb: 2 }}
          />
          <StyledTextField
            fullWidth
            margin="dense"
            label="И-мэйл"
            name="email"
            type="email"
            value={editUser.email}
            onChange={(e) => setEditUser({...editUser, email: e.target.value})}
            sx={{ mb: 2 }}
          />
          <StyledTextField
            fullWidth
            margin="dense"
            label="Утас"
            name="phone"
            type="number"
            value={editUser.phone}
            onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
            sx={{ mb: 2 }}
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
            onClick={handleEditUser} 
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

export default AdminUsersManagement;
