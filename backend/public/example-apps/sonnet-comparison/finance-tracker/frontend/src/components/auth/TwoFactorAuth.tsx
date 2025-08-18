import React from 'react';
import { Navigate } from 'react-router-dom';

const TwoFactorAuth: React.FC = () => {
  // This is a placeholder component - in a real app, this would handle 2FA setup
  return <Navigate to="/dashboard" replace />;
};

export default TwoFactorAuth;