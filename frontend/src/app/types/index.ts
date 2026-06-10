// Interfaces que reflejan exactamente los modelos del backend

export type UserRole = 'admin' | 'organizer' | 'attendee' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdById: string | null;
  preferences?: { categories?: string[] };
  availability?: { weekdays?: boolean; weekends?: boolean; mornings?: boolean; afternoons?: boolean };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'finished';

export interface Event {
  id: string;
  title: string;
  category?: string;
  description: string | null;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: EventStatus;
  organizerId: string;
  organizer?: Pick<User, 'id' | 'name' | 'email'>;
  registeredCount?: number;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string };
}

export interface QRCode {
  id: string;
  registrationId: string;
  token: string;
  qrImageUrl: string | null;
  isUsed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'absent';

export interface Registration {
  id: string;
  attendeeId: string;
  eventId: string;
  status: RegistrationStatus;
  event?: Event;
  attendee?: Pick<User, 'id' | 'name' | 'email'>;
  qrCode?: QRCode;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  qrCodeId: string;
  scannedById: string;
  eventId: string;
  scannedAt: string;
  scannedBy?: Pick<User, 'id' | 'name'>;
  qrCode?: {
    registration: {
      attendee: Pick<User, 'id' | 'name' | 'email'>;
    };
  };
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  category?: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
}
