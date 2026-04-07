import { useState, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter } from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/dashboard.css';
import { AuthProvider, useAuth } from './context/AuthProvider.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { isLoggedIn, SetLogoutData } = useAuth();

  const router = useMemo(
    () => createRouter(isLoggedIn, SetLogoutData),
    [isLoggedIn, SetLogoutData]
  );

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
