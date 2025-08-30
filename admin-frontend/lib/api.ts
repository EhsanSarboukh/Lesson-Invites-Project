// lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type Teacher = { id: number; name: string; email: string };
export type Student = { id: number; name: string; email: string };
export type Invite = {
  id: number;
  teacherId?: number;
  studentId?: number;
  teacher?: Teacher | null;
  student?: Student | null;
  status: 'pending' | 'accepted' | 'rejected' | string;
  scheduledAt?: string;
  scheduled_at?: string;
  createdAt?: string;
  created_at?: string;
};

async function handleRes<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const message = json?.message ?? text ?? res.statusText;
    const err = new Error(String(message));
    // @ts-ignore
    err.status = res.status;
    throw err;
  }
  return json as T;
}

export async function fetchInvites(status?: string): Promise<Invite[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const url = `${API_BASE}/invites${params.toString() ? `?${params.toString()}` : ''}`;
  const res = await fetch(url);
  return handleRes<Invite[]>(res);
}

export async function fetchStudentInvites(studentId: number | string): Promise<Invite[]> {
  const url = `${API_BASE}/invites/student/${studentId}?status=pending`;
  const res = await fetch(url);
  return handleRes<Invite[]>(res);
}

export async function createInvite(payload: {
  teacherId: number;
  studentId: number;
  scheduledAt: string;
}): Promise<Invite> {
  const res = await fetch(`${API_BASE}/invites/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleRes<Invite>(res);
}

export async function respondInvite(inviteId: number | string, status: 'accepted' | 'rejected'): Promise<Invite> {
  const res = await fetch(`${API_BASE}/invites/respond/${inviteId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return handleRes<Invite>(res);
}

export async function fetchTeachers(): Promise<Teacher[]> {
  const res = await fetch(`${API_BASE}/teachers`);
  return handleRes<Teacher[]>(res);
}

export async function fetchStudents(): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/students`);
  return handleRes<Student[]>(res);
}
