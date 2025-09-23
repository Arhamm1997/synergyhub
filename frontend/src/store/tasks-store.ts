import { create } from "zustand";
import type { Task, CreateTaskData, UpdateTaskData, TaskStatus, Priority } from "@/lib/types";
import { api, API_ENDPOINTS } from "@/lib/api-config";

interface TasksState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;
    // Core CRUD operations
    fetchTasks: (businessId?: string, projectId?: string) => Promise<void>;
    createTask: (taskData: CreateTaskData) => Promise<Task>;
    updateTask: (taskId: string, updates: UpdateTaskData) => Promise<Task>;
    deleteTask: (taskId: string) => Promise<void>;
    getTaskById: (taskId: string) => Task | undefined;
    // Advanced operations
    assignTask: (taskId: string, assigneeId: string) => Promise<void>;
    updateTaskStatus: (taskId: string, status: string) => Promise<void>;
    updateTaskPriority: (taskId: string, priority: string) => Promise<void>;
    addTaskComment: (taskId: string, content: string) => Promise<void>;
    logTime: (taskId: string, timeLog: { hours: number; description?: string }) => Promise<void>;
    getTaskAnalytics: (taskId: string) => Promise<any>;
    // Utility functions
    clearError: () => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    getTaskById: (taskId: string) => {
        return get().tasks.find(task => task.id === taskId);
    },

    fetchTasks: async (businessId?: string, projectId?: string) => {
        try {
            set({ isLoading: true, error: null });

            let endpoint = API_ENDPOINTS.TASKS.BASE;
            const params = new URLSearchParams();

            if (businessId) params.append('businessId', businessId);
            if (projectId) params.append('projectId', projectId);

            if (params.toString()) {
                endpoint += `?${params.toString()}`;
            }

            const response = await api.get(endpoint);
            set({
                tasks: response.data.tasks || response.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error?.response?.data?.message || "Failed to fetch tasks",
                isLoading: false
            });
        }
    },

    createTask: async (taskData: CreateTaskData) => {
        try {
            set({ error: null });
            const response = await api.post(API_ENDPOINTS.TASKS.BASE, taskData);
            const newTask = response.data.task || response.data;

            set((state) => ({
                tasks: [newTask, ...state.tasks],
            }));

            return newTask;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to create task";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    updateTask: async (taskId: string, updates: UpdateTaskData) => {
        try {
            set({ error: null });
            const response = await api.put(API_ENDPOINTS.TASKS.BY_ID(taskId), updates);
            const updatedTask = response.data.task || response.data;

            set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === taskId ? { ...task, ...updatedTask } : task
                ),
            }));

            return updatedTask;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to update task";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    deleteTask: async (taskId: string) => {
        try {
            set({ error: null });
            await api.delete(API_ENDPOINTS.TASKS.BY_ID(taskId));

            set((state) => ({
                tasks: state.tasks.filter((task) => task.id !== taskId),
            }));
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to delete task";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    assignTask: async (taskId: string, assigneeId: string) => {
        try {
            await get().updateTask(taskId, { assigneeId });
        } catch (error) {
            throw error;
        }
    },

    updateTaskStatus: async (taskId: string, status: string) => {
        try {
            await get().updateTask(taskId, { status: status as TaskStatus });
        } catch (error) {
            throw error;
        }
    },

    updateTaskPriority: async (taskId: string, priority: string) => {
        try {
            await get().updateTask(taskId, { priority: priority as Priority });
        } catch (error) {
            throw error;
        }
    },

    addTaskComment: async (taskId: string, content: string) => {
        try {
            set({ error: null });
            await api.post(API_ENDPOINTS.TASKS.COMMENTS(taskId), { content });

            // Refresh the task to get updated comments
            await get().fetchTasks();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to add comment";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    logTime: async (taskId: string, timeLog: { hours: number; description?: string }) => {
        try {
            set({ error: null });
            await api.post(API_ENDPOINTS.TASKS.TIME_LOGS(taskId), timeLog);

            // Refresh the task to get updated time logs
            await get().fetchTasks();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to log time";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    getTaskAnalytics: async (taskId: string) => {
        try {
            const response = await api.get(`${API_ENDPOINTS.TASKS.BY_ID(taskId)}/analytics`);
            return response.data;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to get task analytics";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },
}));