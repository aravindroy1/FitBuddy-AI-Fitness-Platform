import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/index.js';

interface GuardedRouteProps {
  children: React.ReactNode;
}

export const GuardedRoute: React.FC<GuardedRouteProps> = ({ children }) => {
  const { isAuthenticated, isVerified } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-otp" replace />;
  }

  return <>{children}</>;
};
