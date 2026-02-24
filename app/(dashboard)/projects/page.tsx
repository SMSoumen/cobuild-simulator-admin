"use client";
import { useState, useEffect } from 'react';
import {
  Folder, UploadCloud, Building2, Edit3, Trash2, Percent,
  Layers, BarChart3, Image as ImageIcon, X, Calendar,
  DollarSign, Plus, Minus, AlertTriangle, RefreshCw, Eye,
  MapPin, FileText, Check, ChevronLeft, ChevronRight, TrendingUp
} from 'lucide-react';
import type { ReactNode } from 'react';
import { apiFetch, auth } from '@/lib/auth';
import imageCompression from 'browser-image-compression';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_COMPRESSED_SIZE = 2 * 1024 * 1024;

const compressionOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1280,
  useWebWorker: true,
  fileType: 'image/jpeg' as const,
  initialQuality: 0.7,
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({
  message, type = 'success', onClose
}: {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };

  return (
    <div className={`fixed top-4 right-4 z-[100] p-4 rounded-xl border ${styles[type]} backdrop-blur-xl shadow-xl max-w-sm`}>
      <div className="flex items-start gap-3">
        <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="hover:opacity-70 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, variant = 'default', icon }: {
  title: string;
  value: string | number;
  variant?: 'default' | 'primary';
  icon?: ReactNode;
}) {
  if (variant === 'primary') {
    return (
      <div className="group relative bg-gradient-to-br from-[#EF6B23] to-[#E4782C] p-4 rounded-xl shadow-lg shadow-[#EF6B23]/20 text-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-[#FA9C31]/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/0 to-transparent opacity-50" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h3 className="text-white/80 text-xs font-medium uppercase tracking-wide mb-1">{title}</h3>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          {icon && (
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="group relative bg-gradient-to-br from-[#2a2a2a] to-[#232323] p-4 rounded-xl border border-white/10 shadow-lg hover:shadow-xl hover:shadow-[#EF6B23]/10 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-transparent" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">{title}</h3>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF6B23] to-[#FA9C31]">{value}</p>
        </div>
        {icon && (
          <div className="w-9 h-9 bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20 rounded-lg flex items-center justify-center text-[#EF6B23] group-hover:scale-110 transition-transform border border-[#EF6B23]/20">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Interfaces ───────────────────────────────────────────────────────────────
type Phase = 'PLANNING' | 'DEVELOPMENT' | 'CONSTRUCTION' | 'COMPLETION' | 'OPERATIONAL';
type UsageMode = 'SIMULATOR_ONLY' | 'REAL_ONLY' | 'SIMULATOR_AND_REAL';

interface ProgressLog {
  id: string;
  projectId: string;
  completionPct: number;
  imageUrl: string;
  currentPhase?: Phase | null;
  createdAt: string;
}

interface Pool {
  id: string;
  projectId: string;
  mode: string;
  asset: string;
  poolCap: string | number;
  totalInvested: string | number;
  isActive: boolean;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  imageUrl: string;
  timelineDays: number;
  totalValue: string | number;
  returnPercent: string | number;
  usage: string;
  location?: string;
  projectOverview?: string;
  projectDetails?: string;
  smartContractUrl?: string;
  createdAt: string;
  updatedAt: string;
  pool?: Pool;
  progressLogs?: ProgressLog[];
}

interface ProgressFormItem {
  completionPct: number;
  image: File | null;
  imagePreview: string;
  currentPhase: Phase | '';
}

interface UploadForm {
  name: string;
  image: File | null;
  imagePreview: string;
  timelineDays: string;
  totalValue: string;
  returnPercent: string;
  usage: UsageMode;
  poolMode: string;
  poolAsset: string;
  poolCap: string;
  location: string;
  projectOverview: string;
  projectDetails: string;
  progressUpdates: ProgressFormItem[];
}

const PHASE_OPTIONS: Phase[] = ['PLANNING', 'DEVELOPMENT', 'CONSTRUCTION', 'COMPLETION', 'OPERATIONAL'];
const PHASE_COLORS: Record<Phase, string> = {
  PLANNING:     'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DEVELOPMENT:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  CONSTRUCTION: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  COMPLETION:   'bg-[#EF6B23]/20 text-[#EF6B23] border-[#EF6B23]/30',
  OPERATIONAL:  'bg-[#4AD991]/20 text-[#4AD991] border-[#4AD991]/30',
};

const USAGE_OPTIONS: { value: UsageMode; label: string }[] = [
  { value: 'SIMULATOR_ONLY',    label: 'Simulator Only' },
  { value: 'REAL_ONLY',         label: 'Real Only' },
  { value: 'SIMULATOR_AND_REAL', label: 'Simulator & Real' },
];

// ✅ FIXED: usage is 'SIMULATOR_ONLY' (with underscores) — server requires this exact value
const DEFAULT_FORM: UploadForm = {
  name: '',
  image: null,
  imagePreview: '',
  timelineDays: '',
  totalValue: '',
  returnPercent: '',
  usage: 'SIMULATOR_ONLY',
  poolMode: 'SIMULATION',
  poolAsset: 'USD',
  poolCap: '',
  location: '',
  projectOverview: '',
  projectDetails: '',
  progressUpdates: [],
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [uploadForm, setUploadForm] = useState<UploadForm>(DEFAULT_FORM);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') =>
    setToast({ message, type });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const getLatestProgress = (project: Project) => {
    if (!project.progressLogs?.length) return 0;
    return Math.max(...project.progressLogs.map(p => p.completionPct));
  };

  const getLatestPhase = (project: Project): Phase | null => {
    if (!project.progressLogs?.length) return null;
    const sorted = [...project.progressLogs].sort((a, b) => b.completionPct - a.completionPct);
    return sorted[0]?.currentPhase ?? null;
  };

  const getUsageLabel = (usage: string) =>
    USAGE_OPTIONS.find(u => u.value === usage)?.label ?? usage;

  // ─── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!auth.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
    fetchProjects(currentPage);
  }, [currentPage]);

  // ─── Safe JSON parse ─────────────────────────────────────────────────────────
  const safeJson = async (response: Response) => {
    const ct = response.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Non-JSON response (${response.status}): ${text.substring(0, 100)}`);
    }
    return response.json();
  };

  // ─── API Calls ───────────────────────────────────────────────────────────────
  const fetchProjects = async (page: number = 1, limit: number = 20) => {
    setIsLoadingProjects(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/projects?page=${page}&limit=${limit}`, { method: 'GET' });
      if (!res.ok) { const d = await safeJson(res); throw new Error(d.message || `HTTP ${res.status}`); }
      const data = await safeJson(res);
      if (data.success) {
        setProjects(data.data || []);
        setTotalProjects(data.meta?.total || 0);
        setTotalPages(data.meta?.totalPages || 1);
        setCurrentPage(data.meta?.page || page);
      } else throw new Error(data.message || 'Failed to load projects');
    } catch (err: any) {
      showToast(err.message || 'Failed to load projects', 'error');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchSingleProject = async (projectId: string) => {
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/projects/${projectId}`, { method: 'GET' });
      if (!res.ok) { const d = await safeJson(res); throw new Error(d.message || 'Failed to fetch project'); }
      const data = await safeJson(res);
      if (data.success) { setViewingProject(data.data); setShowViewModal(true); }
      else throw new Error(data.message || 'Failed to load project details');
    } catch (err: any) {
      showToast(err.message || 'Failed to load project details', 'error');
    }
  };

  // ─── Image compression ───────────────────────────────────────────────────────
  const compressImage = async (file: File): Promise<File> => {
    setIsCompressing(true);
    try {
      const compressed = await imageCompression(file, compressionOptions);
      if (compressed.size > MAX_COMPRESSED_SIZE)
        throw new Error(`Image too large after compression (${formatFileSize(compressed.size)}). Max: ${formatFileSize(MAX_COMPRESSED_SIZE)}.`);
      return compressed;
    } finally {
      setIsCompressing(false);
    }
  };

  const processImageFile = async (file: File, onSuccess: (compressed: File, preview: string) => void) => {
    if (!file.type.startsWith('image/')) { showToast('Please select a valid image file', 'error'); return; }
    if (file.size > MAX_FILE_SIZE) { showToast(`File too large (${formatFileSize(file.size)}). Max: ${formatFileSize(MAX_FILE_SIZE)}`, 'error'); return; }
    try {
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onload = (e) => onSuccess(compressed, e.target?.result as string);
      reader.readAsDataURL(compressed);
    } catch (err: any) {
      showToast(err.message || 'Failed to process image', 'error');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file, (compressed, preview) =>
      setUploadForm(f => ({ ...f, image: compressed, imagePreview: preview })));
  };

  const handleProgressImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file, (compressed, preview) =>
      setUploadForm(f => {
        const updated = [...f.progressUpdates];
        updated[index] = { ...updated[index], image: compressed, imagePreview: preview };
        return { ...f, progressUpdates: updated };
      }));
  };

  const addProgressUpdate = () =>
    setUploadForm(f => ({
      ...f,
      progressUpdates: [...f.progressUpdates, { completionPct: 0, image: null, imagePreview: '', currentPhase: '' }],
    }));

  const removeProgressUpdate = (index: number) =>
    setUploadForm(f => ({ ...f, progressUpdates: f.progressUpdates.filter((_, i) => i !== index) }));

  const updateProgress = (index: number, patch: Partial<ProgressFormItem>) =>
    setUploadForm(f => {
      const updated = [...f.progressUpdates];
      updated[index] = { ...updated[index], ...patch };
      return { ...f, progressUpdates: updated };
    });

  // ─── Build FormData ───────────────────────────────────────────────────────────
  const buildFormData = (includeImage = true) => {
    const fd = new FormData();
    fd.append('name', uploadForm.name);
    fd.append('timelineDays', uploadForm.timelineDays);
    fd.append('totalValue', uploadForm.totalValue);
    fd.append('returnPercent', uploadForm.returnPercent || '15.75');
    fd.append('usage', uploadForm.usage);
    fd.append('pool[mode]', uploadForm.poolMode);
    fd.append('pool[asset]', uploadForm.poolAsset);
    fd.append('pool[poolCap]', uploadForm.poolCap || uploadForm.totalValue);
    if (uploadForm.location) fd.append('location', uploadForm.location);
    if (uploadForm.projectOverview) fd.append('projectOverview', uploadForm.projectOverview);
    if (uploadForm.projectDetails) fd.append('projectDetails', uploadForm.projectDetails);
    if (includeImage && uploadForm.image) fd.append('imageUrl', uploadForm.image);
    uploadForm.progressUpdates.forEach((p, i) => {
      fd.append(`progressUpdates[${i}][completionPct]`, p.completionPct.toString());
      if (p.currentPhase) fd.append(`progressUpdates[${i}][currentPhase]`, p.currentPhase);
      if (p.image) fd.append(`progressUpdates[${i}][imageUrl]`, p.image);
    });
    return fd;
  };

  // ─── Error handler helper ────────────────────────────────────────────────────
  const extractError = async (res: Response): Promise<string> => {
    const rawText = await res.text();
    try {
      const parsed = JSON.parse(rawText);
      return parsed.message || `HTTP ${res.status}`;
    } catch {
      return `HTTP ${res.status}: ${rawText.substring(0, 120)}`;
    }
  };

  // ─── Submit: Create ───────────────────────────────────────────────────────────
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name || !uploadForm.image || !uploadForm.timelineDays || !uploadForm.totalValue) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/projects`, {
        method: 'POST',
        body: buildFormData(true),
      });
      if (!res.ok) throw new Error(await extractError(res));
      const data = await safeJson(res);
      if (data.success) {
        showToast('Project created successfully!', 'success');
        closeModal();
        fetchProjects(1);
      } else throw new Error(data.message || 'Failed to create project');
    } catch (err: any) {
      showToast(err.message || 'Failed to create project', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Submit: Edit ─────────────────────────────────────────────────────────────
  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !uploadForm.name || !uploadForm.timelineDays || !uploadForm.totalValue) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/projects/${editingProject.id}`, {
        method: 'PUT',
        body: buildFormData(!!uploadForm.image),
      });
      if (!res.ok) throw new Error(await extractError(res));
      const data = await safeJson(res);
      if (data.success) {
        showToast('Project updated successfully!', 'success');
        closeModal();
        fetchProjects(currentPage);
      } else throw new Error(data.message || 'Failed to update project');
    } catch (err: any) {
      showToast(err.message || 'Failed to update project', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────────
  const deleteProject = async (projectId: string) => {
    setIsLoading(true);
    setDeleteConfirmId(null);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await extractError(res));
      const data = await safeJson(res);
      if (data.success) {
        showToast('Project deleted successfully!', 'success');
        fetchProjects(currentPage);
      } else throw new Error(data.message || 'Failed to delete project');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete project', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project);
    setUploadForm({
      name: project.name,
      image: null,
      imagePreview: project.imageUrl,
      timelineDays: String(project.timelineDays),
      totalValue: String(project.totalValue),
      returnPercent: String(project.returnPercent),
      // ✅ FIXED: default fallback uses correct underscore format
      usage: (project.usage as UsageMode) || 'SIMULATOR_ONLY',
      poolMode: project.pool?.mode || 'SIMULATION',
      poolAsset: project.pool?.asset || 'USD',
      poolCap: String(project.pool?.poolCap || project.totalValue),
      location: project.location || '',
      projectOverview: project.projectOverview || '',
      projectDetails: project.projectDetails || '',
      progressUpdates: (project.progressLogs || []).map(p => ({
        completionPct: p.completionPct,
        image: null,
        imagePreview: p.imageUrl,
        currentPhase: p.currentPhase || '',
      })),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setUploadForm(DEFAULT_FORM);
  };

  // ─── Stats ────────────────────────────────────────────────────────────────────
  const activeCount = projects.filter(p => p.pool?.isActive).length;
  const totalProgressLogs = projects.reduce((acc, p) => acc + (p.progressLogs?.length || 0), 0);
  const avgProgress = projects.length
    ? Math.round(projects.reduce((acc, p) => acc + getLatestProgress(p), 0) / projects.length)
    : 0;

  // ─── Shared input class ───────────────────────────────────────────────────────
  const inputCls = "w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all text-sm";
  const selectCls = "w-full px-3 py-2.5 bg-[#151515]/80 border border-[#626262]/30 rounded-lg text-white text-sm focus:outline-none focus:border-[#EF6B23] cursor-pointer";

  return (
    <div className="min-h-screen bg-[#1a1a1a] space-y-6 p-4 sm:p-6 lg:p-8">

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Compressing indicator */}
      {isCompressing && (
        <div className="fixed top-4 right-4 z-50 bg-[#EF6B23] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="text-sm font-semibold">Compressing image…</span>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] rounded-2xl border border-white/10 p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Delete Project?</h3>
            <p className="text-sm text-gray-400 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2.5 bg-[#151515]/80 border border-white/10 text-white rounded-xl hover:bg-[#333333] transition-all text-sm font-medium">
                Cancel
              </button>
              <button onClick={() => deleteProject(deleteConfirmId)} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all text-sm font-semibold">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API warning */}
      {!API_BASE_URL && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-500 mb-0.5">API Not Configured</h4>
            <p className="text-xs text-red-400/80">Set NEXT_PUBLIC_API_BASE_URL in your .env.local file</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
            Project Management
            <Building2 className="w-7 h-7 text-[#EF6B23]" />
          </h1>
          <p className="text-sm text-gray-400">Manage construction projects, pools and progress tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchProjects(currentPage)}
            disabled={isLoadingProjects}
            className="p-2.5 bg-[#2a2a2a] text-white rounded-xl hover:bg-[#333333] transition-all border border-white/10 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingProjects ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setEditingProject(null); setUploadForm(DEFAULT_FORM); setShowModal(true); }}
            disabled={isCompressing || !API_BASE_URL}
            className="px-5 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#EF6B23]/25 hover:scale-[1.02] transition-all flex items-center gap-2 border border-[#FA9C31]/20 text-sm disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            Add Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Projects" value={totalProjects} variant="primary" icon={<Building2 className="w-4 h-4" />} />
        <StatCard title="Active Pools"   value={activeCount}       icon={<Layers className="w-4 h-4" />} />
        <StatCard title="Progress Logs"  value={totalProgressLogs} icon={<BarChart3 className="w-4 h-4" />} />
        <StatCard title="Avg Progress"   value={`${avgProgress}%`} icon={<Percent className="w-4 h-4" />} />
      </div>

      {/* Projects Grid */}
      {isLoadingProjects ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#EF6B23]/30 border-t-[#EF6B23] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading projects…</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-[#2a2a2a] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Folder className="w-10 h-10 text-[#626262]" />
          </div>
          <p className="text-gray-400 text-lg font-medium mb-2">No projects yet</p>
          <p className="text-gray-500 text-sm mb-6">Add your first project to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold text-sm"
          >
            Add First Project
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => {
              const latestProgress = getLatestProgress(project);
              const latestPhase    = getLatestPhase(project);
              return (
                <div key={project.id} className="relative bg-gradient-to-br from-[#2a2a2a] to-[#232323] rounded-xl border border-white/10 shadow-lg hover:shadow-xl hover:shadow-[#EF6B23]/10 transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="relative h-44 flex-shrink-0 overflow-hidden">
                    <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <button onClick={() => fetchSingleProject(project.id)} className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                    {latestPhase && (
                      <span className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-[10px] font-semibold border ${PHASE_COLORS[latestPhase]}`}>
                        {latestPhase}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-3 flex-grow">
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">{project.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{project.timelineDays}d</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{formatCurrency(project.totalValue)}</span>
                        <span className="flex items-center gap-1 text-[#EF6B23]"><TrendingUp className="w-3 h-3" />{project.returnPercent}%</span>
                      </div>
                      {project.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />{project.location}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-semibold text-white">{latestProgress}%</span>
                      </div>
                      <div className="w-full bg-[#333333]/50 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-[#EF6B23] to-[#FA9C31] h-1.5 rounded-full transition-all duration-500" style={{ width: `${latestProgress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {project.progressLogs?.length || 0} log{(project.progressLogs?.length || 0) !== 1 ? 's' : ''}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${
                        project.pool?.isActive
                          ? 'bg-[#4AD991]/10 text-[#4AD991] border-[#4AD991]/20'
                          : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      }`}>
                        {project.pool?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-auto pt-1">
                      <button
                        onClick={() => startEditProject(project)}
                        disabled={isLoading || isCompressing}
                        className="flex-1 py-2 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-[#EF6B23]/30 transition-all disabled:opacity-50"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(project.id)}
                        disabled={isLoading || isCompressing}
                        className="px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] border border-white/10 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === currentPage ? 'bg-[#EF6B23] text-white shadow-lg shadow-[#EF6B23]/25' : 'bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#333333] border border-white/10'}`}>
                    {page}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] border border-white/10 disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* ─── Create / Edit Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Modal Header */}
            <div className="p-6 border-b border-[#333333]/50 sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm z-10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {editingProject ? 'Edit Project' : 'New Project'}
                <UploadCloud className="w-5 h-5 text-[#EF6B23]" />
              </h3>
              <button onClick={closeModal} disabled={isLoading || isCompressing} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={editingProject ? handleEditProject : handleSubmitProject} className="p-6 space-y-5">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name *</label>
                <input type="text" required value={uploadForm.name}
                  onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))}
                  disabled={isLoading || isCompressing}
                  className={inputCls} placeholder="e.g. Skyline Tower" />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Project Image {!editingProject && '*'}
                  {isCompressing && <span className="text-xs text-[#EF6B23]">(Compressing…)</span>}
                </label>
                <input type="file" accept="image/*" onChange={handleImageUpload}
                  required={!editingProject} disabled={isLoading || isCompressing}
                  className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white file:bg-[#EF6B23]/20 file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2 file:cursor-pointer hover:file:bg-[#EF6B23]/30 transition-all text-sm" />
                {uploadForm.imagePreview && (
                  <img src={uploadForm.imagePreview} alt="Preview" className="mt-3 w-32 h-24 object-cover rounded-xl border border-white/10" />
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Max {formatFileSize(MAX_FILE_SIZE)} · Compressed to &lt;{formatFileSize(MAX_COMPRESSED_SIZE)} · JPG, PNG, WebP
                </p>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Timeline (days) *
                  </label>
                  <input type="number" required value={uploadForm.timelineDays}
                    onChange={e => setUploadForm(f => ({ ...f, timelineDays: e.target.value }))}
                    disabled={isLoading || isCompressing} className={inputCls} placeholder="e.g. 365" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" /> Total Value *
                  </label>
                  <input type="number" required value={uploadForm.totalValue}
                    onChange={e => setUploadForm(f => ({ ...f, totalValue: e.target.value }))}
                    disabled={isLoading || isCompressing} className={inputCls} placeholder="e.g. 500000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                    <Percent className="w-4 h-4" /> Return %
                  </label>
                  <input type="text" value={uploadForm.returnPercent}
                    onChange={e => setUploadForm(f => ({ ...f, returnPercent: e.target.value }))}
                    disabled={isLoading || isCompressing} className={inputCls} placeholder="e.g. 15.75" />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Location <span className="text-gray-500 text-xs ml-1">(optional)</span>
                </label>
                <input type="text" value={uploadForm.location}
                  onChange={e => setUploadForm(f => ({ ...f, location: e.target.value }))}
                  disabled={isLoading || isCompressing} className={inputCls} placeholder="e.g. Test Road, Dubai" />
              </div>

              {/* Overview + Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Overview <span className="text-gray-500 text-xs ml-1">(optional)</span>
                  </label>
                  <textarea rows={3} value={uploadForm.projectOverview}
                    onChange={e => setUploadForm(f => ({ ...f, projectOverview: e.target.value }))}
                    disabled={isLoading || isCompressing}
                    className={`${inputCls} resize-none`} placeholder="Short summary..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Details <span className="text-gray-500 text-xs ml-1">(optional)</span>
                  </label>
                  <textarea rows={3} value={uploadForm.projectDetails}
                    onChange={e => setUploadForm(f => ({ ...f, projectDetails: e.target.value }))}
                    disabled={isLoading || isCompressing}
                    className={`${inputCls} resize-none`} placeholder="Full description..." />
                </div>
              </div>

              {/* Pool Configuration */}
              <div className="border-t border-[#333333]/50 pt-5">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Pool Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Usage Mode *</label>
                    <select value={uploadForm.usage}
                      onChange={e => setUploadForm(f => ({ ...f, usage: e.target.value as UsageMode }))}
                      disabled={isLoading || isCompressing} className={selectCls}>
                      {USAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Pool Mode</label>
                    <select value={uploadForm.poolMode}
                      onChange={e => setUploadForm(f => ({ ...f, poolMode: e.target.value }))}
                      disabled={isLoading || isCompressing} className={selectCls}>
                      <option value="SIMULATION">Simulation</option>
                      <option value="LIVE">Live</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Asset</label>
                    <select value={uploadForm.poolAsset}
                      onChange={e => setUploadForm(f => ({ ...f, poolAsset: e.target.value }))}
                      disabled={isLoading || isCompressing} className={selectCls}>
                      <option value="USD">USD</option>
                      <option value="NFCTOKEN">NFC Token</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Pool Cap</label>
                    <input type="number" value={uploadForm.poolCap}
                      onChange={e => setUploadForm(f => ({ ...f, poolCap: e.target.value }))}
                      disabled={isLoading || isCompressing}
                      className="w-full px-3 py-2.5 bg-[#151515]/80 border border-[#626262]/30 rounded-lg text-white text-sm focus:outline-none focus:border-[#EF6B23]"
                      placeholder="Defaults to total value" />
                  </div>
                </div>
              </div>

              {/* Progress Updates */}
              <div className="border-t border-[#333333]/50 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#EF6B23]" /> Progress Updates
                  </label>
                  <button type="button" onClick={addProgressUpdate} disabled={isLoading || isCompressing}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:shadow-lg transition-all disabled:opacity-50">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                <div className="space-y-3">
                  {uploadForm.progressUpdates.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-4 border border-dashed border-white/10 rounded-xl">
                      No progress updates yet. Click "Add" to create one.
                    </p>
                  ) : (
                    uploadForm.progressUpdates.map((progress, index) => (
                      <div key={index} className="p-4 bg-[#1a1a1a]/50 border border-[#626262]/20 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-300">Update #{index + 1}</span>
                          <button type="button" onClick={() => removeProgressUpdate(index)} disabled={isLoading || isCompressing}
                            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Completion %</label>
                            <input type="number" min="0" max="100" required value={progress.completionPct}
                              onChange={e => updateProgress(index, { completionPct: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })}
                              disabled={isLoading || isCompressing}
                              className="w-full px-3 py-2 bg-[#151515]/80 border border-[#626262]/30 rounded-lg text-white text-sm focus:outline-none focus:border-[#EF6B23]" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Phase</label>
                            <select value={progress.currentPhase}
                              onChange={e => updateProgress(index, { currentPhase: e.target.value as Phase | '' })}
                              disabled={isLoading || isCompressing}
                              className="w-full px-3 py-2 bg-[#151515]/80 border border-[#626262]/30 rounded-lg text-white text-sm focus:outline-none focus:border-[#EF6B23] cursor-pointer">
                              <option value="">No phase</option>
                              {PHASE_OPTIONS.map(ph => <option key={ph} value={ph}>{ph}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">
                              Image {!progress.imagePreview && '*'}
                              {isCompressing && <span className="text-[#EF6B23]"> (…)</span>}
                            </label>
                            <input type="file" accept="image/*"
                              onChange={e => handleProgressImageUpload(e, index)}
                              required={!progress.imagePreview} disabled={isLoading || isCompressing}
                              className="w-full px-2 py-1.5 bg-[#151515]/80 border border-[#626262]/30 rounded-lg text-white file:bg-[#EF6B23]/20 file:text-white file:border-0 file:rounded-lg file:px-2 file:py-1 file:cursor-pointer hover:file:bg-[#EF6B23]/30 transition-all text-xs" />
                          </div>
                        </div>
                        {progress.imagePreview && (
                          <img src={progress.imagePreview} alt={`Progress ${index + 1}`} className="w-full h-20 object-cover rounded-lg border border-white/10" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Submit row */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} disabled={isLoading || isCompressing}
                  className="flex-1 px-6 py-3 bg-[#151515]/80 border border-[#626262]/30 text-white rounded-xl font-semibold hover:bg-[#1a1a1a] transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading || isCompressing}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#EF6B23]/25 transition-all flex items-center justify-center gap-2 border border-[#FA9C31]/20 disabled:opacity-50">
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{editingProject ? 'Updating…' : 'Creating…'}</>
                  ) : (
                    <><UploadCloud className="w-4 h-4" />{editingProject ? 'Update Project' : 'Create Project'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── View Modal ────────────────────────────────────────────────────────── */}
      {showViewModal && viewingProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-[#333333]/50 sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm z-10 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Project Details <Eye className="w-5 h-5 text-[#EF6B23]" />
              </h3>
              <button onClick={() => { setShowViewModal(false); setViewingProject(null); }} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img src={viewingProject.imageUrl} alt={viewingProject.name} className="w-full h-64 object-cover rounded-xl border border-white/10" />
                  {viewingProject.location && (
                    <p className="mt-3 text-sm text-gray-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#EF6B23]" /> {viewingProject.location}
                    </p>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">{viewingProject.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-[#EF6B23]/20 text-[#EF6B23] rounded-lg text-xs font-medium border border-[#EF6B23]/30">
                        {getUsageLabel(viewingProject.usage)}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                        viewingProject.pool?.isActive
                          ? 'bg-[#4AD991]/20 text-[#4AD991] border-[#4AD991]/30'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        Pool {viewingProject.pool?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Timeline',     value: `${viewingProject.timelineDays} days` },
                      { label: 'Total Value',  value: formatCurrency(viewingProject.totalValue) },
                      { label: 'Return %',     value: `${viewingProject.returnPercent}%`, accent: true },
                      { label: 'Progress',     value: `${getLatestProgress(viewingProject)}%` },
                    ].map(({ label, value, accent }) => (
                      <div key={label} className="p-3 bg-[#1a1a1a]/50 rounded-lg border border-white/10">
                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                        <p className={`text-lg font-bold ${accent ? 'text-[#EF6B23]' : 'text-white'}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  {viewingProject.pool && (
                    <div className="p-4 bg-[#1a1a1a]/50 rounded-lg border border-white/10">
                      <h5 className="text-sm font-semibold text-gray-300 mb-3">Pool Details</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          ['Mode',           viewingProject.pool.mode],
                          ['Asset',          viewingProject.pool.asset],
                          ['Pool Cap',       formatCurrency(viewingProject.pool.poolCap)],
                          ['Total Invested', formatCurrency(viewingProject.pool.totalInvested)],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-gray-400">{k}:</span>
                            <span className="text-white font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Overview / Details */}
              {(viewingProject.projectOverview || viewingProject.projectDetails) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {viewingProject.projectOverview && (
                    <div className="p-4 bg-[#1a1a1a]/50 rounded-xl border border-white/10">
                      <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#EF6B23]" /> Overview
                      </h5>
                      <p className="text-sm text-gray-400 leading-relaxed">{viewingProject.projectOverview}</p>
                    </div>
                  )}
                  {viewingProject.projectDetails && (
                    <div className="p-4 bg-[#1a1a1a]/50 rounded-xl border border-white/10">
                      <h5 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#EF6B23]" /> Details
                      </h5>
                      <p className="text-sm text-gray-400 leading-relaxed">{viewingProject.projectDetails}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Progress Logs */}
              {viewingProject.progressLogs && viewingProject.progressLogs.length > 0 && (
                <div>
                  <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#EF6B23]" /> Progress Updates
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewingProject.progressLogs.map((log) => (
                      <div key={log.id} className="bg-[#1a1a1a]/50 rounded-xl border border-white/10 overflow-hidden">
                        <img src={log.imageUrl} alt={`${log.completionPct}%`} className="w-full h-32 object-cover" />
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-bold text-white">{log.completionPct}%</span>
                            <span className="text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                          </div>
                          {log.currentPhase && (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border mb-2 ${PHASE_COLORS[log.currentPhase]}`}>
                              {log.currentPhase}
                            </span>
                          )}
                          <div className="w-full bg-[#333333]/50 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-[#EF6B23] to-[#FA9C31] h-1.5 rounded-full" style={{ width: `${log.completionPct}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 flex gap-4 pt-2 border-t border-white/10">
                <span>Created: {formatDate(viewingProject.createdAt)}</span>
                <span>Updated: {formatDate(viewingProject.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}