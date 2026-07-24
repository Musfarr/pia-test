import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePublicAuth } from '../../context/PublicAuthProvider';

export default function PublicProtectedRoute({ children }) {
  const { isVoterLoggedIn } = usePublicAuth();

  if (!isVoterLoggedIn) {
    return <Navigate to="/vote/login" replace />;
  }

  return children;
}
