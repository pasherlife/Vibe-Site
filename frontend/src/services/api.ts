import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  User,
  TokenResponse,
  LoginCredentials,
  RegisterCredentials,
  Project,
  ProjectMember,
  TranslationFile,
  FileVersion,
  TranslationString,
  TranslationSuggestion,
  TranslationComment,
  TranslationStats,
  ActivityLog,
} from '@/types';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, clear and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export the configured axios instance
export { api };

// Authentication API
export const authApi = {
  login: (credentials: LoginCredentials): Promise<TokenResponse> =>
    api.post('/auth/login', credentials),
  
  register: (credentials: RegisterCredentials): Promise<TokenResponse> =>
    api.post('/auth/register', credentials),
  
  logout: (): Promise<{ message: string }> =>
    api.post('/auth/logout'),
  
  getCurrentUser: (): Promise<User> =>
    api.get('/auth/me'),
};

// User API
export const userApi = {
  getById: (userId: string): Promise<User> =>
    api.get(`/users/${userId}`),
  
  list: (skip?: number, limit?: number): Promise<User[]> =>
    api.get('/users', { params: { skip, limit } }),
  
  updateProfile: (userId: string, data: Partial<User>): Promise<User> =>
    api.put(`/users/${userId}`, data),
  
  updateMyProfile: (data: Partial<User>): Promise<User> =>
    api.put('/users/me', data),
  
  search: (query: string, limit?: number): Promise<User[]> =>
    api.get('/users/search', { params: { query, limit } }),
};

// Project API
export const projectApi = {
  listMy: (skip?: number, limit?: number): Promise<Project[]> =>
    api.get('/projects/my', { params: { skip, limit } }),
  
  listPublic: (skip?: number, limit?: number): Promise<Project[]> =>
    api.get('/projects/public', { params: { skip, limit } }),
  
  getById: (projectId: string): Promise<Project> =>
    api.get(`/projects/${projectId}`),
  
  create: (data: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'owner_id'>): Promise<Project> =>
    api.post('/projects', data),
  
  update: (projectId: string, data: Partial<Project>): Promise<Project> =>
    api.put(`/projects/${projectId}`, data),
  
  delete: (projectId: string): Promise<{ message: string }> =>
    api.delete(`/projects/${projectId}`),
  
  // Members
  getMembers: (projectId: string): Promise<ProjectMember[]> =>
    api.get(`/projects/${projectId}/members`),
  
  addMember: (projectId: string, data: { user_id: string; role: string }): Promise<ProjectMember> =>
    api.post(`/projects/${projectId}/members`, data),
  
  updateMemberRole: (projectId: string, userId: string, role: string): Promise<ProjectMember> =>
    api.put(`/projects/${projectId}/members/${userId}`, null, { params: { role } }),
  
  removeMember: (projectId: string, userId: string): Promise<{ message: string }> =>
    api.delete(`/projects/${projectId}/members/${userId}`),
  
  search: (query: string, limit?: number): Promise<Project[]> =>
    api.get('/projects/search', { params: { query, limit } }),
};

