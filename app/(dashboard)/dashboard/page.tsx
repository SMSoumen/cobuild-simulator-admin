"use client";
import React, { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Briefcase, ArrowUpRight, Clock, Activity } from 'lucide-react';

function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    
    <div className="min-h-screen bg-[#1a1a1a] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative background elements - Dark theme */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#EF6B23]/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  variant?: 'default' | 'primary';
  trend?: number;
  icon?: ReactNode;
}

function StatCard({ title, value, variant = 'default', trend, icon }: StatCardProps) {
  const isPositiveTrend = trend && trend > 0;
  
  if (variant === 'primary') {
    return (
      <div className="group relative bg-gradient-to-br from-[#EF6B23] to-orange-600 p-5 rounded-2xl shadow-xl shadow-[#EF6B23]/20 text-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#EF6B23]/30 hover:scale-[1.01] border border-orange-500/20">
        {/* Glossy overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/0 to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-black/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white/70 text-xs font-medium mb-1.5 uppercase tracking-wide">{title}</h3>
              <p className="text-2xl font-bold tracking-tight drop-shadow-lg">{value}</p>
            </div>
            {icon && (
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/20">
                <div className="scale-75">
                  {icon}
                </div>
              </div>
            )}
          </div>
          
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-white/20">
              {isPositiveTrend ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span className="text-xs font-semibold">
                {isPositiveTrend ? '+' : ''}{trend}%
              </span>
              <span className="text-[10px] text-white/60 ml-0.5">vs last month</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-gradient-to-br from-[#2a2a2a] to-[#232323] p-5 rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-[#EF6B23]/10 transition-all duration-300 hover:scale-[1.01] overflow-hidden">
      {/* Glassmorphism glossy effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">{title}</h3>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF6B23] to-orange-400">
              {value}
            </p>
          </div>
          {icon && (
            <div className="w-9 h-9 bg-gradient-to-br from-[#EF6B23]/20 to-orange-500/20 rounded-xl flex items-center justify-center text-[#EF6B23] group-hover:scale-110 transition-transform duration-300 border border-[#EF6B23]/20 backdrop-blur-sm">
              <div className="scale-75">
                {icon}
              </div>
            </div>
          )}
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2.5 pt-2.5 border-t border-white/10 ${
            isPositiveTrend ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositiveTrend ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span className="text-xs font-semibold">
              {isPositiveTrend ? '+' : ''}{trend}%
            </span>
            <span className="text-[10px] text-gray-500 ml-0.5">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const activities = [
    { id: 1, title: 'New user registered', time: '2 min ago', type: 'user' },
    { id: 2, title: 'Payment received: $1,234', time: '15 min ago', type: 'payment' },
    { id: 3, title: 'Project "Alpha" completed', time: '1h ago', type: 'project' },
    { id: 4, title: 'System backup completed', time: '3h ago', type: 'system' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            Dashboard
            <span className="text-lg">👋</span>
          </h1>
          <p className="text-sm text-gray-400">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard 
            title="Total Users" 
            value="1,234" 
            trend={12.5}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard 
            title="Revenue" 
            value="$45,678" 
            variant="primary"
            trend={8.2}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <StatCard 
            title="Active Projects" 
            value="89" 
            trend={-3.1}
            icon={<Briefcase className="w-5 h-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#EF6B23]" />
                  Recent Activity
                </h2>
                <button className="text-xs text-[#EF6B23] font-medium hover:text-orange-400 flex items-center gap-1 group transition-colors">
                  View All
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
              
              <div className="space-y-1.5">
                {activities.map((item, index) => (
                  <div 
                    key={item.id}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-[#EF6B23]/10 hover:to-transparent transition-all duration-200 cursor-pointer border border-transparent hover:border-[#EF6B23]/30 backdrop-blur-sm"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <div className="relative">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-sm border ${
                        item.type === 'user' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        item.type === 'payment' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        item.type === 'project' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      } group-hover:scale-110 transition-transform duration-200`}>
                        {item.type === 'user' && <Users className="w-4 h-4" />}
                        {item.type === 'payment' && <DollarSign className="w-4 h-4" />}
                        {item.type === 'project' && <Briefcase className="w-4 h-4" />}
                        {item.type === 'system' && <Activity className="w-4 h-4" />}
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#EF6B23] rounded-full border-2 border-[#232323] animate-pulse shadow-lg shadow-[#EF6B23]/50"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 font-medium group-hover:text-[#EF6B23] transition-colors truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </div>
                    </div>
                    
                    <ArrowUpRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 group-hover:text-[#EF6B23] transition-all flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] overflow-hidden border border-blue-500/20">
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/0 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-white/70 uppercase tracking-wide">Completion Rate</h3>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold mb-2 drop-shadow-lg">94.2%</p>
                <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
                  <div className="bg-white h-full rounded-full transition-all duration-500 shadow-lg shadow-white/50" style={{ width: '94.2%' }}></div>
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-5 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] overflow-hidden border border-purple-500/20">
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/0 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-white/70 uppercase tracking-wide">Task Progress</h3>
                  <Briefcase className="w-4 h-4" />
                </div>
                <p className="text-2xl font-bold mb-1 drop-shadow-lg">67/89</p>
                <p className="text-xs text-white/60">tasks completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
