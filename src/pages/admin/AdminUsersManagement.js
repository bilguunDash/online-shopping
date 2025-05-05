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
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from '../../components/AdminHeader';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

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
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load users. Please try again later.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(API_ENDPOINTS.user.delete(id));
        // Remove from state
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        setError('Failed to delete user. Please try again later.');
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
      newErrors.firstName = "First name is required";
    }
    
    if (!newUser.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!newUser.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!newUser.password) {
      newErrors.password = "Password is required";
    } else if (newUser.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
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
              Users Management
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
              Add New User
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
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>First Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Last Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Phone</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Created At</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Actions</th>
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
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>{user.firstName}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>{user.lastName}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>{user.email}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>{user.phone || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString() 
                          : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteUser(user.id)}
                          sx={{ borderRadius: '8px' }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '16px', textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                      No users found
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
          Add New User
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <StyledTextField
            fullWidth
            margin="dense"
            label="First Name"
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
            label="Last Name"
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
            label="Email"
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
            label="Phone"
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
            label="Password"
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
            Cancel
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
            Add User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsersManagement;
