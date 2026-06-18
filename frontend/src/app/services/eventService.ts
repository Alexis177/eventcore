import { api } from './api';
import type { Event, Registration, CreateEventPayload, EventStatus, Comment } from '../types';

class EventService {
  getPublishedEvents(page: number = 1, limit: number = 9): Promise<{ data: Event[]; total: number; currentPage: number; totalPages: number }> {
    return api.get(`/events?page=${page}&limit=${limit}`, false);
  }
  getEventById(id: string): Promise<Event> { return api.get<Event>(`/events/${id}`, false); }
  getMyEvents(): Promise<Event[]> { return api.get<Event[]>('/events/organizer/my-events'); }
  getAllEvents(): Promise<Event[]> { return api.get<Event[]>('/events/admin/all'); }
  getEventRegistrations(eventId: string): Promise<Registration[]> {
    return api.get<Registration[]>(`/events/${eventId}/registrations`);
  }
  createEvent(payload: CreateEventPayload): Promise<Event> { return api.post<Event>('/events', payload); }
  updateEvent(id: string, payload: Partial<CreateEventPayload>): Promise<Event> { return api.put<Event>(`/events/${id}`, payload); }
  changeStatus(id: string, status: EventStatus): Promise<Event> { return api.patch<Event>(`/events/${id}/status`, { status }); }
  cancelEvent(id: string): Promise<Event> { return api.patch<Event>(`/events/${id}/status`, { status: 'cancelled' }); }
  registerToEvent(eventId: string): Promise<{ registration: Registration }> { return api.post(`/events/${eventId}/register`, {}); }

  // --- RESUMEN Y COMENTARIOS ---
  updateSummary(id: string, summary: string): Promise<Event> {
    return api.put<Event>(`/events/${id}/summary`, { summary });
  }
  addComment(id: string, content: string): Promise<Comment> {
    return api.post<Comment>(`/events/${id}/comments`, { content });
  }
  getComments(id: string): Promise<Comment[]> {
    return api.get<Comment[]>(`/events/${id}/comments`);
  }
  getEventStats(id: string): Promise<any> {
    return api.get<any>(`/events/${id}/stats`);
  }
  downloadEventReportCSV(id: string): Promise<Blob> {
    return api.downloadBlob(`/events/${id}/report/csv`);
  }
  downloadGlobalReportCSV(): Promise<Blob> {
    return api.downloadBlob('/events/report/global/csv');
  }
  downloadAnalyticsReportCSV(): Promise<Blob> {
    return api.downloadBlob('/events/report/analytics/csv');
  }
}

export const eventService = new EventService();
