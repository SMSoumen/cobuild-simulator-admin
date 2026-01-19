"use client";
import { useState, useEffect } from 'react';
import { Folder, UploadCloud, Building2, Home, Edit3, Trash2, Percent, Layers, BarChart3, Image as ImageIcon, X, Calendar, DollarSign, Plus, Minus, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import type { ReactNode } from 'react';
import { apiFetch, auth } from '@/lib/auth';
import imageCompression from 'browser-image-compression';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// File size limits (in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_COMPRESSED_SIZE = 2 * 1024 * 1024; // 2MB after compression

// Image compression options - MORE AGGRESSIVE
const compressionOptions = {
  maxSizeMB: 0.5, // Reduced from 1MB to 0.5MB
  maxWidthOrHeight: 1280, // Reduced from 1920 to 1280
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.7, // Added quality setting
};

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
      <div className="group relative bg-gradient-to-br from-[#EF6B23] to-[#E4782C] p-4 rounded-xl shadow-lg shadow-[#EF6B23]/20 text-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#EF6B23]/30 hover:scale-[1.02] border border-[#FA9C31]/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/0 to-transparent opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-white/80 text-xs font-medium uppercase tracking-wide">{title}</h3>
              <p className="text-xl font-bold tracking-tight drop-shadow-lg">{value}</p>
            </div>
            {icon && (
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/20">
                <div className="scale-90">{icon}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-gradient-to-br from-[#2a2a2a] to-[#232323] p-4 rounded-xl border border-white/10 shadow-lg hover:shadow-xl hover:shadow-[#EF6B23]/10 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/0 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wide">{title}</h3>
            <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF6B23] to-[#FA9C31]">{value}</p>
          </div>
          {icon && (
            <div className="w-8 h-8 bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20 rounded-lg flex items-center justify-center text-[#EF6B23] group-hover:scale-110 transition-transform duration-300 border border-[#EF6B23]/20 backdrop-blur-sm">
              <div className="scale-90">{icon}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProgressUpdate {
  id: string;
  projectId: string;
  completionPct: number;
  imageUrl: string;
  createdAt: string;
}

interface Pool {
  id: string;
  projectId: string;
  mode: string;
  asset: string;
  poolCap: string;
  totalInvested: string;
  isActive: boolean;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  imageUrl: string;
  timelineDays: number;
  totalValue: string;
  returnPercent: string;
  usage: string;
  createdAt: string;
  updatedAt: string;
  pool?: Pool;
  progressLogs?: ProgressUpdate[];
}

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
  const [uploadForm, setUploadForm] = useState({
    name: "",
    image: null as File | null,
    imagePreview: "" as string,
    timelineDays: "",
    totalValue: "",
    returnPercent: "",
    usage: "SIMULATOR_ONLY",
    poolMode: "SIMULATION",
    poolAsset: "USD",
    poolCap: "",
    progressUpdates: [] as { completionPct: number; image: File | null; imagePreview: string }[]
  });

  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      alert('Please login first');
      window.location.href = '/login';
      return;
    }
    fetchProjects(currentPage);
  }, [currentPage]);

  const fetchProjects = async (page: number = 1, limit: number = 20) => {
    setIsLoadingProjects(true);
    try {
      if (!API_BASE_URL) {
        throw new Error('API_BASE_URL is not configured. Please set NEXT_PUBLIC_API_BASE_URL in your .env file');
      }

      const response = await apiFetch(
        `${API_BASE_URL}/admin/projects?page=${page}&limit=${limit}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } else {
          const text = await response.text();
          console.error('Server returned non-JSON response:', text.substring(0, 200));
          throw new Error(`Server error: ${response.status} - Expected JSON but received HTML`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (data.success) {
        setProjects(data.data || []);
        if (data.meta) {
          setTotalPages(data.meta.totalPages || 1);
          setCurrentPage(data.meta.page || 1);
        }
      } else {
        console.error('Failed to fetch projects:', data.message);
        alert('Failed to load projects: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to load projects. Please check your connection and API configuration.');
      }
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchSingleProject = async (projectId: string) => {
    try {
      if (!API_BASE_URL) {
        throw new Error('API_BASE_URL is not configured');
      }

      const response = await apiFetch(
        `${API_BASE_URL}/admin/projects/${projectId}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch project');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (data.success) {
        setViewingProject(data.data);
        setShowViewModal(true);
      } else {
        throw new Error(data.message || 'Failed to load project details');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      alert(error instanceof Error ? error.message : 'Failed to load project details.');
    }
  };

  // UPDATED: Compress image with validation
  const compressImage = async (file: File): Promise<File> => {
    try {
      setIsCompressing(true);
      console.log(`Original size: ${formatFileSize(file.size)}`);

      const compressedFile = await imageCompression(file, compressionOptions);
      console.log(`Compressed size: ${formatFileSize(compressedFile.size)}`);

      // Check if compressed file is still too large
      if (compressedFile.size > MAX_COMPRESSED_SIZE) {
        throw new Error(
          `Image is still too large after compression (${formatFileSize(compressedFile.size)}). ` +
          `Maximum allowed size is ${formatFileSize(MAX_COMPRESSED_SIZE)}. ` +
          `Please use a smaller or lower quality image.`
        );
      }

      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    } finally {
      setIsCompressing(false);
    }
  };

  // UPDATED: Handle main project image upload with validation
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        e.target.value = '';
        return;
      }

      // Check file size BEFORE compression
      if (file.size > MAX_FILE_SIZE) {
        alert(
          `File is too large (${formatFileSize(file.size)}). ` +
          `Maximum allowed size is ${formatFileSize(MAX_FILE_SIZE)}. ` +
          `Please select a smaller image.`
        );
        e.target.value = '';
        return;
      }

      setIsCompressing(true);

      // Compress the image
      const compressedFile = await compressImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadForm({
          ...uploadForm,
          image: compressedFile,
          imagePreview: e.target?.result as string
        });
      };
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error('Error handling image:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to process image. Please try again.');
      }
      e.target.value = '';
    }
  };

  // UPDATED: Handle progress image upload with validation
  const handleProgressImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        e.target.value = '';
        return;
      }

      // Check file size BEFORE compression
      if (file.size > MAX_FILE_SIZE) {
        alert(
          `File is too large (${formatFileSize(file.size)}). ` +
          `Maximum allowed size is ${formatFileSize(MAX_FILE_SIZE)}. ` +
          `Please select a smaller image.`
        );
        e.target.value = '';
        return;
      }

      setIsCompressing(true);

      // Compress the image
      const compressedFile = await compressImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedProgress = [...uploadForm.progressUpdates];
        updatedProgress[index] = {
          ...updatedProgress[index],
          image: compressedFile,
          imagePreview: e.target?.result as string
        };
        setUploadForm({ ...uploadForm, progressUpdates: updatedProgress });
      };
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error('Error handling progress image:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to process image. Please try again.');
      }
      e.target.value = '';
    }
  };

  const addProgressUpdate = () => {
    setUploadForm({
      ...uploadForm,
      progressUpdates: [
        ...uploadForm.progressUpdates,
        { completionPct: 0, image: null, imagePreview: "" }
      ]
    });
  };

  const removeProgressUpdate = (index: number) => {
    const updatedProgress = uploadForm.progressUpdates.filter((_, i) => i !== index);
    setUploadForm({ ...uploadForm, progressUpdates: updatedProgress });
  };

  const updateProgressPercentage = (index: number, percentage: number) => {
    const updatedProgress = [...uploadForm.progressUpdates];
    updatedProgress[index] = { ...updatedProgress[index], completionPct: percentage };
    setUploadForm({ ...uploadForm, progressUpdates: updatedProgress });
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚀 Starting project submission...');

    if (!uploadForm.name || !uploadForm.image || !uploadForm.timelineDays || !uploadForm.totalValue) {
      alert('Please fill in all required fields');
      return;
    }

    if (!API_BASE_URL) {
      alert('API is not configured. Please set NEXT_PUBLIC_API_BASE_URL in your environment variables.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // Log form data being prepared
      console.log('📝 Preparing form data:');
      console.log('- Name:', uploadForm.name);
      console.log('- Timeline Days:', uploadForm.timelineDays);
      console.log('- Total Value:', uploadForm.totalValue);
      console.log('- Return Percent:', uploadForm.returnPercent || '15.75');
      console.log('- Usage:', uploadForm.usage);
      console.log('- Image file:', uploadForm.image?.name, '- Size:', uploadForm.image?.size, 'bytes');
      console.log('- Progress updates count:', uploadForm.progressUpdates.length);

      formData.append('name', uploadForm.name);
      formData.append('timelineDays', uploadForm.timelineDays);
      formData.append('totalValue', uploadForm.totalValue);
      formData.append('returnPercent', uploadForm.returnPercent || '15.75');
      formData.append('usage', uploadForm.usage);
      formData.append('pool[mode]', uploadForm.poolMode);
      formData.append('pool[asset]', uploadForm.poolAsset);
      formData.append('pool[poolCap]', uploadForm.poolCap || uploadForm.totalValue);
      formData.append('imageUrl', uploadForm.image);

      uploadForm.progressUpdates.forEach((progress, index) => {
        console.log(`- Progress update ${index + 1}: ${progress.completionPct}%, has image: ${!!progress.image}`);
        formData.append(`progressUpdates[${index}][completionPct]`, progress.completionPct.toString());
        if (progress.image) {
          formData.append(`progressUpdates[${index}][imageUrl]`, progress.image);
        }
      });

      // Log the API endpoint
      const apiEndpoint = `${API_BASE_URL}/admin/projects`;
      console.log('🌐 API Endpoint:', apiEndpoint);
      console.log('🌐 Full API_BASE_URL:', API_BASE_URL);

      // Make the request
      console.log('📤 Sending request...');
      const response = await apiFetch(
        apiEndpoint,
        {
          method: 'POST',
          headers: {} as any,
          body: formData,
        }
      );

      // Log response details
      console.log('📥 Response received:');
      console.log('- Status:', response.status, response.statusText);
      console.log('- OK:', response.ok);
      console.log('- Content-Type:', response.headers.get('content-type'));

      // Log all response headers
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log('- All Headers:', headers);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        console.error('❌ Response not OK. Status:', response.status);
        console.error('❌ Content-Type:', contentType);

        // Always get the raw response first to see what we got
        const text = await response.text();
        console.error('❌ Raw response (first 1000 chars):', text.substring(0, 1000));

        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = JSON.parse(text);
            console.error('❌ Parsed error data:', errorData);
            throw new Error(errorData.message || 'Failed to create project');
          } catch (parseError) {
            console.error('❌ Could not parse JSON error:', parseError);
            throw new Error(`Server error ${response.status}: ${text.substring(0, 100)}`);
          }
        } else {
          const errorMsg = `Server error ${response.status}: Expected JSON response but got ${contentType || 'unknown type'}. ` +
            `This usually means: ` +
            `(1) API endpoint doesn't exist (check URL) ` +
            `(2) Server crashed (check server logs) ` +
            `(3) CORS issues ` +
            `(4) Wrong API configuration. ` +
            `Response preview: ${text.substring(0, 200)}`;
          throw new Error(errorMsg);
        }
      }

      const contentType = response.headers.get('content-type');
      console.log('✅ Response OK. Parsing content...');

      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Expected JSON but got:', text.substring(0, 500));
        throw new Error(
          `Server returned ${contentType || 'unknown type'} instead of JSON. ` +
          `Check your backend API to ensure it returns JSON with correct Content-Type header.`
        );
      }

      const data = await response.json();
      console.log('✅ Parsed JSON response:', data);

      if (data.success) {
        console.log('🎉 Project created successfully!');
        alert('Project created successfully!');
        closeModal();
        fetchProjects(1);
      } else {
        console.error('❌ API returned success: false', data);
        throw new Error(data.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('💥 Error creating project:', error);
      console.error('Error type:', typeof error);
      console.error('Error name:', error instanceof Error ? error.name : 'unknown');

      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('❌ Network error - API might be down or URL is wrong');
        const networkMsg = 'Network error: Cannot reach the API server. ' +
          'Possible causes: ' +
          '(1) Server is not running ' +
          '(2) Wrong API URL in .env.local ' +
          '(3) CORS configuration issue. ' +
          'Check console for details.';
        alert(networkMsg);
      } else if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        alert(error.message);
      } else {
        console.error('Unknown error type:', error);
        alert('Failed to create project. Check browser console (F12) for detailed error logs.');
      }
    } finally {
      setIsLoading(false);
      console.log('✅ Request completed, loading state reset');
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProject || !uploadForm.name || !uploadForm.timelineDays || !uploadForm.totalValue) {
      alert('Please fill in all required fields');
      return;
    }

    if (!API_BASE_URL) {
      alert('API is not configured');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      formData.append('name', uploadForm.name);
      formData.append('timelineDays', uploadForm.timelineDays);
      formData.append('totalValue', uploadForm.totalValue);
      formData.append('returnPercent', uploadForm.returnPercent || '15.75');
      formData.append('usage', uploadForm.usage);
      formData.append('pool[mode]', uploadForm.poolMode);
      formData.append('pool[asset]', uploadForm.poolAsset);
      formData.append('pool[poolCap]', uploadForm.poolCap || uploadForm.totalValue);

      if (uploadForm.image) {
        formData.append('imageUrl', uploadForm.image);
      }

      const response = await apiFetch(
        `${API_BASE_URL}/admin/projects/${editingProject.id}`,
        {
          method: 'PUT',
          headers: {} as any,
          body: formData,
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update project');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (data.success) {
        alert('Project updated successfully!');
        closeModal();
        fetchProjects(currentPage);
      } else {
        throw new Error(data.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Failed to update project. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    if (!API_BASE_URL) {
      alert('API is not configured');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch(
        `${API_BASE_URL}/admin/projects/${projectId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete project');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();

      if (data.success) {
        alert('Project deleted successfully!');
        fetchProjects(currentPage);
      } else {
        throw new Error(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete project. Please try again.');
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
      timelineDays: project.timelineDays.toString(),
      totalValue: project.totalValue,
      returnPercent: project.returnPercent,
      usage: project.usage,
      poolMode: project.pool?.mode || "SIMULATION",
      poolAsset: project.pool?.asset || "USD",
      poolCap: project.pool?.poolCap || project.totalValue,
      progressUpdates: (project.progressLogs || []).map(p => ({
        completionPct: p.completionPct,
        image: null,
        imagePreview: p.imageUrl
      }))
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setUploadForm({ 
      name: "", 
      image: null, 
      imagePreview: "", 
      timelineDays: "", 
      totalValue: "",
      returnPercent: "",
      usage: "SIMULATOR_ONLY",
      poolMode: "SIMULATION",
      poolAsset: "USD",
      poolCap: "",
      progressUpdates: []
    });
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setViewingProject(null);
  };

  const getLatestProgress = (project: Project) => {
    if (!project.progressLogs || project.progressLogs.length === 0) return 0;
    return Math.max(...project.progressLogs.map(p => p.completionPct));
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] space-y-6 p-4 sm:p-6 lg:p-8">
      {isCompressing && (
        <div className="fixed top-4 right-4 z-50 bg-[#EF6B23] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Compressing image...</span>
        </div>
      )}

      {!API_BASE_URL && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-500 mb-1">API Configuration Missing</h4>
            <p className="text-xs text-red-400/80">
              Please set NEXT_PUBLIC_API_BASE_URL in your .env.local file
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            Projects <Building2 className="w-6 h-6 text-[#EF6B23]" />
          </h1>
          <p className="text-sm text-gray-400">Manage construction projects and progress tracking.</p>
        </div>
        <button
          onClick={() => fetchProjects(currentPage)}
          className="p-2 bg-gradient-to-r from-[#EF6B23]/20 to-[#E4782C]/20 text-[#EF6B23] rounded-lg hover:from-[#EF6B23]/30 hover:to-[#E4782C]/30 transition-all border border-[#EF6B23]/30"
          title="Refresh projects"
          disabled={isLoadingProjects}
        >
          <RefreshCw className={`w-5 h-5 ${isLoadingProjects ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Total Projects" value={projects.length} variant="primary" icon={<Building2 className="w-4 h-4" />} />
        <StatCard title="Active" value={projects.filter(p => p.pool?.isActive).length} icon={<Layers className="w-4 h-4" />} />
        <StatCard title="Updates" value={projects.reduce((acc, p) => acc + (p.progressLogs?.length || 0), 0)} icon={<BarChart3 className="w-4 h-4" />} />
        <StatCard title="Avg Progress" value={`${Math.round(projects.reduce((acc, p) => acc + getLatestProgress(p), 0) / projects.length || 0)}%`} icon={<Percent className="w-4 h-4" />} />
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          disabled={isCompressing || !API_BASE_URL}
          className="px-6 py-3 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#EF6B23]/25 hover:scale-[1.02] transition-all flex items-center gap-2 border border-[#FA9C31]/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UploadCloud className="w-4 h-4" />
          Add New Project
        </button>
      </div>
      {isLoadingProjects ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#EF6B23]/30 border-t-[#EF6B23] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading projects...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map((project) => {
              const latestProgress = getLatestProgress(project);
              return (
                <div 
                  key={project.id} 
                  className="relative bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-xl border border-white/10 shadow-lg hover:shadow-xl hover:shadow-[#EF6B23]/10 transition-all duration-300 overflow-visible flex flex-col"
                >
                  <div className="relative h-40 overflow-hidden rounded-t-xl flex-shrink-0">
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => fetchSingleProject(project.id)}
                      className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-all"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 flex flex-col gap-2.5 flex-grow">
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">{project.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {project.timelineDays} days
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatCurrency(project.totalValue)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Latest Progress</span>
                        <span className="font-semibold text-white">{latestProgress}%</span>
                      </div>
                      <div className="w-full bg-[#333333]/50 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-[#EF6B23] to-[#FA9C31] h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${latestProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {project.progressLogs?.length || 0} progress update{(project.progressLogs?.length || 0) !== 1 ? 's' : ''}
                    </div>

                    <div className="flex gap-2 mt-auto pt-2">
                      <button
                        onClick={() => startEditProject(project)}
                        disabled={isLoading || isCompressing}
                        className="flex-1 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] hover:from-[#EF6B23]/90 hover:to-[#E4782C]/90 text-white rounded-lg font-semibold text-xs shadow-md hover:shadow-lg hover:shadow-[#EF6B23]/30 transition-all duration-200 flex items-center justify-center gap-1.5 border border-[#FA9C31]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => deleteProject(project.id, project.name)}
                        disabled={isLoading || isCompressing}
                        className="px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 flex items-center justify-center border border-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
              >
                Previous
              </button>
              <span className="text-gray-400 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333333] transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-[#333333]/50 sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {editingProject ? 'Edit Project' : 'New Project'}
                  <UploadCloud className="w-5 h-5 text-[#EF6B23]" />
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all group"
                  disabled={isLoading || isCompressing}
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={editingProject ? handleEditProject : handleSubmitProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Project Name *
                </label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all backdrop-blur-sm text-sm"
                  placeholder="e.g. Skyline Tower"
                  required
                  disabled={isLoading || isCompressing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Project Image * {isCompressing && <span className="text-xs text-[#EF6B23]">(Compressing...)</span>}
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white file:bg-[#EF6B23]/20 file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2 file:cursor-pointer hover:file:bg-[#EF6B23]/30 transition-all text-sm"
                    required={!editingProject}
                    disabled={isLoading || isCompressing}
                  />
                  {uploadForm.imagePreview && (
                    <img
                      src={uploadForm.imagePreview}
                      alt="Preview"
                      className="w-32 h-24 object-cover rounded-xl border border-[#626262]/30"
                    />
                  )}
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-400">
                      <strong>Image Requirements:</strong><br/>
                      • Maximum file size: {formatFileSize(MAX_FILE_SIZE)}<br/>
                      • Images will be compressed to under {formatFileSize(MAX_COMPRESSED_SIZE)}<br/>
                      • Supported formats: JPG, PNG, WebP
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Timeline (days) *
                  </label>
                  <input
                    type="number"
                    value={uploadForm.timelineDays}
                    onChange={(e) => setUploadForm({ ...uploadForm, timelineDays: e.target.value })}
                    className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all backdrop-blur-sm text-sm"
                    placeholder="e.g. 10"
                    required
                    disabled={isLoading || isCompressing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Total Value *
                  </label>
                  <input
                    type="number"
                    value={uploadForm.totalValue}
                    onChange={(e) => setUploadForm({ ...uploadForm, totalValue: e.target.value })}
                    className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all backdrop-blur-sm text-sm"
                    placeholder="e.g. 500000"
                    required
                    disabled={isLoading || isCompressing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Return %
                  </label>
                  <input
                    type="text"
                    value={uploadForm.returnPercent}
                    onChange={(e) => setUploadForm({ ...uploadForm, returnPercent: e.target.value })}
                    className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all backdrop-blur-sm text-sm"
                    placeholder="e.g. 15.75"
                    disabled={isLoading || isCompressing}
                  />
                </div>
              </div>

              <div className="border-t border-[#333333]/50 pt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Pool Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Mode</label>
                    <select
                      value={uploadForm.poolMode}
                      onChange={(e) => setUploadForm({ ...uploadForm, poolMode: e.target.value })}
                      className="w-full px-3 py-2 bg-[#151515]/80 border border-[#626262]/30 rounded-lg text-white text-sm focus:outline-none focus:border-[#EF6B23]"
                      disabled={isLoading || isCompressing}
                    >
                      <option value="SIMULATION">Simulation</option>
                      <option value="LIVE">Live</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Asset</label>
                    <select
                      value={uploadForm.poolAsset}
                      onChange={(e) => setUploadForm({ ...uploadForm, poolAsset: e.target.value })}
                      className="w-full px-3 py-2 bg-[#151515]/80 border border-[#626262]/30 rounded-lg text-white text-sm focus:outline-none focus:border-[#EF6B23]"
                      disabled={isLoading || isCompressing}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Pool Cap</label>
                    <input
                      type="number"
                      value={uploadForm.poolCap}
                      onChange={(e) => setUploadForm({ ...uploadForm, poolCap: e.target.value })}
                      className="w-full px-3 py-2 bg-[#151515]/80 border border-[#626262]/30 rounded-lg text-white text-sm focus:outline-none focus:border-[#EF6B23]"
                      placeholder="Auto-calculated"
                      disabled={isLoading || isCompressing}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#333333]/50 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Progress Updates
                  </label>
                  {!editingProject && (
                    <button
                      type="button"
                      onClick={addProgressUpdate}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#EF6B23]/25 transition-all flex items-center gap-1.5 text-xs border border-[#FA9C31]/20"
                      disabled={isLoading || isCompressing}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Progress
                    </button>
                  )}
                </div>

                {editingProject && (
                  <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-500 mb-1">Progress Updates Cannot Be Edited</h4>
                      <p className="text-xs text-amber-400/80">
                        Existing progress updates are view-only in edit mode.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {editingProject ? (
                    uploadForm.progressUpdates.length > 0 ? (
                      uploadForm.progressUpdates.map((progress, index) => (
                        <div key={index} className="p-4 bg-[#1a1a1a]/50 border border-[#626262]/20 rounded-xl space-y-3 opacity-60">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-300">Progress Update #{index + 1}</span>
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">View Only</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1.5">Completion %</label>
                              <div className="px-3 py-2 bg-[#151515]/50 border border-[#626262]/20 rounded-lg text-gray-400 text-xs">
                                {progress.completionPct}%
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1.5">Progress Image</label>
                              {progress.imagePreview && (
                                <img src={progress.imagePreview} alt={`Progress ${index + 1}`} className="w-full h-16 object-cover rounded-lg border border-[#626262]/30" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 text-sm">No progress updates for this project.</div>
                    )
                  ) : (
                    <>
                      {uploadForm.progressUpdates.map((progress, index) => (
                        <div key={index} className="p-4 bg-[#1a1a1a]/50 border border-[#626262]/20 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-300">Progress Update #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeProgressUpdate(index)}
                              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-all"
                              disabled={isLoading || isCompressing}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1.5">Completion %</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={progress.completionPct}
                                onChange={(e) => updateProgressPercentage(index, parseFloat(e.target.value))}
                                className="w-full px-3 py-2 bg-[#151515]/80 border border-[#626262]/30 rounded-lg text-white text-sm focus:outline-none focus:border-[#EF6B23]"
                                required
                                disabled={isLoading || isCompressing}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1.5">Progress Image {isCompressing && <span className="text-xs text-[#EF6B23]">(Compressing...)</span>}</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleProgressImageUpload(e, index)}
                                className="w-full px-2 py-1.5 bg-[#151515]/80 border border-[#626262]/30 rounded-lg text-white file:bg-[#EF6B23]/20 file:text-white file:border-0 file:rounded-lg file:px-2 file:py-1 file:cursor-pointer hover:file:bg-[#EF6B23]/30 transition-all text-xs"
                                required={!progress.imagePreview}
                                disabled={isLoading || isCompressing}
                              />
                              {progress.imagePreview && (
                                <img src={progress.imagePreview} alt={`Progress ${index + 1}`} className="mt-2 w-full h-16 object-cover rounded-lg border border-[#626262]/30" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {uploadForm.progressUpdates.length === 0 && (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          No progress updates added yet. Click "Add Progress" to add one.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-[#151515]/80 border border-[#626262]/30 text-white rounded-xl font-semibold hover:bg-[#1a1a1a] transition-all"
                  disabled={isLoading || isCompressing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isCompressing}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#EF6B23]/25 transition-all flex items-center justify-center gap-2 border border-[#FA9C31]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {editingProject ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      {editingProject ? 'Update Project' : 'Create Project'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showViewModal && viewingProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-[#333333]/50 sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Project Details
                  <Eye className="w-5 h-5 text-[#EF6B23]" />
                </h3>
                <button
                  onClick={closeViewModal}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all group"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={viewingProject.imageUrl}
                    alt={viewingProject.name}
                    className="w-full h-64 object-cover rounded-xl border border-white/10"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">{viewingProject.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-[#EF6B23]/20 text-[#EF6B23] rounded-lg text-xs font-medium border border-[#EF6B23]/30">
                        {viewingProject.usage}
                      </span>
                      {viewingProject.pool?.isActive && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs font-medium border border-green-500/30">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-[#1a1a1a]/50 rounded-lg border border-white/10">
                      <p className="text-xs text-gray-400 mb-1">Timeline</p>
                      <p className="text-lg font-bold text-white">{viewingProject.timelineDays} days</p>
                    </div>
                    <div className="p-3 bg-[#1a1a1a]/50 rounded-lg border border-white/10">
                      <p className="text-xs text-gray-400 mb-1">Total Value</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(viewingProject.totalValue)}</p>
                    </div>
                    <div className="p-3 bg-[#1a1a1a]/50 rounded-lg border border-white/10">
                      <p className="text-xs text-gray-400 mb-1">Return %</p>
                      <p className="text-lg font-bold text-[#EF6B23]">{viewingProject.returnPercent}%</p>
                    </div>
                    <div className="p-3 bg-[#1a1a1a]/50 rounded-lg border border-white/10">
                      <p className="text-xs text-gray-400 mb-1">Progress</p>
                      <p className="text-lg font-bold text-white">{getLatestProgress(viewingProject)}%</p>
                    </div>
                  </div>

                  {viewingProject.pool && (
                    <div className="p-4 bg-[#1a1a1a]/50 rounded-lg border border-white/10">
                      <h5 className="text-sm font-semibold text-gray-300 mb-3">Pool Details</h5>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Mode:</span>
                          <span className="text-white font-medium">{viewingProject.pool.mode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Asset:</span>
                          <span className="text-white font-medium">{viewingProject.pool.asset}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pool Cap:</span>
                          <span className="text-white font-medium">{formatCurrency(viewingProject.pool.poolCap)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Invested:</span>
                          <span className="text-white font-medium">{formatCurrency(viewingProject.pool.totalInvested)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {viewingProject.progressLogs && viewingProject.progressLogs.length > 0 && (
                <div>
                  <h5 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#EF6B23]" />
                    Progress Updates
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewingProject.progressLogs.map((progress) => (
                      <div key={progress.id} className="bg-[#1a1a1a]/50 rounded-lg border border-white/10 overflow-hidden">
                        <img
                          src={progress.imageUrl}
                          alt={`Progress ${progress.completionPct}%`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-white">{progress.completionPct}%</span>
                            <span className="text-xs text-gray-400">{formatDate(progress.createdAt)}</span>
                          </div>
                          <div className="w-full bg-[#333333]/50 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-[#EF6B23] to-[#FA9C31] h-1.5 rounded-full"
                              style={{ width: `${progress.completionPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p>Created: {formatDate(viewingProject.createdAt)}</p>
                <p>Last Updated: {formatDate(viewingProject.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}