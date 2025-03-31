'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { createDepartment } from '@/redux/slices/departmentSlice';

// Material UI imports
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

// API Hata tipi
interface ApiError {
  message: string;
}

export default function CreateDepartmentPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isAdmin } = useAppSelector((state) => state.auth);
  const { isCreating, error: departmentError } = useAppSelector((state) => state.departments);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Departament adi bos ola bilmez');
      return;
    }

    try {
      await dispatch(createDepartment({ name, description })).unwrap();
      setSuccess('Departament uğurla yaradildi');
      setName('');
      setDescription('');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/departments');
      }, 2000);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Departament yaradılarkən xəta baş verdi');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AddIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography className='text-black' variant="h5" component="h1" fontWeight="500">
            Yeni Departament Yarat
          </Typography>
        </Box>
        
        <Button 
          variant="outlined" 
          component={Link} 
          href="/admin/departments"
          startIcon={<ArrowBackIcon />}
          size="medium"
        >
          Geri Don
        </Button>
      </Box>

      {error || departmentError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || departmentError}
        </Alert>
      ) : null}

      {success ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      ) : null}

      <Paper 
        elevation={1} 
        component="form"
        onSubmit={handleSubmit}
        sx={{ p: 3, borderRadius: 1 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Departament Adı"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              margin="normal"
              placeholder="Departament adini daxil edin"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Təsvir"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              variant="outlined"
              margin="normal"
              placeholder="Departament təsvirini daxil edin (isteğe bağlı)"
              multiline
              rows={4}
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={isCreating}
            startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          >
            {isCreating ? 'Yaradilir...' : 'Yarat'}
          </Button>
          
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.push('/admin/departments')}
          >
            Ləğv et
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 