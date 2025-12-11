import { create } from 'zustand';
import { api } from '../services/api';

export interface Participant {
    id: string;
    name: string;
    logicalName?: string;
}

export interface MessageParameter {
    id: string;
    name: string;
    type: string;
}

export interface Message {
    id: string;
    fromId: string;
    toId: string;
    content: string;
    logicalName?: string;
    type: 'solid' | 'dotted'; // solid는 동기 호출, dotted는 응답/비동기 호출
    parameters?: MessageParameter[];
    returnValueType?: 'void' | 'string' | 'number' | 'boolean' | 'object' | 'any';
}

interface DiagramState {
    participants: Participant[];
    messages: Message[];
    isLoading: boolean;

    loadParticipants: () => Promise<void>;
    addParticipant: (name: string) => Promise<void>;
    updateParticipant: (id: string, name: string, logicalName?: string) => void;
    removeParticipant: (id: string) => void;
    moveParticipant: (id: string, direction: 'up' | 'down') => void;

    addMessage: (fromId: string, toId: string, content: string) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    removeMessage: (id: string) => void;

    addParameter: (messageId: string, name: string, type: string) => void;
    updateParameter: (messageId: string, parameterId: string, updates: Partial<MessageParameter>) => void;
    removeParameter: (messageId: string, parameterId: string) => void;
    moveParameter: (messageId: string, parameterId: string, direction: 'up' | 'down') => void;

    setDiagram: (participants: Participant[], messages: Message[]) => void;
    resetDiagram: () => void;
}

export const useDiagramStore = create<DiagramState>((set) => ({
    participants: [
        { id: 'p1', name: 'User', logicalName: '사용자' },
        { id: 'p2', name: 'System', logicalName: '시스템' },
    ],
    messages: [
        { id: 'm1', fromId: 'p1', toId: 'p2', content: 'Login', logicalName: '로그인', type: 'solid', parameters: [], returnValueType: 'void' },
    ],
    isLoading: false,

    loadParticipants: async () => {
        set({ isLoading: true });
        // 예제 연동: 백엔드에서 가져오기.
        // 실제 시나리오에서는 로컬 상태와 병합하거나 대체할 수 있음.
        // 안전한 리팩토링을 위해 에러를 로그에 남기지만 백엔드가 다운되어도 중단하지 않음.
        try {
            const data = await api.getParticipants();
            if (data && data.length > 0) {
                // Map API data to Store Participant format if needed
                const mapped = data.map(p => ({
                    id: p.id,
                    name: p.name,
                    logicalName: p.logicalName
                }));
                set({ participants: mapped });
            }
        } catch (e) {
            console.error("Failed to load participants", e);
        } finally {
            set({ isLoading: false });
        }
    },

    addParticipant: async (name) => {
        // Optimistic update
        const tempId = crypto.randomUUID();
        const newParticipant = { id: tempId, name };
        set((state) => ({
            participants: [...state.participants, newParticipant],
        }));

        try {
            const created = await api.createParticipant(name);
            if (created) {
                // Update with real ID from backend
                set((state) => ({
                    participants: state.participants.map(p =>
                        p.id === tempId ? { ...p, id: created.id, logicalName: created.logicalName } : p
                    )
                }));
            }
        } catch (e) {
            console.error("Failed to sync participant to backend", e);
        }
    },

    updateParticipant: (id, name, logicalName) => set((state) => ({
        participants: state.participants.map((p) =>
            p.id === id ? { ...p, name, logicalName } : p
        ),
    })),

    removeParticipant: (id) => set((state) => ({
        participants: state.participants.filter((p) => p.id !== id),
        // 이 참가자가 포함된 메시지도 제거
        messages: state.messages.filter((m) => m.fromId !== id && m.toId !== id),
    })),

    moveParticipant: (id, direction) => set((state) => {
        const index = state.participants.findIndex(p => p.id === id);
        if (index === -1) return {};

        const newParticipants = [...state.participants];
        if (direction === 'up' && index > 0) {
            [newParticipants[index], newParticipants[index - 1]] = [newParticipants[index - 1], newParticipants[index]];
        } else if (direction === 'down' && index < newParticipants.length - 1) {
            [newParticipants[index], newParticipants[index + 1]] = [newParticipants[index + 1], newParticipants[index]];
        }

        return { participants: newParticipants };
    }),

    addMessage: (fromId, toId, content) => set((state) => ({
        messages: [...state.messages, {
            id: crypto.randomUUID(),
            fromId,
            toId,
            content,
            type: 'solid',
            parameters: [],
            returnValueType: 'void',
        }],
    })),

    updateMessage: (id, updates) => set((state) => ({
        messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
        ),
    })),

    removeMessage: (id) => set((state) => ({
        messages: state.messages.filter((m) => m.id !== id),
    })),

    addParameter: (messageId, name, type) => set((state) => ({
        messages: state.messages.map((m) =>
            m.id === messageId
                ? { ...m, parameters: [...(m.parameters || []), { id: crypto.randomUUID(), name, type }] }
                : m
        ),
    })),

    updateParameter: (messageId, parameterId, updates) => set((state) => ({
        messages: state.messages.map((m) =>
            m.id === messageId
                ? {
                    ...m,
                    parameters: (m.parameters || []).map((p) =>
                        p.id === parameterId ? { ...p, ...updates } : p
                    )
                }
                : m
        ),
    })),

    removeParameter: (messageId, parameterId) => set((state) => ({
        messages: state.messages.map((m) =>
            m.id === messageId
                ? { ...m, parameters: (m.parameters || []).filter((p) => p.id !== parameterId) }
                : m
        ),
    })),

    moveParameter: (messageId, parameterId, direction) => set((state) => {
        const messageIndex = state.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return {};

        const message = state.messages[messageIndex];
        const parameters = message.parameters || [];
        const index = parameters.findIndex(p => p.id === parameterId);
        if (index === -1) return {};

        const newParameters = [...parameters];
        if (direction === 'up' && index > 0) {
            [newParameters[index], newParameters[index - 1]] = [newParameters[index - 1], newParameters[index]];
        } else if (direction === 'down' && index < newParameters.length - 1) {
            [newParameters[index], newParameters[index + 1]] = [newParameters[index + 1], newParameters[index]];
        }

        const newMessages = [...state.messages];
        newMessages[messageIndex] = { ...message, parameters: newParameters };

        return { messages: newMessages };
    }),

    setDiagram: (participants, messages) => set({ participants, messages }),

    resetDiagram: () => set({ participants: [], messages: [] }),
}));
