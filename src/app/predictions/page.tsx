"use client";

import { useState, useEffect } from "react";
import { getAllAttendance, getTimetable } from "@/lib/db";
import { AttendanceEntry, TimetableClass } from "@/lib/types";

interface SubjectStats {
  subject: string;
  attended: number;
  conducted: number;
  percentage: number;
}

export default function PredictionsPage() {
  const [stats, setStats] = useState<SubjectStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulation State
  const [simSubject, setSimSubject] = useState("");
  const [simAction, setSimAction] = useState<"miss" | "attend">("miss");
  const [simCount, setSimCount] = useState<number>(1);
  const [simulationResult, setSimulationResult] = useState<SubjectStats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const allEntries = await getAllAttendance();
      
      const subjectMap: Record<string, SubjectStats> = {};
      
      allEntries.forEach(entry => {
        if (!subjectMap[entry.subject]) {
          subjectMap[entry.subject] = { subject: entry.subject, attended: 0, conducted: 0, percentage: 100 };
        }
        
        if (entry.status === 'Attended') {
          subjectMap[entry.subject].attended++;
          subjectMap[entry.subject].conducted++;
        } else if (entry.status === 'Missed') {
          subjectMap[entry.subject].conducted++;
        }
      });

      const computedStats = Object.values(subjectMap).map(s => {
        s.percentage = s.conducted === 0 ? 100 : Number(((s.attended / s.conducted) * 100).toFixed(1));
        return s;
      });

      setStats(computedStats);
      if (computedStats.length > 0) setSimSubject(computedStats[0].subject);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const runSimulation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simSubject) return;

    const currentStats = stats.find(s => s.subject === simSubject);
    if (!currentStats) return;

    let newAttended = currentStats.attended;
    let newConducted = currentStats.conducted;

    if (simAction === "attend") {
      newAttended += simCount;
      newConducted += simCount;
    } else {
      newConducted += simCount;
    }

    const newPercentage = newConducted === 0 ? 100 : Number(((newAttended / newConducted) * 100).toFixed(1));
    
    setSimulationResult({
      subject: simSubject,
      attended: newAttended,
      conducted: newConducted,
      percentage: newPercentage
    });
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return 'var(--tertiary)'; // Safe 
    if (percentage >= 75) return '#facc15'; // Risk (Warning Yellow)
    return 'var(--error)'; // Danger
  };

  const getMessageForPercentage = (percentage: number) => {
    if (percentage >= 80) return "✅ Safe Zone! You are performing well.";
    if (percentage >= 75) return "⚠️ Risk Zone. Careful about missing classes.";
    return "🔴 Danger Zone. You must attend the next few classes!";
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>AI Prediction Engine</h1>
        <p className="text-secondary">Simulate your future and get smart suggestions.</p>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {loading ? (
          <p className="text-secondary">Crunching numbers...</p>
        ) : stats.length === 0 ? (
           <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
           <p className="text-secondary">No attendance data to predict on yet.</p>
         </div>
        ) : (
          <>
            {/* Future Simulation Panel */}
            <section className="card">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Future Simulation</h2>
              <form onSubmit={runSimulation} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
                  <label className="form-label" htmlFor="simSubject">Subject</label>
                  <select id="simSubject" className="form-control" value={simSubject} onChange={(e) => setSimSubject(e.target.value)}>
                    {stats.map(s => <option key={s.subject} value={s.subject}>{s.subject}</option>)}
                  </select>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
                  <label className="form-label" htmlFor="simAction">Action</label>
                  <select id="simAction" className="form-control" value={simAction} onChange={(e) => setSimAction(e.target.value as "miss" | "attend")}>
                    <option value="miss">If I Miss</option>
                    <option value="attend">If I Attend</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '150px' }}>
                  <label className="form-label" htmlFor="simCount">Next (Classes)</label>
                  <input id="simCount" type="number" min="1" className="form-control" value={simCount} onChange={(e) => setSimCount(Number(e.target.value))} />
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Simulate</button>
              </form>

              {simulationResult && (
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', border: `1px solid ${getStatusColor(simulationResult.percentage)}` }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Simulation Result for {simulationResult.subject}</h3>
                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                    <div>
                      <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Projected Attendance</span>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: getStatusColor(simulationResult.percentage) }}>{simulationResult.percentage}%</div>
                    </div>
                  </div>
                  <p style={{ fontWeight: 500, color: getStatusColor(simulationResult.percentage) }}>
                    {getMessageForPercentage(simulationResult.percentage)}
                  </p>
                </div>
              )}
            </section>
            
            {/* Smart Suggestions */}
            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Smart Suggestions</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {stats.map(s => {
                  const bunkRaw = (s.attended / 0.75) - s.conducted;
                  const canBunk = bunkRaw > 0 ? Math.floor(bunkRaw) : 0;
                  
                  const recoveryRaw = (0.75 * s.conducted - s.attended) / 0.25;
                  const mustAttend = recoveryRaw > 0 ? Math.ceil(recoveryRaw) : 0;

                  return (
                    <div key={s.subject} className="card" style={{ borderLeft: `4px solid ${getStatusColor(s.percentage)}` }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{s.subject} ({s.percentage}%)</h3>
                      {s.percentage >= 80 ? (
                        <p style={{ fontSize: '0.875rem' }}>"You can safely skip the next <strong>{canBunk}</strong> classes." ✅</p>
                      ) : s.percentage >= 75 ? (
                        <p style={{ fontSize: '0.875rem' }}>"Avoid skipping! You are just brushing the 75% limit." ⚠️</p>
                      ) : (
                        <p style={{ fontSize: '0.875rem' }}>"You are in the danger zone. You must attend the next <strong>{mustAttend}</strong> classes consecutively." 🔴</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
