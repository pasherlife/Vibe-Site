import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, userApi, getStoredUser, setAuthToken, clearAuthToken } from '@/services/api';
import type { User, TokenResponse, LoginCredentials, RegisterCredentials } from '@/types';

// Custom hook for authentication
export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Get current user from localStorage or query
  const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: ['user'],
    queryFn: authApi.getCurrentUser,
    initialData: getStoredUser(),
    enabled: !!getStoredUser(),
  });
  
  // Login mutation
  const loginMutation = useMutation<TokenResponse, Error, LoginCredentials>({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      setAuthToken(response.access_token, response.user);
      queryClient.setQueryData(['user'], response.user);
      navigate('/');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
  
  // Register mutation
  const registerMutation = useMutation<TokenResponse, Error, RegisterCredentials>({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      setAuthToken(response.access_token, response.user);
      queryClient.setQueryData(['user'], response.user);
      navigate('/');
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuthToken();
      queryClient.clear();
      navigate('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });
  
  // Manual logout (without calling API)
  const logout = () => {
    clearAuthToken();
    queryClient.clear();
    navigate('/login');
  };
  
  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    manualLogout: logout,
    loginLoading: loginMutation.isPending,
    registerLoading: registerMutation.isPending,
    logoutLoading: logoutMutation.isPending,
  };
};

// Hook to check if user is authenticated
export const useIsAuthenticated = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
};

// Hook to get current user
export const useCurrentUser = () => {
  const { user, isLoading, isError } = useAuth();
  return { user, isLoading, isError };
};
