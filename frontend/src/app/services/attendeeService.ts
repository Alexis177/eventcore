import { api } from './api';
import type { Registration } from '../types';

class AttendeeService {
  getMyRegistrations(): Promise<Registration[]> {
    return api.get<Registration[]>('/attendee/my-registrations');
  }

  getMyQR(registrationId: string): Promise<Registration> {
    return api.get<Registration>(`/attendee/my-registrations/${registrationId}/qr`);
  }

  cancelRegistration(registrationId: string): Promise<Registration> {
    return api.patch<Registration>(`/attendee/my-registrations/${registrationId}/cancel`);
  }
}

export const attendeeService = new AttendeeService();
