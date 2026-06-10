import { api } from './api';
import type { User } from '../types';

interface CreateOrganizerPayload { name: string; email: string; password: string; }

class AdminService {
  listOrganizers(): Promise<User[]> { return api.get<User[]>('/admin/organizers'); }
  createOrganizer(payload: CreateOrganizerPayload): Promise<User> { return api.post<User>('/admin/organizers', payload); }
  toggleOrganizerStatus(id: string): Promise<User> { return api.patch<User>(`/admin/organizers/${id}/status`); }
  listAllUsers(): Promise<User[]> { return api.get<User[]>('/admin/users'); }
}

export const adminService = new AdminService();
