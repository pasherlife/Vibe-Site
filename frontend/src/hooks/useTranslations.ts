import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { translationApi } from '@/services/api';
import type {
  TranslationString,
  TranslationSuggestion,
  TranslationComment,
} from '@/types';

// Hook to get a translation string
export const useTranslationString = (stringId: string) => {
  return useQuery<TranslationString>({
    queryKey: ['translations', 'strings', stringId],
    queryFn: () => translationApi.getString(stringId),
    enabled: !!stringId,
  });
};

// Hook to update a translation string
export const useUpdateTranslationString = (stringId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<TranslationString, Error, Partial<TranslationString>>({
    mutationFn: (data) => translationApi.updateString(stringId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', 'strings', stringId] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
};

// Hook to get strings by file
export const useTranslationStringsByFile = (
  fileId: string,
  skip?: number,
  limit?: number,
  status?: string
) => {
  return useQuery<TranslationString[]>({
    queryKey: ['translations', 'files', fileId, 'strings', skip, limit, status],
    queryFn: () => translationApi.listByFile(fileId, skip, limit, status),
    enabled: !!fileId,
  });
};

// Hook to create a translation suggestion
export const useCreateSuggestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TranslationSuggestion, Error, { translation_string_id: string; suggested_text: string }>({
    mutationFn: translationApi.createSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', 'suggestions'] });
    },
  });
};

// Hook to get suggestions for a string
export const useTranslationSuggestions = (stringId: string, status?: string) => {
  return useQuery<TranslationSuggestion[]>({
    queryKey: ['translations', 'strings', stringId, 'suggestions', status],
    queryFn: () => translationApi.getSuggestions(stringId, status),
    enabled: !!stringId,
  });
};

// Hook to update suggestion status
export const useUpdateSuggestionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TranslationSuggestion, Error, { suggestionId: string; status: string }>({
    mutationFn: ({ suggestionId, status }) => translationApi.updateSuggestionStatus(suggestionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', 'suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['translations', 'strings'] });
    },
  });
};

// Hook to delete a suggestion
export const useDeleteSuggestion = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TranslationSuggestion, Error, string>({
    mutationFn: translationApi.deleteSuggestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', 'suggestions'] });
    },
  });
};

// Hook to create a comment
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TranslationComment, Error, { translation_string_id: string; content: string; parent_id?: string }>({
    mutationFn: translationApi.createComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', 'comments'] });
    },
  });
};

// Hook to get comments for a string
export const useTranslationComments = (stringId: string) => {
  return useQuery<TranslationComment[]>({
    queryKey: ['translations', 'strings', stringId, 'comments'],
    queryFn: () => translationApi.getComments(stringId),
    enabled: !!stringId,
  });
};

// Hook to update a comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TranslationComment, Error, { commentId: string; content: string }>({
    mutationFn: ({ commentId, content }) => translationApi.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', 'comments'] });
    },
  });
};

// Hook to delete a comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TranslationComment, Error, string>({
    mutationFn: translationApi.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', 'comments'] });
    },
  });
};

// Hook to lock a string
export const useLockString = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TranslationString, Error, string>({
    mutationFn: translationApi.lockString,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', 'strings'] });
    },
  });
};

// Hook to unlock a string
export const useUnlockString = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TranslationString, Error, string>({
    mutationFn: translationApi.unlockString,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translations', 'strings'] });
    },
  });
};

// Hook to search translations
export const useSearchTranslations = (params: {
  query: string;
  project_id?: string;
  file_id?: string;
  status?: string;
  limit?: number;
}) => {
  return useQuery<TranslationString[]>({
    queryKey: ['translations', 'search', params],
    queryFn: () => translationApi.search(params),
    enabled: params.query.length >= 2,
  });
};
