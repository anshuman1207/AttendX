"use client";

import { useState, useEffect } from "react";
import { getSubjects, addSubject, removeSubject } from "@/lib/db";
import { Subject } from "@/lib/types";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newColor, setNewColor] = useState("#a78bfa");

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    setLoading(true);
    const data = await getSubjects();
    setSubjects(data);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim()) return;

    try {
      const today = new Date();
      const dateStr = today.getMonth() + 1 + '/' + today.getDate() + '/' + today.getFullYear();
      
      const subj: Omit<Subject, "id"> = { 
        name: newSubject.trim(), 
        color: newColor, 
        createdAt: dateStr 
      };
      
      await addSubject(subj);
      setNewSubject("");
      setNewColor("#a78bfa");
      setShowAdd(false);
      loadSubjects();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    try {
      await removeSubject(id);
      loadSubjects();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Subjects</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          + Add Subject
        </button>
      </header>

      {showAdd && (
        <section className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create New Subject</h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 2, minWidth: '200px' }}>
              <label className="form-label" htmlFor="name">Subject Code / Name</label>
              <input 
                id="name" 
                type="text" 
                className="form-control" 
                placeholder="e.g., CSE 2201" 
                value={newSubject} 
                onChange={(e) => setNewSubject(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '100px' }}>
              <label className="form-label" htmlFor="color">Color Label</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  id="color" 
                  type="color" 
                  style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                  value={newColor} 
                  onChange={(e) => setNewColor(e.target.value)} 
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>{newColor}</span>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', height: '40px' }}>Save</button>
            <button type="button" className="btn btn-outline" style={{ padding: '0.5rem 1.5rem', height: '40px' }} onClick={() => setShowAdd(false)}>Cancel</button>
          </form>
        </section>
      )}

      <main>
        {loading ? (
          <p className="text-secondary">Loading subjects...</p>
        ) : subjects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p className="text-secondary" style={{ marginBottom: '1rem' }}>No subjects defined yet.</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Create your first subject</button>
          </div>
        ) : (
          <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--on-surface-variant)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Subject</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--on-surface-variant)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Color</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--on-surface-variant)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Created</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--on-surface-variant)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, idx) => (
                  <tr key={s.id} style={{ borderBottom: idx === subjects.length - 1 ? 'none' : '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--on-surface)' }}>{s.name}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: s.color }}></div>
                        <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{s.color}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>{s.createdAt}</td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => handleDelete(s.id)} 
                        className="btn btn-danger" 
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', border: 'none' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
