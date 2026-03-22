import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const user = await authAPI.me();
                    setCurrentUser(user);
                } catch (error) {
                    console.error("Failed to fetch user with stored token", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const login = async (username, password) => {
        const response = await authAPI.login(username, password);
        localStorage.setItem('token', response.access_token);
        const user = await authAPI.me();
        setCurrentUser(user);
        return user;
    };

    const register = async (email, username, password) => {
        await authAPI.register({ email, username, password });
        return login(username, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
