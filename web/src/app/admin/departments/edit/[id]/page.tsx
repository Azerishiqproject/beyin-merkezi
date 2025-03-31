'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';

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
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// API Hata tipi
interface ApiError {
  message: string;
}

export default function EditDepartmentPage() {
  // useParams ile id'yi al
  const { id } = useParams(); 
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  const { isAuthenticated, isAdmin, token } = useAppSelector((state) => state.auth);

  // Departament verilerini getir
  const fetchDepartment = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/departments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Departament məlumatları almaqda xeta yaranadi');
      }

      setName(data.data.name);
      setDescription(data.data.description || '');
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Departament məlumatları almaqda xeta yaranadi');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    if (token && id) {
      fetchDepartment();
    }
  }, [isAuthenticated, isAdmin, token, id, router, fetchDepartment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Departament adi bos ola bilmez');
      setUpdating(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/departments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Departament yenilenemekde xeta yaranadi');
      }

      setSuccess('Departament uğurla yeniləndi');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/departments');
      }, 2000);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Departament yenilenemekde xeta yaranadi');
    } finally {
      setUpdating(false);
    }
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
          <EditIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography className='text-black' variant="h5" component="h1" fontWeight="500">
            Departamenti Yenile
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

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
            color="primary"
            disabled={updating}
            startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          >
            {updating ? 'Yenilenir...' : 'Yenilə'}
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