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
  useTheme
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

const AdminsManagement = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const theme = useTheme();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state for adding new admin
  const [showAddModal, setShowAddModal] = useState(false);
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
      setError('Failed to load admins. Please try again later.');
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (id) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await api.delete(API_ENDPOINTS.admin.delete(id));
        // Remove from state
        setAdmins(admins.filter(admin => admin.id !== id));
      } catch (err) {
        setError('Failed to delete admin. Please try again later.');
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
      newErrors.firstName = "First name is required";
    }
    
    if (!newAdmin.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!newAdmin.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newAdmin.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!newAdmin.password) {
      newErrors.password = "Password is required";
    } else if (newAdmin.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    // if (newAdmin.password !== newAdmin.confirmPassword) {
    //   newErrors.confirmPassword = "Passwords do not match";
    // }
    
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
              Admins Management
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
              Add New Admin
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
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>First Name</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Last Name</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Email</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Phone</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Created At</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, borderBottom: `1px solid ${theme.palette.divider}` }}>Actions</th>
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
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteAdmin(admin.id || index)}
                          sx={{ 
                            borderRadius: '8px',
                            minWidth: '30px',
                            padding: '6px 12px',
                            height: '36px'
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px 16px', textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                      No admins found
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
          Add New Admin
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <StyledTextField
            fullWidth
            margin="dense"
            label="First Name"
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
            label="Last Name"
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
            label="Email"
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
            label="Phone"
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
            label="Password"
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
            label="Confirm Password"
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
            Cancel
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
            Add Admin
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminsManagement;
