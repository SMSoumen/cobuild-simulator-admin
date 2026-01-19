"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText, 
  BarChart3,
  FolderTree, 
  UserSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, SVGProps } from 'react';

type MenuItem = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
  badge?: number;
};


export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Users', href: '/users', badge: 3 },
    { icon: FolderTree, label: 'Projects', href: '/projects' },
    { icon: UserSquare, label: 'Referral', href: '/referral' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];


  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Call admin logout API
      const response = await apiFetch(`${API_BASE_URL}/admin/auth/logout`, {
        method: 'POST',
        body: JSON.stringify({
          logoutFromAllDevices: true // Set to false if you want to logout from current device only
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Logout successful:', data.message);
      }
    } catch (error) {
      console.error('❌ Logout API error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Clear all tokens from localStorage
      localStorage.removeItem('adminaccesstoken');
      localStorage.removeItem('adminrefreshtoken');
      localStorage.removeItem('user');
      
      // Redirect to login page
      router.push('/');
      setIsLoggingOut(false);
    }
  };


  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-[#1f1f1f] via-[#1a1a1a] to-[#151515] border-r border-white/10 transition-all duration-300 ease-in-out flex flex-col h-screen sticky top-0 shadow-2xl shadow-black/50 relative overflow-hidden`}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#EF6B23]/10 to-transparent blur-2xl"></div>


      {/* Header */}
      <div className="p-5 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#EF6B23]/20 to-transparent rounded-full blur-3xl"></div>
        
        <div className={`flex items-center gap-3 relative z-10 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && (
            <div className="w-9 h-9 bg-gradient-to-br from-[#2a2a2a] to-[#232323] rounded-lg flex items-center justify-center text-[#EF6B23] border border-white/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              <Sparkles className="w-4 h-4 relative z-10" />
            </div>
          )}
          <div>
            <h2 className={`font-semibold text-white text-sm transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
              Admin Panel
            </h2>
            <p className={`text-[10px] text-gray-500 ${isCollapsed ? 'hidden' : 'block'}`}>
              Manage workspace.
            </p>
          </div>
        </div>
        
        {isCollapsed && (
          <div className="w-9 h-9 bg-gradient-to-br from-[#2a2a2a] to-[#232323] rounded-lg mx-auto flex items-center justify-center text-[#EF6B23] border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <Sparkles className="w-4 h-4 relative z-10" />
          </div>
        )}
      </div>


      {/* Menu Items - removed scrollbar */}
      <nav className="flex-1 p-3 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          nav::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <ul className="space-y-1.5">
          {menuItems.map((item: MenuItem) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#2a2a2a] to-[#252525] text-white border border-white/10' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent hover:border-white/10'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                >
                  {/* Subtle overlay for active state */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#EF6B23] rounded-r-full"></div>
                    </>
                  )}
                  
                  <div className="relative z-10">
                    <IconComponent className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                      !isActive && 'group-hover:scale-110'
                    }`} />
                    {item.badge && !isCollapsed && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-semibold rounded-full flex items-center justify-center border border-[#1a1a1a]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  
                  <span className={`${isCollapsed ? 'hidden' : 'block'} font-medium text-xs transition-all duration-200 relative z-10`}>
                    {item.label}
                  </span>


                  {/* Badge for collapsed state */}
                  {item.badge && isCollapsed && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-semibold rounded-full flex items-center justify-center border border-[#1a1a1a] z-20">
                      {item.badge}
                    </span>
                  )}
                </Link>


                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg"></div>
                    <span className="relative z-10">{item.label}</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#2a2a2a]"></div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>


      {/* Footer - Simple tip only */}
      <div className={`p-3 border-t border-white/10 ${isCollapsed ? 'hidden' : 'block'} relative`}>
        <div className="bg-gradient-to-br from-white/5 to-transparent rounded-lg p-3 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-semibold text-gray-400 mb-1">Quick Tip</p>
            <p className="text-[10px] text-gray-500">Use shortcuts to navigate</p>
          </div>
        </div>
      </div>


      {/* Logout Button */}
      <div className="p-3 pt-0">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden group
            text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/30
            ${isCollapsed ? 'justify-center' : ''}
            ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          
          <LogOut className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 relative z-10 ${
            isLoggingOut ? 'animate-pulse' : 'group-hover:scale-110'
          }`} />
          
          <span className={`${isCollapsed ? 'hidden' : 'block'} font-medium text-xs transition-all duration-200 relative z-10`}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </span>
        </button>

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-3 bottom-20 px-3 py-1.5 bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-white/10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-lg"></div>
            <span className="relative z-10">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#2a2a2a]"></div>
          </div>
        )}
      </div>


      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="m-3 mt-0 p-2.5 bg-gradient-to-br from-[#2a2a2a] to-[#232323] text-gray-400 rounded-lg hover:text-white transition-all duration-300 flex items-center justify-center group relative overflow-hidden border border-white/10"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-0.5" />
        ) : (
          <ChevronLeft className="w-4 h-4 relative z-10 transition-transform group-hover:-translate-x-0.5" />
        )}
      </button>
    </aside>
  );
}
