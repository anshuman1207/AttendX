"use client";

import { useState, useEffect } from "react";
import { getTimetable, addTimetableClass, removeTimetableClass, getSubjects } from "@/lib/db";
import { TimetableClass, DayOfWeek, Subject } from "@/lib/types";

export default function TimetablePage() {
  const [schedule, setSchedule] = useState<TimetableClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("Monday");

  const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const timetableData = await getTimetable();
      const subjectsData = await getSubjects();
      setSchedule(timetableData);
      setSubjects(subjectsData);
      if (subjectsData.length > 0) setSelectedSubjectId(subjectsData[0].id!);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSubjectId || !timeSlot) return;

    const subj = subjects.find(s => s.id === selectedSubjectId);
    if (!subj) return;

    try {
      const newClass: Omit<TimetableClass, "id"> = { 
        subjectId: subj.id!,
        subjectName: subj.name,
        subjectColor: subj.color,
        timeSlot, 
        day: selectedDay 
      };
      await addTimetableClass(newClass);
      setTimeSlot("");
      setShowAdd(false);
      loadData();
    } catch (err) {
      console.error("Error adding class", err);
    }
  }

  async function handleRemove(id?: string) {
    if (!id) return;
    try {
      await removeTimetableClass(id);
      loadData();
    } catch (err) {
      console.error("Error removing class", err);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '1400px' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Timetable Setup</h1>
          <p className="text-secondary">Define your weekly schedule — classes auto-generate each day</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          + Add Class
        </button>
      </header>

      {showAdd && (
        <section className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Schedule a Class</h2>
          {subjects.length === 0 ? (
            <p className="text-error">You need to add Subjects first before scheduling classes. Go to the Subjects tab.</p>
          ) : (
            <form onSubmit={handleAdd} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
                <label className="form-label" htmlFor="day">Day</label>
                <select id="day" className="form-control" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div className="form-group" style={{ marginBottom: 0, flex: 2, minWidth: '200px' }}>
                <label className="form-label" htmlFor="subject">Subject</label>
                <select id="subject" className="form-control" value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <div className="form-group" style={{ marginBottom: 0, flex: 2, minWidth: '200px' }}>
                <label className="form-label" htmlFor="timeslot">Time Slot</label>
                <input 
                  id="timeslot" type="text" className="form-control" 
                  placeholder="e.g., 9:00 AM - 10:00 AM" 
                  value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required 
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', height: '40px' }}>Save</button>
              <button type="button" className="btn btn-outline" style={{ padding: '0.5rem 1.5rem', height: '40px' }} onClick={() => setShowAdd(false)}>Cancel</button>
            </form>
          )}
        </section>
      )}

      <main>
        {loading ? (
          <p className="text-secondary">Loading schedule...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
            {DAYS.map(day => {
              const dayClasses = schedule.filter(c => c.day === day).sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)); // Simple string sort for display
              return (
                <div key={day} style={{ minWidth: '250px' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{day}</h3>
                  </div>
                  <div style={{ backgroundColor: 'var(--surface-container)', border: '1px solid var(--outline-variant)', borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: '1rem', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {dayClasses.map(cls => (
                      <div key={cls.id} className="card" style={{ padding: '1rem', backgroundColor: 'var(--surface)', borderColor: 'var(--outline-variant)', borderRadius: 'var(--radius-md)', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cls.subjectColor || 'var(--primary)' }}></div>
                          <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{cls.subjectName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                          <span style={{ fontSize: '1rem' }}>⏰</span>
                          <span>{cls.timeSlot}</span>
                        </div>
                        <button 
                          onClick={() => handleRemove(cls.id)} 
                          style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.25rem' }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
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
