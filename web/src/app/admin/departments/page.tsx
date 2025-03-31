'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchDepartments, deleteDepartment } from '@/redux/slices/departmentSlice';

// Material UI imports
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
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
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BusinessIcon from '@mui/icons-material/Business';

// API Hata tipi
interface ApiError {
  message: string;
}

export default function DepartmentsPage() {
  const [error, setError] = useState('');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isAdmin } = useAppSelector((state) => state.auth);
  const { departments, isLoading, isDeleting, error: departmentError } = useAppSelector((state) => state.departments);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    dispatch(fetchDepartments())
      .unwrap()
      .catch((err) => {
        setError(err);
      });
  }, [isAuthenticated, isAdmin, dispatch, router]);

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm('Bu departamenti silmek istədiyinizə əminsiniz?')) {
      return;
    }

    try {
      await dispatch(deleteDepartment(departmentId)).unwrap();
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Departament silinərkən xəta baş verdi');
    }
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
          <BusinessIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography className='text-black' variant="h5" component="h1" fontWeight="500">
            Departamentler
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          component={Link} 
          href="/admin/departments/create"
          startIcon={<AddIcon />}
          color="success"
        >
          Yeni Departament
        </Button>
      </Box>

      {(error || departmentError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || departmentError}
        </Alert>
      )}

      <Paper elevation={1} sx={{ borderRadius: 1 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Ad</TableCell>
                <TableCell>Təsvir</TableCell>
                <TableCell>Yaradılma Tarixi</TableCell>
                <TableCell align="right">Əməliyyatlar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      Heç bir departament tapilmadi
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department) => (
                  <TableRow key={department._id} hover>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {department._id}
                    </TableCell>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.description || '-'}</TableCell>
                    <TableCell>{new Date(department.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Düzəliş et">
                          <IconButton 
                            component={Link} 
                            href={`/admin/departments/edit/${department._id}`}
                            color="primary"
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton 
                            onClick={() => handleDeleteDepartment(department._id)}
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