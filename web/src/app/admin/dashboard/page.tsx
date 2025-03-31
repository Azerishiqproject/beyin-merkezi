'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { getApiUrl } from '@/utils/api';

// Material UI imports
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddIcon from '@mui/icons-material/Add';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';


interface Department {
  _id: string;
  name: string;
  description: string;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

// API Hata tipi
interface ApiError {
  message: string;
}

export default function AdminDashboard() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isAdmin, token } = useAppSelector((state) => state.auth);

  // Departments getir
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('api/departments'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Departamentları almaqda xeta yaranadi');
      }

      // Fetch user counts for each department
      const departmentsWithCounts = await Promise.all(
        data.data.map(async (dept: Department) => {
          const userCountResponse = await fetch(getApiUrl(`api/users?departmentId=${dept._id}`), {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          const userData = await userCountResponse.json();
          
          if (!userCountResponse.ok) {
            console.error(`Error fetching users for department ${dept.name}`);
            return { ...dept, userCount: 0 };
          }
          
          return { ...dept, userCount: userData.data.length };
        })
      );

      setDepartments(departmentsWithCounts);
      return departmentsWithCounts;
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Departamentları almaqda xeta yaranadi');
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
      router.push('/');
      return;
    }

    // Fetch departments
    if (token) {
      fetchDepartments()
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated, isAdmin, token, router, fetchDepartments]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (loading) {
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
          <DashboardIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography className='text-black' variant="h5" component="h1" fontWeight="500">
            Admin Panel
          </Typography>
        </Box>
        
        <Button 
          variant="outlined" 
          color="error"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          size="medium"
        >
          Çıxış
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ borderRadius: 1, height: '100%' }}>
            <Box sx={{ p: 2, bgcolor: 'background.neutral', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight="500">
                İdarəetmə Menyusu
              </Typography>
            </Box>
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/admin/users">
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="İstifadəçilər" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/admin/departments">
                  <ListItemIcon>
                    <BusinessIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Departamentler" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/admin/evaluations">
                  <ListItemIcon>
                    <AssessmentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Qiymətləndirmələr" />
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ borderRadius: 1, height: '100%' }}>
            <Box sx={{ p: 2, bgcolor: 'background.neutral', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight="500">
                Elave Etmek
              </Typography>
            </Box>
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/admin/users/create">
                  <ListItemIcon>
                    <PersonAddIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Yeni İstifadəçi" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/admin/departments/create">
                  <ListItemIcon>
                    <AddIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Yeni Departament" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/admin/evaluations/create">
                  <ListItemIcon>
                    <AddIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Yeni Qiymətləndirmə" />
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Departments */}
      <Paper elevation={1} sx={{ borderRadius: 1, mb: 4 }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.neutral', 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="500">
              Departamentler
            </Typography>
          </Box>
          <Button 
            variant="text" 
            component={Link} 
            href="/admin/departments"
            size="small"
          >
            Hamisini Gör
          </Button>
        </Box>
        
        {departments.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Heç bir departament yaradilmadi.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ p: 2 }}>
            {departments.map((department) => (
              <Grid item xs={12} sm={6} md={4} key={department._id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="500">
                        {department.name}
                      </Typography>
                      <Chip 
                        label={`${department.userCount} Kişi`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    {department.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {department.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                      <Button 
                        variant="text" 
                        component={Link} 
                        href={`/admin/departments/${department._id}`}
                        size="small"
                      >
                        Detaylar
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
} 