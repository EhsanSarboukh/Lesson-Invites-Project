// app/student/[id]/page.tsx
import React from 'react';
import StudentClient from './student-client';

type ParamsShape = { id: string };

export default async function StudentPage({ params }: { params: ParamsShape | Promise<ParamsShape> }) {
  // Await params because Next may provide it as a Promise
  const { id: studentId } = await params;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pending Invites (Student #{studentId})</h2>
      <StudentClient studentId={studentId} />
    </div>
  );
}
