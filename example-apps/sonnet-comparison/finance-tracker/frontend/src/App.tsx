import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import Header from './components/layout/Header';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TwoFactorAuth from './components/auth/TwoFactorAuth';

// Page components
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import SavingsGoals from './pages/SavingsGoals';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#22c55e',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/2fa" element={<TwoFactorAuth />} />
            
            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <div className="min-h-screen">
                    <Header />
                    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/expenses" element={<Expenses />} />
                        <Route path="/budgets" element={<Budgets />} />
                        <Route path="/savings-goals" element={<SavingsGoals />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </main>
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;