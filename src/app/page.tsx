"use client";

import { useState, useEffect } from "react";
import { getTimetable, getAttendanceByDate, markAttendance, updateAttendance, getAllAttendance } from "@/lib/db";
import { TimetableClass, AttendanceEntry, DayOfWeek, AttendanceStatus } from "@/lib/types";

export default function Home() {
  const [classesToday, setClassesToday] = useState<(TimetableClass & { attendanceRecord?: AttendanceEntry, projectedMissPercentage?: number, currentPercentage?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date();
  const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  
  const daysOfWeek: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = daysOfWeek[today.getDay()];

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const timetable = await getTimetable();
      const attendanceToday = await getAttendanceByDate(dateStr);
      const allAttendance = await getAllAttendance();
      
      const todaysClasses = timetable.filter(c => c.day === currentDay);
      
      const reconciled = todaysClasses.map(cls => {
        const record = attendanceToday.find(a => a.subject === cls.subject && a.timeSlot === cls.timeSlot);
        
        // Calculate Immediate Decision Feedback
        const subjectLogs = allAttendance.filter(a => a.subject === cls.subject);
        let attended = 0;
        let conducted = 0;
        
        subjectLogs.forEach(entry => {
          if (entry.status === 'Attended') { attended++; conducted++; }
          else if (entry.status === 'Missed') { conducted++; }
        });
        
        const currentPercentage = conducted === 0 ? 100 : Number(((attended / conducted) * 100).toFixed(1));
        const projectedMissPercentage = (conducted + 1) === 0 ? 100 : Number(((attended / (conducted + 1)) * 100).toFixed(1));
        
        return {
          ...cls,
          attendanceRecord: record,
          currentPercentage,
          projectedMissPercentage
        };
      });
      
      setClassesToday(reconciled);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleMarkStatus(cls: TimetableClass, status: AttendanceStatus) {
    try {
      const entry: Omit<AttendanceEntry, 'id'> = {
        subject: cls.subject,
        date: dateStr,
        day: currentDay,
        timeSlot: cls.timeSlot,
        status: status,
        timestamp: Date.now()
      };
      await markAttendance(entry);
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateStatus(id: string, status: AttendanceStatus) {
    try {
      await updateAttendance(id, { status });
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  }

  const getStatusColor = (status: AttendanceStatus) => {
    switch(status) {
      case 'Attended': return 'var(--tertiary)';
      case 'Missed': return 'var(--error)';
      case 'Cancelled': return 'var(--secondary)';
      default: return 'var(--on-surface)';
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Daily Dashboard</h1>
          <p className="text-secondary">{dateStr} • {currentDay}</p>
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Today's Classes</h2>
          {loading ? (
            <p className="text-secondary">Loading your classes...</p>
          ) : classesToday.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p className="text-secondary" style={{ fontSize: '1.1rem' }}>No classes scheduled for today.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {classesToday.map(cls => (
                <div key={cls.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface)' }}>{cls.subject}</h3>
                    <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{cls.timeSlot}</div>
                  </div>
                  
                  <div>
                    {!cls.attendanceRecord ? (
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn" 
                            style={{ backgroundColor: 'var(--tertiary-container)', color: 'var(--on-tertiary-container)' }}
                            onClick={() => handleMarkStatus(cls, 'Attended')}
                          >
                            🟢 Attended
                          </button>
                          <button 
                            className="btn" 
                            style={{ backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)' }}
                            onClick={() => handleMarkStatus(cls, 'Missed')}
                          >
                            🔴 Missed
                          </button>
                          <button 
                            className="btn" 
                            style={{ backgroundColor: 'var(--surface-variant)', color: 'var(--on-surface-variant)' }}
                            onClick={() => handleMarkStatus(cls, 'Cancelled')}
                          >
                            ⚪ Cancelled
                          </button>
                        </div>
                        {cls.currentPercentage !== undefined && cls.projectedMissPercentage !== undefined && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginTop: '0.5rem', textAlign: 'right' }}>
                            {cls.projectedMissPercentage < 75 ? (
                              <span style={{ color: 'var(--error)' }}>
                                If you miss this class, attendance will drop to {cls.projectedMissPercentage}% ⚠️
                              </span>
                            ) : (
                              <span>
                                If you miss this class, attendance drops to {cls.projectedMissPercentage}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: getStatusColor(cls.attendanceRecord.status) }}>
                          {cls.attendanceRecord.status === 'Attended' && '🟢'}
                          {cls.attendanceRecord.status === 'Missed' && '🔴'}
                          {cls.attendanceRecord.status === 'Cancelled' && '⚪'}
                          {cls.attendanceRecord.status}
                        </div>
                        <select 
                          className="form-control" 
                          style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: '0.875rem' }}
                          value={cls.attendanceRecord.status}
                          onChange={(e) => handleUpdateStatus(cls.attendanceRecord!.id!, e.target.value as AttendanceStatus)}
                        >
                          <option value="Attended">Change to Attended</option>
                          <option value="Missed">Change to Missed</option>
                          <option value="Cancelled">Change to Cancelled</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
