// User types
export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  language: string;
  theme: string;
  created_at: string;
  last_login: string | null;
  bio?: string;
}

export interface UserProfile extends User {
  projects_owned_count: number;
  projects_member_count: number;
  translations_count: number;
  suggestions_count: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  full_name?: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  owner_id: string;
  is_public: boolean;
  allow_join_requests: boolean;
  default_language: string;
  target_languages: string;
  created_at: string;
  updated_at: string;
  members_count?: number;
  files_count?: number;
  strings_count?: number;
  progress?: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  updated_at: string;
  username?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

// File types
export type FileType = 'locres' | 'csv' | 'json' | 'txt';
export type FileStatus = 'pending' | 'processing' | 'ready' | 'error';

export interface TranslationFile {
  id: string;
  project_id: string;
  uploaded_by_id: string | null;
  filename: string;
  original_filename: string;
  file_type: FileType;
  file_path: string;
  file_size: number;
  source_language: string;
  target_language: string;
  status: FileStatus;
  error_message: string | null;
  total_strings: number;
  translated_strings: number;
  reviewed_strings: number;
  created_at: string;
  updated_at: string;
  uploaded_by_username?: string;
  uploaded_by_full_name?: string;
}

export interface FileVersion {
  id: string;
  file_id: string;
  version_number: number;
  filename: string;
  file_path: string;
  file_size: number;
  changelog: string | null;
  created_at: string;
}

// Translation types
export type TranslationStatus = 'untranslated' | 'translated' | 'reviewed' | 'approved' | 'rejected';

export interface TranslationString {
  id: string;
  file_id: string;
  key: string;
  source_text: string;
  target_text: string | null;
  context: string | null;
  notes: string | null;
  max_length: number | null;
  status: TranslationStatus;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  filename?: string;
  file_type?: FileType;
}

export interface TranslationSuggestion {
  id: string;
  translation_string_id: string;
  user_id: string | null;
  suggested_text: string;
  status: string;
  created_at: string;
  updated_at: string;
  username?: string;
  full_name?: string;
}

export interface TranslationComment {
  id: string;
  translation_string_id: string;
  user_id: string | null;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  replies?: TranslationComment[];
}

export interface TranslationStats {
  total_strings: number;
  translated_strings: number;
  reviewed_strings: number;
  approved_strings: number;
  progress_percentage: number;
  untranslated_count: number;
  translated_count: number;
  reviewed_count: number;
  approved_count: number;
  rejected_count: number;
}

// Activity types
export interface ActivityLog {
  id: string;
  user_id: string | null;
  project_id: string | null;
  activity_type: string;
  description: string | null;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  project_name?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
}

// UI State types
export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface SearchParams {
  query: string;
  project_id?: string;
  file_id?: string;
  status?: TranslationStatus;
  limit?: number;
}

// Language types
export interface Language {
  code: string;
  name: string;
  flag: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  created_at: Date;
}
