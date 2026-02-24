/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import Apply from './pages/Apply';
import HRLogin from './pages/HRLogin';
import HRDashboard from './pages/HRDashboard';
import Demo from './pages/Demo';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/hr/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="demo" element={<Demo />} />
            <Route path="apply/:id" element={<Apply />} />
            <Route path="hr/login" element={<HRLogin />} />
            <Route path="hr/dashboard" element={
              <ProtectedRoute>
                <HRDashboard />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
