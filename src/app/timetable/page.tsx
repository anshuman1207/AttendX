"use client";

import { useState, useEffect } from "react";
import { getTimetable, addTimetableClass, removeTimetableClass } from "@/lib/db";
import { TimetableClass, DayOfWeek } from "@/lib/types";

export default function TimetablePage() {
  const [schedule, setSchedule] = useState<TimetableClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("Monday");

  const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    loadTimetable();
  }, []);

  async function loadTimetable() {
    setLoading(true);
    const data = await getTimetable();
    setSchedule(data);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!subject || !timeSlot) return;

    try {
      const newClass: Omit<TimetableClass, "id"> = { subject, timeSlot, day: selectedDay };
      await addTimetableClass(newClass);
      setSubject("");
      setTimeSlot("");
      loadTimetable();
    } catch (err) {
      console.error("Error adding class", err);
    }
  }

  async function handleRemove(id?: string) {
    if (!id) return;
    try {
      await removeTimetableClass(id);
      loadTimetable();
    } catch (err) {
      console.error("Error removing class", err);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Timetable Setup</h1>
        <p className="text-secondary">Define your weekly schedule across the days.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Add Class Form */}
        <section className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add a Class</h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="day">Day</label>
              <select 
                id="day" 
                className="form-control" 
                value={selectedDay} 
                onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
              >
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="subject">Subject</label>
              <input 
                id="subject" 
                type="text" 
                className="form-control" 
                placeholder="e.g., Mathematics" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="timeslot">Time Slot</label>
              <input 
                id="timeslot" 
                type="text" 
                className="form-control" 
                placeholder="e.g., 9:00 AM - 10:00 AM" 
                value={timeSlot} 
                onChange={(e) => setTimeSlot(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Add to Timetable</button>
          </form>
        </section>

        {/* Timetable View */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Weekly Schedule</h2>
          {loading ? (
            <p className="text-secondary">Loading schedule...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {DAYS.map(day => {
                const dayClasses = schedule.filter(c => c.day === day);
                return (
                  <div key={day} className="card" style={{ padding: '1rem 1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--outline-variant)', paddingBottom: '0.5rem' }}>{day}</h3>
                    {dayClasses.length === 0 ? (
                      <p className="text-secondary" style={{ fontSize: '0.875rem' }}>No classes scheduled.</p>
                    ) : (
                      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {dayClasses.map(cls => (
                          <li key={cls.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                            <div>
                              <div style={{ fontWeight: 500, color: 'var(--on-surface)' }}>{cls.subject}</div>
                              <div className="text-secondary" style={{ fontSize: '0.875rem' }}>{cls.timeSlot}</div>
                            </div>
                            <button onClick={() => handleRemove(cls.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Remove</button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
