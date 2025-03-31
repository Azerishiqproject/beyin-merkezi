import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';
import { getApiUrl } from '@/utils/api';

// API Error interface
interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
    }
  };
}

// Define the evaluation criteria type
export interface EvaluationCriteria {
  davamiyyet: number;
  isGuzarKeyfiyyetler: number;
  streseDavamliliq: number;
  ascImici: number;
  qavramaMenimseme: number;
  ixtisasBiliyi: number;
  muhendisEtikasi: number;
  komandaIleIslemeBacarigi: number;
}

// Backend criteria with different field name
interface BackendEvaluationCriteria {
  davamiyyet?: number;
  isguzarKeyfiyetler?: number;
  streseDavamliliq?: number;
  ascImici?: number;
  qavramaMenimseme?: number;
  ixtisasBiliyi?: number;
  muhendisEtikasi?: number;
  komandaIleIslemeBacarigi?: number;
}

// Define the evaluation type
export interface Evaluation {
  _id: string;
  userId: string;
  evaluationNumber: number;
  evaluatorId: string;
  evaluationDate: string;
  criteria: EvaluationCriteria;
  averageScore: number;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  evaluator?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Raw evaluation from API might include individual criteria fields
interface RawEvaluation extends Partial<Evaluation>, Partial<BackendEvaluationCriteria> {
  _id: string;
  userId: string;
  evaluationNumber: number;
}

// Define the evaluation state
interface EvaluationState {
  evaluations: Evaluation[];
  userEvaluations: Evaluation[];
  currentEvaluation: Evaluation | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Define the initial state
const initialState: EvaluationState = {
  evaluations: [],
  userEvaluations: [],
  currentEvaluation: null,
  loading: false,
  error: null,
  success: false,
};

// Combined criteria type for transformation
type CombinedEvaluationCriteria = EvaluationCriteria & BackendEvaluationCriteria;

// Helper function to transform evaluations
const transformEvaluations = (evaluations: RawEvaluation[]): Evaluation[] => {
  return evaluations.map(evaluation => {
    // Ensure user and evaluator are properly structured
    const user = evaluation.user && typeof evaluation.user === 'object' 
      ? evaluation.user 
      : { firstName: '', lastName: '', email: '' };
    
    const evaluator = evaluation.evaluator && typeof evaluation.evaluator === 'object'
      ? evaluation.evaluator
      : { firstName: '', lastName: '', email: '' };
    
    // Map backend criteria fields to frontend fields if needed
    let criteria: CombinedEvaluationCriteria = evaluation.criteria || {
      davamiyyet: 1,
      isGuzarKeyfiyyetler: 1,
      streseDavamliliq: 1,
      ascImici: 1,
      qavramaMenimseme: 1,
      ixtisasBiliyi: 1,
      muhendisEtikasi: 1,
      komandaIleIslemeBacarigi: 1
    };
    
    // If criteria is not in the expected format, create it from individual fields
    if (!criteria || typeof criteria !== 'object') {
      criteria = {
        davamiyyet: evaluation.davamiyyet || 1,
        isGuzarKeyfiyyetler: evaluation.isguzarKeyfiyetler || 1, // Map backend field to frontend field
        streseDavamliliq: evaluation.streseDavamliliq || 1,
        ascImici: evaluation.ascImici || 1,
        qavramaMenimseme: evaluation.qavramaMenimseme || 1,
        ixtisasBiliyi: evaluation.ixtisasBiliyi || 1,
        muhendisEtikasi: evaluation.muhendisEtikasi || 1,
        komandaIleIslemeBacarigi: evaluation.komandaIleIslemeBacarigi || 1
      };
    } else if (criteria.isguzarKeyfiyetler !== undefined && criteria.isGuzarKeyfiyyetler === undefined) {
      // If backend field exists but frontend field doesn't, map it
      criteria = {
        ...criteria,
        isGuzarKeyfiyyetler: criteria.isguzarKeyfiyetler
      };
      // Remove backend-specific field if present
      delete criteria.isguzarKeyfiyetler;
    }
    
    // Convert to the proper format before returning
    const finalCriteria: EvaluationCriteria = {
      davamiyyet: criteria.davamiyyet || 1,
      isGuzarKeyfiyyetler: criteria.isGuzarKeyfiyyetler || 1,
      streseDavamliliq: criteria.streseDavamliliq || 1,
      ascImici: criteria.ascImici || 1,
      qavramaMenimseme: criteria.qavramaMenimseme || 1,
      ixtisasBiliyi: criteria.ixtisasBiliyi || 1,
      muhendisEtikasi: criteria.muhendisEtikasi || 1,
      komandaIleIslemeBacarigi: criteria.komandaIleIslemeBacarigi || 1
    };
    
    return {
      ...evaluation,
      user,
      evaluator,
      criteria: finalCriteria
    } as Evaluation;
  });
};

// Create async thunks for API calls
export const fetchEvaluations = createAsyncThunk(
  'evaluations/fetchEvaluations',
  async (filters: { departmentId?: string; year?: string } = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: filters
      };

      console.log('Fetching evaluations with filters:', filters);
      const response = await axios.get(getApiUrl('api/evaluations'), config);
      console.log('API Response:', response.data);
      
      // Transform evaluations to ensure proper structure
      const transformedEvaluations = transformEvaluations(response.data.evaluations || []);
      
      return {
        ...response.data,
        evaluations: transformedEvaluations
      };
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || 'Qiymətləndirmələr alınamadı');
    }
  }
);

