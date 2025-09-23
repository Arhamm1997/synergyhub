import { create } from 'zustand';
import type { Project } from '@/lib/types';
import { api, API_ENDPOINTS } from '@/lib/api-config';

interface ProjectStore {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  // CRUD operations
  fetchProjects: () => Promise<void>;
  updateProject: (updatedProject: Project) => void;
  getProject: (id: string) => Project | undefined;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.PROJECTS.BASE);
      const projects = response.data.projects || response.data || [];
      set({ projects, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      set({
        projects: [],
        isLoading: false,
        error: null // Don't show error, just use empty state
      });
    }
  },

  updateProject: (updatedProject) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      ),
    }));
  },

  getProject: (id) => {
    return get().projects.find((project) => project.id === id);
  },

  addProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(API_ENDPOINTS.PROJECTS.BASE, projectData);
      const newProject = response.data.project || response.data;
      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to create project';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`${API_ENDPOINTS.PROJECTS.BASE}/${id}`);
      set((state) => ({
        projects: state.projects.filter(project => project.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete project';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  }
}));