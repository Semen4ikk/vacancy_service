import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../utils/token';


const ProtectedRoute = ({ element }) => {
    const { accessToken } = useAuth();

    return accessToken ? element : <Navigate to="/login" />;
};

export default ProtectedRoute;

