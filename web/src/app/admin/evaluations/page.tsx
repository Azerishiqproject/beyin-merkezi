'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  fetchEvaluations, 
  deleteEvaluation,
  resetEvaluationState,
  Evaluation
} from '@/redux/slices/evaluationSlice';
import { RootState } from '@/redux/store';
import { toast } from 'react-toastify';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import { getApiUrl } from '@/utils/api';
import { fetchAndExportAllDepartmentEvaluations } from '@/utils/excelExport';

// Material UI imports
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Avatar,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BusinessIcon from '@mui/icons-material/Business';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

// Interface for grouped evaluations by user
interface UserEvaluations {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  evaluations: Evaluation[];
}

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

// Extended user interface with departmentId
interface UserWithDepartment {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: string | { _id: string; name: string };
}

export default function EvaluationsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state: RootState) => state.auth.user);
  const evaluations = useAppSelector((state: RootState) => state.evaluation.evaluations);
  const loading = useAppSelector((state: RootState) => state.evaluation.loading);
  const error = useAppSelector((state: RootState) => state.evaluation.error);
  const success = useAppSelector((state: RootState) => state.evaluation.success);
  const token = useAppSelector((state: RootState) => state.auth.token);
  
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentOption | null>(null);
  const [selectedYear, setSelectedYear] = useState<YearOption | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);

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

  // Group evaluations by user
  const groupedEvaluations = useMemo(() => {
    const userMap = new Map<string, UserEvaluations>();
    
    evaluations.forEach(evaluation => {
      // Eğer evaluation.user yoksa, API'den dönen veriyi kontrol et ve oluştur
      if (!evaluation.user) {
        // Eğer userId varsa ve bir string ise devam et
        if (!evaluation.userId || typeof evaluation.userId !== 'string') {
          return; // Geçersiz veri, atla
        }
        
        // Kullanıcı bilgisi olmadan devam et, boş değerlerle doldur
        const userId = evaluation.userId;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            userId,
            firstName: 'Bilinmeyen',
            lastName: 'Kullanıcı',
            email: 'bilinmeyen@email.com',
            evaluations: []
          });
        }
        
        // Değerlendirmeyi ekle
        userMap.get(userId)?.evaluations.push(evaluation);
        return;
      }
      
      const userId = evaluation.userId;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          firstName: evaluation.user.firstName || '',
          lastName: evaluation.user.lastName || '',
          email: evaluation.user.email || '',
          evaluations: []
        });
      }
      
      userMap.get(userId)?.evaluations.push(evaluation);
    });
    
    // Sort evaluations by evaluation number for each user
    userMap.forEach(userEval => {
      userEval.evaluations.sort((a, b) => a.evaluationNumber - b.evaluationNumber);
    });
    
    const result = Array.from(userMap.values());
    return result;
  }, [evaluations]);

  // Fetch evaluations with filters
  useEffect(() => {
    const filters: { departmentId?: string; year?: string } = {};
    
    if (selectedDepartment) {
      filters.departmentId = selectedDepartment.value;
    }
    
    if (selectedYear) {
      filters.year = selectedYear.value;
    }
    
    dispatch(fetchEvaluations(filters));
  }, [dispatch, selectedDepartment, selectedYear]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetEvaluationState());
    }
    if (success) {
      dispatch(resetEvaluationState());
    }
  }, [error, success, dispatch]);

  const handleDelete = (id: string) => {
    setEvaluationToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (evaluationToDelete) {
      dispatch(deleteEvaluation(evaluationToDelete));
      setOpenDeleteDialog(false);
      setEvaluationToDelete(null);
    }
  };

  const toggleUserExpand = (userId: string) => {
    const newExpandedUsers = new Set(expandedUsers);
    if (newExpandedUsers.has(userId)) {
      newExpandedUsers.delete(userId);
    } else {
      newExpandedUsers.add(userId);
    }
    setExpandedUsers(newExpandedUsers);
  };

  const handleFilterReset = () => {
    setSelectedDepartment(null);
    setSelectedYear(null);
  };

  // İsmin baş harflerini alma fonksiyonu
  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName && !lastName) return '?';
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase();
  };

  // Excel export handler
  const handleExportToExcel = async () => {
    try {
      setExportLoading(true);
      
      // Check if token exists and is valid
      if (!token) {
        toast.error('Token bulunamadı, lütfen yeniden giriş yapın');
        throw new Error('Token bulunamadı');
      }
      
      // Verify token validity by making a simple API call
      try {
        const testResponse = await fetch(getApiUrl('api/departments'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (!testResponse.ok) {
          toast.error('Oturum süresi dolmuş, lütfen yeniden giriş yapın');
          throw new Error('Authorization failed - please re-login');
        }
      } catch (authError) {
        console.error('Authorization test failed:', authError);
        toast.error('API bağlantısı sağlanamadı, lütfen tekrar deneyin');
        throw new Error('API connection failed');
      }
      
      // Get proper API URL for Excel export, making sure it doesn't have any trailing slash
      const apiBaseUrl = getApiUrl('').replace(/\/+$/, '');
      console.log('Exporting evaluations using API URL:', apiBaseUrl);
      
      // Prepare filters based on current selections
      const filters: { departmentId?: string; year?: string } = {};
      
      if (selectedDepartment) {
        filters.departmentId = selectedDepartment.value;
      }
      
      if (selectedYear) {
        filters.year = selectedYear.value;
      }
      
      // Generate a descriptive filename based on filters
      const filenameParts = ['beyin-merkezi-degerlendirmeler'];
      
      if (selectedDepartment) {
        // Convert department name to a filename-friendly format
        const deptName = selectedDepartment.label
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
        filenameParts.push(deptName);
      }
      
      if (selectedYear) {
        filenameParts.push(selectedYear.value);
      }
      
      filenameParts.push(new Date().toISOString().split('T')[0]);
      const customFileName = `${filenameParts.join('-')}.xlsx`;
      
      // Log the export details
      console.log('Exporting with filters:', filters);
      console.log('Filename:', customFileName);
      
      // If filters exist, use the filtered export, otherwise do a full export
      if (Object.keys(filters).length > 0) {
        // Export only the currently displayed evaluations (organized by department)
        // This creates a map of departments with their evaluations from the current view
        const departmentsMap = new Map<string, { name: string; evaluations: { [key: number]: Evaluation[] } }>();
        
        // First, try to load all department names to have better labels
        const departmentNames = new Map<string, string>();
        
        try {
          const deptResponse = await fetch(getApiUrl('api/departments'), {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (deptResponse.ok) {
            const deptData = await deptResponse.json();
            if (deptData.data && Array.isArray(deptData.data)) {
              deptData.data.forEach((dept: Department) => {
                if (dept._id && dept.name) {
                  departmentNames.set(dept._id, dept.name);
                }
              });
            }
          }
        } catch (error) {
          console.warn('Could not fetch department names:', error);
          // Continue even if we can't get the names
        }
        
        // Group all visible evaluations by department and evaluation number
        groupedEvaluations.forEach(userEval => {
          userEval.evaluations.forEach(evaluation => {
            // Get or find department info - user.departmentId might be an object or string
            let departmentId = '';
            let departmentName = '';
            
            // First try to get department from evaluation.user
            if (evaluation.user) {
              // Cast user to our extended interface with departmentId
              const userWithDept = evaluation.user as unknown as UserWithDepartment;
              
              if (userWithDept.departmentId) {
                if (typeof userWithDept.departmentId === 'string') {
                  departmentId = userWithDept.departmentId;
                  
                  // Try to find department name from selected department if IDs match
                  if (selectedDepartment && selectedDepartment.value === departmentId) {
                    departmentName = selectedDepartment.label;
                  } else if (departmentNames.has(departmentId)) {
                    // Try to use the name from our pre-loaded departments map
                    departmentName = departmentNames.get(departmentId) || '';
                  }
                } else if (typeof userWithDept.departmentId === 'object' && userWithDept.departmentId._id) {
                  departmentId = userWithDept.departmentId._id;
                  departmentName = userWithDept.departmentId.name || '';
                }
              }
            }
            
            // If we still don't have a department name but we have an ID and selectedDepartment matches,
            // use the selected department's name
            if (!departmentName && departmentId && selectedDepartment && selectedDepartment.value === departmentId) {
              departmentName = selectedDepartment.label;
            }
            
            // Try once more with our pre-loaded department names
            if (!departmentName && departmentId && departmentNames.has(departmentId)) {
              departmentName = departmentNames.get(departmentId) || '';
            }
            
            // Last resort - use a friendlier term in Azerbaijani if we have departmentId but no name
            if (!departmentName && departmentId) {
              departmentName = 'Departament Bilinmiyor';
            }
            
            // Skip if we couldn't determine the department
            if (!departmentId) return;
            
            // Create department entry if it doesn't exist
            if (!departmentsMap.has(departmentId)) {
              departmentsMap.set(departmentId, {
                name: departmentName,
                evaluations: { 1: [], 2: [], 3: [] }
              });
            }
            
            // Add evaluation to the appropriate group
            const deptData = departmentsMap.get(departmentId)!;
            const evalNumber = evaluation.evaluationNumber;
            if (!deptData.evaluations[evalNumber]) {
              deptData.evaluations[evalNumber] = [];
            }
            deptData.evaluations[evalNumber].push(evaluation);
          });
        });
        
        // Convert map to array for the export function
        const departmentsToExport = Array.from(departmentsMap.values());
        
        if (departmentsToExport.length === 0) {
          toast.warning('Hiçbir qiymətləndirmə tapılmadı, filtreləri dəyişdirin');
          setExportLoading(false);
          return;
        }
        
        // Import directly rather than using the fetchAndExport function
        const { exportDepartmentEvaluationsToExcel } = await import('@/utils/excelExport');
        exportDepartmentEvaluationsToExcel(departmentsToExport, customFileName);
        toast.success('Qiymətləndirmələr uğurla yükləndi');
      } else {
        // If no filters are selected, export all data
        await fetchAndExportAllDepartmentEvaluations(apiBaseUrl, token);
        toast.success('Bütün qiymətləndirmələr uğurla yükləndi');
      }
    } catch (err: unknown) {
      console.error('Excel export error:', err);
      let errorMessage = 'Veriler indirilirken xəta baş verdi';
      
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setExportLoading(false);
    }
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography className='text-black' variant="h5" component="h1" fontWeight="500">
            Qiymətləndirmələr
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto'
        }}>
          <Button 
            variant="contained" 
            color="success"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportToExcel}
            disabled={exportLoading}
            fullWidth={isMobile}
          >
            {exportLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                Yüklənir...
              </>
            ) : (
              <>
                {selectedDepartment || selectedYear ? 'Filtrələnmiş Exceli Yüklə' : 'Excel Yüklə'}
              </>
            )}
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            href="/admin/evaluations/create"
            startIcon={<AddIcon />}
            fullWidth={isMobile}
          >
            Yeni Qiymətləndirmə
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FilterAltIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="medium">
            Filtreler
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
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
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
              İl
            </Typography>
            <Select
              options={yearOptions}
              value={selectedYear}
              onChange={(option) => setSelectedYear(option as YearOption)}
              placeholder="Il seçin"
              isClearable
            />
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleFilterReset}
              startIcon={<ClearIcon />}
            >
              Filtreleri Temizle
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : groupedEvaluations.length === 0 ? (
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <PeopleAltIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.7 }} />
            <Typography variant="h6" color="text.secondary">
              Heleki qiymətləndirmə yoxdur.
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Typography className='text-black' variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <PeopleAltIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
            Toplam {groupedEvaluations.length} kişi
          </Typography>
          
          {groupedEvaluations.map((userEval) => (
            <Accordion 
              key={userEval.userId} 
              expanded={expandedUsers.has(userEval.userId)}
              onChange={() => toggleUserExpand(userEval.userId)}
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                overflow: 'hidden',
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  backgroundColor: 'background.paper',
                  borderBottom: expandedUsers.has(userEval.userId) ? 1 : 0,
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        mr: 2
                      }}
                    >
                      {getInitials(userEval.firstName, userEval.lastName)}
                    </Avatar>
                    
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {userEval.firstName} {userEval.lastName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <EmailIcon sx={{ mr: 0.5, fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {userEval.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Chip 
                    label={userEval.evaluations.length}
                    color="primary"
                    size="small"
                    icon={<AssessmentIcon />}
                    sx={{ mr: 2 }}
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails sx={{ p: 0 }}>
                <TableContainer>
                  <Table size="medium">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'background.default' }}>
                        <TableCell>Qiymətləndirmə No</TableCell>
                        <TableCell>Ortalama Qiymət</TableCell>
                        <TableCell>Tarix</TableCell>
                        <TableCell>Qiymətləndiren</TableCell>
                        <TableCell align="right">İşlemler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userEval.evaluations.map((evaluation) => (
                        <TableRow 
                          key={evaluation._id}
                          sx={{ 
                            '&:last-child td, &:last-child th': { border: 0 },
                            '&:hover': { backgroundColor: 'action.hover' }
                          }}
                        >
                          <TableCell>
                            <Chip 
                              label={`${evaluation.evaluationNumber}. Qiymətləndirmə`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={evaluation.averageScore.toFixed(2)}
                              size="small"
                              color={
                                evaluation.averageScore >= 8 ? 'success' :
                                evaluation.averageScore >= 6 ? 'primary' :
                                evaluation.averageScore >= 4 ? 'warning' : 'error'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <DateRangeIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {new Date(evaluation.evaluationDate).toLocaleDateString('tr-TR')}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {evaluation.evaluator?.firstName} {evaluation.evaluator?.lastName || 'Bilinmeyen'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Görüntüle">
                                <IconButton 
                                  size="small" 
                                  component={Link} 
                                  href={`/admin/evaluations/${evaluation._id}`}
                                  color="primary"
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Düzenle">
                                <IconButton 
                                  size="small" 
                                  component={Link} 
                                  href={`/admin/evaluations/edit/${evaluation._id}`}
                                  color="info"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Sil">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(evaluation._id);
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Qiymətləndirməni Sil
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bu qiymətləndirməni silmek istediğinizden əminsinizmi? Bu prosesi geri qaytarıla bilməz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            İptal
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained"
            color="error"
            autoFocus
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}