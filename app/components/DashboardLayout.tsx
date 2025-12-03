import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-[#EF6B23]/20 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">Welcome to Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-gray-600 hover:text-[#EF6B23] transition-colors">
                Notifications
              </button>
              <div className="w-10 h-10 bg-[#EF6B23] rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
