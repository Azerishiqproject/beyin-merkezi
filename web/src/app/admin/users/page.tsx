'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchUsers, deleteUser } from '@/redux/slices/userSlice';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import { getApiUrl } from '@/utils/api';

// Material UI imports
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import PeopleIcon from '@mui/icons-material/People';

// Interface for department option
interface DepartmentOption {
  value: string;
  label: string;
}

// Interface for year option
interface YearOption {
  value: string;
  label: string;
}

// Interface for Department
interface Department {
  _id: string;
  name: string;
  description?: string;
}

// Interface for User
interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  userType: string;
  departmentId?: Department | string;
  academicDegree?: string;
  averageScore?: number;
  evaluationAverageScore?: number;
}

// Interface for API error
interface ApiError {
  message?: string;
}

// Custom styles for react-select
const selectStyles = {
  control: (provided: Record<string, unknown>) => ({
    ...provided,
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
    boxShadow: 'none',
    '&:hover': {
      border: '1px solid #1976d2',
    },
  }),
  menu: (provided: Record<string, unknown>) => ({
    ...provided,
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  }),
  option: (provided: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#1976d2' : state.isFocused ? '#f5f5f5' : undefined,
    color: state.isSelected ? 'white' : '#333',
    '&:hover': {
      backgroundColor: state.isSelected ? '#1976d2' : '#f5f5f5',
    },
  }),
};

export default function UsersPage() {
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { isAuthenticated, isAdmin, token } = useAppSelector((state) => state.auth);
  const { users, isLoading, isDeleting, error: userError } = useAppSelector((state) => state.users);

  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentOption | null>(null);
  const [selectedYear, setSelectedYear] = useState<YearOption | null>(null);

  // Generate year options starting from 2025
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: YearOption[] = [];
    
    // Start from 2025 and go up to current year + 1
    for (let year = 2024; year <= currentYear + 1; year++) {
      years.push({ value: year.toString(), label: year.toString() });
    }
    
    return years;
  }, []);

  // Load departments asynchronously
  const loadDepartments = async (inputValue: string) => {
    try {
      const response = await fetch(getApiUrl('api/departments'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Departamentleri almaqda xeta yaranadi');
      }

      const departmentOptions = data.data
        .filter((dept: Department) => 
          dept.name.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map((dept: Department) => ({
          value: dept._id,
          label: dept.name,
        }));

      return departmentOptions;
    } catch (err) {
      console.error('Error loading departments:', err);
      return [];
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    const filters: { departmentId?: string; year?: string } = {};
    
    if (selectedDepartment) {
      filters.departmentId = selectedDepartment.value;
    }
    
    if (selectedYear) {
      filters.year = selectedYear.value;
    }

    dispatch(fetchUsers(filters))
      .unwrap()
      .catch((err) => {
        setError(err);
      });
  }, [isAuthenticated, isAdmin, dispatch, router, selectedDepartment, selectedYear]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu istifadəçini silmək istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      await dispatch(deleteUser(userId)).unwrap();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Kullanıcı silinemedi');
    }
  };

  // Helper function to get department name
  const getDepartmentName = (user: User) => {
    if (!user.departmentId) return '-';
    if (typeof user.departmentId === 'string') return 'Yüklənir...';
    return user.departmentId.name;
  };

  // Helper function to get full name
  const getFullName = (user: User) => {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (!firstName && !lastName) return '-';
    return `${firstName} ${lastName}`.trim();
  };

  const handleFilterReset = () => {
    setSelectedDepartment(null);
    setSelectedYear(null);
  };

  // Get score color based on value
  const getScoreColor = (score: number | undefined) => {
    if (score === undefined) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography className='text-black' variant="h5" component="h1" fontWeight="500">
            İstifadəçilər
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          component={Link} 
          href="/admin/users/create"
          startIcon={<AddIcon />}
          color="success"
        >
          Yeni İstifadəçi
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={1} sx={{ mb: 3, p: 2, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterAltIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight="500">
            Filtreler
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                Departament
              </Typography>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadDepartments}
                value={selectedDepartment}
                onChange={(option) => setSelectedDepartment(option as DepartmentOption)}
                placeholder="Departament seçin"
                isClearable
                styles={selectStyles}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                İl
              </Typography>
              <Select
                options={yearOptions}
                value={selectedYear}
                onChange={(option) => setSelectedYear(option as YearOption)}
                placeholder="Il seçin"
                isClearable
                styles={selectStyles}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              variant="text"
              onClick={handleFilterReset}
              startIcon={<FilterAltOffIcon />}
              sx={{ mt: 1 }}
            >
              Filtreleri Temizle
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {(error || userError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || userError}
        </Alert>
      )}

      <Paper elevation={1} sx={{ borderRadius: 1 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Ad Soyad</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>İstifadəçi Növü</TableCell>
                <TableCell>Departament</TableCell>
                <TableCell>Elmi Derecesi</TableCell>
                <TableCell>Manuel Ortalama</TableCell>
                <TableCell>Qiymətləndirmə Ortalaması</TableCell>
                <TableCell align="right">Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">
                      Heç bir istifadəçi tapılmadı
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{getFullName(user)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.userType} 
                        color={user.userType === 'Admin' ? 'secondary' : 'default'} 
                        size="small" 
                        variant={user.userType === 'Admin' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>{getDepartmentName(user)}</TableCell>
                    <TableCell>{user.academicDegree || '-'}</TableCell>
                    <TableCell>
                      {user.averageScore !== undefined ? (
                        <Chip 
                          label={user.averageScore} 
                          color={getScoreColor(user.averageScore)} 
                          size="small" 
                          variant="outlined"
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {user.evaluationAverageScore !== undefined ? (
                        <Chip 
                          label={user.evaluationAverageScore} 
                          color={getScoreColor(user.evaluationAverageScore)} 
                          size="small" 
                          variant="outlined"
                        />
                      ) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Düzəliş et">
                          <IconButton 
                            component={Link} 
                        href={`/admin/users/edit/${user._id}`}
                            color="primary"
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton 
                        onClick={() => handleDeleteUser(user._id)}
                            disabled={isDeleting}
                            color="error"
                            size="small"
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
      </Paper>
    </Container>
  );
} 