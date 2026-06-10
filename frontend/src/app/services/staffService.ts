import { api } from './api';
import type { CheckIn, User } from '../types';

interface ScanResult {
  checkIn: CheckIn;
  attendee: { id: string; name: string; email: string };
  eventId: string;
}

interface CreateStaffPayload { name: string; email: string; password: string; }

class StaffService {
  scanQR(token: string, eventId: string): Promise<ScanResult> {
    return api.post<ScanResult>('/staff/scan', { token, eventId });
  }

  getEventCheckIns(eventId: string): Promise<CheckIn[]> {
    return api.get<CheckIn[]>(`/staff/events/${eventId}/checkins`);
  }

  listStaff(): Promise<User[]> {
    return api.get<User[]>('/organizer/staff');
  }

  createStaff(payload: CreateStaffPayload): Promise<User> {
    return api.post<User>('/organizer/staff', payload);
  }

  toggleStaffStatus(id: string): Promise<User> {
    return api.patch<User>(`/organizer/staff/${id}/status`);
  }
}

export const staffService = new StaffService();
