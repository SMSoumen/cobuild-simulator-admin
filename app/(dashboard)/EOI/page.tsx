"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, Search, Filter, X, Download, RefreshCw,
  Calendar, Mail, Phone, User, Building2, CheckCircle2,
  Clock, ChevronLeft, ChevronRight, FileText, TrendingUp,
  Eye, Star, Check, XCircle, SearchX
} from 'lucide-react';
import type { ReactNode } from 'react';
import { apiFetch } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface InvestorType {
  id: string;
  code: string;
  label: string;
  isActive: boolean;
}

interface EOIRecord {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  investorType: InvestorType | string;   // API returns object; guard against string too
  foundingCircleOptIn: boolean;
  interestReason?: string | null;
  consentGiven: boolean;
  consentVersion: string;
  status: 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  notes?: string | null;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: EOIRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// ─── Helper: resolves investorType whether object or legacy string ─────────────
const resolveInvestorType = (type: InvestorType | string): { code: string; label: string } => {
  if (type && typeof type === 'object') {
    return { code: type.code, label: type.label };
  }
  const str = String(type ?? '');
  const labelMap: Record<string, string> = {
    SOLOINVESTOR: 'Solo Investor',
    INVESTMENTENTITY: 'Investment Entity',
    ORGANIZATION: 'Organization',
    SOLO_INVESTOR: 'Solo Investor',
    INVESTMENT_ENTITY: 'Investment Entity',
  };
  return { code: str, label: labelMap[str] ?? str.replace(/_/g, ' ') };
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({
  title, value, variant = 'default', trend, icon, subtitle
}: {
  title: string;
  value: string | number;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  trend?: number;
  icon?: ReactNode;
  subtitle?: string;
}) {
  const isPositiveTrend = trend && trend > 0;

  if (variant === 'primary') {
    return (
      <div className="group relative bg-gradient-to-br from-[#EF6B23] to-[#E4782C] p-5 rounded-2xl shadow-xl shadow-[#EF6B23]/20 text-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#EF6B23]/30 hover:scale-[1.01] border border-[#FA9C31]/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/0 to-transparent opacity-50" />
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
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

  if (variant === 'success') {
    return (
      <div className="group relative bg-gradient-to-br from-[#4AD991]/20 to-[#3ac882]/20 p-5 rounded-2xl border border-[#4AD991]/30 shadow-xl hover:shadow-2xl hover:shadow-[#4AD991]/10 transition-all duration-300 hover:scale-[1.01] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#4AD991]/10 via-transparent to-transparent" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-[#4AD991] text-xs font-medium mb-1.5 uppercase tracking-wide">{title}</h3>
              <p className="text-3xl font-bold text-white">{value}</p>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {icon && (
              <div className="w-10 h-10 bg-[#4AD991]/20 rounded-xl flex items-center justify-center text-[#4AD991] group-hover:scale-110 transition-transform duration-300 border border-[#4AD991]/30 backdrop-blur-sm">
                {icon}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-gradient-to-br from-[#2a2a2a] to-[#232323] p-5 rounded-2xl border border-white/10 shadow-xl hover:shadow-2xl hover:shadow-[#EF6B23]/10 transition-all duration-300 hover:scale-[1.01] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-transparent" />
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
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({
  message, type = 'success', onClose
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
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl border ${colors[type]} backdrop-blur-xl shadow-xl`}>
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

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function EOIDetailModal({
  eoi, onClose, onUpdateStatus
}: {
  eoi: EOIRecord;
  onClose: () => void;
  onUpdateStatus: (id: string, status: EOIRecord['status'], notes?: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(eoi.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: EOIRecord['status']) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(eoi.id, status, notes);
    } finally {
      setIsUpdating(false);
    }
  };

  // FIX: use resolveInvestorType helper instead of type.replace()
  const getInvestorTypeLabel = (type: InvestorType | string) =>
    resolveInvestorType(type).label;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      REVIEWED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      APPROVED: 'bg-[#4AD991]/20 text-[#4AD991] border-[#4AD991]/30',
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[status] || styles['PENDING'];
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#2a2a2a]/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20 rounded-xl flex items-center justify-center border border-[#EF6B23]/20">
              <FileText className="w-5 h-5 text-[#EF6B23]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">EOI Details</h2>
              <p className="text-xs text-gray-400">Submitted {new Date(eoi.submittedAt).toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-4 bg-[#151515]/50 rounded-xl border border-white/5">
            <span className="text-sm text-gray-400">Current Status</span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusBadge(eoi.status)}`}>
              {eoi.status}
            </span>
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#EF6B23]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#EF6B23]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Full Name</p>
                  <p className="text-white font-medium">{eoi.fullName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#EF6B23]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-[#EF6B23]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
                  <p className="text-white font-medium text-sm break-all">{eoi.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#EF6B23]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-[#EF6B23]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Phone</p>
                  <p className="text-white font-medium">{eoi.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#EF6B23]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-[#EF6B23]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Investor Type</p>
                  {/* FIX: was getInvestorTypeLabel(eoi.investorType) which crashed */}
                  <p className="text-white font-medium">{getInvestorTypeLabel(eoi.investorType)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Founding Circle */}
          <div className={`p-4 rounded-xl border ${eoi.foundingCircleOptIn ? 'bg-[#4AD991]/10 border-[#4AD991]/30' : 'bg-[#151515]/50 border-white/5'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Star className={`w-5 h-5 ${eoi.foundingCircleOptIn ? 'text-[#4AD991]' : 'text-gray-500'}`} />
              <span className="text-white font-medium">Founding Circle Interest</span>
            </div>
            <p className={`text-sm ml-7 ${eoi.foundingCircleOptIn ? 'text-[#4AD991]' : 'text-gray-400'}`}>
              {eoi.foundingCircleOptIn
                ? '✓ Expressed interest in joining the Founding Circle of Investors'
                : '✗ Not interested in Founding Circle'}
            </p>
          </div>

          {/* Interest Reason */}
          {eoi.interestReason && (
            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-wide">Interest Reason</label>
              <div className="p-4 bg-[#151515]/50 rounded-xl border border-white/5 text-gray-300 text-sm leading-relaxed max-h-40 overflow-y-auto">
                {eoi.interestReason}
              </div>
            </div>
          )}

          {/* Consent */}
          <div className="flex items-center gap-2 p-3 bg-[#4AD991]/10 rounded-lg border border-[#4AD991]/20">
            <CheckCircle2 className="w-4 h-4 text-[#4AD991]" />
            <span className="text-xs text-[#4AD991]">Consent given (Version {eoi.consentVersion})</span>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <label className="text-xs text-gray-500 uppercase tracking-wide">Admin Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this application..."
              className="w-full h-24 px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
            <button
              onClick={() => handleStatusUpdate('APPROVED')}
              disabled={isUpdating || eoi.status === 'APPROVED'}
              className="flex-1 min-w-[120px] px-4 py-3 bg-[#4AD991]/20 text-[#4AD991] border border-[#4AD991]/30 rounded-xl font-semibold hover:bg-[#4AD991]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isUpdating ? <div className="w-4 h-4 border-2 border-[#4AD991]/30 border-t-[#4AD991] rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              Approve
            </button>
            <button
              onClick={() => handleStatusUpdate('REJECTED')}
              disabled={isUpdating || eoi.status === 'REJECTED'}
              className="flex-1 min-w-[120px] px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isUpdating ? <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject
            </button>
            <button
              onClick={() => handleStatusUpdate('REVIEWED')}
              disabled={isUpdating || eoi.status === 'REVIEWED'}
              className="flex-1 min-w-[120px] px-4 py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl font-semibold hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isUpdating ? <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" /> : <Eye className="w-4 h-4" />}
              Mark Reviewed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function EOIAdminPage() {
  const [records, setRecords] = useState<EOIRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState<ApiResponse['meta'] | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EOIRecord['status']>('all');
  // FIX: filter codes now match actual API codes (no underscores)
  const [investorTypeFilter, setInvestorTypeFilter] = useState<'all' | 'SOLOINVESTOR' | 'INVESTMENTENTITY' | 'ORGANIZATION'>('all');
  const [foundingCircleFilter, setFoundingCircleFilter] = useState<'all' | 'true' | 'false'>('all');

  const [selectedEOI, setSelectedEOI] = useState<EOIRecord | null>(null);

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    params.append('page', currentPage.toString());
    params.append('limit', limit.toString());
    if (searchTerm.trim()) params.append('searchTerm', searchTerm.trim());
    if (investorTypeFilter !== 'all') params.append('investorType', investorTypeFilter);
    if (foundingCircleFilter !== 'all') params.append('foundingCircleOptIn', foundingCircleFilter);
    return params.toString();
  }, [currentPage, limit, searchTerm, investorTypeFilter, foundingCircleFilter]);

  const fetchEOIRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryString = buildQueryParams();
      const response = await apiFetch(`${API_BASE_URL}/admin/eoi?${queryString}`, { method: 'GET' });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data: ApiResponse = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setRecords(data.data);
        setMeta(data.meta);
      } else {
        throw new Error(data.message || 'Invalid response structure');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch EOI records';
      setError(msg);
      setToast({ message: msg, type: 'error' });
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEOIRecords(); }, [currentPage, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchEOIRecords();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const updateEOIStatus = async (id: string, status: EOIRecord['status'], notes?: string) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/admin/eoi/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(notes && { notes }) }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      setToast({ message: `Status updated to ${status}`, type: 'success' });
      await fetchEOIRecords();
      setSelectedEOI(null);
    } catch (err: any) {
      setToast({ message: err.message || 'Update failed', type: 'error' });
      throw err;
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Investor Type', 'Founding Circle', 'Status', 'Submitted At', 'Interest Reason'];
    const rows = filteredRecords.map(r => [
      r.fullName,
      r.email,
      r.phoneNumber,
      // FIX: was r.investorType.replace(/_/g, ' ') which crashed on object
      resolveInvestorType(r.investorType).label,
      r.foundingCircleOptIn ? 'Yes' : 'No',
      r.status,
      new Date(r.submittedAt).toLocaleDateString(),
      r.interestReason || 'N/A',
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eoi-records-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setToast({ message: 'Records exported successfully!', type: 'success' });
  };

  const filteredRecords = useMemo(() => {
    if (statusFilter === 'all') return records;
    return records.filter(r => r.status === statusFilter);
  }, [records, statusFilter]);

  const totalRecords = meta?.total || 0;
  const pendingCount = records.filter(r => r.status === 'PENDING').length;
  const approvedCount = records.filter(r => r.status === 'APPROVED').length;
  const foundingCircleCount = records.filter(r => r.foundingCircleOptIn).length;

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || investorTypeFilter !== 'all' || foundingCircleFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setInvestorTypeFilter('all');
    setFoundingCircleFilter('all');
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      REVIEWED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      APPROVED: 'bg-[#4AD991]/20 text-[#4AD991] border-[#4AD991]/30',
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[status] || styles['PENDING'];
  };

  // FIX: use resolveInvestorType to get code safely from object or string
  const getInvestorTypeIcon = (type: InvestorType | string) => {
    const { code } = resolveInvestorType(type);
    if (code === 'SOLOINVESTOR' || code === 'SOLO_INVESTOR') return <User className="w-4 h-4" />;
    if (code === 'INVESTMENTENTITY' || code === 'INVESTMENT_ENTITY') return <Building2 className="w-4 h-4" />;
    if (code === 'ORGANIZATION') return <Users className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  // FIX: was type.replace(/_/g, ' ') – crashed at line 583 when type was an object
  const getInvestorTypeLabel = (type: InvestorType | string) =>
    resolveInvestorType(type).label;

  return (
    <div className="min-h-screen bg-[#1a1a1a] space-y-6 p-4 sm:p-6 lg:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedEOI && (
        <EOIDetailModal eoi={selectedEOI} onClose={() => setSelectedEOI(null)} onUpdateStatus={updateEOIStatus} />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            Expression of Interest
            <FileText className="w-7 h-7 text-[#EF6B23]" />
          </h1>
          <p className="text-sm text-gray-400">Manage and review investor expressions of interest.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={filteredRecords.length === 0}
            className="px-4 py-2.5 bg-[#2a2a2a] text-white rounded-xl hover:bg-[#333333] transition-all flex items-center gap-2 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={fetchEOIRecords}
            disabled={isLoading}
            className="px-4 py-2.5 bg-[#2a2a2a] text-white rounded-xl hover:bg-[#333333] transition-all flex items-center gap-2 border border-white/10 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-300 font-medium">Error</p>
            <p className="text-xs text-red-400 mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Submissions" value={totalRecords} icon={<FileText className="w-5 h-5" />} subtitle="All time" />
        <StatCard title="Pending Review" value={pendingCount} variant="primary" icon={<Clock className="w-5 h-5" />} subtitle="Awaiting action" />
        <StatCard title="Approved" value={approvedCount} variant="success" icon={<CheckCircle2 className="w-5 h-5" />} subtitle="Qualified investors" />
        <StatCard title="Founding Circle" value={foundingCircleCount} icon={<Star className="w-5 h-5" />} subtitle="Expressed interest" />
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
              <X className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Investor Type</label>
            {/* FIX: values now match actual API codes: SOLOINVESTOR, INVESTMENTENTITY */}
            <select
              value={investorTypeFilter}
              onChange={(e) => { setInvestorTypeFilter(e.target.value as any); setCurrentPage(1); }}
              className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all text-sm cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="SOLOINVESTOR">Solo Investor</option>
              <option value="INVESTMENTENTITY">Investment Entity</option>
              <option value="ORGANIZATION">Organization</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Founding Circle</label>
            <select
              value={foundingCircleFilter}
              onChange={(e) => { setFoundingCircleFilter(e.target.value as any); setCurrentPage(1); }}
              className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all text-sm cursor-pointer"
            >
              <option value="all">All</option>
              <option value="true">Interested</option>
              <option value="false">Not Interested</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mt-4 pt-4 border-t border-[#333333]/50">
          <div className="flex flex-wrap gap-2">
            {(['all', 'PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-[#EF6B23] text-white shadow-lg shadow-[#EF6B23]/25'
                    : 'bg-[#151515]/50 text-gray-400 hover:text-white hover:bg-[#333333]'
                }`}
              >
                {status === 'all' ? 'All Status' : status}
                {status !== 'all' && (
                  <span className="ml-2 text-xs opacity-70">
                    {records.filter(r => r.status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing <span className="text-white font-semibold">{filteredRecords.length}</span> of{' '}
            <span className="text-white font-semibold">{totalRecords}</span> records
          </p>
          {meta && (
            <p className="text-xs text-gray-500">
              Page {meta.page} of {meta.totalPages} • {meta.limit} per page
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[#333333]/50 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#EF6B23]" /> All Submissions
          </h3>
          {!isLoading && filteredRecords.length > 0 && (
            <span className="text-xs text-gray-400 bg-[#151515]/50 px-3 py-1.5 rounded-lg border border-[#333333]/50">
              {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-[#EF6B23]/30 border-t-[#EF6B23] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">Loading records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#626262]/30 bg-[#1f1f1f]/50">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider">Applicant</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider hidden xl:table-cell">Submitted</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#333333]/30">
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="group hover:bg-[#1f1f1f]/50 transition-all cursor-pointer"
                    onClick={() => setSelectedEOI(record)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20 rounded-full flex items-center justify-center border border-[#EF6B23]/20 group-hover:scale-110 transition-transform">
                          <span className="text-sm font-bold text-[#EF6B23]">
                            {record.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{record.fullName}</p>
                          {record.foundingCircleOptIn && (
                            <p className="text-[10px] text-[#4AD991] flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 fill-current" /> Founding Circle
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Mail className="w-3.5 h-3.5 text-gray-500" />
                          <span className="truncate max-w-[180px]">{record.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                          <span>{record.phoneNumber}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#151515]/50 rounded-lg flex items-center justify-center text-[#EF6B23]">
                          {getInvestorTypeIcon(record.investorType)}
                        </div>
                        {/* FIX: getInvestorTypeLabel now handles object safely */}
                        <span className="text-gray-300 text-sm hidden sm:inline">
                          {getInvestorTypeLabel(record.investorType)}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border ${getStatusBadge(record.status)}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          record.status === 'APPROVED' ? 'bg-[#4AD991]'
                          : record.status === 'REJECTED' ? 'bg-red-400'
                          : record.status === 'REVIEWED' ? 'bg-blue-400'
                          : 'bg-yellow-400'
                        }`} />
                        {record.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-xs">{new Date(record.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedEOI(record); }}
                        className="p-2.5 text-[#EF6B23] hover:text-[#FA9C31] hover:bg-[#EF6B23]/20 rounded-lg transition-all active:scale-95"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredRecords.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <SearchX className="w-10 h-10 text-[#626262] opacity-50" />
            </div>
            <p className="text-gray-400 text-lg font-medium mb-2">
              {hasActiveFilters ? 'No matching records found' : 'No submissions yet'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="px-4 py-2 bg-[#EF6B23]/20 text-[#EF6B23] rounded-lg hover:bg-[#EF6B23]/30 transition-all text-sm border border-[#EF6B23]/30">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="p-6 border-t border-[#333333]/50 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Page <span className="text-white font-semibold">{meta.page}</span> of{' '}
              <span className="text-white font-semibold">{meta.totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={!meta.hasPrevious || isLoading}
                className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(meta.page - 2, meta.totalPages - 4)) + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      page === meta.page
                        ? 'bg-[#EF6B23] text-white shadow-lg shadow-[#EF6B23]/25'
                        : 'bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#333333] border border-white/10'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={!meta.hasNext || isLoading}
                className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] transition-all border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}