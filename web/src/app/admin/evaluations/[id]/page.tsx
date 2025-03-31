'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  fetchEvaluationById, 
  fetchUserEvaluations,
  selectCurrentEvaluation,
  selectUserEvaluations,
  selectEvaluationLoading,
  selectEvaluationError,
  resetEvaluationState,
  EvaluationCriteria
} from '@/redux/slices/evaluationSlice';
import { RootState } from '@/redux/store';
import { toast } from 'react-toastify';

// Material UI imports
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  LinearProgress,
  Avatar,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import DateRangeIcon from '@mui/icons-material/DateRange';
import GradeIcon from '@mui/icons-material/Grade';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CommentIcon from '@mui/icons-material/Comment';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function EvaluationDetailPage() {
  // Get id from params using useParams hook
  const params = useParams();
  const id = params.id as string;
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const currentUser = useAppSelector((state: RootState) => state.auth.user);
  const evaluation = useAppSelector(selectCurrentEvaluation);
  const userEvaluations = useAppSelector(selectUserEvaluations);
  const loading = useAppSelector(selectEvaluationLoading);
  const error = useAppSelector(selectEvaluationError);
  const [activeTab, setActiveTab] = useState<string>('details');

  useEffect(() => {
    dispatch(fetchEvaluationById(id));
    return () => {
      dispatch(resetEvaluationState());
    };
  }, [dispatch, id]);

  // Fetch all evaluations for this user when the evaluation is loaded
  useEffect(() => {
    if (evaluation && evaluation.userId) {
      dispatch(fetchUserEvaluations(evaluation.userId));
    }
  }, [dispatch, evaluation]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      router.push('/admin/evaluations');
    }
  }, [error, router]);

  const criteriaLabels: Record<keyof EvaluationCriteria, string> = {
    davamiyyet: 'Davamiyyet',
    isGuzarKeyfiyyetler: 'İşgüzar keyfiyyətlər',
    streseDavamliliq: 'Stresə davamlılıq',
    ascImici: 'ASC imici',
    qavramaMenimseme: 'Qavrama mənimsəmə',
    ixtisasBiliyi: 'İxtisas biliyi',
    muhendisEtikasi: 'Mühəndis etikası',
    komandaIleIslemeBacarigi: 'Komanda ilə işləmə bacarığı'
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // İsmin baş harflerini alma fonksiyonu
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Puan rengini belirleme fonksiyonu
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'primary';
    if (score >= 4) return 'warning';
    return 'error';
  };

  if (!currentUser || currentUser.userType !== 'Admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="h6">Erişim Reddedildi</Typography>
          <Typography variant="body1">Bu sayfaya erişim yetkiniz bulunmamaktadır.</Typography>
        </Alert>
      </Container>
    );
  }

  if (loading && !evaluation) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!evaluation) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Qiymətləndirmə tapılmadı.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            href="/admin/evaluations"
            startIcon={<ArrowBackIcon />}
          >
            Qiymətləndirməlere Qayıt
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
          Qiymətləndirmə Detayı
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant="contained" 
            component={Link} 
            href={`/admin/evaluations/edit/${evaluation._id}`}
            startIcon={<EditIcon />}
            color="primary"
          >
            Düzenle
          </Button>
          <Button 
            variant="outlined" 
            component={Link} 
            href="/admin/evaluations"
            startIcon={<ArrowBackIcon />}
          >
            Geri Dön
          </Button>
        </Stack>
      </Box>

      {/* User Information */}
      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="medium" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
            Kullanıcı Bilgileri
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center', 
            justifyContent: 'space-between',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main', 
                  mr: 2
                }}
              >
                {evaluation.user ? getInitials(evaluation.user.firstName, evaluation.user.lastName) : 'BK'}
              </Avatar>
              
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {evaluation.user ? `${evaluation.user.firstName} ${evaluation.user.lastName}` : 'Bilinmeyen Kullanıcı'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <EmailIcon sx={{ mr: 0.5, fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {evaluation.user?.email || 'Email bilgisi yok'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Chip 
              label={`${userEvaluations.length} Qiymətləndirmə`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider'
          }}
        >
          <Tab 
            label="Bu Qiymətləndirmə" 
            value="details" 
            icon={<AssessmentIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Tüm Qiymətləndirmələr" 
            value="all" 
            icon={<GradeIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {activeTab === 'details' ? (
        <Paper sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight="medium" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Qiymətləndirmə Bilgileri
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ width: 170, fontWeight: 'medium' }}>
                        Qiymətləndirmə No:
                      </Typography>
                      <Chip 
                        label={`${evaluation.evaluationNumber}. Qiymətləndirmə`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ width: 170, fontWeight: 'medium' }}>
                        Ortalama Qiymət:
                      </Typography>
                      <Chip
                        label={evaluation.averageScore.toFixed(2)}
                        size="small"
                        color={getScoreColor(evaluation.averageScore)}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ width: 170, fontWeight: 'medium' }}>
                        Qiymətləndirmə Tarixi:
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DateRangeIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {new Date(evaluation.evaluationDate).toLocaleDateString('tr-TR')}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ width: 170, fontWeight: 'medium' }}>
                        Qiymətləndiren:
                      </Typography>
                      <Typography variant="body2">
                        {evaluation.evaluator ? `${evaluation.evaluator.firstName} ${evaluation.evaluator.lastName}` : 'Bilinmeyen Qiymətləndirici'}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
              
              {evaluation.comments && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="medium" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <CommentIcon sx={{ mr: 1, color: 'primary.main' }} />
                      Şerhler
                    </Typography>
                    
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: 'background.default'
                      }}
                    >
                      <Typography variant="body1">
                        {evaluation.comments}
                      </Typography>
                    </Paper>
                  </Box>
                </Grid>
              )}
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" fontWeight="medium" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <GradeIcon sx={{ mr: 1, color: 'primary.main' }} />
                Qiymətləndirmə Kriterleri
              </Typography>
              
              <Grid container spacing={3}>
                {Object.entries(criteriaLabels).map(([key, label]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {label}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color={getScoreColor(evaluation.criteria[key as keyof EvaluationCriteria])}
                        >
                          {evaluation.criteria[key as keyof EvaluationCriteria]}/10
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(evaluation.criteria[key as keyof EvaluationCriteria] / 10) * 100} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: 'action.hover'
                        }}
                        color={getScoreColor(evaluation.criteria[key as keyof EvaluationCriteria])}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="medium" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
              Tüm Qiymətləndirmələr
            </Typography>
            
            <Grid container spacing={3}>
              {userEvaluations.map((evalItem) => (
                <Grid item xs={12} sm={6} md={4} key={evalItem._id}>
                  <Card 
                    variant={evalItem._id === id ? "elevation" : "outlined"}
                    sx={{ 
                      borderRadius: 2,
                      borderColor: evalItem._id === id ? 'primary.main' : undefined,
                      bgcolor: evalItem._id === id ? 'action.selected' : undefined
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Chip 
                          label={`${evalItem.evaluationNumber}. Qiymətləndirmə`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={evalItem.averageScore.toFixed(2)}
                          size="small"
                          color={getScoreColor(evalItem.averageScore)}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <DateRangeIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {new Date(evalItem.evaluationDate).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {evalItem.evaluator ? `${evalItem.evaluator.firstName} ${evalItem.evaluator.lastName}` : 'Bilinmeyen'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <IconButton 
                          component={Link} 
                          href={`/admin/evaluations/${evalItem._id}`}
                          size="small"
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          component={Link} 
                          href={`/admin/evaluations/edit/${evalItem._id}`}
                          size="small"
                          color="info"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      )}
    </Container>
  );
}