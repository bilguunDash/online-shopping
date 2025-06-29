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
  Divider,
  Tabs,
  Tab,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AdminHeader from '../../components/admin/AdminHeader';
// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
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

const StyledFormControl = styled(FormControl)(({ theme }) => ({
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
  '& .MuiSelect-select': {
    height: '60px',
    display: 'flex',
    alignItems: 'center',
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
  
  const [modelForm, setModelForm] = useState({
    categoryId: '',
    model: ''
  });
  
  const [editCategoryForm, setEditCategoryForm] = useState({
    id: '',
    name: '',
    model: ''
  });
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [categoryModels, setCategoryModels] = useState({});
  const [createDialogTab, setCreateDialogTab] = useState(0);
  const [openEditModelDialog, setOpenEditModelDialog] = useState(false);
  const [modelToEdit, setModelToEdit] = useState(null);
  const [openDeleteModelDialog, setOpenDeleteModelDialog] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);
  const [editModelForm, setEditModelForm] = useState({
    id: '',
    name: '',
    categoryId: ''
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
      const uniqueCategories = Array.from(
        new Map(response.data.map(item => [item.id, item])).values()
      );
      setCategories(uniqueCategories);

      // Бүх category-ийн models-ийг татах
      const modelsMap = {};
      await Promise.all(uniqueCategories.map(async (cat) => {
        const models = await fetchCategoryModels(cat.id);
        modelsMap[cat.id] = models;
      }));
      setCategoryModels(modelsMap);

      setLoading(false);
    } catch (error) {
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
  
  // Handle model form change
  const handleModelFormChange = (e) => {
    const { name, value } = e.target;
    setModelForm({ ...modelForm, [name]: value });
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
  
  // Handle create model
  const handleCreateModel = async (e) => {
    e.preventDefault();
    if (!modelForm.categoryId) {
      setNotification({
        open: true,
        message: 'Please select a category',
        severity: 'warning'
      });
      return;
    }
    
    if (!modelForm.model.trim()) {
      setNotification({
        open: true,
        message: 'Model name cannot be empty',
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    try {
      // Use the new API endpoint
      const response = await api.post(
        `admin/categories/${modelForm.categoryId}/items`,
        null,
        {
          baseURL: 'http://localhost:8083',
          params: {
            catItemName: modelForm.model
          }
        }
      );
      setNotification({
        open: true,
        message: response.data.message || 'Model added to category successfully',
        severity: 'success'
      });
      // Reset form and refresh categories
      setModelForm({ categoryId: '', model: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error adding model to category:', error);
      setNotification({
        open: true,
        message: 'Error adding model: ' + (error.response?.data?.message || error.message),
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
        message: 'Ангилалын нэр хоосон байж болохгүй',
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.put(
        `/admin/update-category/${editCategoryForm.id}`,
        null,
        {
          baseURL: 'http://localhost:8083',
          params: {
            categoryName: editCategoryForm.name
          }
        }
      );
      
      setNotification({
        open: true,
        message: response.data.message || 'Ангилал амжилттай шинэчлэгдлээ',
        severity: 'success'
      });
      
      // Close dialog and refresh categories
      setOpenEditDialog(false);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      setNotification({
        open: true,
        message: 'Ангилал шинэчлэхэд алдаа гарлаа: ' + (error.response?.data?.message || error.message),
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

  const fetchCategoryModels = async (categoryId) => {
    try {
      const response = await api.get(`/admin/category-items/${categoryId}`, {
        baseURL: 'http://localhost:8083'
      });
      return response.data; // массив
    } catch (error) {
      return [];
    }
  };

  // Handle edit model
  const handleOpenEditModelDialog = (model, categoryId) => {
    setModelToEdit(model);
    setEditModelForm({
      id: model.id,
      name: model.name,
      categoryId: categoryId
    });
    setOpenEditModelDialog(true);
  };

  const handleCloseEditModelDialog = () => {
    setOpenEditModelDialog(false);
    setModelToEdit(null);
  };

  const handleEditModelFormChange = (e) => {
    const { name, value } = e.target;
    setEditModelForm({ ...editModelForm, [name]: value });
  };

  const handleUpdateModel = async () => {
    if (!editModelForm.name.trim()) {
      setNotification({
        open: true,
        message: 'Загварын нэр хоосон байж болохгүй',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(
        `/admin/update-category-item/${editModelForm.id}`,
        null,
        {
          baseURL: 'http://localhost:8083',
          params: {
            categoryItems: editModelForm.name
          }
        }
      );

      setNotification({
        open: true,
        message: response.data.message || 'Загвар амжилттай шинэчлэгдлээ',
        severity: 'success'
      });

      handleCloseEditModelDialog();
      fetchCategories();
    } catch (error) {
      setNotification({
        open: true,
        message: 'Загвар шинэчлэхэд алдаа гарлаа: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete model
  const handleOpenDeleteModelDialog = (model) => {
    setModelToDelete(model);
    setOpenDeleteModelDialog(true);
  };

  const handleCloseDeleteModelDialog = () => {
    setOpenDeleteModelDialog(false);
    setModelToDelete(null);
  };

  const handleDeleteModel = async () => {
    if (!modelToDelete) return;

    setLoading(true);
    try {
      const response = await api.delete(`/admin/delete-category-item/${modelToDelete.id}`, {
        baseURL: 'http://localhost:8083'
      });

      setNotification({
        open: true,
        message: response.data.message || 'Загвар амжилттай устгагдлаа',
        severity: 'success'
      });

      handleCloseDeleteModelDialog();
      fetchCategories();
    } catch (error) {
      setNotification({
        open: true,
        message: 'Загвар устгахад алдаа гарлаа: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Ангилал Удирдлага
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Ангилал Үүсгэх
            </Button>
          </Box>
          
          <StyledPaper>
            {/* Categories Table */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Ангилал, загваруудын жагсаалт
                </Typography>
                {/* <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Хайх..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 200 }}
                  />
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={fetchCategories}
                    startIcon={<RefreshIcon />}
                  >
                    Сэргээх
                  </Button>
                </Box> */}
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
              <Table sx={{ minWidth: 650 }} aria-label="categories table">
                <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '80px' }}>ID</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ангилалын Нэр</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Загварууд</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '120px' }}>Үйлдлүүд</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            Ангилал олдсонгүй
                          </Typography>
                          <Button 
                            variant="outlined" 
                            startIcon={<AddIcon />}
                            onClick={() => setOpenCreateDialog(true)}
                          >
                            Ангилал нэмэх
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow 
                        key={category.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: theme.palette.action.hover 
                          },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell>{category.id}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              sx={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '&:hover': { 
                                  color: 'primary.main',
                                  textDecoration: 'underline'
                                }
                              }}
                              onClick={() => handleOpenEditDialog(category)}
                            >
                              {category.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <FormControl fullWidth size="small">
                              <Select
                                value=""
                                displayEmpty
                                renderValue={(selected) => {
                                  if (selected === '') {
                                    return <em>Загвар сонгох</em>;
                                  }
                                  return selected;
                                }}
                                onChange={(e) => {
                                  const selectedModel = categoryModels[category.id].find(
                                    model => model.name === e.target.value
                                  );
                                  if (selectedModel) {
                                    handleOpenEditModelDialog(selectedModel, category.id);
                                  }
                                }}
                                sx={{
                                  '& .MuiSelect-select': {
                                    py: 1
                                  }
                                }}
                              >
                                {(categoryModels[category.id] || []).map((model) => (
                                  <MenuItem 
                                    key={model.id} 
                                    value={model.name}
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      py: 1,
                                      '&:hover': {
                                        backgroundColor: theme.palette.action.hover,
                                        '& .model-actions': {
                                          display: 'flex'
                                        }
                                      }
                                    }}
                                  >
                                    <span>{model.name}</span>
                                    <Box 
                                      className="model-actions" 
                                      sx={{ 
                                        display: 'none',
                                        gap: 0.5
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Tooltip title="Засах">
                                        <IconButton
                                          color="primary"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEditModelDialog(model, category.id);
                                          }}
                                          size="small"
                                          sx={{
                                            '&:hover': {
                                              backgroundColor: theme.palette.primary.light
                                            }
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Устгах">
                                        <IconButton
                                          color="error"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenDeleteModelDialog(model);
                                          }}
                                          size="small"
                                          sx={{
                                            '&:hover': {
                                              backgroundColor: theme.palette.error.light
                                            }
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<AddIcon />}
                              onClick={() => {
                                setModelForm(prev => ({ ...prev, categoryId: category.id }));
                                setCreateDialogTab(1);
                                setOpenCreateDialog(true);
                              }}
                              sx={{
                                alignSelf: 'flex-start',
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.light,
                                  color: theme.palette.primary.main
                                }
                              }}
                            >
                              Загвар нэмэх
                            </Button>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Засах">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenEditDialog(category)}
                                size="small"
                                sx={{
                                  backgroundColor: theme.palette.primary.light,
                                  '&:hover': {
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white'
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Устгах">
                              <IconButton
                                color="error"
                                onClick={() => handleOpenDeleteDialog(category)}
                                size="small"
                                sx={{
                                  backgroundColor: theme.palette.error.light,
                                  '&:hover': {
                                    backgroundColor: theme.palette.error.main,
                                    color: 'white'
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </StyledPaper>
        </Container>
      </Main>
      
      {/* Create Category/Model Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Шинэ Ангилал/Загвар</DialogTitle>
        <DialogContent>
          <Tabs
            value={createDialogTab}
            onChange={(e, newValue) => setCreateDialogTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Ангилал Үүсгэх" />
            <Tab label="Загвар Нэмэх" />
          </Tabs>
          
          {createDialogTab === 0 && (
            <Box component="form" onSubmit={handleCreateCategory}>
              <StyledTextField
                autoFocus
                margin="dense"
                name="name"
                label="Ангилалын Нэр"
                type="text"
                fullWidth
                variant="outlined"
                value={newCategoryForm.name}
                onChange={handleCreateFormChange}
                sx={{ mb: 2 }}
              />
              <DialogActions sx={{ px: 0, pb: 0 }}>
                <Button onClick={() => setOpenCreateDialog(false)} variant="outlined">
                  Цуцлах
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  color="primary"
                  variant="contained"
                >
                  {loading ? <CircularProgress size={24} /> : 'Үүсгэх'}
                </Button>
              </DialogActions>
            </Box>
          )}
          
          {createDialogTab === 1 && (
            <Box component="form" onSubmit={handleCreateModel}>
              <StyledFormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Ангилал Сонгох</InputLabel>
                <Select
                  name="categoryId"
                  value={modelForm.categoryId}
                  onChange={handleModelFormChange}
                  label="Ангилал Сонгох"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </StyledFormControl>
              <StyledTextField
                margin="dense"
                name="model"
                label="Загварын Нэр"
                type="text"
                fullWidth
                variant="outlined"
                value={modelForm.model}
                onChange={handleModelFormChange}
                sx={{ mb: 2 }}
              />
              <DialogActions sx={{ px: 0, pb: 0 }}>
                <Button onClick={() => setOpenCreateDialog(false)} variant="outlined">
                  Цуцлах
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  color="primary"
                  variant="contained"
                >
                  {loading ? <CircularProgress size={24} /> : 'Нэмэх'}
                </Button>
              </DialogActions>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Category Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Ангилал Засах</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Ангилалын мэдээллийг шинэчлэх.
          </DialogContentText>
          <StyledTextField
            autoFocus
            margin="dense"
            name="name"
            label="Ангилалын Нэр"
            type="text"
            fullWidth
            variant="outlined"
            value={editCategoryForm.name}
            onChange={handleEditFormChange}
            sx={{ mb: 2 }}
          />
          
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseEditDialog} variant="outlined">Цуцлах</Button>
          <Button
            onClick={handleUpdateCategory}
            disabled={loading}
            color="primary"
            variant="contained"
          >
            {loading ? <CircularProgress size={24} /> : 'Шинэчлэх'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Category Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Устгахыг Баталгаажуулах</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Та "{categoryToDelete?.name}" ангилалыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">Цуцлах</Button>
          <Button
            onClick={handleDeleteCategory}
            disabled={loading}
            color="error"
            variant="contained"
          >
            {loading ? <CircularProgress size={24} /> : 'Устгах'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Model Dialog */}
      <Dialog open={openEditModelDialog} onClose={handleCloseEditModelDialog}>
        <DialogTitle>Загвар Засах</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Загварын мэдээллийг шинэчлэх.
          </DialogContentText>
          <StyledTextField
            autoFocus
            margin="dense"
            name="name"
            label="Загварын Нэр"
            type="text"
            fullWidth
            variant="outlined"
            value={editModelForm.name}
            onChange={handleEditModelFormChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseEditModelDialog} variant="outlined">
            Цуцлах
          </Button>
          <Button
            onClick={handleUpdateModel}
            disabled={loading}
            color="primary"
            variant="contained"
          >
            {loading ? <CircularProgress size={24} /> : 'Шинэчлэх'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Model Dialog */}
      <Dialog
        open={openDeleteModelDialog}
        onClose={handleCloseDeleteModelDialog}
      >
        <DialogTitle>Загвар Устгах</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Та "{modelToDelete?.name}" загварыг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDeleteModelDialog} variant="outlined">
            Цуцлах
          </Button>
          <Button
            onClick={handleDeleteModel}
            disabled={loading}
            color="error"
            variant="contained"
          >
            {loading ? <CircularProgress size={24} /> : 'Устгах'}
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
