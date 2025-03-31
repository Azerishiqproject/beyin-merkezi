'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchUsers, User } from '@/redux/slices/userSlice';
import { 
  createEvaluation, 
  resetEvaluationState,
  EvaluationCriteria
} from '@/redux/slices/evaluationSlice';
import { toast } from 'react-toastify';
import { RootState } from '@/redux/store';
import AsyncSelect from 'react-select/async';
import Select, { StylesConfig } from 'react-select';
import { getApiUrl } from '@/utils/api';

// Material UI imports
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  FormControl,
  MenuItem,
  Select as MuiSelect,
  SelectChangeEvent,
  TextField,
  Slider,
  FormHelperText,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';


// Interface for department option
interface DepartmentOption {
  value: string;
  label: string;
}

// Interface for year option
interface YearOption {
  value: string;
  label: string;
}

// Interface for Department
interface Department {
  _id: string;
  name: string;
  description?: string;
}

// Interface for API Error
interface ApiError {
  message: string;
}

// Custom styles for react-select
const selectStyles: StylesConfig<DepartmentOption | YearOption, false> = {
  control: (provided) => ({
    ...provided,
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
    boxShadow: 'none',
    '&:hover': {
      border: '1px solid #1976d2',
    },
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#1976d2' : state.isFocused ? '#f5f5f5' : undefined,
    color: state.isSelected ? 'white' : '#333',
    '&:hover': {
      backgroundColor: state.isSelected ? '#1976d2' : '#f5f5f5',
    },
  }),
};

