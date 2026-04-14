"use client";

import { useState, useEffect } from "react";
import { getAllAttendance } from "@/lib/db";
import { AttendanceEntry } from "@/lib/types";

interface SubjectStats {
  subject: string;
  attended: number;
  missed: number;
  cancelled: number;
  conducted: number;
  percentage: number;
  canBunk: number;
  mustAttend: number;
}

import AttendanceChart from "@/components/AttendanceChart";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<SubjectStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  // ... (keeping loadAnalytics logic unchanged inside the component) ...

  async function loadAnalytics() {
    setLoading(true);
    try {
      const allEntries = await getAllAttendance();
      
      const subjectMap: Record<string, SubjectStats> = {};
      
      allEntries.forEach(entry => {
        if (!subjectMap[entry.subject]) {
          subjectMap[entry.subject] = {
            subject: entry.subject,
            attended: 0,
            missed: 0,
            cancelled: 0,
            conducted: 0,
            percentage: 100,
            canBunk: 0,
            mustAttend: 0
          };
        }
        
        switch (entry.status) {
          case 'Attended':
            subjectMap[entry.subject].attended++;
            break;
          case 'Missed':
            subjectMap[entry.subject].missed++;
            break;
          case 'Cancelled':
            subjectMap[entry.subject].cancelled++;
            break;
        }
      });
      
      const computedStats = Object.values(subjectMap).map(s => {
        s.conducted = s.attended + s.missed;
        s.percentage = s.conducted === 0 ? 100 : Number(((s.attended / s.conducted) * 100).toFixed(1));
        
        const bunkRaw = (s.attended / 0.75) - s.conducted;
        s.canBunk = bunkRaw > 0 ? Math.floor(bunkRaw) : 0;
        
        const recoveryRaw = (0.75 * s.conducted - s.attended) / 0.25;
        s.mustAttend = recoveryRaw > 0 ? Math.ceil(recoveryRaw) : 0;
        
        return s;
      });
      
      setStats(computedStats);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'var(--tertiary)'; 
    if (percentage >= 75) return '#facc15'; 
    return 'var(--error)'; 
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Analytics</h1>
        <p className="text-secondary">Track your attendance across all subjects.</p>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {loading ? (
          <p className="text-secondary">Loading your analytics...</p>
        ) : stats.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p className="text-secondary">No attendance data available yet to analyze.</p>
          </div>
        ) : (
          <>
            <section className="card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--on-surface-variant)' }}>Attendance Trends</h2>
              <AttendanceChart stats={stats} />
            </section>
            
            <section className="card" style={{ overflowX: 'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
                  <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Subject</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Attended</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Missed</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Conducted</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>%</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Can Bunk</th>
                  <th style={{ padding: '1rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Must Attend</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s, idx) => (
                  <tr key={s.subject} style={{ borderBottom: idx === stats.length - 1 ? 'none' : '1px solid var(--outline-variant)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{s.subject}</td>
                    <td style={{ padding: '1rem', color: 'var(--tertiary)' }}>{s.attended}</td>
                    <td style={{ padding: '1rem', color: 'var(--error)' }}>{s.missed}</td>
                    <td style={{ padding: '1rem' }}>{s.conducted}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: getStatusColor(s.percentage) }}>{s.percentage}%</td>
                    <td style={{ padding: '1rem' }}>
                      {s.canBunk > 0 ? (
                        <span style={{ backgroundColor: 'var(--tertiary-container)', color: 'var(--on-tertiary-container)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500 }}>
                          {s.canBunk} classes
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {s.mustAttend > 0 ? (
                        <span style={{ backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 500 }}>
                          {s.mustAttend} classes
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
