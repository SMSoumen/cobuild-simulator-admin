"use client";
import type { ReactNode } from 'react';
import Sidebar from './components/Sidebar';
import './globals.css';
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#1a1a1a] overflow-hidden">
        <div className="flex h-screen">
          <Sidebar />
          {/* OPTION A: no padding */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          {/* OPTION B: small padding if you want a tiny gap */}
          {/* <main className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4">
            {children}
          </main> */}
        </div>
      </body>
    </html>
  );
}
