// src/types.ts

export interface TimeSlot {
  id: string;
  dateTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  id?: string;
  clientName: string;
  clientEmail: string;
  slotId: string;
  notes?: string;
}
