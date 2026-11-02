import { apiClient } from '../../services/apiClient';
import { catalogMock, membersSeed } from '../../mocks/hrData';
import type { HrCatalog, HrMember, HrMemberInput } from '../../types/hr';

// Flip VITE_USE_MOCK=false to use the real API. Delete the mock branches + src/mocks afterwards.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// In-memory store so members created/edited in the UI show up in the directory during a session.
let store: HrMember[] = [...membersSeed];

export const hrService = {
  getCatalog: (): Promise<HrCatalog> => (USE_MOCK ? Promise.resolve(catalogMock) : apiClient.get<HrCatalog>('/hr/catalog')),

  listMembers: (): Promise<HrMember[]> => (USE_MOCK ? Promise.resolve([...store]) : apiClient.get<HrMember[]>('/hr/members')),

  getMember: async (id: string): Promise<HrMember | undefined> => {
    if (USE_MOCK) return store.find((m) => m.id === id);
    return apiClient.get<HrMember>(`/hr/members/${id}`);
  },

  createMember: async (payload: HrMemberInput): Promise<HrMember> => {
    if (!USE_MOCK) return apiClient.post<HrMember>('/hr/members', payload);
    const member: HrMember = { id: `hr-${Date.now()}`, ...payload };
    store = [member, ...store];
    return member;
  },

  updateMember: async (id: string, payload: HrMemberInput): Promise<HrMember> => {
    if (!USE_MOCK) return apiClient.put<HrMember>(`/hr/members/${id}`, payload);
    const member: HrMember = { id, ...payload };
    store = store.map((m) => (m.id === id ? member : m));
    return member;
  },
};
