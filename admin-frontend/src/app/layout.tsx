// app/layout.tsx
import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Lesson Invites',
  description: 'Admin & Student UI for Lesson Invites',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white font-sans">
        <div className="min-h-screen">
          <header className="bg-slate-900 shadow-lg border-b border-slate-700">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <a href="/">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 hover:opacity-85 transition-opacity duration-300">
                  Lesson Invites 🚀
                </h1>
              </a>
              <nav className="flex gap-3">
                <a
                  href="/admin"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-gray-300 border border-slate-700 hover:bg-slate-700 transition-colors duration-300 transform active:scale-95"
                >
                  Teachers
                </a>
                <a
                  href="/student"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-gray-300 border border-slate-700 hover:bg-slate-700 transition-colors duration-300 transform active:scale-95"
                >
                  Students
                </a>
              </nav>
            </div>
          </header>

          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>

          <footer className="mt-12 text-center text-sm text-gray-500 pb-8 border-t border-slate-800 pt-4">
            <p className="text-gray-400">
              Backend: {process.env.NEXT_PUBLIC_API_URL} — ensure Nest is running & CORS enabled.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}