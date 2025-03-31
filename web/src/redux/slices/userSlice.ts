import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiUrl } from '@/utils/api';

// API Error interface
interface ApiError {
  message: string;
}

// Types
export interface User {
  _id: string;
  email: string;
  userType: 'User' | 'Admin';
  firstName?: string;
  lastName?: string;
  academicDegree?: string;
  averageScore?: number;
  evaluationAverageScore?: number;
  departmentId?: string | {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  success: string | null;
}

// Initial state
const initialState: UserState = {
  users: [],
  currentUser: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  success: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (filters: { departmentId?: string; year?: string } = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      // Build URL with query parameters
      let url = getApiUrl('api/users');
      const params = new URLSearchParams();
      
      if (filters.departmentId) {
        params.append('departmentId', filters.departmentId);
      }
      
      if (filters.year) {
        params.append('year', filters.year);
      }
      
      // Append query parameters if any exist
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('Fetching users with URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'İstifadəçiləri əldə edərkən xəta baş verdi');
      }

      return data.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'İstifadəçiləri əldə edərkən xəta baş verdi');
    }
  }
);

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: { token: string } };
      
      if (!auth.token) {
        return rejectWithValue('Token bulunamadı');
      }
      
      const response = await fetch(getApiUrl(`api/users/${id}`), {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return rejectWithValue(data.message || 'İstifadəçi bilgisi alınamadı');
      }
      
      return data.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'İstifadəçi bilgisi alınamadı');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/create',
  async (
    userData: { 
      email: string; 
      password: string; 
      userType: string; 
      firstName?: string;
      lastName?: string;
      academicDegree?: string;
      averageScore?: number;
      departmentId?: string 
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as { auth: { token: string } };
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      // If user type is User, departmentId is required
      if (userData.userType === 'User' && !userData.departmentId) {
        return rejectWithValue('Departament seçimi zorunludur');
      }

      const response = await fetch(getApiUrl('api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'İstifadəçi yaradilarken xeta yaranadi');
      }

      return data.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'İstifadəçi yaradilarken xeta yaranadi');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async (
    { id, ...userData }: { 
      id: string; 
      email: string; 
      password?: string; 
      userType: string; 
      firstName?: string;
      lastName?: string;
      academicDegree?: string;
      averageScore?: number;
      departmentId?: string 
    },
    { rejectWithValue, getState }
  ) => {
    try {
      const state = getState() as { auth: { token: string } };
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      // If user type is User, departmentId is required
      if (userData.userType === 'User' && !userData.departmentId) {
        return rejectWithValue('Departament seçimi zorunludur');
      }

      const response = await fetch(getApiUrl(`api/users/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'İstifadəçi yenilenerken xeta yaranadi');
      }

      return data.data;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'İstifadəçi yenilenerken xeta yaranadi');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: { token: string } };
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('Token bulunamadı');
      }

      const response = await fetch(getApiUrl(`api/users/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'İstifadəçi silinərkən xəta baş verdi');
      }

      return id;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.message || 'İstifadəçi silinərkən xəta baş verdi');
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserSuccess: (state) => {
      state.success = null;
    },
    resetUserState: (state) => {
      state.currentUser = null;
      state.error = null;
      state.success = null;
      state.isCreating = false;
      state.isUpdating = false;
      state.isDeleting = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch single user
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isCreating = false;
        state.users.push(action.payload);
        state.success = 'İstifadəçi uğurla yaradıldı';
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.users = state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        );
        state.currentUser = action.payload;
        state.success = 'İstifadəçi uğurla yeniləndi';
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.users = state.users.filter(
          (user) => user._id !== action.payload
        );
        state.success = 'İstifadəçi uğurla silindi';
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearUserError, clearUserSuccess, resetUserState } = userSlice.actions;
export default userSlice.reducer; 