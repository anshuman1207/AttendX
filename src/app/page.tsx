"use client";

import { useState, useEffect } from "react";
import { getTimetable, getAllAttendance, markAttendance, updateAttendance, getSubjects } from "@/lib/db";
import { TimetableClass, AttendanceEntry, DayOfWeek, AttendanceStatus, Subject } from "@/lib/types";

// Helper function to get dates for Monday to Friday of the current week
function getWeekDates(today: Date) {
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);
  
  const weekDays: { date: Date, dateString: string, dayName: DayOfWeek }[] = [];
  const days: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    
    // Format YYYY-MM-DD
    const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    weekDays.push({ date: d, dateString: dateStr, dayName: days[i] });
  }
  
  return weekDays;
}

export default function WeeklyDashboard() {
  const [timetable, setTimetable] = useState<TimetableClass[]>([]);
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  const today = new Date();
  const weekDays = getWeekDates(today);
  const weekStartStr = weekDays[0].date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const weekEndStr = weekDays[4].date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const tb = await getTimetable();
      const att = await getAllAttendance();
      const subjs = await getSubjects();
      setTimetable(tb);
      setAttendance(att);
      setSubjects(subjs);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleMarkStatus(cls: TimetableClass, dateStr: string, status: AttendanceStatus) {
    try {
      const entry: Omit<AttendanceEntry, 'id'> = {
        subject: cls.subjectName,
        date: dateStr,
        day: cls.day,
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

  // Calculate top weekly metrics
  let attendedThisWeek = 0;
  let missedThisWeek = 0;
  
  // Filter attendance to ONLY this week's records
  const weekDateStrings = weekDays.map(w => w.dateString);
  const weeklyAttendance = attendance.filter(a => weekDateStrings.includes(a.date));
  
  weeklyAttendance.forEach(a => {
    if (a.status === 'Attended') attendedThisWeek++;
    if (a.status === 'Missed') missedThisWeek++;
  });
  
  const totalConducted = attendedThisWeek + missedThisWeek;
  const weekPercentage = totalConducted === 0 ? 100 : Number(((attendedThisWeek / totalConducted) * 100).toFixed(1));

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '1400px' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Weekly View</h1>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Mon, {weekStartStr} — Fri, {weekEndStr}</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--tertiary)' }}>
          <div style={{ fontSize: '2rem' }}>✅</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{attendedThisWeek}</div>
          <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Attended This Week</div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--error)' }}>
          <div style={{ fontSize: '2rem', color: 'var(--error)' }}>✖️</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{missedThisWeek}</div>
          <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Missed This Week</div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '2rem' }}>📊</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{weekPercentage}%</div>
          <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Week Attendance</div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '2rem' }}>📚</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{subjects.length}</div>
          <div className="text-secondary" style={{ fontSize: '0.875rem' }}>Subjects</div>
        </div>
      </div>

      <main>
        {loading ? (
          <p className="text-secondary">Loading your schedule...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {weekDays.map(dayObj => {
              const dayClasses = timetable.filter(c => c.day === dayObj.dayName).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
              
              const dateDisplay = dayObj.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
              
              return (
                <div key={dayObj.dayName} style={{ minWidth: '250px' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{dayObj.dayName}</h3>
                    <p className="text-secondary" style={{ fontSize: '0.875rem' }}>{dateDisplay}</p>
                  </div>
                  
                  <div style={{ backgroundColor: 'var(--surface-container)', border: '1px solid var(--outline-variant)', borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: '1rem', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {dayClasses.map(cls => {
                      // Find if an attendance record exists for this date and class
                      const record = attendance.find(a => a.date === dayObj.dateString && a.subject === cls.subjectName && a.timeSlot === cls.timeSlot);
                      
                      return (
                        <div key={cls.id} className="card" style={{ padding: '1rem', backgroundColor: 'var(--surface)', borderColor: 'var(--outline-variant)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cls.subjectColor || 'var(--primary)' }}></div>
                            <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{cls.subjectName}</span>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1rem' }}>⏰</span>
                            <span>{cls.timeSlot}</span>
                          </div>
                          
                          {/* Inline marking controls */}
                          {!record ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleMarkStatus(cls, dayObj.dateString, 'Attended')}
                                style={{ padding: '0.5rem', backgroundColor: 'var(--tertiary-container)', color: 'var(--on-tertiary-container)', border: 'none', borderRadius: '100px', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                              >
                                🟢 <span style={{fontWeight: 500}}>Attended</span>
                              </button>
                              <button 
                                onClick={() => handleMarkStatus(cls, dayObj.dateString, 'Missed')}
                                style={{ padding: '0.5rem', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', border: 'none', borderRadius: '100px', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                              >
                                🔴 <span style={{fontWeight: 500}}>Missed</span>
                              </button>
                              <button 
                                onClick={() => handleMarkStatus(cls, dayObj.dateString, 'Cancelled')}
                                style={{ padding: '0.5rem', backgroundColor: 'var(--surface-variant)', color: 'var(--on-surface-variant)', border: 'none', borderRadius: '100px', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                              >
                                ⚪ <span style={{fontWeight: 500}}>Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-variant)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: record.status === 'Attended' ? 'var(--tertiary)' : record.status === 'Missed' ? 'var(--error)' : 'var(--on-surface-variant)' }}>
                                {record.status === 'Attended' ? '🟢 Attended' : record.status === 'Missed' ? '🔴 Missed' : '⚪ Cancelled'}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
