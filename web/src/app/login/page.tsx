'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login } from '@/redux/slices/authSlice';

// Material UI imports
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailIcon from '@mui/icons-material/Email';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';

// API Error interface
interface ApiError {
  message?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  
  const dispatch = useAppDispatch();
  const { isLoading, isAuthenticated, isAdmin, error: authError } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // If already logged in, redirect
    if (isAuthenticated) {
      if (isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/profile');
      }
    }
  }, [isAuthenticated, isAdmin, router]);

  useEffect(() => {
    // Set error from Redux state
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await dispatch(login({ email, password })).unwrap();
      // Redirect will happen automatically due to the effect above
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Giriş zamanı xəta baş verdi');
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 8
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, sm: 5 }, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2,
            bgcolor: 'white',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ 
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}>
            <Box 
              sx={{ 
                bgcolor: theme.palette.primary.main, 
                p: 2, 
                borderRadius: '50%', 
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              <LockOutlinedIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography 
              component="h1" 
              variant="h4" 
              fontWeight="bold"
              color="primary.main"
              textAlign="center"
            >
              Hesabınıza daxil olun
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ mt: 1, textAlign: 'center' }}
            >
              Sistemə giriş etmək üçün məlumatlarınızı daxil edin
            </Typography>
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 3,
                borderRadius: 1
              }}
            >
              {error}
            </Alert>
          )}
          
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              width: '100%',
              maxWidth: 400,
              mx: 'auto'
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email ünvanı"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifrə"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ 
                py: 1.5,
                fontWeight: 'bold',
                position: 'relative',
                borderRadius: 1.5,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                }
              }}
              startIcon={!isLoading && <LoginIcon />}
            >
              {isLoading ? (
                <>
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      position: 'absolute',
                      color: 'white'
                    }} 
                  />
                  <span style={{ visibility: 'hidden' }}>Daxil ol</span>
                </>
              ) : 'Daxil ol'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 