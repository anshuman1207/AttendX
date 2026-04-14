export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type AttendanceStatus = 'Attended' | 'Missed' | 'Cancelled' | 'Pending';

export interface TimetableClass {
  id?: string;
  subject: string;
  timeSlot: string; // e.g., "9:00 AM - 10:00 AM"
  day: DayOfWeek;
}

export interface AttendanceEntry {
  id?: string;
  subject: string;
  date: string; // YYYY-MM-DD
  day: DayOfWeek;
  timeSlot: string;
  status: AttendanceStatus;
  timestamp: number;
  notes?: string;
}

export interface SubjectAnalytics {
  subject: string;
  attended: number;
  missed: number;
  cancelled: number;
  conducted: number;
  attendancePercentage: number;
}
