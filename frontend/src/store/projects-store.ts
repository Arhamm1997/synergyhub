import { create } from "zustand";
import type { Project } from "@/lib/types";
import { api, API_ENDPOINTS } from "@/lib/api-config";

interface CreateProjectData {
    name: string;
    description?: string;
    clientId?: string;
    businessId?: string;
    deadline?: string;
    budget?: number;
    status?: string;
    teamMembers?: string[];
}

interface UpdateProjectData {
    name?: string;
    description?: string;
    clientId?: string;
    deadline?: string;
    budget?: number;
    status?: string;
    teamMembers?: string[];
    progress?: number;
}

interface ProjectsState {
    projects: Project[];
    isLoading: boolean;
    error: string | null;
    // Core CRUD operations
    fetchProjects: (businessId?: string) => Promise<void>;
    createProject: (projectData: CreateProjectData) => Promise<Project>;
    updateProject: (projectId: string, updates: UpdateProjectData) => Promise<Project>;
    deleteProject: (projectId: string) => Promise<void>;
    getProjectById: (projectId: string) => Project | undefined;
    // Advanced operations
    getProjectAnalytics: (projectId: string) => Promise<any>;
    addTeamMember: (projectId: string, memberId: string) => Promise<void>;
    removeTeamMember: (projectId: string, memberId: string) => Promise<void>;
    updateProjectStatus: (projectId: string, status: string) => Promise<void>;
    // Utility functions
    clearError: () => void;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    getProjectById: (projectId: string) => {
        return get().projects.find(project => project.id === projectId);
    },

    fetchProjects: async (businessId?: string) => {
        try {
            set({ isLoading: true, error: null });

            let endpoint = API_ENDPOINTS.PROJECTS.BASE;
            if (businessId) {
                endpoint += `?businessId=${businessId}`;
            }

            const response = await api.get(endpoint);
            set({
                projects: response.data.projects || response.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error?.response?.data?.message || "Failed to fetch projects",
                isLoading: false
            });
        }
    },

    createProject: async (projectData: CreateProjectData) => {
        try {
            set({ error: null });
            const response = await api.post(API_ENDPOINTS.PROJECTS.BASE, projectData);
            const newProject = response.data.project || response.data;

            set((state) => ({
                projects: [newProject, ...state.projects],
            }));

            return newProject;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to create project";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    updateProject: async (projectId: string, updates: UpdateProjectData) => {
        try {
            set({ error: null });
            const response = await api.put(API_ENDPOINTS.PROJECTS.BY_ID(projectId), updates);
            const updatedProject = response.data.project || response.data;

            set((state) => ({
                projects: state.projects.map((project) =>
                    project.id === projectId ? { ...project, ...updatedProject } : project
                ),
            }));

            return updatedProject;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to update project";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    deleteProject: async (projectId: string) => {
        try {
            set({ error: null });
            await api.delete(API_ENDPOINTS.PROJECTS.BY_ID(projectId));

            set((state) => ({
                projects: state.projects.filter((project) => project.id !== projectId),
            }));
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to delete project";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    getProjectAnalytics: async (projectId: string) => {
        try {
            const response = await api.get(API_ENDPOINTS.PROJECTS.ANALYTICS(projectId));
            return response.data;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to get project analytics";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    addTeamMember: async (projectId: string, memberId: string) => {
        try {
            set({ error: null });
            await api.post(`${API_ENDPOINTS.PROJECTS.BY_ID(projectId)}/team`, { memberId });

            // Refresh projects to get updated team
            await get().fetchProjects();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to add team member";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    removeTeamMember: async (projectId: string, memberId: string) => {
        try {
            set({ error: null });
            await api.delete(`${API_ENDPOINTS.PROJECTS.BY_ID(projectId)}/team/${memberId}`);

            // Refresh projects to get updated team
            await get().fetchProjects();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to remove team member";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    updateProjectStatus: async (projectId: string, status: string) => {
        try {
            await get().updateProject(projectId, { status });
        } catch (error) {
            throw error;
        }
    },
}));