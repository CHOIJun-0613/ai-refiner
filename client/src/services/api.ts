const API_BASE_URL = 'http://localhost:8000/api';

export interface ApiParticipant {
    id: string;
    name: string;
    logicalName?: string;
    methods?: any[];
}

export interface ApiPackage {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
}

export interface ApiClass {
    id: string;
    name: string;
    stereotype?: string;
    description?: string;
    packageId?: string;
}

export interface ApiDAO {
    id: string;
    name: string;
    description?: string;
}

export const api = {
    getParticipants: async (): Promise<ApiParticipant[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/participants`);
            if (!response.ok) throw new Error('Failed to fetch participants');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    createParticipant: async (name: string, logicalName?: string): Promise<ApiParticipant | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/participants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, logicalName })
            });
            if (!response.ok) throw new Error('Failed to create participant');
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    getPackages: async (): Promise<ApiPackage[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/packages`);
            if (!response.ok) throw new Error('Failed to fetch packages');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    createPackage: async (name: string, description?: string, parentId?: string): Promise<ApiPackage | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/packages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, parentId })
            });
            if (!response.ok) throw new Error('Failed to create package');
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    getClasses: async (): Promise<ApiClass[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/classes`);
            if (!response.ok) throw new Error('Failed to fetch classes');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    createClass: async (name: string, stereotype?: string, description?: string, packageId?: string): Promise<ApiClass | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/classes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, stereotype, description, packageId })
            });
            if (!response.ok) throw new Error('Failed to create class');
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    getDAOs: async (): Promise<ApiDAO[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/daos`);
            if (!response.ok) throw new Error('Failed to fetch DAOs');
            return await response.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    createDAO: async (name: string, description?: string): Promise<ApiDAO | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/daos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });
            if (!response.ok) throw new Error('Failed to create DAO');
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }
};
