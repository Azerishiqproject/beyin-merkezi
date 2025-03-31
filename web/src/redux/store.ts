import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import departmentReducer from './slices/departmentSlice';
import userReducer from './slices/userSlice';
import evaluationReducer from './slices/evaluationSlice';

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  departments: departmentReducer,
  users: userReducer,
  evaluation: evaluationReducer,
  // Diğer reducer'lar buraya eklenebilir
});

// Redux persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Sadece auth state'ini persist et
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 