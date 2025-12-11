import { create } from 'zustand';
import { api, ApiPackage, ApiClass, ApiDAO } from '../services/api';

interface ComponentState {
    packages: ApiPackage[];
    classes: ApiClass[];
    daos: ApiDAO[];
    isLoading: boolean;

    loadAll: () => Promise<void>;

    addPackage: (name: string, description?: string, parentId?: string) => Promise<void>;
    addClass: (name: string, stereotype?: string, description?: string, packageId?: string) => Promise<void>;
    addDAO: (name: string, description?: string) => Promise<void>;
}

export const useComponentStore = create<ComponentState>((set) => ({
    packages: [],
    classes: [],
    daos: [],
    isLoading: false,

    loadAll: async () => {
        set({ isLoading: true });
        try {
            const [packages, classes, daos] = await Promise.all([
                api.getPackages(),
                api.getClasses(),
                api.getDAOs()
            ]);
            set({ packages, classes, daos });
        } catch (e) {
            console.error("Failed to load components", e);
        } finally {
            set({ isLoading: false });
        }
    },

    addPackage: async (name, description, parentId) => {
        try {
            const newPackage = await api.createPackage(name, description, parentId);
            if (newPackage) {
                set((state) => ({ packages: [...state.packages, newPackage] }));
            }
        } catch (e) {
            console.error("Failed to create package", e);
        }
    },

    addClass: async (name, stereotype, description, packageId) => {
        try {
            const newClass = await api.createClass(name, stereotype, description, packageId);
            if (newClass) {
                set((state) => ({ classes: [...state.classes, newClass] }));
            }
        } catch (e) {
            console.error("Failed to create class", e);
        }
    },

    addDAO: async (name, description) => {
        try {
            const newDAO = await api.createDAO(name, description);
            if (newDAO) {
                set((state) => ({ daos: [...state.daos, newDAO] }));
            }
        } catch (e) {
            console.error("Failed to create DAO", e);
        }
    }
}));
