import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  CircularProgress,
  useTheme,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from '../../components/AdminHeader';
// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../utils/axios';

const drawerWidth = 0;

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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: '10px',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
    : '0 2px 10px rgba(0,0,0,0.08)',
  backgroundColor: theme.palette.background.paper
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputLabel-root': {
    height: '23px',
    transform: 'translate(14px, 20px) scale(1)',
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
    height: '60px',
    padding: '10px 14px',
  },
  '& .MuiInputBase-inputMultiline': {
    height: 'auto',
  }
}));

const AdminCategories = ({ darkMode, toggleDarkMode }) => {
  const router = useRouter();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  
  // Form states
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    model: ''
  });
  const [editCategoryForm, setEditCategoryForm] = useState({
    id: '',
    name: '',
    model: ''
  });
  
  // Dialog states
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('jwt');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Fetch all categories
    fetchCategories();
  }, [router]);
  
  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/categ-all", {
        baseURL: 'http://localhost:8083'
      });
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setNotification({
        open: true,
        message: 'Error loading categories: ' + error.message,
        severity: 'error'
      });
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle create category form change
  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setNewCategoryForm({ ...newCategoryForm, [name]: value });
  };
  
  // Handle create category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryForm.name.trim()) {
      setNotification({
        open: true,
        message: 'Category name cannot be empty',
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post("/admin/create-category", newCategoryForm, {
        baseURL: 'http://localhost:8083'
      });
      
      setNotification({
        open: true,
        message: response.data.message || 'Category created successfully',
        severity: 'success'
      });
      
      // Reset form and refresh categories
      setNewCategoryForm({ name: '', model: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      setNotification({
        open: true,
        message: 'Error creating category: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle edit category
  const handleOpenEditDialog = (category) => {
    setEditCategoryForm({
      id: category.id,
      name: category.name,
      model: category.model || ''
    });
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };
  
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditCategoryForm({ ...editCategoryForm, [name]: value });
  };
  
  const handleUpdateCategory = async () => {
    if (!editCategoryForm.name.trim()) {
      setNotification({
        open: true,
        message: 'Category name cannot be empty',
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.put(`/admin/update-category/${editCategoryForm.id}`, { 
        name: editCategoryForm.name,
        model: editCategoryForm.model
      }, {
        baseURL: 'http://localhost:8083'
      });
      
      setNotification({
        open: true,
        message: response.data.message || 'Category updated successfully',
        severity: 'success'
      });
      
      // Close dialog and refresh categories
      setOpenEditDialog(false);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      setNotification({
        open: true,
        message: 'Error updating category: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle delete category
  const handleOpenDeleteDialog = (category) => {
    setCategoryToDelete(category);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCategoryToDelete(null);
  };
  
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    setLoading(true);
    try {
      const response = await api.delete(`/admin/delete-categories/${categoryToDelete.id}`, {
        baseURL: 'http://localhost:8083'
      });
      
      setNotification({
        open: true,
        message: response.data.message || 'Category deleted successfully',
        severity: 'success'
      });
      
      // Close dialog and refresh categories
      handleCloseDeleteDialog();
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setNotification({
        open: true,
        message: 'Error deleting category: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ 
      display: 'flex',
      backgroundColor: theme.palette.background.default, 
      minHeight: '100vh',
      overflow: 'hidden',
      width: '100%',
      position: 'relative'
    }}>
      <AdminHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <Main>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: theme.palette.text.primary }}>
            Category Management
          </Typography>
          
          <StyledPaper>
            <Box>
              {/* Create Category Form */}
              <Box component="form" onSubmit={handleCreateCategory} sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} lg={5}>
                    <StyledTextField
                      label="Category Name"
                      name="name"
                      value={newCategoryForm.name}
                      onChange={handleCreateFormChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid item xs={12} lg={5}>
                    <StyledTextField
                      label="Model"
                      name="model"
                      value={newCategoryForm.model}
                      onChange={handleCreateFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} lg={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      disabled={loading}
                      fullWidth
                      sx={{ height: '56px' }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Add'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Categories Table */}
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table sx={{ minWidth: 650 }} aria-label="categories table">
                  <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category Name</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Model</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    ) : categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell>{category.id}</TableCell>
                          <TableCell>{category.name}</TableCell>
                          <TableCell>{category.model}</TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenEditDialog(category)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDeleteDialog(category)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </StyledPaper>
        </Container>
      </Main>
      
      {/* Edit Category Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update the category information.
          </DialogContentText>
          <StyledTextField
            autoFocus
            margin="dense"
            name="name"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editCategoryForm.name}
            onChange={handleEditFormChange}
            sx={{ mb: 2 }}
          />
          <StyledTextField
            margin="dense"
            name="model"
            label="Model"
            type="text"
            fullWidth
            variant="outlined"
            value={editCategoryForm.model}
            onChange={handleEditFormChange}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseEditDialog} variant="outlined">Cancel</Button>
          <Button
            onClick={handleUpdateCategory}
            disabled={loading}
            color="primary"
            variant="contained"
          >
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Category Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">Cancel</Button>
          <Button
            onClick={handleDeleteCategory}
            disabled={loading}
            color="error"
            variant="contained"
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
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

AdminCategories.displayName = 'AdminCategories';

// Wrap the component with role-based protection
import roleBasedRoute from '../../utils/roleBasedRoute';
export default roleBasedRoute(AdminCategories, "ADMIN");
