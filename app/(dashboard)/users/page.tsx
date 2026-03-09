"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, UserPlus, UserCheck, UserX, Search, Edit3, Trash2,
  Mail, Phone, MapPin, Flag, Cake, Eye, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, FileText, CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { apiFetch, auth } from '@/lib/auth';

// ─── Toast ─────────────────────────────────────────────────
type Toast = { id: number; message: string; type: 'success' | 'error' | 'warning' };

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 pl-3 pr-4 py-3 rounded-xl border shadow-2xl text-sm font-medium pointer-events-auto
            transition-all duration-300
            ${toast.type === 'success'
              ? 'bg-[#1a1a1a] border-green-500/40 text-green-400 shadow-green-500/10'
              : toast.type === 'error'
              ? 'bg-[#1a1a1a] border-red-500/40 text-red-400 shadow-red-500/10'
              : 'bg-[#1a1a1a] border-yellow-500/40 text-yellow-400 shadow-yellow-500/10'
            }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          {toast.type === 'error'   && <XCircle       className="w-4 h-4 flex-shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span className="text-white/90">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-1 opacity-40 hover:opacity-100 transition-opacity text-white"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── StatCard ──────────────────────────────────────────────
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
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/0 to-transparent opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
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
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

// ─── Types ─────────────────────────────────────────────────
interface Profile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  passportUrl?: string;
  residency?: string;
  nationality?: string;
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
  passport?: string;
  isOnline?: boolean;
  isActive?: boolean;
  profile?: Profile;
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

// ─── UserAvatar component ──────────────────────────────────
function UserAvatar({
  avatar, firstName, lastName, size = 'md', className = '',
}: {
  avatar?: string;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  const sizeClass = {
    sm: 'w-8  h-8  text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-lg',
  }[size];

  const getInitials = (f?: string, l?: string) => {
    const first = f?.trim() || '';
    const last  = l?.trim() || '';
    if (!first && !last) return '??';
    if (!first) return last.charAt(0).toUpperCase();
    if (!last)  return first.charAt(0).toUpperCase();
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const showImage = !!avatar && !imgError;

  return (
    <div
      className={`${sizeClass} rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 border border-[#EF6B23]/30 ${
        showImage ? '' : 'bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20'
      } ${className}`}
    >
      {showImage ? (
        <img
          src={avatar}
          alt={`${firstName ?? ''} ${lastName ?? ''}`}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-[#EF6B23] font-semibold">
          {getInitials(firstName, lastName)}
        </span>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function UsersPage() {
  const router = useRouter();
  const [users,         setUsers]         = useState<User[]>([]);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [selectedUser,  setSelectedUser]  = useState<User | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [totalUsers,    setTotalUsers]    = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editMode,      setEditMode]      = useState(false);
  const [editFormData,  setEditFormData]  = useState({ firstName: '', lastName: '', phone: '' });

  // ── Toast State ────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const removeToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const itemsPerPage = 10;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ── Normalize ──────────────────────────────────────────────
  const normalizeUser = (user: any): User => {
    const profile = user.profile ?? {};
    return {
      ...user,
      firstName:   profile.firstName   ?? user.firstName   ?? '',
      lastName:    profile.lastName    ?? user.lastName    ?? '',
      phone:       profile.phone       ?? user.phone       ?? '',
      residency:   profile.residency   ?? user.residency   ?? '',
      nationality: profile.nationality ?? user.nationality ?? '',
      avatar:      profile.avatarUrl   ?? user.avatar      ?? '',
      passport:    profile.passportUrl ?? user.passport    ?? '',
      status:      user.status ?? (user.isActive ? 'active' : 'inactive'),
      isOnline:    user.isOnline ?? false,
    };
  };

  const simulateOnlineStatus = (list: User[]) =>
    list.map(u => ({ ...u, isOnline: Math.random() > 0.7 }));

  // ── Auth guard ─────────────────────────────────────────────
  useEffect(() => {
    if (!auth.isAuthenticated()) router.push('/login');
  }, [router]);

  // ── Fetch list ─────────────────────────────────────────────
  const fetchUsers = async (page = 1, limit = itemsPerPage) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/users/?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);

      const result: ApiResponse<UsersListResponse> = await res.json();
      if (!result.success) throw new Error(result.message);
      if (!result.data)    throw new Error('No data in response');

      let usersData: any[] = result.data.users ?? (result.data as any);
      if (!Array.isArray(usersData)) throw new Error('Users data is not an array');

      usersData = simulateOnlineStatus(usersData.map(normalizeUser));
      setUsers(usersData);
      setCurrentPage(result.data.pagination?.page      ?? page);
      setTotalPages( result.data.pagination?.totalPages ?? 1);
      setTotalUsers( result.data.pagination?.totalUsers ?? usersData.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch single user ──────────────────────────────────────
  const fetchUserDetails = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user details');
      const result: ApiResponse<User> = await res.json();
      if (result.success && result.data) {
        setSelectedUser(normalizeUser(result.data));
      } else {
        throw new Error(result.message || 'Failed to load user details');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load user details', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' });
    setEditMode(true);
  };

  // ── Update ─────────────────────────────────────────────────
  const updateUser = async (userId: string, updates: Partial<User>) => {
    setActionLoading(userId);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Failed to update user');
      }
      const result: ApiResponse<User> = await res.json();
      if (result.success) {
        await fetchUsers(currentPage, itemsPerPage);
        setSelectedUser(null);
        setEditMode(false);
        showToast('User updated successfully!');
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSubmit = async () => {
    if (!selectedUser) return;
    if (!editFormData.firstName?.trim() || !editFormData.lastName?.trim()) {
      showToast('First name and last name are required', 'warning');
      return;
    }
    await updateUser(selectedUser.id, editFormData);
  };

  // ── Delete ─────────────────────────────────────────────────
  const deleteUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Failed to delete user');
      }
      const result: ApiResponse<any> = await res.json();
      if (result.success) {
        await fetchUsers(currentPage, itemsPerPage);
        setDeleteConfirm(null);
        setSelectedUser(null);
        showToast('User deleted successfully!');
      } else {
        throw new Error(result.message || 'Delete failed');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Initial load ───────────────────────────────────────────
  useEffect(() => {
    if (auth.isAuthenticated()) fetchUsers(1, itemsPerPage);
  }, []);

  const filteredUsers = users.filter(u => {
    const name  = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = u.email?.toLowerCase() || '';
    const q     = searchTerm.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const getInitials = (f?: string, l?: string) => {
    const first = f?.trim() || '';
    const last  = l?.trim() || '';
    if (!first && !last) return '??';
    if (!first) return last.charAt(0).toUpperCase();
    if (!last)  return first.charAt(0).toUpperCase();
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const activeUsers  = users.filter(u => u.status === 'active').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;
  const onlineUsers  = users.filter(u => u.isOnline).length;

  // ── Status badge helper ────────────────────────────────────
  const statusBadge = (status?: string) =>
    status === 'active'  ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
    status === 'pending' ? 'bg-[#EAAB2A]/20 text-[#EAAB2A] border border-[#EAAB2A]/30' :
                           'bg-red-500/20 text-red-400 border border-red-500/30';

  return (
    <div className="min-h-screen bg-[#1a1a1a] space-y-6 p-4 sm:p-6 lg:p-8">

      {/* ── Page title ──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          Users <Users className="w-5 h-5 text-[#EF6B23]" />
        </h1>
        <p className="text-sm text-gray-400">Manage all user accounts and permissions.</p>
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users"  value={totalUsers}  icon={<Users className="w-5 h-5" />} />
        <StatCard title="Active Users" value={activeUsers} variant="primary" icon={<UserCheck className="w-5 h-5" />} />
        <StatCard title="Online Now"   value={onlineUsers} icon={
          <div className="relative">
            <UserPlus className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        } />
        <StatCard title="Pending" value={pendingUsers} icon={<UserX className="w-5 h-5" />} />
      </div>

      {/* ── Error ───────────────────────────────────────────── */}
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

      {/* ── Table card ──────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl hover:shadow-2xl hover:shadow-[#EF6B23]/10 transition-all duration-300">

        {/* Search + Refresh */}
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
            className="px-6 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-medium hover:shadow-xl hover:shadow-[#EF6B23]/25 hover:scale-[1.02] transition-all flex items-center gap-2 border border-[#FA9C31]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> : <><Users className="w-4 h-4" /> Refresh</>}
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
                    <th className="text-right py-3 w-24" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]/30">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-[#1f1f1f]/70 transition-all duration-200 border-b border-[#333333]/20">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <UserAvatar
                              avatar={user.avatar}
                              firstName={user.firstName}
                              lastName={user.lastName}
                              size="md"
                              className="group-hover:scale-105 transition-transform"
                            />
                            {user.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2a2a2a] animate-pulse">
                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium group-hover:text-[#EF6B23] transition-colors">
                                {user.firstName || 'N/A'} {user.lastName || ''}
                              </p>
                              {user.isOnline && (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-semibold rounded-full border border-green-500/30">
                                  Online
                                </span>
                              )}
                            </div>
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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(user.status)}`}>
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
                            {actionLoading === user.id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Eye className="w-3.5 h-3.5" />}
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
                  Page {currentPage} of {totalPages} ({totalUsers} total users, {onlineUsers} online)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchUsers(currentPage - 1, itemsPerPage)}
                    disabled={currentPage === 1 || loading}
                    className="px-4 py-2 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white hover:bg-[#1a1a1a] hover:border-[#EF6B23] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={() => fetchUsers(currentPage + 1, itemsPerPage)}
                    disabled={currentPage === totalPages || loading}
                    className="px-4 py-2 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white hover:bg-[#1a1a1a] hover:border-[#EF6B23] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── User Details / Edit Modal ────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Modal Header */}
            <div className="p-6 border-b border-[#333333]/50 sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <UserAvatar
                      avatar={selectedUser.avatar}
                      firstName={selectedUser.firstName}
                      lastName={selectedUser.lastName}
                      size="lg"
                      className="rounded-2xl"
                    />
                    {selectedUser.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#2a2a2a] animate-pulse">
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">
                        {editMode ? 'Edit User' : 'User Details'}
                      </h3>
                      {selectedUser.isOnline && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                          Online
                        </span>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(selectedUser.status)}`}>
                      {selectedUser.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedUser(null); setEditMode(false); }}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all group"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {editMode ? (
                <>
                  <div className="space-y-4">
                    {[
                      { label: 'First Name', key: 'firstName', type: 'text' },
                      { label: 'Last Name',  key: 'lastName',  type: 'text' },
                      { label: 'Phone',      key: 'phone',     type: 'tel'  },
                    ].map(({ label, key, type }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
                        <input
                          type={type}
                          value={(editFormData as any)[key]}
                          onChange={(e) => setEditFormData({ ...editFormData, [key]: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all"
                        />
                      </div>
                    ))}
                  </div>

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
                      {actionLoading === selectedUser.id
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        : <><Edit3 className="w-4 h-4" /> Save Changes</>}
                    </button>
                  </div>
                </>
              ) : (
                <>
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

                  {/* Passport */}
                  {selectedUser.passport ? (
                    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#626262] flex-shrink-0" />
                        <p className="text-sm text-gray-400">Passport Document</p>
                      </div>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 bg-black/30">
                        <img
                          src={selectedUser.passport}
                          alt="Passport"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                            const next = e.currentTarget.nextSibling as HTMLElement | null;
                            if (next) next.style.display = 'flex';
                          }}
                        />
                        <div className="hidden absolute inset-0 items-center justify-center flex-col gap-2" style={{ display: 'none' }}>
                          <FileText className="w-10 h-10 text-gray-600" />
                          <p className="text-gray-600 text-xs">Could not load image</p>
                        </div>
                      </div>
                      <a
                        href={selectedUser.passport}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#EF6B23] hover:underline text-center"
                      >
                        Open full image ↗
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50">
                      <FileText className="w-5 h-5 text-[#626262] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Passport Document</p>
                        <p className="text-white/40 font-medium text-sm">Not uploaded</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => setEditMode(true)}
                      disabled={actionLoading === selectedUser.id}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-medium hover:shadow-xl hover:shadow-[#EF6B23]/25 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" /> Edit User
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(selectedUser.id)}
                      disabled={actionLoading === selectedUser.id}
                      className="flex-1 px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium hover:bg-red-500/30 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ────────────────────────── */}
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
                {actionLoading === deleteConfirm
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                  : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notifications ──────────────────────────────── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

    </div>
  );
}
