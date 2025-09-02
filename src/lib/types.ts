
import { z } from 'zod';

export type WorkerRole = 'Carer' | 'Cook' | 'Cleaner' | 'Executive' | 'Volunteer';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type Shift = 'Morning' | 'Afternoon' | 'Evening' | 'Off Day';
export type AttendanceStatus = 'pending' | 'approved' | 'rejected';

export const daysOfWeek: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const shiftOptions: Shift[] = ['Morning', 'Afternoon', 'Evening', 'Off Day'];


export type Schedule = Record<DayOfWeek, Shift>;

export interface Worker {
  id: string;
  name: string;
  role: WorkerRole;
  schedule: Schedule;
  pin: string; // 4-digit PIN
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  name: string;
  role: WorkerRole;
  shift: Shift;
  notes: string;
  timestamp: Date;
  status: AttendanceStatus;
}

// AI Flow Types
export const SummarizeNotesInputSchema = z.object({
  notes: z.array(z.string()).describe('A list of notes submitted by staff members for a single day.'),
});
export type SummarizeNotesInput = z.infer<typeof SummarizeNotesInputSchema>;

export const SummarizeNotesOutputSchema = z.object({
  summary: z.string().describe('A concise summary of all the provided notes, highlighting key events, issues, and staff sentiment.'),
});
export type SummarizeNotesOutput = z.infer<typeof SummarizeNotesOutputSchema>;
