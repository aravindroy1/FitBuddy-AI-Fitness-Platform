import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import { GuardedRoute } from './components/GuardedRoute.js';
import { Layout } from './components/Layout.js';

// Auth Pages
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { ForgotPassword } from './pages/ForgotPassword.js';
import { VerifyOtp } from './pages/VerifyOtp.js';

// App Pages
import { Dashboard } from './pages/Dashboard.js';
import { DietPlanner } from './pages/DietPlanner.js';
import { WorkoutPlanner } from './pages/WorkoutPlanner.js';
import { AICoach } from './pages/AICoach.js';
import { ExerciseDetection } from './pages/ExerciseDetection.js';

import { MedicalReports } from './pages/MedicalReports.js';
import { Profile } from './pages/Profile.js';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          {/* Guarded App Routes */}
          <Route
            path="/"
            element={
              <GuardedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </GuardedRoute>
            }
          />
          <Route
            path="/diet"
            element={
              <GuardedRoute>
                <Layout>
                  <DietPlanner />
                </Layout>
              </GuardedRoute>
            }
          />
          <Route
            path="/workout"
            element={
              <GuardedRoute>
                <Layout>
                  <WorkoutPlanner />
                </Layout>
              </GuardedRoute>
            }
          />
          <Route
            path="/coach"
            element={
              <GuardedRoute>
                <Layout>
                  <AICoach />
                </Layout>
              </GuardedRoute>
            }
          />
          <Route
            path="/exercise"
            element={
              <GuardedRoute>
                <Layout>
                  <ExerciseDetection />
                </Layout>
              </GuardedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <GuardedRoute>
                <Layout>
                  <MedicalReports />
                </Layout>
              </GuardedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <GuardedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </GuardedRoute>
            }
          />

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
