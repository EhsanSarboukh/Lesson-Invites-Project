// app/layout.tsx
import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Lesson Invites',
  description: 'Admin & Student UI for Lesson Invites'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="bg-white shadow">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
              <h1 className="text-lg font-semibold">Lesson Invites</h1>
              <nav className="ml-4 flex gap-3">
                <a href="/admin" className="text-sm text-slate-700 hover:underline">Admin</a>
                <a href="/student/1" className="text-sm text-slate-700 hover:underline">Student (demo)</a>
              </nav>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>

          <footer className="mt-12 text-center text-sm text-gray-500 pb-8">
            Backend: {process.env.NEXT_PUBLIC_API_URL} — make sure Nest is running & CORS enabled.
          </footer>
        </div>
      </body>
    </html>
  );
}
