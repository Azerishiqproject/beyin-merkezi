import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getApiUrl } from '@/utils/api';

// Types
export interface User {
  id: string;
  email: string;
  userType: string;
  firstName?: string;
  lastName?: string;
  academicDegree?: string;
  averageScore?: number;
  departmentId?: string | {
    _id: string;
    name: string;
  };
  token?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(getApiUrl('api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Giriş zamanı xəta baş verdi');
      }

      const userData = {
        id: data.data._id,
        email: data.data.email,
        userType: data.data.userType,
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        academicDegree: data.data.academicDegree,
        averageScore: data.data.averageScore,
        departmentId: data.data.departmentId,
        token: data.data.token,
      };

      // Save to localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      return {
        user: userData,
        token: data.data.token,
      };
    } catch (error: unknown) {
      let errorMessage = 'Giriş zamanı xəta baş verdi';
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Clear state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isAdmin = action.payload.user.userType === 'Admin';
      
      // Add token to user object for convenience
      if (state.user) {
        state.user.token = action.payload.token;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isAdmin = action.payload.user.userType === 'Admin';
        
        // Add token to user object for convenience
        if (state.user) {
          state.user.token = action.payload.token;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer; 