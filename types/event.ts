import type { User } from "./user";

export type Event = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  location: string | null;
  isVirtual: boolean;
  maxAttendees: number | null;
  registrationDeadline: Date | null;
  status: string | null;
  userId: string;
  user: User;
  sessions: EventSession[];
  registrations: EventRegistration[];
  createdAt: Date;
  updatedAt: Date;
};

export type EventSession = {
  id: string;
  title: string;
  description: string | null;
  startTime: Date | null;
  endTime: Date | null;
  location: string | null;
  maxAttendees: number | null;
  eventId: string;
  event: Event;
  registrations: EventRegistration[];
  createdAt: Date;
  updatedAt: Date;
};

export type EventRegistration = {
  id: string;
  bookingDate: Date;
  eventId: string;
  event: Event;
  sessionId: string | null;
  session: EventSession | null;
  userId: string;
  user: User;
};
