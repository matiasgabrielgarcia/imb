import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import DashboardView from './views/DashboardView';
import PropertiesView from './views/PropertiesView';
import NotificationsView from './views/NotificationsView';
import OpportunitiesView from './views/OpportunitiesView';
import PropertyDetail from './components/PropertyDetail';
import SaleDetail from './components/SaleDetail';
import RentalDetail from './components/RentalDetail';
import PropertyCreate from './components/PropertyCreate';
import PropertyEdit from './components/PropertyEdit';

import './App.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ProfileView from './views/ProfileView';
import Layout from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/profile" />;
};

function App() {
  const theme = createTheme();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginForm />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfileView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/propiedades" 
                element={
                  <ProtectedRoute>
                    <PropertiesView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/propiedades/nueva" 
                element={
                  <ProtectedRoute>
                    <PropertyCreate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/propiedades/:id/editar" 
                element={
                  <ProtectedRoute>
                    <PropertyEdit />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/propiedades/:id" 
                element={
                  <ProtectedRoute>
                    <PropertyDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/propiedades/:id/ventas/:saleId" 
                element={
                  <ProtectedRoute>
                    <SaleDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/propiedades/:id/alquileres/:rentalId" 
                element={
                  <ProtectedRoute>
                    <RentalDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notificaciones" 
                element={
                  <ProtectedRoute>
                    <NotificationsView />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/oportunidades" 
                element={
                  <ProtectedRoute>
                    <OpportunitiesView />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/profile" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
