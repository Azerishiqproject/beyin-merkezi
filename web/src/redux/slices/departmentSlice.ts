import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl } from '@/utils/api';

// API Error interface
interface ApiError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    }
  };
}

// Types
export interface Department {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentState {
  departments: Department[];
  currentDepartment: Department | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  success: string | null;
}

// Initial state
const initialState: DepartmentState = {
  departments: [],
  currentDepartment: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  success: null,
};

// Async thunks
export const fetchDepartments = createAsyncThunk(
  'departments/fetchAll',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      const response = await fetch(getApiUrl('api/departments'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Departamentleri almaqda xeta yaranadi');
      }

      return data.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'Departamentleri almaqda xeta yaranadi');
    }
  }
);

export const fetchDepartment = createAsyncThunk(
  'departments/fetchDepartment',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      if (!auth.token) {
        return rejectWithValue('Token bulunamadı');
      }
      
      const response = await fetch(getApiUrl(`api/departments/${id}`), {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'Departament melumatlarini almaqda xeta yaranadi');
      }
      
      return data.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'Departament melumatlarini almaqda xeta yaranadi');
    }
  }
);

export const createDepartment = createAsyncThunk(
  'departments/create',
  async (
    { name, description }: { name: string; description?: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as { auth: { token: string } };
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      const response = await fetch(getApiUrl('api/departments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Departament yaradilarken xeta yaranadi');
      }

      return data.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'Departament yaradilarken xeta yaranadi');
    }
  }
);

export const updateDepartment = createAsyncThunk(
  'departments/update',
  async (
    { id, name, description }: { id: string; name: string; description?: string },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as { auth: { token: string } };
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      const response = await fetch(getApiUrl(`api/departments/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Departament yenilenerken xeta yaranadi');
      }

      return data.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'Departament yenilenerken xeta yaranadi');
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  'departments/delete',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      const response = await fetch(getApiUrl(`api/departments/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Departament silinerkende xeta yaranadi');
      }

      return id;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'Departament silinerkende xeta yaranadi');
    }
  }
);

// Department slice
const departmentSlice = createSlice({
  name: 'departments',
  initialState,
  reducers: {
    clearDepartmentError: (state) => {
      state.error = null;
    },
    clearDepartmentSuccess: (state) => {
      state.success = null;
    },
    resetDepartmentState: (state) => {
      state.currentDepartment = null;
      state.error = null;
      state.success = null;
      state.isCreating = false;
      state.isUpdating = false;
      state.isDeleting = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch departments
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single department
      .addCase(fetchDepartment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDepartment = action.payload;
      })
      .addCase(fetchDepartment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create department
      .addCase(createDepartment.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.isCreating = false;
        state.departments.push(action.payload);
        state.success = 'Departament uğurla yaradildi';
      })
      .addCase(createDepartment.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Update department
      .addCase(updateDepartment.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.departments = state.departments.map((department) =>
          department._id === action.payload._id ? action.payload : department
        );
        state.currentDepartment = action.payload;
        state.success = 'Departament uğurla yenilenddi';
      })
      .addCase(updateDepartment.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      // Delete department
      .addCase(deleteDepartment.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.departments = state.departments.filter(
          (department) => department._id !== action.payload
        );
        state.success = 'Departament uğurla silindi';
      })
      .addCase(deleteDepartment.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearDepartmentError, clearDepartmentSuccess, resetDepartmentState } = departmentSlice.actions;
export default departmentSlice.reducer; 