'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { createUser, resetUserState } from '@/redux/slices/userSlice';
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
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SaveIcon from '@mui/icons-material/Save';

export default function CreateUserPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('User');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [academicDegree, setAcademicDegree] = useState('');
  const [averageScore, setAverageScore] = useState<number | undefined>(undefined);
  const [departmentId, setDepartmentId] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isAdmin } = useAppSelector((state) => state.auth);
  const { isCreating, error: userError, success: userSuccess } = useAppSelector((state) => state.users);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/login');
    }

    // Cleanup on unmount
    return () => {
      dispatch(resetUserState());
    };
  }, [isAuthenticated, isAdmin, dispatch, router]);

  useEffect(() => {
    if (userError) {
      setError(userError);
    }
    if (userSuccess) {
      setSuccess(userSuccess);
      // Clear form after successful creation
      setEmail('');
      setPassword('');
      setUserType('User');
      setFirstName('');
      setLastName('');
      setAcademicDegree('');
      setAverageScore(undefined);
      setDepartmentId(undefined);
      
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

    if (!email.trim()) {
      setError('Email boş ola bilməz');
      return;
    }

    if (!password.trim()) {
      setError('Şifrə boş ola bilməz');
      return;
    }

    if (userType === 'User' && !departmentId) {
      setError('Departament seçimi zorunludur');
      return;
    }

    try {
      await dispatch(createUser({ 
        email, 
        password, 
        userType,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        academicDegree: academicDegree || undefined,
        averageScore: averageScore,
        departmentId 
      })).unwrap();
      // Success message and redirect are handled in the useEffect
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('Bilinməyən xəta baş verdi');
      }
    }
  };

  // Show/hide department select based on user type
  const showDepartmentSelect = userType === 'User';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonAddIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" component="h1" fontWeight="500" sx={{ color: 'primary.main' }}>
            Yeni İstifadəçi
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
              required
              label="Şifrə"
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
              helperText="Bu qiymət manuel olaraq daxil edilir və qiymətləndirmələrdən hesablanan ortalamadan bağımsızdır."
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
                  isDisabled={isCreating}
                />
              </Box>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={isCreating}
            startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          >
            {isCreating ? 'Yaradılır...' : 'Yarat'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 