"use client";
import type { ReactNode } from 'react';

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-4">
      <div className="text-lg font-semibold mb-4">Admin</div>
      <nav>
        <ul className="space-y-2">
          <li><a className="block px-2 py-1 rounded hover:bg-gray-800" href="#">Dashboard</a></li>
          <li><a className="block px-2 py-1 rounded hover:bg-gray-800" href="#">Users</a></li>
          <li><a className="block px-2 py-1 rounded hover:bg-gray-800" href="#">Settings</a></li>
        </ul>
      </nav>
    </aside>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#1a1a1a] overflow-hidden">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
