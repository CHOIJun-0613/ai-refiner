const API_BASE_URL = 'http://localhost:8000/api';

export interface ApiParticipant {
    id: string;
    name: string;
    logicalName?: string;
    methods?: any[];
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
    }
};
