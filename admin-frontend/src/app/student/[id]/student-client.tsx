// app/student/[id]/student-client.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { fetchStudentInvites, respondInvite, Invite } from '../../../../lib/api';

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

export default function StudentClient({ studentId }: { studentId: string }) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchStudentInvites(studentId);
      setInvites(data);
    } catch (e: any) {
      alert(e?.message || 'Failed to load invites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const handleRespond = async (id: number, status: 'accepted' | 'rejected') => {
    if (!confirm(`${status} invite #${id}?`)) return;
    setActionLoading(id);
    try {
      await respondInvite(id, status);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const fmtDate = (d?: string) => (d ? new Date(d).toLocaleString() : '-');

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 font-sans">
      <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 drop-shadow-lg mb-8">
        Your Invites 📬
      </h1>
      {loading ? (
        <p className="text-center py-12 text-gray-400 animate-pulse">Loading invites...</p>
      ) : invites.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl mb-2">🎉</p>
          <p>No new invites found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {invites.map((inv) => (
            <div
              key={inv.id}
              className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-4 sm:mb-0">
                  <div className="font-bold text-gray-100 text-lg mb-1">
                    {inv.teacher?.name ?? `Teacher #${inv.teacherId}`}
                  </div>
                  <div className="text-sm text-gray-400">
                    Scheduled: {fmtDate(inv.scheduled_at ?? inv.scheduledAt)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(inv.status)}`}
                  >
                    {inv.status}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={actionLoading === inv.id}
                      onClick={() => handleRespond(inv.id, 'accepted')}
                      className="bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:bg-emerald-500 transition-colors duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === inv.id ? '...' : 'Accept'}
                    </button>
                    <button
                      disabled={actionLoading === inv.id}
                      onClick={() => handleRespond(inv.id, 'rejected')}
                      className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:bg-red-500 transition-colors duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === inv.id ? '...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}