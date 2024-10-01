import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Element, allowedRoles }) => {
  const token = localStorage.getItem('token'); // Pega o token do localStorage
  const userRole = localStorage.getItem('role'); // Pega a role do localStorage (você deve armazenar a role no login)

  if (!token) {
    return <Navigate to="/login" />; // Redireciona para o login se não houver token
  }

  // Verifica se a role do usuário é permitida
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />; // Redireciona se o usuário não tiver permissão
  }

  return <Element />;
};

export default PrivateRoute;
