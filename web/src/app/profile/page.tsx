'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { getApiUrl } from '@/utils/api';
import axios from 'axios';

// Material UI imports
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import GradeIcon from '@mui/icons-material/Grade';
import BusinessIcon from '@mui/icons-material/Business';

// Değerlendirme tipi
interface Evaluation {
  _id: string;
  userId: string;
  evaluationNumber: number;
  evaluatorId: string;
  evaluationDate: string;
  averageScore: number;
  comments?: string;
  criteria?: {
    davamiyyet: number;
    isGuzarKeyfiyyetler: number;
    streseDavamliliq: number;
    ascImici: number;
    qavramaMenimseme: number;
    ixtisasBiliyi: number;
    muhendisEtikasi: number;
    komandaIleIslemeBacarigi: number;
  };
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Hata tipi için interface
interface ApiError {
  message: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated} = useAppSelector((state) => state.auth);
  const [departmentName, setDepartmentName] = useState<string>('-');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvaluationNumber, setSelectedEvaluationNumber] = useState<number>(1);
  const [departmentEvaluations, setDepartmentEvaluations] = useState<Evaluation[]>([]);
  const [departmentEvaluationsLoading, setDepartmentEvaluationsLoading] = useState<boolean>(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Departman adını getir
  const fetchDepartmentName = useCallback(async (departmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(getApiUrl(`api/departments/${departmentId}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Departament melumatlarini almaqda xeta yaranadi');
      }

      setDepartmentName(data.data.name);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Departament melumatlarini almaqda xeta yaranadi');
      setDepartmentName('-');
    } finally {
      setLoading(false);
    }
  }, []);

  // Departmana göre değerlendirmeleri getir
  const fetchDepartmentEvaluations = useCallback(async (evaluationNumber: number) => {
    if (!user?.departmentId) return;
    
    setDepartmentEvaluationsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const departmentId = typeof user.departmentId === 'string' 
        ? user.departmentId 
        : user.departmentId._id;

      const response = await axios.get(getApiUrl('api/evaluations'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          departmentId,
          evaluationNumber
        }
      });

      if (response.data.success) {
        setDepartmentEvaluations(response.data.evaluations || []);
      } else {
        throw new Error(response.data.message || 'Departament qiymətləndirmələri alınamadı');
      }
    } catch (err) {
      const error = err as ApiError;
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setDepartmentEvaluations([]);
      } else {
        setError(error.message || 'Departament qiymətləndirmələri alınamadı');
      }
    } finally {
      setDepartmentEvaluationsLoading(false);
    }
  }, [user?.departmentId]);

  const handleEvaluationClick = useCallback((evaluationNumber: number) => {
    setSelectedEvaluationNumber(evaluationNumber);
    
    if (user?.departmentId) {
      fetchDepartmentEvaluations(evaluationNumber);
    }
  }, [user?.departmentId, fetchDepartmentEvaluations]);

  // Puan rengini belirle
  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  }, []);

  // Kullanıcı adının baş harflerini al
  const getInitials = useCallback((firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return '?';
    return `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`;
  }, []);

  // Puan arka plan rengini belirle
  const getScoreBackgroundColor = useCallback((score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.primary.main;
    if (score >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  }, [theme.palette]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.departmentId && typeof user.departmentId === 'string') {
      fetchDepartmentName(user.departmentId);
    } else if (user?.departmentId && typeof user.departmentId === 'object') {
      setDepartmentName(user.departmentId.name);
    }
    
    if (user?.id) {
      fetchDepartmentEvaluations(1);
    }
  }, [isAuthenticated, user, router, fetchDepartmentName, fetchDepartmentEvaluations]);


  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100%', 
      bgcolor: 'background.default', 
      pt: 8, 
      pb: 4 
    }}>
      <Container maxWidth="lg">
        <Paper 
          elevation={2} 
          sx={{ 
            p: { xs: 2, sm: 4 }, 
            borderRadius: 2, 
            bgcolor: 'white',
            overflow: 'hidden'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="bold" 
            sx={{ mb: 4, color: 'primary.main' }}
          >
            Profilim
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%', 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      color: 'primary.main', 
                      fontWeight: 'bold',
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    İstifadəçi Məlumatları
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="body1" component="div">
                        <Box component="span" fontWeight="medium" color="text.secondary">Ad Soyad:</Box>{' '}
                        <Box component="span" fontWeight="bold">{user.firstName || ''} {user.lastName || ''}{!user.firstName && !user.lastName && '-'}</Box>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                        <EmailIcon />
                      </Avatar>
                      <Typography variant="body1" component="div">
                        <Box component="span" fontWeight="medium" color="text.secondary">Email:</Box>{' '}
                        <Box component="span" fontWeight="bold">{user.email}</Box>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%', 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      color: 'primary.main', 
                      fontWeight: 'bold',
                      pb: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    Tehsil Melumatlari
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Typography variant="body1" component="div">
                        <Box component="span" fontWeight="medium" color="text.secondary">Departament:</Box>{' '}
                        <Box component="span" fontWeight="bold">{loading ? 'Yuklenir...' : departmentName}</Box>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                        <SchoolIcon />
                      </Avatar>
                      <Typography variant="body1" component="div">
                        <Box component="span" fontWeight="medium" color="text.secondary">Elmi Derecesi:</Box>{' '}
                        <Box component="span" fontWeight="bold">{user.academicDegree || '-'}</Box>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                        <GradeIcon />
                      </Avatar>
                      <Typography variant="body1" component="div">
                        <Box component="span" fontWeight="medium" color="text.secondary">Ortalama Balı:</Box>{' '}
                        <Box component="span" fontWeight="bold">
                          {user.averageScore !== undefined ? (
                            <Chip 
                              label={user.averageScore} 
                              color={getScoreColor(user.averageScore)} 
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          ) : '-'}
                        </Box>
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mb: 3, mt: 5 }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center',
                pb: 1,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <BusinessIcon sx={{ mr: 1 }} />
              Departament Qiymətləndirmələri
            </Typography>
          </Box>

          <Paper 
            elevation={0} 
            variant="outlined" 
            sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              mb: 4
            }}
          >
            <Tabs
              value={selectedEvaluationNumber - 1}
              onChange={(e, newValue) => handleEvaluationClick(newValue + 1)}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              allowScrollButtonsMobile
              sx={{ 
                bgcolor: 'background.paper',
                '& .MuiTab-root': {
                  fontWeight: 'medium',
                  py: 2,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minWidth: { xs: '120px', sm: '160px' },
                  textTransform: 'none'
                },
                '& .Mui-selected': {
                  fontWeight: 'bold',
                  color: 'primary.main',
                },
                '& .MuiTabs-scrollButtons': {
                  width: { xs: 28, sm: 40 }
                }
              }}
              TabIndicatorProps={{
                style: {
                  height: 3
                }
              }}
            >
              <Tab label={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant={isMobile ? "body2" : "body1"}>
                    1. Dəyərləndirmə
                  </Typography>
                </Box>
              } />
              <Tab label={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant={isMobile ? "body2" : "body1"}>
                    2. Dəyərləndirmə
                  </Typography>
                </Box>
              } />
              <Tab label={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant={isMobile ? "body2" : "body1"}>
                    3. Dəyərləndirmə
                  </Typography>
                </Box>
              } />
            </Tabs>

            <Box sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{ 
                  mb: 3, 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'text.primary',
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                {departmentName} - {selectedEvaluationNumber}. Qiymətləndirmə Nəticələri
              </Typography>
              
              {departmentEvaluationsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : departmentEvaluations.length === 0 ? (
                <Alert severity="warning">
                  Bu departamentdə qiymətləndirmə tapılmadı.
                </Alert>
              ) : (
                <Box sx={{ 
                  width: '100%', 
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': {
                    height: 8,
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'background.paper',
                    borderRadius: 4,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'primary.light',
                    borderRadius: 4,
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
                  },
                }}>
                  <TableContainer sx={{ 
                    borderRadius: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    minWidth: { xs: 800, md: '100%' }
                  }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Kişi</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Ortalama</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Davamiyyet</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>İşgüzar</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Stres</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>ASC</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Qavrama</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>İxtisas</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Etika</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Komanda</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Tarih</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {departmentEvaluations.map((evaluation) => (
                          <TableRow 
                            key={evaluation._id} 
                            sx={{ 
                              backgroundColor: evaluation.userId === user?.id ? 'primary.50' : 'inherit',
                              '&:hover': { backgroundColor: 'action.hover' }
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    mr: 1, 
                                    bgcolor: 'primary.main',
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {getInitials(evaluation.user?.firstName, evaluation.user?.lastName)}
                                </Avatar>
                                <Typography variant="body2" component="div" fontWeight="medium">
                                  {evaluation.user?.firstName} {evaluation.user?.lastName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ 
                                display: 'inline-block', 
                                bgcolor: getScoreBackgroundColor(evaluation.averageScore),
                                color: 'white',
                                fontWeight: 'bold',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 10,
                                minWidth: 32,
                                textAlign: 'center'
                              }}>
                                {evaluation.averageScore.toFixed(0)}
                              </Box>
                            </TableCell>
                            {evaluation.criteria ? (
                              <>
                                <TableCell>{evaluation.criteria.davamiyyet}</TableCell>
                                <TableCell>{evaluation.criteria.isGuzarKeyfiyyetler}</TableCell>
                                <TableCell>{evaluation.criteria.streseDavamliliq}</TableCell>
                                <TableCell>{evaluation.criteria.ascImici}</TableCell>
                                <TableCell>{evaluation.criteria.qavramaMenimseme}</TableCell>
                                <TableCell>{evaluation.criteria.ixtisasBiliyi}</TableCell>
                                <TableCell>{evaluation.criteria.muhendisEtikasi}</TableCell>
                                <TableCell>{evaluation.criteria.komandaIleIslemeBacarigi}</TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                              </>
                            )}
                            <TableCell>
                              {new Date(evaluation.evaluationDate).toLocaleDateString('tr-TR')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          </Paper>
        </Paper>
      </Container>
    </Box>
  );
} 