// components/PublicRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const isAuthenticated = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).user?.type === 'company' : null;

  return isAuthenticated ? <Navigate to="/home" /> : <Outlet />;
};

export default PublicRoute;
