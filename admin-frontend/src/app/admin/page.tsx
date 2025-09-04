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
  Student,
} from '../../../lib/api';

function isoLocalFromDatetimeLocal(value: string) {
  const d = new Date(value);
  return d.toISOString();
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'bg-emerald-600 text-white';
    case 'rejected':
      return 'bg-red-600 text-white';
    case 'pending':
    default:
      return 'bg-amber-500 text-white';
  }
};

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
        scheduledAt: isoLocalFromDatetimeLocal(form.scheduledAt),
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
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-lg tracking-wide">
            Admin Dashboard 🌌
          </h1>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Create Invite Form */}
          <div className="lg:col-span-1 p-8 rounded-3xl shadow-2xl bg-slate-800 border border-slate-700 transform transition-transform duration-500 hover:scale-105">
            <h2 className="text-2xl font-bold text-gray-100 mb-6 border-b-2 border-cyan-400 pb-2">Create New Invite ✨</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label htmlFor="teacher" className="block text-sm font-medium text-gray-300 mb-2">
                  Teacher
                </label>
                <select
                  id="teacher"
                  required
                  value={form.teacherId || ''}
                  onChange={(e) => setForm((p) => ({ ...p, teacherId: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border-slate-600 rounded-xl shadow-inner text-white p-3 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">Select a teacher</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id} className="bg-slate-900">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="student" className="block text-sm font-medium text-gray-300 mb-2">
                  Student
                </label>
                <select
                  id="student"
                  required
                  value={form.studentId || ''}
                  onChange={(e) => setForm((p) => ({ ...p, studentId: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border-slate-600 rounded-xl shadow-inner text-white p-3 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">Select a student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-300 mb-2">
                  Scheduled at
                </label>
                <input
                  id="scheduledAt"
                  required
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                  className="w-full bg-slate-700 border-slate-600 rounded-xl shadow-inner text-white p-3 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform active:scale-95"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ teacherId: 0, studentId: 0, scheduledAt: '' })}
                  className="flex-1 border-2 border-gray-600 text-gray-300 font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors duration-300 transform active:scale-95"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Invite List and Filters */}
          <div className="lg:col-span-2 p-8 rounded-3xl shadow-2xl bg-slate-800 border border-slate-700 transform transition-transform duration-500 hover:scale-105">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-100 border-b-2 border-purple-400 pb-2">Lesson Invites 🚀</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <select
                  className="bg-slate-700 border-slate-600 text-gray-200 rounded-xl shadow-sm p-3 w-full sm:w-auto focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="" className="bg-slate-900">All</option>
                  <option value="pending" className="bg-slate-900">Pending</option>
                  <option value="accepted" className="bg-slate-900">Accepted</option>
                  <option value="rejected" className="bg-slate-900">Rejected</option>
                </select>
                <button
                  onClick={() => load(status)}
                  className="bg-slate-700 text-gray-300 font-bold px-4 py-3 rounded-xl hover:bg-slate-600 transition duration-300 transform active:scale-95 w-full sm:w-auto"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-400 mb-6">
              Showing: <span className="font-bold capitalize text-cyan-300">{status || 'all'}</span> invites
            </div>

            {loading ? (
              <p className="text-center py-12 text-gray-400 animate-pulse">Loading invites...</p>
            ) : error ? (
              <p className="text-center py-12 text-red-400">{error}</p>
            ) : invites.length === 0 ? (
              <p className="text-center py-12 text-gray-400">No invites found.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow-inner border border-slate-700">
                <table className="min-w-full text-sm divide-y divide-slate-700">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-300 uppercase tracking-wider">ID</th>
                      <th className="p-4 text-left font-semibold text-gray-300 uppercase tracking-wider">Teacher</th>
                      <th className="p-4 text-left font-semibold text-gray-300 uppercase tracking-wider">Student</th>
                      <th className="p-4 text-left font-semibold text-gray-300 uppercase tracking-wider">Scheduled</th>
                      <th className="p-4 text-left font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-left font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800 divide-y divide-slate-700">
                    {invites.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-700 transition-colors duration-200">
                        <td className="p-4 text-gray-200">{inv.id}</td>
                        <td className="p-4 text-gray-200">{inv.teacher?.name ?? `#${inv.teacherId}`}</td>
                        <td className="p-4 text-gray-200">{inv.student?.name ?? `#${inv.studentId}`}</td>
                        <td className="p-4 text-gray-400">{fmtDate(inv.scheduled_at ?? inv.scheduledAt)}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(inv.status)}`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              disabled={actionLoading === inv.id || inv.status === 'accepted'}
                              onClick={() => handleRespond(inv.id, 'accepted')}
                              className={`px-3 py-1 rounded-lg text-white text-sm font-semibold transition-all duration-300 transform active:scale-95 ${
                                inv.status === 'accepted'
                                  ? 'bg-emerald-600 opacity-60 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg'
                              }`}
                            >
                              {actionLoading === inv.id ? '...' : 'Accept'}
                            </button>
                            <button
                              disabled={actionLoading === inv.id || inv.status === 'rejected'}
                              onClick={() => handleRespond(inv.id, 'rejected')}
                              className={`px-3 py-1 rounded-lg text-white text-sm font-semibold transition-all duration-300 transform active:scale-95 ${
                                inv.status === 'rejected'
                                  ? 'bg-red-600 opacity-60 cursor-not-allowed'
                                  : 'bg-red-600 hover:bg-red-500 shadow-lg'
                              }`}
                            >
                              {actionLoading === inv.id ? '...' : 'Reject'}
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
    </div>
  );
}