// app/admin/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  fetchInvites,
  createInvite,
  respondInvite,
  fetchTeachers,
  fetchStudents,
  Invite,
  Teacher,
  Student
} from '../../../lib/api';

function isoLocalFromDatetimeLocal(value: string) {
  // datetime-local returns local-time string; convert to ISO so backend understands UTC ISO string
  const d = new Date(value);
  return d.toISOString();
}

export default function AdminPage() {
  const [status, setStatus] = useState<string>('');
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({ teacherId: 0, studentId: 0, scheduledAt: '' });
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async (s = status) => {
    setLoading(true);
    try {
      const data = await fetchInvites(s || undefined);
      setInvites(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load invites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    fetchTeachers().then(setTeachers).catch(() => setTeachers([]));
    fetchStudents().then(setStudents).catch(() => setStudents([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.teacherId || !form.studentId || !form.scheduledAt) {
        alert('Please select teacher, student and scheduled time');
        return;
      }
      await createInvite({
        teacherId: form.teacherId,
        studentId: form.studentId,
        scheduledAt: isoLocalFromDatetimeLocal(form.scheduledAt)
      });
      setForm({ teacherId: 0, studentId: 0, scheduledAt: '' });
      await load();
      alert('Invite created');
    } catch (err: any) {
      alert(err?.message || 'Create failed');
    }
  };

  const handleRespond = async (id: number, statusAction: 'accepted' | 'rejected') => {
    if (!confirm(`${statusAction} invite #${id}?`)) return;
    setActionLoading(id);
    try {
      await respondInvite(id, statusAction);
      await load();
    } catch (err: any) {
      alert(err?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const fmtDate = (d?: string) => (d ? new Date(d).toLocaleString() : '-');

  return (
    <div>
      <div className="mb-6 grid md:grid-cols-2 gap-4">
        <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Create Invite</h2>

          <label className="block mb-2 text-sm">Teacher</label>
          <select
            required
            value={form.teacherId || ''}
            onChange={(e) => setForm((p) => ({ ...p, teacherId: Number(e.target.value) }))}
            className="w-full border rounded p-2 mb-3"
          >
            <option value="">Select a teacher</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <label className="block mb-2 text-sm">Student</label>
          <select
            required
            value={form.studentId || ''}
            onChange={(e) => setForm((p) => ({ ...p, studentId: Number(e.target.value) }))}
            className="w-full border rounded p-2 mb-3"
          >
            <option value="">Select a student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <label className="block mb-2 text-sm">Scheduled at</label>
          <input
            required
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
            className="w-full border rounded p-2 mb-3"
          />

          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
            <button type="button" onClick={() => setForm({ teacherId: 0, studentId: 0, scheduledAt: '' })} className="px-4 py-2 border rounded">Reset</button>
          </div>
        </form>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-3">Filter Invites</h2>
          <div className="flex gap-2 items-center">
            <select className="border rounded p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <button onClick={() => load()} className="bg-blue-600 text-white px-3 py-1 rounded">Refresh</button>
            <div className="ml-auto text-sm text-gray-600">Showing: <strong>{status || 'all'}</strong></div>
          </div>

          {loading ? <p className="mt-3">Loading...</p> : error ? <p className="mt-3 text-red-600">{error}</p> : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Teacher</th>
                    <th className="p-2 text-left">Student</th>
                    <th className="p-2 text-left">Scheduled</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.length === 0 ? (
                    <tr><td colSpan={6} className="p-4 text-center text-gray-500">No invites</td></tr>
                  ) : invites.map(inv => (
                    <tr key={inv.id} className="border-t">
                      <td className="p-2">{inv.id}</td>
                      <td className="p-2">{inv.teacher?.name ?? `#${inv.teacherId}`}</td>
                      <td className="p-2">{inv.student?.name ?? `#${inv.studentId}`}</td>
                      <td className="p-2">{fmtDate(inv.scheduled_at ?? inv.scheduledAt)}</td>
                      <td className="p-2 capitalize">{inv.status}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <button disabled={actionLoading===inv.id || inv.status==='accepted'} onClick={() => handleRespond(inv.id, 'accepted')} className={`px-2 py-1 rounded text-white text-sm ${inv.status==='accepted' ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                            {actionLoading===inv.id ? '...' : 'Accept'}
                          </button>
                          <button disabled={actionLoading===inv.id || inv.status==='rejected'} onClick={() => handleRespond(inv.id, 'rejected')} className={`px-2 py-1 rounded text-white text-sm ${inv.status==='rejected' ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
                            {actionLoading===inv.id ? '...' : 'Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
