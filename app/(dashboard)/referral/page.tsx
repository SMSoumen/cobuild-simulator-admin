"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, UserPlus, Share2, Copy, Check, Barcode, ClipboardList, TrendingUp, Search, Filter, X, Download, RefreshCw, Calendar, Mail, Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import { apiFetch } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ============================================
// Interfaces
// ============================================
interface ReferralCode {
  id: string;
  code: string;
  email: string | null;
  userId?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  createdAt: string;
  isUsed: boolean;
  usedAt?: string | null;
  expiresAt?: string | null;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ReferralCode[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ============================================
// StatCard Component (Enhanced)
// ============================================
function StatCard({ 
  title, 
  value, 
  variant = 'default', 
  trend, 
  icon,
  subtitle 
}: {
  title: string;
  value: string | number;
  variant?: 'default' | 'primary';
  trend?: number;
  icon?: ReactNode;
  subtitle?: string;
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
              <p className="text-3xl font-bold tracking-tight drop-shadow-lg">{value}</p>
              {subtitle && <p className="text-xs text-white/60 mt-1">{subtitle}</p>}
            </div>
            {icon && (
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/20">
                {icon}
              </div>
            )}
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-white/20">
              <TrendingUp className="w-3.5 h-3.5" />
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
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF6B23] to-[#FA9C31]">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {icon && (
            <div className="w-10 h-10 bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20 rounded-xl flex items-center justify-center text-[#EF6B23] group-hover:scale-110 transition-transform duration-300 border border-[#EF6B23]/20 backdrop-blur-sm">
              {icon}
            </div>
          )}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2.5 pt-2.5 border-t border-[#626262]/30 ${isPositiveTrend ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{isPositiveTrend ? '+' : ''}{trend}%</span>
            <span className="text-[10px] text-[#626262] ml-0.5">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Toast Notification Component
// ============================================
function Toast({ 
  message, 
  type = 'success',
  onClose 
}: { 
  message: string; 
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl border ${colors[type]} backdrop-blur-xl shadow-xl animate-in slide-in-from-top-5 duration-300`}>
      <div className="flex items-center gap-3">
        <Check className="w-5 h-5" />
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-2 hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================
export default function ReferralPage() {
  // State Management
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalCodes, setTotalCodes] = useState(0);
  const [meta, setMeta] = useState<ApiResponse['meta'] | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'used'>('all');
  const [searchDebounce, setSearchDebounce] = useState('');

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch codes on mount and page change
  useEffect(() => {
    fetchReferralCodes();
  }, [currentPage]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Fetch Referral Codes with better error handling
  const fetchReferralCodes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/admin/invitation/get-codes?page=${currentPage}&limit=${limit}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();
      
      // FIXED: Handle both response structures
      if (data.success && data.data && Array.isArray(data.data)) {
        const transformedCodes = data.data.map((code) => ({
          id: code.id,
          code: code.code,
          email: code.email,
          userId: code.userId || null,
          createdAt: formatDate(code.createdAt),
          isUsed: code.isUsed,
          usedAt: code.usedAt ? formatDate(code.usedAt) : null,
          expiresAt: code.expiresAt || null,
        }));
        
        setCodes(transformedCodes);
        setMeta(data.meta || null);
        setTotalCodes(data.meta?.total || transformedCodes.length);
        
        if (transformedCodes.length === 0 && currentPage > 1) {
          setCurrentPage(1); // Reset to first page if no data
        }
      } else {
        throw new Error(data.message || 'Invalid response structure from server');
      }
    } catch (err: any) {
      console.error('Error fetching codes:', err);
      const errorMessage = err.message || 'Failed to fetch invitation codes';
      setError(errorMessage);
      setToast({ message: errorMessage, type: 'error' });
      setCodes([]);
      setTotalCodes(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate New Code with better feedback
  const generateNewCode = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await apiFetch(`${API_BASE_URL}/admin/invitation/generate-code`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      // Handle 204 No Content or 201 Created
      if (response.status === 204 || response.status === 201) {
        setToast({ message: 'Invitation code generated successfully!', type: 'success' });
        await fetchReferralCodes();
        return;
      }

      if (response.ok) {
        try {
          const data = await response.json();
          if (data.success) {
            setToast({ message: 'Invitation code generated successfully!', type: 'success' });
            await fetchReferralCodes();
          } else {
            throw new Error(data.message || 'Failed to generate code');
          }
        } catch (parseError) {
          // If parsing fails but status is ok, still refresh
          setToast({ message: 'Code generated successfully!', type: 'success' });
          await fetchReferralCodes();
        }
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate code');
      }
    } catch (err: any) {
      console.error('Error generating code:', err);
      const errorMessage = err.message || 'Failed to generate code';
      setError(errorMessage);
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy Code with feedback
  const copyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setToast({ message: `Code "${code}" copied to clipboard!`, type: 'success' });
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Code', 'Status', 'User Name', 'Email', 'Created At', 'Used At', 'Expires At'];
    const rows = filteredCodes.map(code => [
      code.code,
      code.isUsed ? 'Used' : 'Available',
      code.userId ? `${code.userId.firstName} ${code.userId.lastName}` : 'Unassigned',
      code.userId?.email || code.email || 'N/A',
      code.createdAt,
      code.usedAt || 'N/A',
      code.expiresAt || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invitation-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    setToast({ message: 'Codes exported successfully!', type: 'success' });
  };

  // Filtered codes with memoization
  const filteredCodes = useMemo(() => {
    return codes.filter((code) => {
      const userName = code.userId 
        ? `${code.userId.firstName} ${code.userId.lastName}` 
        : 'Unassigned';
      const userEmail = code.userId?.email || code.email || 'N/A';
      
      const matchesSearch = 
        code.code.toLowerCase().includes(searchDebounce.toLowerCase()) ||
        userName.toLowerCase().includes(searchDebounce.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchDebounce.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'available' && !code.isUsed) ||
        (statusFilter === 'used' && code.isUsed);
      
      return matchesSearch && matchesStatus;
    });
  }, [codes, searchDebounce, statusFilter]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Stats calculations
  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all';
  const availableCount = codes.filter(c => !c.isUsed).length;
  const usedCount = codes.filter(c => c.isUsed).length;
  const conversionRate = totalCodes > 0 ? ((usedCount / totalCodes) * 100).toFixed(1) : '0.0';
  const expiringCount = codes.filter(c => {
    const days = getDaysUntilExpiry(c.expiresAt);
    return days !== null && days <= 7 && days > 0;
  }).length;

  return (
    <div className="min-h-screen bg-[#1a1a1a] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Toast Notifications */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            Invitation Codes 
            <Share2 className="w-7 h-7 text-[#EF6B23]" />
          </h1>
          <p className="text-sm text-gray-400">Generate and manage unique invitation codes for user registration.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={filteredCodes.length === 0}
            className="px-4 py-2.5 bg-[#2a2a2a] text-white rounded-xl hover:bg-[#333333] transition-all flex items-center gap-2 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <button
            onClick={fetchReferralCodes}
            disabled={isLoading}
            className="px-4 py-2.5 bg-[#2a2a2a] text-white rounded-xl hover:bg-[#333333] transition-all flex items-center gap-2 border border-white/10 disabled:opacity-50"
            title="Refresh codes"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-5">
          <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-300 font-medium">Error</p>
            <p className="text-xs text-red-400 mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard 
          title="Total Codes" 
          value={totalCodes} 
          icon={<Barcode className="w-5 h-5" />}
          subtitle="All generated"
        />
        <StatCard 
          title="Active Codes" 
          value={availableCount} 
          variant="primary" 
          icon={<UserPlus className="w-5 h-5" />}
          subtitle="Ready to use"
        />
        <StatCard 
          title="Used Codes" 
          value={usedCount} 
          icon={<Users className="w-5 h-5" />}
          subtitle="Registered users"
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${conversionRate}%`} 
          icon={<TrendingUp className="w-5 h-5" />}
          trend={parseFloat(conversionRate)}
        />
        {expiringCount > 0 && (
          <StatCard 
            title="Expiring Soon" 
            value={expiringCount} 
            icon={<Clock className="w-5 h-5" />}
            subtitle="Within 7 days"
          />
        )}
      </div>

      {/* Generate Button */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Barcode className="w-5 h-5 text-[#EF6B23]" />
              Generate New Invitation Code
            </h3>
            <p className="text-sm text-gray-400">Create a unique code for new users to register. Codes are valid for 15 days.</p>
          </div>
          <button
            onClick={generateNewCode}
            disabled={isGenerating}
            className="px-8 py-3 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#EF6B23]/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 border border-[#FA9C31]/20 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Generate Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-[#EF6B23]" />
          <h3 className="text-lg font-semibold text-white">Filters & Search</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-1.5 border border-red-500/30"
            >
              <X className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Codes</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code, name, or email..."
                className="w-full pl-10 pr-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'used')}
              className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all text-sm cursor-pointer"
            >
              <option value="all">All Status ({totalCodes})</option>
              <option value="available">Available ({availableCount})</option>
              <option value="used">Used ({usedCount})</option>
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#333333]/50 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing <span className="text-white font-semibold">{filteredCodes.length}</span> of <span className="text-white font-semibold">{totalCodes}</span> codes
          </p>
          {meta && (
            <p className="text-xs text-gray-500">
              Page {meta.page} of {meta.totalPages}
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[#333333]/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#EF6B23]" />
              All Invitation Codes
            </h3>
            {!isLoading && filteredCodes.length > 0 && (
              <span className="text-xs text-gray-400 bg-[#151515]/50 px-3 py-1.5 rounded-lg border border-[#333333]/50">
                {filteredCodes.length} {filteredCodes.length === 1 ? 'code' : 'codes'}
              </span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-[#EF6B23]/30 border-t-[#EF6B23] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg font-medium">Loading invitation codes...</p>
            <p className="text-gray-500 text-sm mt-1">Please wait</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#626262]/30 bg-[#1f1f1f]/50">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider">Code</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden lg:table-cell">Email</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden xl:table-cell">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden 2xl:table-cell">Created</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden 2xl:table-cell">Expires</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]/30">
                {filteredCodes.map((code) => {
                  const userName = code.userId 
                    ? `${code.userId.firstName} ${code.userId.lastName}` 
                    : 'Unassigned';
                  const userEmail = code.userId?.email || code.email || 'Not assigned';
                  const initials = code.userId
                    ? `${code.userId.firstName[0]}${code.userId.lastName[0]}`.toUpperCase()
                    : '?';
                  const daysUntilExpiry = getDaysUntilExpiry(code.expiresAt);
                  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;

                  return (
                    <tr key={code.id} className="group hover:bg-[#1f1f1f]/50 transition-all">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                            !code.isUsed 
                              ? 'bg-[#4AD991]/20 text-[#4AD991] border border-[#4AD991]/30 group-hover:bg-[#4AD991]/30' 
                              : 'bg-red-500/20 text-red-400 border border-red-500/30 group-hover:bg-red-500/30'
                          }`}>
                            {code.code.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-mono font-semibold text-white text-sm">{code.code}</p>
                            {isExpiringSoon && (
                              <p className="text-[10px] text-orange-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                Expires in {daysUntilExpiry} days
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20 rounded-full flex items-center justify-center border border-[#EF6B23]/20 group-hover:scale-110 transition-transform">
                            <span className="text-xs font-bold text-[#EF6B23]">{initials}</span>
                          </div>
                          <span className="text-white text-sm font-medium">{userName}</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300 text-sm">{userEmail}</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6 hidden xl:table-cell">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
                          !code.isUsed 
                            ? 'bg-[#4AD991]/20 text-[#4AD991] border border-[#4AD991]/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${!code.isUsed ? 'bg-[#4AD991]' : 'bg-red-400'}`}></div>
                          {!code.isUsed ? 'Available' : 'Used'}
                        </span>
                      </td>
                      
                      <td className="py-4 px-6 hidden 2xl:table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400 text-xs">{code.createdAt}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 hidden 2xl:table-cell">
                        {code.expiresAt ? (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400 text-xs">
                              {formatDate(code.expiresAt)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">No expiry</span>
                        )}
                      </td>
                      
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => copyCode(code.code)}
                          className="p-2.5 text-[#EF6B23] hover:text-[#FA9C31] hover:bg-[#EF6B23]/20 rounded-lg transition-all active:scale-95"
                          title="Copy invitation code"
                        >
                          {copiedCode === code.code ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredCodes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Barcode className="w-10 h-10 text-[#626262] opacity-50" />
            </div>
            <p className="text-gray-400 text-lg font-medium mb-2">
              {hasActiveFilters ? 'No matching codes found' : 'No invitation codes yet'}
            </p>
            <p className="text-[#626262] text-sm mb-6">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search terms' 
                : 'Generate your first invitation code to get started'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 bg-[#EF6B23]/20 text-[#EF6B23] rounded-lg hover:bg-[#EF6B23]/30 transition-all font-semibold text-sm flex items-center gap-2 mx-auto"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            ) : (
              <button
                onClick={generateNewCode}
                disabled={isGenerating}
                className="px-6 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-lg hover:shadow-lg hover:shadow-[#EF6B23]/25 transition-all font-semibold text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                Generate First Code
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && !isLoading && (
          <div className="p-6 border-t border-[#333333]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              Page <span className="text-white font-semibold">{meta.page}</span> of <span className="text-white font-semibold">{meta.totalPages}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={!meta.hasPrevious}
                className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!meta.hasPrevious}
                className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(meta.totalPages, prev + 1))}
                disabled={!meta.hasNext}
                className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(meta.totalPages)}
                disabled={!meta.hasNext}
                className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[#EF6B23]" />
          How Invitation Codes Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50 hover:border-[#EF6B23]/30 transition-all">
            <div className="w-10 h-10 bg-[#EF6B23]/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <UserPlus className="w-5 h-5 text-[#EF6B23]" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">1. Generate Code</h4>
              <p className="text-gray-400 text-xs">Create unique invitation codes with 15-day validity</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50 hover:border-[#4AD991]/30 transition-all">
            <div className="w-10 h-10 bg-[#4AD991]/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Copy className="w-5 h-5 text-[#4AD991]" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">2. Share Code</h4>
              <p className="text-gray-400 text-xs">Copy and share codes with new users via email or chat</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#151515]/50 border border-[#333333]/50 hover:border-red-500/30 transition-all">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Users className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">3. User Registration</h4>
              <p className="text-gray-400 text-xs">Code is validated and marked as used during signup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