// File API
export const fileApi = {
  upload: (projectId: string, file: File, sourceLanguage?: string, targetLanguage?: string): Promise<TranslationFile> => {
    const formData = new FormData();
    formData.append('project_id', projectId);
    formData.append('file', file);
    if (sourceLanguage) formData.append('source_language', sourceLanguage);
    if (targetLanguage) formData.append('target_language', targetLanguage);
    
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  listByProject: (projectId: string): Promise<TranslationFile[]> =>
    api.get(`/files/projects/${projectId}`),
  
  getById: (fileId: string): Promise<TranslationFile> =>
    api.get(`/files/${fileId}`),
  
  update: (fileId: string, data: Partial<TranslationFile>): Promise<TranslationFile> =>
    api.put(`/files/${fileId}`, data),
  
  delete: (fileId: string): Promise<TranslationFile> =>
    api.delete(`/files/${fileId}`),
  
  download: (fileId: string): Promise<Blob> =>
    api.get(`/files/${fileId}/download`, { responseType: 'blob' }),
  
  // Versions
  getVersions: (fileId: string): Promise<FileVersion[]> =>
    api.get(`/files/${fileId}/versions`),
  
  // Stats
  getStats: (fileId: string): Promise<TranslationStats> =>
    api.get(`/files/${fileId}/stats`),
  
  // Strings
  getStrings: (
    fileId: string,
    skip?: number,
    limit?: number,
    status?: string,
    search?: string
  ): Promise<TranslationString[]> =>
    api.get(`/files/${fileId}/strings`, { params: { skip, limit, status, search } }),
};

// Translation API
export const translationApi = {
  getString: (stringId: string): Promise<TranslationString> =>
    api.get(`/translations/strings/${stringId}`),
  
  updateString: (stringId: string, data: Partial<TranslationString>): Promise<TranslationString> =>
    api.put(`/translations/strings/${stringId}`, data),
  
  listByFile: (
    fileId: string,
    skip?: number,
    limit?: number,
    status?: string
  ): Promise<TranslationString[]> =>
    api.get(`/translations/files/${fileId}/strings`, { params: { skip, limit, status } }),
  
  // Suggestions
  createSuggestion: (data: { translation_string_id: string; suggested_text: string }): Promise<TranslationSuggestion> =>
    api.post('/translations/suggestions', data),
  
  getSuggestions: (stringId: string, status?: string): Promise<TranslationSuggestion[]> =>
    api.get(`/translations/strings/${stringId}/suggestions`, { params: { status } }),
  
  updateSuggestionStatus: (suggestionId: string, status: string): Promise<TranslationSuggestion> =>
    api.put(`/translations/suggestions/${suggestionId}/status`, null, { params: { status } }),
  
  deleteSuggestion: (suggestionId: string): Promise<TranslationSuggestion> =>
    api.delete(`/translations/suggestions/${suggestionId}`),
  
  // Comments
  createComment: (data: { translation_string_id: string; content: string; parent_id?: string }): Promise<TranslationComment> =>
    api.post('/translations/comments', data),
  
  getComments: (stringId: string): Promise<TranslationComment[]> =>
    api.get(`/translations/strings/${stringId}/comments`),
  
  updateComment: (commentId: string, content: string): Promise<TranslationComment> =>
    api.put(`/translations/comments/${commentId}`, null, { params: { content } }),
  
  deleteComment: (commentId: string): Promise<TranslationComment> =>
    api.delete(`/translations/comments/${commentId}`),
  
  // Lock/Unlock
  lockString: (stringId: string): Promise<TranslationString> =>
    api.post(`/translations/strings/${stringId}/lock`),
  
  unlockString: (stringId: string): Promise<TranslationString> =>
    api.post(`/translations/strings/${stringId}/unlock`),
  
  // Search
  search: (params: {
    query: string;
    project_id?: string;
    file_id?: string;
    status?: string;
    limit?: number;
  }): Promise<TranslationString[]> =>
    api.get('/translations/search', { params }),
};

// Activity API
export const activityApi = {
  getRecent: (limit?: number): Promise<ActivityLog[]> =>
    api.get('/activity/recent', { params: { limit } }),
  
  getByUser: (skip?: number, limit?: number): Promise<ActivityLog[]> =>
    api.get('/activity/user', { params: { skip, limit } }),
  
  getByProject: (projectId: string, skip?: number, limit?: number): Promise<ActivityLog[]> =>
    api.get(`/activity/projects/${projectId}`, { params: { skip, limit } }),
  
  getById: (logId: string): Promise<ActivityLog> =>
    api.get(`/activity/${logId}`),
};

// Helper function to set auth token
export const setAuthToken = (token: string, user: User) => {
  localStorage.setItem('access_token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Helper function to clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
};

// Helper function to get stored user
export const getStoredUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};
