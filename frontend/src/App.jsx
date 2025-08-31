import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import Workshops from './pages/Workshops';
import WorkshopDetail from './pages/WorkshopDetail';
import ServiceRequest from './pages/ServiceRequest';
import MyRequests from './pages/MyRequests';
import RequestDetail from './pages/RequestDetail';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AdminUsers from './pages/admin/AdminUsers';
import AdminWorkshops from './pages/admin/AdminWorkshops';
import AdminReports from './pages/admin/AdminReports';
import AdminRequests from './pages/admin/AdminRequests';
import AdminWorkshopNew from './pages/admin/AdminWorkshopNew';
import AdminWorkshopAssign from './pages/admin/AdminWorkshopAssign';
import WorkerActiveRequests from './pages/worker/WorkerActiveRequests';
import WorkerCompleted from './pages/worker/WorkerCompleted';
import WorkerServiceMap from './pages/worker/WorkerServiceMap';

// Layout Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  const { user } = useAuth();

  // Determine dashboard based on user role
  const getDashboardComponent = () => {
    if (!user) return <Navigate to="/login" />;
    
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'worker':
        return <WorkerDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Dashboard - Role Based */}
          <Route path="/" element={getDashboardComponent()} />
          <Route path="/dashboard" element={getDashboardComponent()} />

          {/* Common Routes */}
          <Route path="/workshops" element={
            <ProtectedRoute allowedRoles={['user','admin']}>
              <Workshops />
            </ProtectedRoute>
          } />
          <Route path="/workshops/:id" element={
            <ProtectedRoute allowedRoles={['user','admin']}>
              <WorkshopDetail />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />

          {/* User Routes */}
          <Route path="/service-request" element={
            <ProtectedRoute allowedRoles={['user']}>
              <ServiceRequest />
            </ProtectedRoute>
          } />
          <Route path="/my-requests" element={
            <ProtectedRoute allowedRoles={['user']}>
              <MyRequests />
            </ProtectedRoute>
          } />
          <Route path="/requests/:id" element={
            <ProtectedRoute allowedRoles={['user', 'admin', 'worker']}>
              <RequestDetail />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/workshops" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminWorkshops />
            </ProtectedRoute>
          } />
          <Route path="/admin/workshops/new" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminWorkshopNew />
            </ProtectedRoute>
          } />
          <Route path="/admin/workshops/:id/assign" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminWorkshopAssign />
            </ProtectedRoute>
          } />
          <Route path="/admin/requests" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRequests />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReports />
            </ProtectedRoute>
          } />

          {/* Worker Routes */}
          <Route path="/worker/active-requests" element={
            <ProtectedRoute allowedRoles={['worker']}>
              <WorkerActiveRequests />
            </ProtectedRoute>
          } />
          <Route path="/worker/completed" element={
            <ProtectedRoute allowedRoles={['worker']}>
              <WorkerCompleted />
            </ProtectedRoute>
          } />
          <Route path="/worker/map" element={
            <ProtectedRoute allowedRoles={['worker']}>
              <WorkerServiceMap />
            </ProtectedRoute>
          } />
        </Route>
      </Route>

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App
