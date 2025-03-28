import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from '../utils/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState(() => ({
        accessToken: localStorage.getItem('accessToken') || null,
        refreshToken: localStorage.getItem('refreshToken') || null
    }));

    useEffect(() => {
        if (authData.accessToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authData.accessToken}`;
        }
    }, [authData.accessToken]);

    const updateAuthData = useCallback(({ access, refresh }) => {
        setAuthData(prev => ({
            accessToken: access || prev.accessToken,
            refreshToken: refresh || prev.refreshToken
        }));

        if (access) {
            localStorage.setItem('accessToken', access);
            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        }
        if (refresh) {
            localStorage.setItem('refreshToken', refresh);
        }
    }, []);

    const logout = useCallback(() => {
        setAuthData({ accessToken: null, refreshToken: null });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete axios.defaults.headers.common['Authorization'];
    }, []);

    const refreshAccessToken = useCallback(async () => {
        try {
            const response = await axios.post('/api/v1/auth/refresh', {
                refresh_token: authData.refreshToken
            });

            updateAuthData({
                access: response.data.access,
                refresh: response.data.refresh
            });

            return response.data.access;
        } catch (error) {
            logout();
            throw error;
        }
    }, [authData.refreshToken, updateAuthData, logout]);

    const login = useCallback(async (credentials) => {
        const response = await axios.post('/api/v1/auth/token', {
            username: credentials.username,
            password: credentials.password
        });

        updateAuthData({
            access: response.data.access,
            refresh: response.data.refresh
        });

        return response.data;
    }, [updateAuthData]);

    return (
        <AuthContext.Provider value={{
            ...authData,
            login,
            logout,
            refreshAccessToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
