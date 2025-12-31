"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserPlus, UserCheck, UserX, Search, Edit3, Trash2, Mail, Phone, MapPin, Flag, Cake, Eye, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { apiFetch, auth } from '@/lib/auth';


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


interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  residency?: string;
  nationality?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  avatar?: string;
}


interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}


interface UsersListResponse {
  users?: User[];
  pagination?: {
    page?: number;
    limit?: number;
    totalUsers?: number;
    totalPages?: number;
  };
}


export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  
  const itemsPerPage = 10;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Check authentication
  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  // Fetch all users with pagination
  const fetchUsers = async (page: number = 1, limit: number = itemsPerPage) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/admin/users/?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const result: ApiResponse<UsersListResponse> = await response.json();
      
      // Debug logging
      console.log('📦 API Response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'API returned success: false');
      }

      if (!result.data) {
        throw new Error('No data in response');
      }

      // Handle flexible response structure
      const usersData = result.data.users || result.data;
      const paginationData = result.data.pagination || {};

      // Validate users data
      if (!Array.isArray(usersData)) {
        console.error('❌ Invalid users data:', usersData);
        throw new Error('Users data is not an array');
      }

      // Set state with safe fallbacks
      setUsers(usersData);
      setCurrentPage(paginationData.page ?? page);
      setTotalPages(paginationData.totalPages ?? 1);
      setTotalUsers(paginationData.totalUsers ?? usersData.length);

      console.log('✅ Loaded', usersData.length, 'users');
      
    } catch (err: any) {
      console.error('❌ Error fetching users:', err);
      setError(err.message || 'Failed to load users');
      
      // Set empty state on error
      setUsers([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single user details
  const fetchUserDetails = async (userId: string) => {
    setActionLoading(userId);
    
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/admin/users/${userId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const result: ApiResponse<User> = await response.json();
      
      console.log('📦 User Details Response:', result);
      
      if (result.success && result.data) {
        setSelectedUser(result.data);
      } else {
        throw new Error(result.message || 'Failed to load user details');
      }
    } catch (err: any) {
      console.error('❌ Error fetching user details:', err);
      alert(err.message || 'Failed to load user details');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle edit click
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || ''
    });
    setEditMode(true);
  };

  // Update user
  const updateUser = async (userId: string, updates: Partial<User>) => {
    setActionLoading(userId);
    
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/admin/users/${userId}`,
        {
          method: 'PUT',
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const result: ApiResponse<User> = await response.json();
      
      console.log('📦 Update Response:', result);
      
      if (result.success) {
        // Refresh users list
        await fetchUsers(currentPage, itemsPerPage);
        setSelectedUser(null);
        setEditMode(false);
        alert('User updated successfully!');
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err: any) {
      console.error('❌ Error updating user:', err);
      alert(err.message || 'Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle update submit
  const handleUpdateSubmit = async () => {
    if (!selectedUser) return;
    
    // Validate form data
    if (!editFormData.firstName?.trim() || !editFormData.lastName?.trim()) {
      alert('First name and last name are required');
      return;
    }
    
    if (!editFormData.phone?.trim()) {
      alert('Phone number is required');
      return;
    }
    
    await updateUser(selectedUser.id, editFormData);
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    setActionLoading(userId);
    
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/admin/users/${userId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      const result: ApiResponse<any> = await response.json();
      
      console.log('📦 Delete Response:', result);
      
      if (result.success) {
        // Refresh users list
        await fetchUsers(currentPage, itemsPerPage);
        setDeleteConfirm(null);
        setSelectedUser(null);
        alert('User deleted successfully!');
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (err: any) {
      console.error('❌ Error deleting user:', err);
      alert(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  // Initial load
  useEffect(() => {
    if (auth.isAuthenticated()) {
      fetchUsers(1, itemsPerPage);
    }
  }, []);

  // Filter users based on search - with safe handling
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Get initials for avatar with safe fallbacks
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.trim() || '';
    const last = lastName?.trim() || '';
    
    if (!first && !last) return '??';
    if (!first) return last.charAt(0).toUpperCase();
    if (!last) return first.charAt(0).toUpperCase();
    
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  // Calculate stats - with safe handling
  const activeUsers = users.filter(u => u.status === 'active').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#1a1a1a] space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          Users <Users className="w-5 h-5 text-[#EF6B23]" />
        </h1>
        <p className="text-sm text-gray-400">Manage all user accounts and permissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={totalUsers} icon={<Users className="w-5 h-5" />} />
        <StatCard title="Active Users" value={activeUsers} variant="primary" icon={<UserCheck className="w-5 h-5" />} />
        <StatCard title="Current Page" value={`${users.length}`} icon={<UserPlus className="w-5 h-5" />} />
        <StatCard title="Pending" value={pendingUsers} icon={<UserX className="w-5 h-5" />} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Error loading users</p>
            <p className="text-sm">{error}</p>
          </div>
          <button 
            onClick={() => fetchUsers(currentPage, itemsPerPage)}
            className="ml-auto px-4 py-2 bg-red-500/30 hover:bg-red-500/40 rounded-lg text-sm font-medium transition-all"
          >
            Retry
          </button>
        </div>
      )}

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
          <button 
            onClick={() => fetchUsers(currentPage, itemsPerPage)}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-medium hover:shadow-xl hover:shadow-[#EF6B23]/25 hover:scale-[1.02] transition-all flex items-center gap-2 border border-[#FA9C31]/20 hover:border-[#FA9C31]/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Refresh
              </>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#EF6B23] animate-spin mb-4" />
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#626262]/30">
                    <th className="text-left py-3 text-gray-300 font-medium">User</th>
                    <th className="text-left py-3 text-gray-300 font-medium hidden md:table-cell">Email</th>
                    <th className="text-left py-3 text-gray-300 font-medium hidden lg:table-cell">Phone</th>
                    <th className="text-left py-3 text-gray-300 font-medium hidden xl:table-cell">Residency</th>
                    <th className="text-left py-3 text-gray-300 font-medium hidden 2xl:table-cell">Nationality</th>
                    <th className="text-left py-3 text-gray-300 font-medium hidden xl:table-cell">Joined</th>
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
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          <div>
                            <p className="text-white font-medium group-hover:text-[#EF6B23] transition-colors">
                              {user.firstName || 'N/A'} {user.lastName || ''}
                            </p>
                            <p className="text-xs text-[#626262] md:hidden">{user.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 hidden md:table-cell">
                        <p className="text-gray-200 truncate max-w-[200px]">{user.email || 'N/A'}</p>
                      </td>
                      <td className="py-4 pr-4 hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-[#626262] flex-shrink-0" />
                          <span className="text-gray-200">{user.phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 hidden xl:table-cell">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#626262] flex-shrink-0" />
                          <span className="text-gray-200 truncate max-w-[120px]">{user.residency || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 hidden 2xl:table-cell">
                        <div className="flex items-center gap-1">
                          <Flag className="w-3.5 h-3.5 text-[#626262] flex-shrink-0" />
                          <span className="text-gray-200">{user.nationality || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 hidden xl:table-cell">
                        <span className="text-gray-200">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          user.status === 'pending' ? 'bg-[#EAAB2A]/20 text-[#EAAB2A] border border-[#EAAB2A]/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {user.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all ml-auto">
                          <button 
                            onClick={() => fetchUserDetails(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                            title="View Details"
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button 
                            onClick={() => handleEditClick(user)}
                            disabled={actionLoading === user.id}
                            className="p-1.5 text-[#EF6B23] hover:text-[#FA9C31] hover:bg-[#EF6B23]/20 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                            title="Edit User"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(user.id)}
                            disabled={actionLoading === user.id}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-[#626262] mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg">No users found</p>
                <p className="text-[#626262] text-sm mt-1">Try adjusting your search terms</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#333333]/30">
                <p className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages} ({totalUsers} total users)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchUsers(currentPage - 1, itemsPerPage)}
                    disabled={currentPage === 1 || loading}
                    className="px-4 py-2 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white hover:bg-[#1a1a1a] hover:border-[#EF6B23] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => fetchUsers(currentPage + 1, itemsPerPage)}
                    disabled={currentPage === totalPages || loading}
                    className="px-4 py-2 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white hover:bg-[#1a1a1a] hover:border-[#EF6B23] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Details/Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-[#333333]/50 sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20 rounded-2xl flex items-center justify-center text-[#EF6B23] font-bold text-lg border border-[#EF6B23]/30">
                    {getInitials(selectedUser.firstName, selectedUser.lastName)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editMode ? 'Edit User' : 'User Details'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedUser.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      selectedUser.status === 'pending' ? 'bg-[#EAAB2A]/20 text-[#EAAB2A] border border-[#EAAB2A]/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {selectedUser.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setEditMode(false);
                  }}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all group"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* User Details/Edit Form */}
            <div className="p-6 space-y-4">
              {editMode ? (
                <>
                  {/* Edit Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                      <input
                        type="text"
                        value={editFormData.firstName}
                        onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                        className="w-full px-4 py-2.5 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={editFormData.lastName}
                        onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                        className="w-full px-4 py-2.5 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Readonly Fields */}
                  <div className="pt-4 border-t border-[#333333]/50 space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                      <Mail className="w-4 h-4 text-[#626262] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Email (readonly)</p>
                        <p className="text-white text-sm">{selectedUser.email || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                        <MapPin className="w-4 h-4 text-[#626262] mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Residency</p>
                          <p className="text-white text-sm">{selectedUser.residency || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                        <Flag className="w-4 h-4 text-[#626262] mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Nationality</p>
                          <p className="text-white text-sm">{selectedUser.nationality || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex gap-2">
                    <button 
                      onClick={() => setEditMode(false)}
                      disabled={actionLoading === selectedUser.id}
                      className="flex-1 px-4 py-2.5 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white hover:bg-[#1a1a1a] transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleUpdateSubmit}
                      disabled={actionLoading === selectedUser.id}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-medium hover:shadow-xl hover:shadow-[#EF6B23]/25 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {actionLoading === selectedUser.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* View Mode */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                    <Mail className="w-5 h-5 text-[#626262] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Email</p>
                      <p className="text-white font-medium">{selectedUser.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                    <Phone className="w-5 h-5 text-[#626262] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Phone</p>
                      <p className="text-white font-medium">{selectedUser.phone || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                    <MapPin className="w-5 h-5 text-[#626262] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Residency</p>
                      <p className="text-white font-medium">{selectedUser.residency || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                      <Flag className="w-5 h-5 text-[#626262] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Nationality</p>
                        <p className="text-white font-medium">{selectedUser.nationality || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                      <Cake className="w-5 h-5 text-[#626262] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Joined</p>
                        <p className="text-white font-medium">
                          {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button 
                      onClick={() => setEditMode(true)}
                      disabled={actionLoading === selectedUser.id}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-medium hover:shadow-xl hover:shadow-[#EF6B23]/25 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit User
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(selectedUser.id)}
                      disabled={actionLoading === selectedUser.id}
                      className="flex-1 px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium hover:bg-red-500/30 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete User</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this user? All data associated with this account will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={actionLoading === deleteConfirm}
                className="flex-1 px-4 py-2.5 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white hover:bg-[#1a1a1a] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium hover:bg-red-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === deleteConfirm ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
