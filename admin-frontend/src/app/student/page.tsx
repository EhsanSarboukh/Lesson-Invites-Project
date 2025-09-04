// app/student/page.tsx
import React from 'react';
import { fetchStudents, Student } from '../../../lib/api';
import Link from 'next/link';

export default async function StudentsPage() {
  let students: Student[] = [];
  let error: string | null = null;
  try {
    students = await fetchStudents();
  } catch (e: any) {
    error = e?.message || 'Failed to load students';
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 font-sans">
      <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 drop-shadow-lg mb-8">
        Select a Student 🎓
      </h1>
      {error ? (
        <p className="text-center py-12 text-red-400">{error}</p>
      ) : students.length === 0 ? (
        <p className="text-center py-12 text-gray-400">No students found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {students.map((student) => (
            <Link key={student.id} href={`/student/${student.id}`} passHref>
              <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 cursor-pointer transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <h2 className="text-xl font-semibold text-gray-100">{student.name}</h2>
                <p className="text-sm text-gray-400 mt-1">Student ID: {student.id}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}