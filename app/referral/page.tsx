"use client";
import { useState } from 'react';
import { Users, UserPlus, Share2, Copy, Check, Barcode, ClipboardList, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

function StatCard({ title, value, variant = 'default', trend, icon }: {
  title: string;
  value: string | number;
  variant?: 'default' | 'primary';
  trend?: number;
  icon?: ReactNode;
}) {
  const isPositiveTrend = trend && trend > 0;
  
  if (variant === 'primary') {
    return (
      <div className="group relative bg-gradient-to-br from-[#EF6B23] to-[#E4782C] p-5 rounded-2xl shadow-xl shadow-[#EF6B23]/20 text-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#EF6B23]/30 hover:scale-[1.01] border border-[#FA9C31]/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/0 to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-white/70 text-xs font-medium mb-1.5 uppercase tracking-wide">{title}</h3>
              <p className="text-2xl font-bold tracking-tight drop-shadow-lg">{value}</p>
            </div>
            {icon && (
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/20">
                <div className="scale-75">{icon}</div>
              </div>
            )}
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-white/20">
              {isPositiveTrend ? <UserPlus className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
              <span className="text-xs font-semibold">{isPositiveTrend ? '+' : ''}{trend}%</span>
              <span className="text-[10px] text-white/60 ml-0.5">this month</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-gradient-to-br from-[#2a2a2a] to-[#232323] p-5 rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-[#EF6B23]/10 transition-all duration-300 hover:scale-[1.01] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">{title}</h3>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF6B23] to-[#FA9C31]">{value}</p>
          </div>
          {icon && (
            <div className="w-9 h-9 bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20 rounded-xl flex items-center justify-center text-[#EF6B23] group-hover:scale-110 transition-transform duration-300 border border-[#EF6B23]/20 backdrop-blur-sm">
              <div className="scale-75">{icon}</div>
            </div>
          )}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2.5 pt-2.5 border-t border-[#626262]/30 ${isPositiveTrend ? 'text-green-400' : 'text-red-400'}`}>
            {isPositiveTrend ? <UserPlus className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            <span className="text-xs font-semibold">{isPositiveTrend ? '+' : ''}{trend}%</span>
            <span className="text-[10px] text-[#626262] ml-0.5">this month</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ReferralCode {
  id: number;
  code: string;
  usedBy: string | null;
  createdAt: string;
  status: 'available' | 'used';
}

export default function ReferralPage() {
  const [codes, setCodes] = useState<ReferralCode[]>([
    { id: 1, code: 'REF2025A1', usedBy: null, createdAt: '2025-01-15', status: 'available' },
    { id: 2, code: 'REF2025B2', usedBy: 'john.doe@email.com', createdAt: '2025-01-14', status: 'used' },
    { id: 3, code: 'REF2025C3', usedBy: null, createdAt: '2025-01-13', status: 'available' },
    { id: 4, code: 'REF2025D4', usedBy: 'jane.smith@email.com', createdAt: '2025-01-12', status: 'used' },
  ]);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const generateNewCode = () => {
    const newCode = `REF${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const newReferral: ReferralCode = {
      id: Date.now(),
      code: newCode,
      usedBy: null,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'available'
    };
    setCodes([newReferral, ...codes]);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const markCodeAsUsed = (codeId: number, userEmail: string) => {
    setCodes(codes.map(code => 
      code.id === codeId 
        ? { ...code, usedBy: userEmail, status: 'used' }
        : code
    ));
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          Referral Codes <Share2 className="w-6 h-6 text-[#EF6B23]" />
        </h1>
        <p className="text-sm text-gray-400">Generate unique referral codes for users. Each code can only be used once.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Codes" value={codes.length} icon={<Barcode className="w-5 h-5" />} />
        <StatCard title="Active Codes" value="12" variant="primary" icon={<UserPlus className="w-5 h-5" />} />
        <StatCard title="Used Codes" value="8" trend={25} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Conversion" value="2.4x" trend={15} icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      {/* Generate New Code */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Barcode className="w-5 h-5 text-[#EF6B23]" />
              Generate New Referral Code
            </h3>
            <p className="text-sm text-gray-400">Create unique codes for new users. Each code is one-time use only.</p>
          </div>
          <button
            onClick={generateNewCode}
            className="px-8 py-3 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#EF6B23]/25 hover:scale-[1.02] transition-all flex items-center gap-2 border border-[#FA9C31]/20 whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Generate Code
          </button>
        </div>
      </div>

      {/* Referral Codes Table */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[#333333]/50">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#EF6B23]" />
            All Referral Codes
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#626262]/30">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider">Code</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden lg:table-cell">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden xl:table-cell">Used By</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden 2xl:table-cell">Created</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]/30">
              {codes.map((code) => (
                <tr key={code.id} className="group hover:bg-[#1f1f1f]/50 transition-all">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        code.status === 'available' 
                          ? 'bg-[#4AD991]/20 text-[#4AD991] border border-[#4AD991]/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {code.code.slice(-2)}
                      </div>
                      <div>
                        <p className="font-mono font-semibold text-white text-sm">{code.code}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6 hidden lg:table-cell">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      code.status === 'available' 
                        ? 'bg-[#4AD991]/20 text-[#4AD991] border border-[#4AD991]/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {code.status === 'available' ? 'Available' : 'Used'}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6 hidden xl:table-cell">
                    <span className="text-gray-200 text-sm truncate max-w-[200px]">
                      {code.usedBy || '-'}
                    </span>
                  </td>
                  
                  <td className="py-4 px-6 hidden 2xl:table-cell">
                    <span className="text-gray-400 text-xs">{code.createdAt}</span>
                  </td>
                  
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => copyCode(code.code)}
                        className="p-2 text-[#EF6B23] hover:text-[#FA9C31] hover:bg-[#EF6B23]/20 rounded-lg transition-all group"
                        title="Copy code"
                      >
                        {copiedCode === code.code ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      {code.status === 'available' && (
                        <button
                          onClick={() => markCodeAsUsed(code.id, 'user@example.com')}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all"
                          title="Mark as used"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {codes.length === 0 && (
          <div className="text-center py-12">
            <Barcode className="w-16 h-16 text-[#626262] mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg mb-2">No referral codes yet</p>
            <p className="text-[#626262] text-sm mb-6">Generate your first referral code above</p>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#EF6B23]" />
          How Referral Codes Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
            <div className="w-10 h-10 bg-[#EF6B23]/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <UserPlus className="w-5 h-5 text-[#EF6B23]" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Generate Code</h4>
              <p className="text-gray-400">Create unique codes for users</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
            <div className="w-10 h-10 bg-[#4AD991]/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Copy className="w-5 h-5 text-[#4AD991]" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Share Code</h4>
              <p className="text-gray-400">Copy & share with users</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">One-Time Use</h4>
              <p className="text-gray-400">Each code used once only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
