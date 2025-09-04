// app/student/[id]/page.tsx
import StudentClient from './student-client';

export default async function StudentPage({ params }: { params: { id: string } }) {
  const studentId = params.id;
  return (
    <div>
      <StudentClient studentId={studentId} />
    </div>
  );
}