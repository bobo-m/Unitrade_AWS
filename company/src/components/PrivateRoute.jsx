// components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Check if user data is in localStorage to determine if the user is authenticated
  const isAuthenticated = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).user?.type === 'company' : null;
  // console.log("isAuthenticated:", isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login"/>;
};

export default PrivateRoute;