export const fetchUserEvaluations = createAsyncThunk(
  'evaluations/fetchUserEvaluations',
  async (userId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(getApiUrl(`api/evaluations/user/${userId}`), config);
      console.log('User Evaluations API Response:', response.data);
      
      // Transform evaluations to ensure proper structure
      const transformedEvaluations = transformEvaluations(response.data.evaluations || []);
      
      return {
        ...response.data,
        evaluations: transformedEvaluations
      };
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || 'İstifadəçi qiymətləndirmələri alınamadı');
    }
  }
);

export const fetchEvaluationById = createAsyncThunk(
  'evaluations/fetchEvaluationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(getApiUrl(`api/evaluations/${id}`), config);
      console.log('Evaluation By ID API Response:', response.data);
      
      // Transform evaluation to ensure proper structure
      const evaluation = response.data.evaluation;
      if (evaluation) {
        const transformedEvaluation = transformEvaluations([evaluation])[0];
        return {
          ...response.data,
          evaluation: transformedEvaluation
        };
      }
      
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || 'Qiymətləndirmə alınamadı');
    }
  }
);

export const createEvaluation = createAsyncThunk(
  'evaluations/createEvaluation',
  async (evaluationData: {
    userId: string;
    evaluationNumber: number;
    criteria: EvaluationCriteria;
    comments?: string;
  }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.post(getApiUrl('api/evaluations'), evaluationData, config);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || 'Qiymətləndirmə yaratılmadı');
    }
  }
);

export const updateEvaluation = createAsyncThunk(
  'evaluations/updateEvaluation',
  async (
    { id, evaluationData }: { 
      id: string; 
      evaluationData: {
        criteria: EvaluationCriteria;
        comments?: string;
        averageScore?: number;
      }
    }, 
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.put(getApiUrl(`api/evaluations/${id}`), evaluationData, config);
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || 'Qiymətləndirmə yenilenemedi');
    }
  }
);

export const deleteEvaluation = createAsyncThunk(
  'evaluations/deleteEvaluation',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(getApiUrl(`api/evaluations/${id}`), config);
      return id;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || 'Qiymətləndirmə silinemedi');
    }
  }
);

// Create the evaluation slice
const evaluationSlice = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {
    resetEvaluationState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearCurrentEvaluation: (state) => {
      state.currentEvaluation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all evaluations
      .addCase(fetchEvaluations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvaluations.fulfilled, (state, action: PayloadAction<{ evaluations: Evaluation[] }>) => {
        state.loading = false;
        state.evaluations = action.payload.evaluations;
        state.success = true;
      })
      .addCase(fetchEvaluations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user evaluations
      .addCase(fetchUserEvaluations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserEvaluations.fulfilled, (state, action: PayloadAction<{ evaluations: Evaluation[] }>) => {
        state.loading = false;
        state.userEvaluations = action.payload.evaluations;
        state.success = true;
      })
      .addCase(fetchUserEvaluations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch evaluation by ID
      .addCase(fetchEvaluationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvaluationById.fulfilled, (state, action: PayloadAction<{ evaluation: Evaluation }>) => {
        state.loading = false;
        state.currentEvaluation = action.payload.evaluation;
        state.success = true;
      })
      .addCase(fetchEvaluationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create evaluation
      .addCase(createEvaluation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createEvaluation.fulfilled, (state, action: PayloadAction<{ success: boolean, data: RawEvaluation }>) => {
        state.loading = false;
        
        // Backend'den gelen veriyi dönüştür
        const rawEvaluation = action.payload.data;
        console.log('Raw evaluation from API:', rawEvaluation);
        
        // transformEvaluations fonksiyonunu kullanarak veriyi dönüştür
        const transformedEvaluation = transformEvaluations([rawEvaluation])[0];
        console.log('Transformed evaluation:', transformedEvaluation);
        
        state.evaluations.push(transformedEvaluation);
        state.success = true;
      })
      .addCase(createEvaluation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      
      // Update evaluation
      .addCase(updateEvaluation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEvaluation.fulfilled, (state, action: PayloadAction<{ evaluation: Evaluation }>) => {
        state.loading = false;
        state.evaluations = state.evaluations.map((evaluation) =>
          evaluation._id === action.payload.evaluation._id ? action.payload.evaluation : evaluation
        );
        state.userEvaluations = state.userEvaluations.map((evaluation) =>
          evaluation._id === action.payload.evaluation._id ? action.payload.evaluation : evaluation
        );
        state.currentEvaluation = action.payload.evaluation;
        state.success = true;
      })
      .addCase(updateEvaluation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      
      // Delete evaluation
      .addCase(deleteEvaluation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteEvaluation.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.evaluations = state.evaluations.filter((evaluation) => evaluation._id !== action.payload);
        state.userEvaluations = state.userEvaluations.filter((evaluation) => evaluation._id !== action.payload);
        state.success = true;
      })
      .addCase(deleteEvaluation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

// Export actions and reducer
export const { resetEvaluationState, clearCurrentEvaluation } = evaluationSlice.actions;

// Export selectors
export const selectAllEvaluations = (state: RootState) => state.evaluation.evaluations;
export const selectUserEvaluations = (state: RootState) => state.evaluation.userEvaluations;
export const selectCurrentEvaluation = (state: RootState) => state.evaluation.currentEvaluation;
export const selectEvaluationLoading = (state: RootState) => state.evaluation.loading;
export const selectEvaluationError = (state: RootState) => state.evaluation.error;
export const selectEvaluationSuccess = (state: RootState) => state.evaluation.success;

export default evaluationSlice.reducer; 