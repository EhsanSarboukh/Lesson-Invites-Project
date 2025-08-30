// app/student/[id]/student-client.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { fetchStudentInvites, respondInvite, Invite } from '../../../../lib/api';

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

  return (
    <div>
      {loading ? <p>Loading...</p> : invites.length === 0 ? <p>No pending invites</p> : (
        <div className="grid gap-4">
          {invites.map(inv => (
            <div key={inv.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{inv.teacher?.name ?? `Teacher #${inv.teacherId}`}</div>
                  <div className="text-sm text-gray-600">
                    Scheduled: {inv.scheduledAt ? new Date(inv.scheduledAt).toLocaleString() : inv.scheduled_at ? new Date(inv.scheduled_at).toLocaleString() : '-'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button disabled={actionLoading===inv.id} onClick={() => handleRespond(inv.id, 'accepted')} className="bg-green-600 text-white px-3 py-1 rounded">
                    Accept
                  </button>
                  <button disabled={actionLoading===inv.id} onClick={() => handleRespond(inv.id, 'rejected')} className="bg-red-600 text-white px-3 py-1 rounded">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