export default function CreateEvaluationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const currentUser = useAppSelector((state: RootState) => state.auth.user);
  const users = useAppSelector((state: RootState) => state.users.users);
  const loading = useAppSelector((state: RootState) => state.users.isLoading);
  const evaluationLoading = useAppSelector((state: RootState) => state.evaluation.loading);
  const evaluationError = useAppSelector((state: RootState) => state.evaluation.error);
  const evaluationSuccess = useAppSelector((state: RootState) => state.evaluation.success);
  const token = useAppSelector((state: RootState) => state.auth.token);
  
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [evaluationNumber, setEvaluationNumber] = useState<number>(1);
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
  const [comments, setComments] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentOption | null>(null);
  const [selectedYear, setSelectedYear] = useState<YearOption | null>(null);

  // Generate year options starting from 2025
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: YearOption[] = [];
    
    // Start from 2025 and go up to current year + 1
    for (let year = 2024; year <= currentYear + 1; year++) {
      years.push({ value: year.toString(), label: year.toString() });
    }
    
    return years;
  }, []);

  // Load departments asynchronously
  const loadDepartments = async (inputValue: string) => {
    try {
      const response = await fetch(getApiUrl('api/departments'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Departamentleri almaqda xeta yaranadi');
      }

      const departmentOptions = data.data
        .filter((dept: Department) => 
          dept.name.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map((dept: Department) => ({
          value: dept._id,
          label: dept.name,
        }));

      return departmentOptions;
    } catch (err) {
      console.error('Error loading departments:', err);
      return [];
    }
  };

  useEffect(() => {
    const filters: { departmentId?: string; year?: string } = {};
    
    if (selectedDepartment) {
      filters.departmentId = selectedDepartment.value;
    }
    
    if (selectedYear) {
      filters.year = selectedYear.value;
    }

    dispatch(fetchUsers(filters))
      .unwrap()
      .catch((err: ApiError) => {
        toast.error(err.message || 'Qiymətləndirmə yaradilarkən xəta baş verdi');
      });
  }, [dispatch, selectedDepartment, selectedYear]);

  // Handle success and error messages
  useEffect(() => {
    if (evaluationSuccess) {
      toast.success('Qiymətləndirmə ugurla yaradıldı');
      router.push('/admin/evaluations');
      dispatch(resetEvaluationState());
    }
    if (evaluationError) {
      toast.error(evaluationError);
      dispatch(resetEvaluationState());
    }
  }, [evaluationSuccess, evaluationError, dispatch, router]);

  const handleUserChange = (e: SelectChangeEvent<string>) => {
    setSelectedUser(e.target.value);
  };

  const handleEvaluationNumberChange = (e: SelectChangeEvent<number>) => {
    setEvaluationNumber(e.target.value as number);
  };

  // Handle criteria change
  const handleCriteriaChange = (name: keyof EvaluationCriteria) => (event: Event, newValue: number | number[]) => {
    const numValue = newValue as number;
    
    if (numValue < 1 || numValue > 10) {
      setFormErrors({
        ...formErrors,
        [name]: 'Değer 1 ile 10 arasında olmalıdır'
      });
    } else {
      const newErrors = { ...formErrors };
      delete newErrors[name];
      setFormErrors(newErrors);
    }

    setCriteria({
      ...criteria,
      [name]: numValue
    });
  };

  // Handle comments change
  const handleCommentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComments(e.target.value);
  };

  const handleFilterReset = () => {
    setSelectedDepartment(null);
    setSelectedYear(null);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error('Lütfen bir kullanıcı seçin');
      return;
    }

    // Validate form
    if (Object.keys(formErrors).length > 0) {
      toast.error('Lütfen formdaki hataları düzeltin');
      return;
    }

    // Create new evaluation
    dispatch(createEvaluation({
      userId: selectedUser,
      evaluationNumber,
      criteria,
      comments
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

  // Filter users to only show regular users (not admins)
  const regularUsers = users.filter((user: User) => user.userType === 'User');

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#2e7d32';
    if (score >= 6) return '#1976d2';
    if (score >= 4) return '#ed6c02';
    return '#d32f2f';
  };

  if (!currentUser || currentUser.userType !== 'Admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="h6">Giriş Reddedildi</Typography>
          <Typography variant="body1">Bu sehifeye giriş icazəsi yoxdur.</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Typography className='text-black' variant="h5" component="h1" fontWeight="500">
          Yeni Qiymətləndirmə Yarat
        </Typography>
        
        <Button 
          variant="outlined" 
          component={Link} 
          href="/admin/evaluations"
          startIcon={<ArrowBackIcon />}
          size="medium"
        >
            Geri Qayıt
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper 
        elevation={1} 
        sx={{ 
          mb: 3, 
          p: 2,
          borderRadius: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterAltIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight="500">
            İstifadəçi Filtreleri
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                Departament
              </Typography>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadDepartments}
                value={selectedDepartment}
                onChange={(option) => setSelectedDepartment(option as DepartmentOption)}
                placeholder="Departament seçin"
                isClearable
                styles={selectStyles}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                İl
              </Typography>
              <Select
                options={yearOptions}
                value={selectedYear}
                onChange={(option) => setSelectedYear(option as YearOption)}
                placeholder="İl seçin"
                isClearable
                styles={selectStyles}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              variant="text"
              onClick={handleFilterReset}
              startIcon={<FilterAltOffIcon />}
              sx={{ mt: 1 }}
            >
              Filtreleri Temizle
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper 
        elevation={1} 
        component="form"
        onSubmit={handleSubmit}
        sx={{ 
          p: 3,
          borderRadius: 1
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                Qiymətləndiriləcək İstifadəçi
              </Typography>
              <MuiSelect
                id="user"
                value={selectedUser}
                onChange={handleUserChange}
                displayEmpty
                disabled={loading}
                required
              >
                <MenuItem value="">
                  <em>İstifadəçi Seçin</em>
                </MenuItem>
                {regularUsers.map((user: User) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </MenuItem>
                ))}
              </MuiSelect>
              <FormHelperText>
                {regularUsers.length === 0 && selectedDepartment 
                  ? "Seçilmiş departamentda istifadəçi tapılmadı." 
                  : regularUsers.length === 0 
                    ? "Hiç istifadəçi tapılmadı." 
                    : `${regularUsers.length} istifadəçi listeleniyor.`}
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                Qiymətləndirmə Numarası
              </Typography>
              <MuiSelect
                id="evaluationNumber"
                value={evaluationNumber}
                onChange={handleEvaluationNumberChange}
              >
                <MenuItem value={1}>1. Qiymətləndirmə</MenuItem>
                <MenuItem value={2}>2. Qiymətləndirmə</MenuItem>
                <MenuItem value={3}>3. Qiymətləndirmə</MenuItem>
              </MuiSelect>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 2 }}>
            Qiymətləndirmə Kriterleri
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {Object.entries(criteriaLabels).map(([key, label]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: getScoreColor(criteria[key as keyof EvaluationCriteria]),
                      fontWeight: 'medium'
                    }}>
                      {criteria[key as keyof EvaluationCriteria]}/10
                    </Typography>
                  </Box>
                  <Slider
                    value={criteria[key as keyof EvaluationCriteria]}
                    onChange={handleCriteriaChange(key as keyof EvaluationCriteria)}
                    min={1}
                    max={10}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    color="primary"
                  />
                  {formErrors[key] && (
                    <FormHelperText error>{formErrors[key]}</FormHelperText>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="500" sx={{ mb: 2 }}>
            Yorumlar
          </Typography>
          
          <Divider sx={{ mb: 2 }} />
          
          <TextField
            id="comments"
            name="comments"
            value={comments}
            onChange={handleCommentsChange}
            multiline
            rows={4}
            fullWidth
            placeholder="Qiymətləndirmə hakkında şerhlerinizi yazın..."
            variant="outlined"
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={evaluationLoading}
            color="primary"
          >
            {evaluationLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                İşleniyor...
              </Box>
            ) : 'Qiymətləndirməni Yüklə'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 