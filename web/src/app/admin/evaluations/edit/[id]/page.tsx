'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  fetchEvaluationById, 
  updateEvaluation,
  resetEvaluationState,
  clearCurrentEvaluation,
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
  TextField,
  Slider,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CommentIcon from '@mui/icons-material/Comment';
import GradeIcon from '@mui/icons-material/Grade';

export default function EditEvaluationPage() {
  // Get id from params using useParams hook
  const params = useParams();
  const id = params.id as string;
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const currentUser = useAppSelector((state: RootState) => state.auth.user);
  const evaluation = useAppSelector((state: RootState) => state.evaluation.currentEvaluation);
  const loading = useAppSelector((state: RootState) => state.evaluation.loading);
  const error = useAppSelector((state: RootState) => state.evaluation.error);
  const success = useAppSelector((state: RootState) => state.evaluation.success);

  // Add a state to track if the form is initialized
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [criteria, setCriteria] = useState<EvaluationCriteria>({
    davamiyyet: 1,
    isGuzarKeyfiyyetler: 1,
    streseDavamliliq: 1,
    ascImici: 1,
    qavramaMenimseme: 1,
    ixtisasBiliyi: 1,
    muhendisEtikasi: 1,
    komandaIleIslemeBacarigi: 1
  });
  const [comments, setComments] = useState('');

  // Calculate average score based on criteria (for display only)
  // Using the same calculation logic as the backend
  const averageScore = useMemo(() => {
    const scores = [
      criteria.davamiyyet,
      criteria.isGuzarKeyfiyyetler,
      criteria.streseDavamliliq,
      criteria.ascImici,
      criteria.qavramaMenimseme,
      criteria.ixtisasBiliyi,
      criteria.muhendisEtikasi,
      criteria.komandaIleIslemeBacarigi
    ];
    
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = parseFloat((sum / scores.length).toFixed(2));
    
    return average;
  }, [criteria]);

  // Fetch evaluation data only once when the component mounts
  useEffect(() => {
    dispatch(fetchEvaluationById(id));
    
    // Clear evaluation state when component unmounts
    return () => {
      dispatch(clearCurrentEvaluation());
      dispatch(resetEvaluationState());
    };
  }, [dispatch, id]);

  // Initialize form with current evaluation data
  useEffect(() => {
    if (evaluation && !isInitialized) {
      setCriteria(evaluation.criteria);
      setComments(evaluation.comments || '');
      setIsInitialized(true);
    }
  }, [evaluation, isInitialized]);

  // Handle success and error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetEvaluationState());
    }
    
    if (success && isSubmitted) {
      toast.success('Qiymətləndirmə ugurla yenilendi');
      router.push(`/admin/evaluations/${id}`);
      dispatch(resetEvaluationState());
    }
  }, [error, success, dispatch, id, router, isSubmitted]);

  // Handle criteria change
  const handleCriteriaChange = (name: keyof EvaluationCriteria) => (event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    
    setCriteria({
      ...criteria,
      [name]: value
    });
  };

  // Handle comments change
  const handleCommentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComments(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitted(true);
    
    // Map frontend criteria names to backend field names
    const backendCriteria = {
      davamiyyet: criteria.davamiyyet,
      isGuzarKeyfiyyetler: criteria.isGuzarKeyfiyyetler, // This will be mapped to isguzarKeyfiyetler in the backend
      streseDavamliliq: criteria.streseDavamliliq,
      ascImici: criteria.ascImici,
      qavramaMenimseme: criteria.qavramaMenimseme,
      ixtisasBiliyi: criteria.ixtisasBiliyi,
      muhendisEtikasi: criteria.muhendisEtikasi,
      komandaIleIslemeBacarigi: criteria.komandaIleIslemeBacarigi
    };
    
    // Update evaluation with criteria only, let backend calculate average score
    dispatch(updateEvaluation({
      id,
      evaluationData: {
        criteria: backendCriteria,
        comments
      }
    }));
  };

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

  // Puan rengini belirleme fonksiyonu
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'primary';
    if (score >= 4) return 'warning';
    return 'error';
  };

  // İsmin baş harflerini alma fonksiyonu
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return '?';
    return `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase();
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
            Qiymətləndirməlere Dön
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
          Qiymətləndirməni Düzenle
        </Typography>
        
        <Button 
          variant="outlined" 
          component={Link} 
          href={`/admin/evaluations/${id}`}
          startIcon={<ArrowBackIcon />}
        >
          Geri Qayıt
        </Button>
      </Box>

      {/* User Information */}
      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="medium" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
            İstifadəçi Bilgileri
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    mr: 2
                  }}
                >
                  {evaluation.user 
                    ? getInitials(evaluation.user.firstName || '', evaluation.user.lastName || '') 
                    : '?'}
                </Avatar>
                
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {evaluation.user 
                      ? `${evaluation.user.firstName || ''} ${evaluation.user.lastName || ''}`.trim() || 'İsimsiz Kullanıcı'
                      : 'Bilinmeyen Kullanıcı'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <EmailIcon sx={{ mr: 0.5, fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {evaluation.user?.email || 'Email bilgisi yok'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="subtitle2" fontWeight="medium" color="text.secondary" sx={{ mb: 1 }}>
                  Qiymətləndirmə Bilgileri
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${evaluation.evaluationNumber}. Qiymətləndirmə`}
                    color="primary"
                    variant="outlined"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DateRangeIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(evaluation.createdAt).toLocaleDateString('tr-TR')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Edit Form */}
      <Paper sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
              Qiymətləndirməni Düzenle
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GradeIcon sx={{ mr: 1, color: getScoreColor(averageScore) }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Tehmini Ortalama Qiymət: 
                <Chip
                  label={averageScore.toFixed(2)}
                  size="small"
                  color={getScoreColor(averageScore)}
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Box>
          </Box>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {Object.entries(criteriaLabels).map(([key, label]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {label}
                      </Typography>
                      <Chip
                        label={criteria[key as keyof EvaluationCriteria]}
                        size="small"
                        color={getScoreColor(criteria[key as keyof EvaluationCriteria])}
                      />
                    </Box>
                    <Slider
                      value={criteria[key as keyof EvaluationCriteria]}
                      onChange={handleCriteriaChange(key as keyof EvaluationCriteria)}
                      min={1}
                      max={10}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                      color={getScoreColor(criteria[key as keyof EvaluationCriteria])}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                <CommentIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                Şerhler
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={comments}
                onChange={handleCommentsChange}
                placeholder="Qiymətləndirmə hakkında şerhlerinizi yazın..."
                variant="outlined"
              />
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'İşleniyor...' : 'Yenilə'}
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>
    </Container>
  );
} 