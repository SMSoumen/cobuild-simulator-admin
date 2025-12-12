"use client";
import { useState } from 'react';
import { Users, UserPlus, UserCheck, UserX, Search, Edit3, Trash2, Plus, Mail, Phone, MapPin, Flag, Cake, Eye } from 'lucide-react';
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
              {isPositiveTrend ? <UserPlus className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
              <span className="text-xs font-semibold">{isPositiveTrend ? '+' : ''}{trend}%</span>
              <span className="text-[10px] text-white/60 ml-0.5">vs last month</span>
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
            {isPositiveTrend ? <UserPlus className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
            <span className="text-xs font-semibold">{isPositiveTrend ? '+' : ''}{trend}%</span>
            <span className="text-[10px] text-[#626262] ml-0.5">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@company.com', phone: '+91 98765 43210', residency: 'New Delhi, India', nationality: 'Indian', dob: '1990-05-15', status: 'active', avatar: 'JD' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@lawfirm.com', phone: '+1 555 123 4567', residency: 'Mumbai, India', nationality: 'Indian', dob: '1985-11-22', status: 'inactive', avatar: 'JS' },
  { id: 3, name: 'Raj Patel', email: 'raj.patel@legal.com', phone: '+91 91234 56789', residency: 'Bangalore, India', nationality: 'Indian', dob: '1992-03-10', status: 'active', avatar: 'RP' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@consult.com', phone: '+44 20 7946 0958', residency: 'London, UK', nationality: 'British', dob: '1988-07-30', status: 'pending', avatar: 'SW' }
];

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  residency: string;
  nationality: string;
  dob: string;
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openUserModal = (user: User) => {
    setSelectedUser(user);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          Users <Users className="w-5 h-5 text-[#EF6B23]" />
        </h1>
        <p className="text-sm text-gray-400">Manage all user accounts and permissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value="1,234" trend={12.5} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Active Users" value="892" trend={8.2} variant="primary" icon={<UserCheck className="w-5 h-5" />} />
        <StatCard title="New Users" value="45" trend={23.1} icon={<UserPlus className="w-5 h-5" />} />
        <StatCard title="Pending" value="12" trend={-3.1} icon={<UserX className="w-5 h-5" />} />
      </div>

      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl hover:shadow-[#EF6B23]/10 transition-all duration-300">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#626262]" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all backdrop-blur-sm hover:bg-[#1a1a1a]"
            />
          </div>
          {/* <button className="px-6 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-medium hover:shadow-xl hover:shadow-[#EF6B23]/25 hover:scale-[1.02] transition-all flex items-center gap-2 border border-[#FA9C31]/20 hover:border-[#FA9C31]/40">
            <Plus className="w-4 h-4" />
            Add User
          </button> */}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#626262]/30">
                <th className="text-left py-3 text-gray-300 font-medium">User</th>
                <th className="text-left py-3 text-gray-300 font-medium hidden md:table-cell">Email</th>
                <th className="text-left py-3 text-gray-300 font-medium hidden lg:table-cell">Phone</th>
                <th className="text-left py-3 text-gray-300 font-medium hidden xl:table-cell">Residency</th>
                <th className="text-left py-3 text-gray-300 font-medium hidden 2xl:table-cell">Nationality</th>
                <th className="text-left py-3 text-gray-300 font-medium hidden xl:table-cell">DOB</th>
                <th className="text-right py-3 text-gray-300 font-medium">Status</th>
                <th className="text-right py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#333333]/30">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-[#1f1f1f]/70 transition-all duration-200 border-b border-[#333333]/20">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20 rounded-xl flex items-center justify-center text-[#EF6B23] font-semibold text-sm border border-[#EF6B23]/30 group-hover:scale-105 transition-transform">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-white font-medium group-hover:text-[#EF6B23] transition-colors">{user.name}</p>
                        <p className="text-xs text-[#626262]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 hidden md:table-cell">
                    <p className="text-gray-200 truncate max-w-[200px]">{user.email}</p>
                  </td>
                  <td className="py-4 pr-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#626262] flex-shrink-0" />
                      <span className="text-gray-200">{user.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 hidden xl:table-cell">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#626262] flex-shrink-0" />
                      <span className="text-gray-200 truncate max-w-[120px]">{user.residency}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 hidden 2xl:table-cell">
                    <div className="flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5 text-[#626262] flex-shrink-0" />
                      <span className="text-gray-200">{user.nationality}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 hidden xl:table-cell">
                    <div className="flex items-center gap-1">
                      <Cake className="w-3.5 h-3.5 text-[#626262] flex-shrink-0" />
                      <span className="text-gray-200">{new Date(user.dob).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      user.status === 'pending' ? 'bg-[#EAAB2A]/20 text-[#EAAB2A] border border-[#EAAB2A]/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-auto">
                      <button 
                        onClick={() => openUserModal(user)}
                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all hover:scale-105"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-[#EF6B23] hover:text-[#FA9C31] hover:bg-[#EF6B23]/20 rounded-lg transition-all hover:scale-105">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all hover:scale-105">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-[#626262] mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">No users found</p>
            <p className="text-[#626262] text-sm mt-1">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-[#333333]/50 sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20 rounded-2xl flex items-center justify-center text-[#EF6B23] font-bold text-lg border border-[#EF6B23]/30">
                    {selectedUser.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedUser.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      selectedUser.status === 'pending' ? 'bg-[#EAAB2A]/20 text-[#EAAB2A] border border-[#EAAB2A]/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {selectedUser.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeUserModal}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all group"
                >
                  <Eye className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </button>
              </div>
            </div>

            {/* User Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                <Mail className="w-5 h-5 text-[#626262] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <p className="text-white font-medium">{selectedUser.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                <Phone className="w-5 h-5 text-[#626262] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Phone</p>
                  <p className="text-white font-medium">{selectedUser.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                <MapPin className="w-5 h-5 text-[#626262] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Residency</p>
                  <p className="text-white font-medium">{selectedUser.residency}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                  <Flag className="w-5 h-5 text-[#626262] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Nationality</p>
                    <p className="text-white font-medium">{selectedUser.nationality}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                  <Cake className="w-5 h-5 text-[#626262] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Date of Birth</p>
                    <p className="text-white font-medium">{new Date(selectedUser.dob).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-medium hover:shadow-xl hover:shadow-[#EF6B23]/25 transition-all text-sm">
                  Edit User
                </button>
                <button className="flex-1 px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium hover:bg-red-500/30 transition-all text-sm">
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
