'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchUser, updateUser, resetUserState } from '@/redux/slices/userSlice';
import DepartmentSelect from '@/components/DepartmentSelect';

// Material UI imports
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// API Error interface
interface ApiError {
  message?: string;
}

// UpdateUserData interface for type safety
interface UpdateUserData {
  id: string;
  email: string;
  userType: string;
  firstName?: string;
  lastName?: string;
  academicDegree?: string;
  averageScore?: number;
  departmentId?: string;
  password?: string;
}

export default function EditUserPage() {
  // useParams ile id'yi al
  const params = useParams();
  const id = params.id as string;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [academicDegree, setAcademicDegree] = useState('');
  const [averageScore, setAverageScore] = useState<number | undefined>(undefined);
  const [evaluationAverageScore, setEvaluationAverageScore] = useState<number | undefined>(undefined);
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isAdmin } = useAppSelector((state) => state.auth);
  const { 
    currentUser, 
    isLoading, 
    isUpdating, 
    error: userError,
    success: userSuccess
  } = useAppSelector((state) => state.users);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
      return;
    }

    if (id) {
      dispatch(fetchUser(id))
        .unwrap()
        .catch((err) => {
          setError(err);
        });
    }

    // Cleanup on unmount
    return () => {
      dispatch(resetUserState());
    };
  }, [isAuthenticated, isAdmin, id, dispatch, router]);

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email);
      setUserType(currentUser.userType);
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
      setAcademicDegree(currentUser.academicDegree || '');
      setAverageScore(currentUser.averageScore);
      setEvaluationAverageScore(currentUser.evaluationAverageScore);
      
      // Handle both string and object departmentId
      if (currentUser.departmentId) {
        if (typeof currentUser.departmentId === 'string') {
          setDepartmentId(currentUser.departmentId);
        } else {
          setDepartmentId(currentUser.departmentId._id);
        }
      } else {
        setDepartmentId(undefined);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (userError) {
      setError(userError);
    }
    if (userSuccess) {
      setSuccess(userSuccess);
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);
    }
  }, [userError, userSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Email boş ola bilməz');
      return;
    }

    if (userType === 'User' && !departmentId) {
      setError('Departament seçimi vacibdir');
      return;
    }

    // Create update object
    const updateData: UpdateUserData = {
      id,
      email,
      userType,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      academicDegree: academicDegree || undefined,
      averageScore: averageScore,
      departmentId,
    };

    // Only include password if it's provided
    if (password) {
      updateData.password = password;
    }

    try {
      await dispatch(updateUser(updateData)).unwrap();
      // Success message and redirect are handled in the useEffect
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Kullanıcı güncellenemedi');
    }
  };

  // Show/hide department select based on user type
  const showDepartmentSelect = userType === 'User';

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
          <EditIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" component="h1" fontWeight="500">
            İstifadəçi Düzəlişi
          </Typography>
        </Box>
        
        <Button 
          variant="outlined" 
          component={Link} 
          href="/admin/users"
          startIcon={<ArrowBackIcon />}
          size="medium"
        >
          Geri Dön
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Ad"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Soyad"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Şifrə (Boş buraxsanız dəyişdirilməyəcək)"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              margin="normal"
              inputProps={{ minLength: 6 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Elmi Derecesi"
              id="academicDegree"
              value={academicDegree}
              onChange={(e) => setAcademicDegree(e.target.value)}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Manuel Ortalama"
              id="averageScore"
              type="number"
              value={averageScore === undefined ? '' : averageScore}
              onChange={(e) => setAverageScore(e.target.value ? Number(e.target.value) : undefined)}
              variant="outlined"
              margin="normal"
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="İmtahan Ortalaması"
              id="evaluationAverageScore"
              type="number"
              value={evaluationAverageScore === undefined ? '' : evaluationAverageScore}
              variant="outlined"
              margin="normal"
              InputProps={{ readOnly: true }}
              disabled
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="userType-label">İstifadəçi Növü</InputLabel>
              <Select
                labelId="userType-label"
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                label="İstifadəçi Növü"
              >
                <MenuItem value="User">İstifadəçi</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {showDepartmentSelect && (
            <Grid item xs={12}>
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                  Departament
                </Typography>
                <DepartmentSelect
                  value={departmentId}
                  onChange={setDepartmentId}
                  isDisabled={isUpdating}
                />
              </Box>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          >
            {isUpdating ? 'Yenilənir...' : 'Yenilə'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 