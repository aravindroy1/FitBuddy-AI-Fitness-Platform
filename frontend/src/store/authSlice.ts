import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  isVerified: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('accessToken'),
  userId: localStorage.getItem('userId'),
  email: localStorage.getItem('email'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isVerified: localStorage.getItem('isVerified') === 'true'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData(state, action: PayloadAction<{ token: string; userId: string; email: string }>) {
      state.token = action.payload.token;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.isAuthenticated = true;
      state.isVerified = true;

      localStorage.setItem('accessToken', action.payload.token);
      localStorage.setItem('userId', action.payload.userId);
      localStorage.setItem('email', action.payload.email);
      localStorage.setItem('isVerified', 'true');
    },
    setRegisterData(state, action: PayloadAction<{ email: string }>) {
      state.email = action.payload.email;
      localStorage.setItem('email', action.payload.email);
    },
    setVerified(state) {
      state.isVerified = true;
      localStorage.setItem('isVerified', 'true');
    },
    logout(state) {
      state.token = null;
      state.userId = null;
      state.email = null;
      state.isAuthenticated = false;
      state.isVerified = false;

      localStorage.clear();
    }
  }
});

export const { setAuthData, setRegisterData, setVerified, logout } = authSlice.actions;
export default authSlice.reducer;
