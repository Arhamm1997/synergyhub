import { create } from "zustand";
import type { Business } from "@/lib/types";
import { api, API_ENDPOINTS } from "@/lib/api-config";

interface CreateBusinessData {
    name: string;
    description?: string;
    type?: string;
    phone?: string;
    email?: string;
    address?: string;
}

interface UpdateBusinessData {
    name?: string;
    description?: string;
    type?: string;
    phone?: string;
    email?: string;
    address?: string;
    status?: string;
    notes?: string;
}

interface BusinessesState {
    businesses: Business[];
    currentBusiness: Business | null;
    isLoading: boolean;
    error: string | null;
    // Core CRUD operations
    fetchBusinesses: () => Promise<void>;
    createBusiness: (businessData: CreateBusinessData) => Promise<Business>;
    updateBusiness: (businessId: string, updates: UpdateBusinessData) => Promise<Business>;
    deleteBusiness: (businessId: string) => Promise<void>;
    getBusinessById: (businessId: string) => Business | undefined;
    setCurrentBusiness: (business: Business | null) => void;
    // Advanced operations
    getBusinessAnalytics: (businessId: string) => Promise<any>;
    inviteMember: (businessId: string, data: { email: string; role: string; message?: string }) => Promise<void>;
    getBusinessMembers: (businessId: string) => Promise<any>;
    // Utility functions
    clearError: () => void;
}

export const useBusinessesStore = create<BusinessesState>((set, get) => ({
    businesses: [],
    currentBusiness: null,
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    getBusinessById: (businessId: string) => {
        return get().businesses.find(business => business.id === businessId);
    },

    setCurrentBusiness: (business: Business | null) => {
        set({ currentBusiness: business });
    },

    fetchBusinesses: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get(API_ENDPOINTS.BUSINESSES.BASE);
            set({
                businesses: response.data.businesses || response.data,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error?.response?.data?.message || "Failed to fetch businesses",
                isLoading: false
            });
        }
    },

    createBusiness: async (businessData: CreateBusinessData) => {
        try {
            set({ error: null });
            const response = await api.post(API_ENDPOINTS.BUSINESSES.BASE, businessData);
            const newBusiness = response.data.business || response.data;

            set((state) => ({
                businesses: [newBusiness, ...state.businesses],
            }));

            return newBusiness;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to create business";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    updateBusiness: async (businessId: string, updates: UpdateBusinessData) => {
        try {
            set({ error: null });
            const response = await api.put(API_ENDPOINTS.BUSINESSES.BY_ID(businessId), updates);
            const updatedBusiness = response.data.business || response.data;

            set((state) => ({
                businesses: state.businesses.map((business) =>
                    business.id === businessId ? { ...business, ...updatedBusiness } : business
                ),
                currentBusiness: state.currentBusiness?.id === businessId
                    ? { ...state.currentBusiness, ...updatedBusiness }
                    : state.currentBusiness
            }));

            return updatedBusiness;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to update business";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    deleteBusiness: async (businessId: string) => {
        try {
            set({ error: null });
            await api.delete(API_ENDPOINTS.BUSINESSES.BY_ID(businessId));

            set((state) => ({
                businesses: state.businesses.filter((business) => business.id !== businessId),
                currentBusiness: state.currentBusiness?.id === businessId ? null : state.currentBusiness
            }));
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to delete business";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    getBusinessAnalytics: async (businessId: string) => {
        try {
            const response = await api.get(API_ENDPOINTS.BUSINESSES.ANALYTICS(businessId));
            return response.data;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to get business analytics";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    inviteMember: async (businessId: string, data: { email: string; role: string; message?: string }) => {
        try {
            set({ error: null });
            await api.post(API_ENDPOINTS.BUSINESSES.INVITE(businessId), data);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to invite member";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },

    getBusinessMembers: async (businessId: string) => {
        try {
            const response = await api.get(API_ENDPOINTS.BUSINESSES.MEMBERS(businessId));
            return response.data;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || "Failed to get business members";
            set({ error: errorMessage });
            throw new Error(errorMessage);
        }
    },
}));