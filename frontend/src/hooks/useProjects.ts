import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/services/api';
import type { Project, ProjectMember } from '@/types';

// Hook to get user's projects
export const useMyProjects = (skip?: number, limit?: number) => {
  return useQuery<Project[]>({
    queryKey: ['projects', 'my', skip, limit],
    queryFn: () => projectApi.listMy(skip, limit),
  });
};

// Hook to get public projects
export const usePublicProjects = (skip?: number, limit?: number) => {
  return useQuery<Project[]>({
    queryKey: ['projects', 'public', skip, limit],
    queryFn: () => projectApi.listPublic(skip, limit),
  });
};

// Hook to get a specific project
export const useProject = (projectId: string) => {
  return useQuery<Project>({
    queryKey: ['projects', projectId],
    queryFn: () => projectApi.getById(projectId),
    enabled: !!projectId,
  });
};

// Hook to create a project
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Project, Error, Omit<Project, 'id' | 'created_at' | 'updated_at' | 'owner_id'>>({
    mutationFn: projectApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Hook to update a project
export const useUpdateProject = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<Project, Error, Partial<Project>>({
    mutationFn: (data) => projectApi.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', 'my'] });
    },
  });
};

// Hook to delete a project
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ message: string }, Error, string>({
    mutationFn: projectApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Hook to get project members
export const useProjectMembers = (projectId: string) => {
  return useQuery<ProjectMember[]>({
    queryKey: ['projects', projectId, 'members'],
    queryFn: () => projectApi.getMembers(projectId),
    enabled: !!projectId,
  });
};

// Hook to add a project member
export const useAddProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<ProjectMember, Error, { user_id: string; role: string }>({
    mutationFn: (data) => projectApi.addMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
    },
  });
};

// Hook to update a project member's role
export const useUpdateProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<ProjectMember, Error, { userId: string; role: string }>({
    mutationFn: ({ userId, role }) => projectApi.updateMemberRole(projectId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
    },
  });
};

// Hook to remove a project member
export const useRemoveProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (userId) => projectApi.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
    },
  });
};

// Hook to search projects
export const useSearchProjects = (query: string, limit?: number) => {
  return useQuery<Project[]>({
    queryKey: ['projects', 'search', query, limit],
    queryFn: () => projectApi.search(query, limit),
    enabled: query.length >= 2,
  });
};
