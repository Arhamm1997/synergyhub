import { create } from "zustand";
import type { Client } from "@/lib/types";
import { api, API_ENDPOINTS } from "@/lib/api-config";

interface CreateClientData {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    businessId?: string;
    projectTitle?: string;
    status?: string;
    budget?: number;
    notes?: string;
}

interface UpdateClientData {
    name?: string;
    email?: string;
    company?: string;
    phone?: string;
    projectTitle?: string;
    status?: string;
    budget?: number;
    notes?: string;
    progress?: number;
}

interface ClientsState {
    clients: Client[];
    isLoading: boolean;
    error: string | null;
    // Core CRUD operations
    fetchClients: (businessId?: string) => Promise<void>;
    createClient: (clientData: CreateClientData) => Promise<Client>;
    updateClient: (clientId: string, updates: UpdateClientData) => Promise<Client>;
    deleteClient: (clientId: string) => Promise<void>;
    getClientById: (clientId: string) => Client | undefined;
    // Utility functions
    clearError: () => void;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
    clients: [],
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    getClientById: (clientId: string) => {
        return get().clients.find(client => client.id === clientId);
    },

    fetchClients: async (businessId?: string) => {
        try {
            set({ isLoading: true, error: null });

            let endpoint = API_ENDPOINTS.CLIENTS.BASE;
            if (businessId) {
                endpoint += `?businessId=${businessId}`;
            }

            const response = await api.get(endpoint);
            set({
                clients: response.data.clients || response.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error?.response?.data?.message || "Failed to fetch clients",
                isLoading: false
            });
        }
    },

    createClient: async (clientData: CreateClientData) => {
        try {
            set({ error: null });
            const response = await api.post(API_ENDPOINTS.CLIENTS.BASE, clientData);
            const newClient = response.data.client || response.data;

            set((state) => ({
                clients: [newClient, ...state.clients],
            }));

            return newClient;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to create client";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    updateClient: async (clientId: string, updates: UpdateClientData) => {
        try {
            set({ error: null });
            const response = await api.put(API_ENDPOINTS.CLIENTS.BY_ID(clientId), updates);
            const updatedClient = response.data.client || response.data;

            set((state) => ({
                clients: state.clients.map((client) =>
                    client.id === clientId ? { ...client, ...updatedClient } : client
                ),
            }));

            return updatedClient;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to update client";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    deleteClient: async (clientId: string) => {
        try {
            set({ error: null });
            await api.delete(API_ENDPOINTS.CLIENTS.BY_ID(clientId));

            set((state) => ({
                clients: state.clients.filter((client) => client.id !== clientId),
            }));
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to delete client";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },
}));