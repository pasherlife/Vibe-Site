import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileApi } from '@/services/api';
import type { TranslationFile, FileVersion, TranslationStats, TranslationString } from '@/types';

// Hook to get files for a project
export const useProjectFiles = (projectId: string) => {
  return useQuery<TranslationFile[]>({
    queryKey: ['files', 'project', projectId],
    queryFn: () => fileApi.listByProject(projectId),
    enabled: !!projectId,
  });
};

// Hook to get a specific file
export const useFile = (fileId: string) => {
  return useQuery<TranslationFile>({
    queryKey: ['files', fileId],
    queryFn: () => fileApi.getById(fileId),
    enabled: !!fileId,
  });
};

// Hook to upload a file
export const useUploadFile = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<TranslationFile, Error, { file: File; sourceLanguage?: string; targetLanguage?: string }>({
    mutationFn: ({ file, sourceLanguage, targetLanguage }) =>
      fileApi.upload(projectId, file, sourceLanguage, targetLanguage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', 'project', projectId] });
    },
  });
};

// Hook to update a file
export const useUpdateFile = (fileId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<TranslationFile, Error, Partial<TranslationFile>>({
    mutationFn: (data) => fileApi.update(fileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', fileId] });
    },
  });
};

// Hook to delete a file
export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TranslationFile, Error, string>({
    mutationFn: fileApi.delete,
    onSuccess: (_, fileId) => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['files', 'project'] });
    },
  });
};

// Hook to download a file
export const useDownloadFile = (fileId: string) => {
  return useMutation<Blob, Error, void>({
    mutationFn: () => fileApi.download(fileId),
  });
};

// Hook to get file versions
export const useFileVersions = (fileId: string) => {
  return useQuery<FileVersion[]>({
    queryKey: ['files', fileId, 'versions'],
    queryFn: () => fileApi.getVersions(fileId),
    enabled: !!fileId,
  });
};

// Hook to get file stats
export const useFileStats = (fileId: string) => {
  return useQuery<TranslationStats>({
    queryKey: ['files', fileId, 'stats'],
    queryFn: () => fileApi.getStats(fileId),
    enabled: !!fileId,
  });
};

// Hook to get file strings
export const useFileStrings = (
  fileId: string,
  skip?: number,
  limit?: number,
  status?: string,
  search?: string
) => {
  return useQuery<TranslationString[]>({
    queryKey: ['files', fileId, 'strings', skip, limit, status, search],
    queryFn: () => fileApi.getStrings(fileId, skip, limit, status, search),
    enabled: !!fileId,
  });
};
