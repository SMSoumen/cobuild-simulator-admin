"use client";
import { useState } from 'react';
import { Folder, UploadCloud, Building2, Home, Edit3, Trash2, Percent, Layers, BarChart3, Image as ImageIcon, X, Calendar, DollarSign, Plus, Minus, AlertTriangle } from 'lucide-react';
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
  id: number;
  percentage: number;
  image: string;
}

interface Project {
  id: number;
  name: string;
  image: string;
  timeline: string;
  cost: string;
  progressUpdates: ProgressUpdate[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "Skyline Tower",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop",
      timeline: "12 months",
      cost: "₹50,00,000",
      progressUpdates: [
        { id: 1, percentage: 25, image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=250&fit=crop" },
        { id: 2, percentage: 65, image: "https://images.unsplash.com/photo-1590725140246-20acdee442be?w=400&h=250&fit=crop" }
      ]
    },
    {
      id: 2,
      name: "Green Valley Residences",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=250&fit=crop",
      timeline: "18 months",
      cost: "₹75,00,000",
      progressUpdates: [
        { id: 1, percentage: 25, image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=250&fit=crop" }
      ]
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    image: null as File | null,
    imagePreview: "" as string,
    timeline: "",
    cost: "",
    progressUpdates: [] as { percentage: number; image: File | null; imagePreview: string }[]
  });

  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadForm({
          ...uploadForm,
          image: file,
          imagePreview: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProgressImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedProgress = [...uploadForm.progressUpdates];
        updatedProgress[index] = {
          ...updatedProgress[index],
          image: file,
          imagePreview: e.target?.result as string
        };
        setUploadForm({ ...uploadForm, progressUpdates: updatedProgress });
      };
      reader.readAsDataURL(file);
    }
  };

  const addProgressUpdate = () => {
    setUploadForm({
      ...uploadForm,
      progressUpdates: [
        ...uploadForm.progressUpdates,
        { percentage: 0, image: null, imagePreview: "" }
      ]
    });
  };

  const removeProgressUpdate = (index: number) => {
    const updatedProgress = uploadForm.progressUpdates.filter((_, i) => i !== index);
    setUploadForm({ ...uploadForm, progressUpdates: updatedProgress });
  };

  const updateProgressPercentage = (index: number, percentage: number) => {
    const updatedProgress = [...uploadForm.progressUpdates];
    updatedProgress[index] = { ...updatedProgress[index], percentage };
    setUploadForm({ ...uploadForm, progressUpdates: updatedProgress });
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadForm.name && uploadForm.imagePreview && uploadForm.timeline && uploadForm.cost) {
      const newProject: Project = {
        id: Date.now(),
        name: uploadForm.name,
        image: uploadForm.imagePreview,
        timeline: uploadForm.timeline,
        cost: uploadForm.cost,
        progressUpdates: uploadForm.progressUpdates.map((p, idx) => ({
          id: Date.now() + idx,
          percentage: p.percentage,
          image: p.imagePreview
        }))
      };
      setProjects([newProject, ...projects]);
      closeModal();
    }
  };

  const deleteProject = (projectId: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project);
    setUploadForm({
      name: project.name,
      image: null,
      imagePreview: project.image,
      timeline: project.timeline,
      cost: project.cost,
      progressUpdates: project.progressUpdates.map(p => ({
        percentage: p.percentage,
        image: null,
        imagePreview: p.image
      }))
    });
    setShowModal(true);
  };

  const handleEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject && uploadForm.name && uploadForm.timeline && uploadForm.cost) {
      setProjects(projects.map(p => 
        p.id === editingProject.id 
          ? { 
              ...p, 
              name: uploadForm.name, 
              timeline: uploadForm.timeline,
              cost: uploadForm.cost,
              image: uploadForm.imagePreview,
              // Keep existing progress updates unchanged
              progressUpdates: p.progressUpdates
            }
          : p
      ));
      closeModal();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setUploadForm({ 
      name: "", 
      image: null, 
      imagePreview: "", 
      timeline: "", 
      cost: "",
      progressUpdates: []
    });
  };

  // Calculate latest progress for each project
  const getLatestProgress = (project: Project) => {
    if (project.progressUpdates.length === 0) return 0;
    return Math.max(...project.progressUpdates.map(p => p.percentage));
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
          Projects <Building2 className="w-6 h-6 text-[#EF6B23]" />
        </h1>
        <p className="text-sm text-gray-400">Manage construction projects and progress tracking.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Total Projects" value={projects.length} variant="primary" icon={<Building2 className="w-4 h-4" />} />
        <StatCard title="Active" value={projects.length} icon={<Layers className="w-4 h-4" />} />
        <StatCard title="Updates" value={projects.reduce((acc, p) => acc + p.progressUpdates.length, 0)} icon={<BarChart3 className="w-4 h-4" />} />
        <StatCard title="Avg Progress" value={`${Math.round(projects.reduce((acc, p) => acc + getLatestProgress(p), 0) / projects.length || 0)}%`} icon={<Percent className="w-4 h-4" />} />
      </div>

      {/* Add Project Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#EF6B23]/25 hover:scale-[1.02] transition-all flex items-center gap-2 border border-[#FA9C31]/20 text-sm"
        >
          <UploadCloud className="w-4 h-4" />
          Add New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map((project) => {
          const latestProgress = getLatestProgress(project);
          return (
            <div 
              key={project.id} 
              className="relative bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-xl border border-white/10 shadow-lg hover:shadow-xl hover:shadow-[#EF6B23]/10 transition-all duration-300 overflow-visible flex flex-col"
            >
              {/* Image Section */}
              <div className="relative h-40 overflow-hidden rounded-t-xl flex-shrink-0">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content Section */}
              <div className="p-4 flex flex-col gap-2.5 flex-grow">
                {/* Project Info */}
                <div>
                  <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">{project.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {project.timeline}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {project.cost}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
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

                {/* Progress Updates Count */}
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {project.progressUpdates.length} progress update{project.progressUpdates.length !== 1 ? 's' : ''}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2 mt-auto pt-2">
                  <button
                    onClick={() => startEditProject(project)}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] hover:from-[#EF6B23]/90 hover:to-[#E4782C]/90 text-white rounded-lg font-semibold text-xs shadow-md hover:shadow-lg hover:shadow-[#EF6B23]/30 transition-all duration-200 flex items-center justify-center gap-1.5 border border-[#FA9C31]/30"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 flex items-center justify-center border border-red-600/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Overlay */}
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
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={editingProject ? handleEditProject : handleSubmitProject} className="p-6 space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Project Name
                </label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all backdrop-blur-sm text-sm"
                  placeholder="e.g. Skyline Tower"
                  required
                />
              </div>

              {/* Project Image */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Project Image
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white file:bg-[#EF6B23]/20 file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2 file:cursor-pointer hover:file:bg-[#EF6B23]/30 transition-all text-sm"
                    required={!editingProject}
                  />
                  {uploadForm.imagePreview && (
                    <img
                      src={uploadForm.imagePreview}
                      alt="Preview"
                      className="w-24 h-20 object-cover rounded-xl border border-[#626262]/30"
                    />
                  )}
                </div>
              </div>

              {/* Timeline and Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Project Timeline
                  </label>
                  <input
                    type="text"
                    value={uploadForm.timeline}
                    onChange={(e) => setUploadForm({ ...uploadForm, timeline: e.target.value })}
                    className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all backdrop-blur-sm text-sm"
                    placeholder="e.g. 10 days"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Project Cost
                  </label>
                  <input
                    type="text"
                    value={uploadForm.cost}
                    onChange={(e) => setUploadForm({ ...uploadForm, cost: e.target.value })}
                    className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all backdrop-blur-sm text-sm"
                    placeholder="e.g. ₹50,00,000"
                    required
                  />
                </div>
              </div>

              {/* Progress Updates Section */}
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
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Progress
                    </button>
                  )}
                </div>

                {/* Warning Banner for Edit Mode */}
                {editingProject && (
                  <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-500 mb-1">Progress Updates Cannot Be Edited</h4>
                      <p className="text-xs text-amber-400/80">
                        Existing progress updates are view-only in edit mode. You can only modify project details (name, image, timeline, and cost).
                      </p>
                    </div>
                  </div>
                )}

                {/* Progress Updates List */}
                <div className="space-y-3">
                  {editingProject ? (
                    // View-only mode for existing progress updates
                    uploadForm.progressUpdates.length > 0 ? (
                      uploadForm.progressUpdates.map((progress, index) => (
                        <div 
                          key={index} 
                          className="p-4 bg-[#1a1a1a]/50 border border-[#626262]/20 rounded-xl space-y-3 opacity-60"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-300">Progress Update #{index + 1}</span>
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs font-medium">
                              View Only
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Progress Percentage - Disabled */}
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                Completion %
                              </label>
                              <div className="px-3 py-2 bg-[#151515]/50 border border-[#626262]/20 rounded-lg text-gray-400 text-xs">
                                {progress.percentage}%
                              </div>
                            </div>

                            {/* Progress Image Preview */}
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                Progress Image
                              </label>
                              {progress.imagePreview && (
                                <img
                                  src={progress.imagePreview}
                                  alt={`Progress ${index + 1}`}
                                  className="w-full h-16 object-cover rounded-lg border border-[#626262]/30"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        No progress updates for this project.
                      </div>
                    )
                  ) : (
                    // Editable mode for new projects
                    <>
                      {uploadForm.progressUpdates.map((progress, index) => (
                        <div 
                          key={index} 
                          className="p-4 bg-[#1a1a1a]/50 border border-[#626262]/20 rounded-xl space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-300">Progress Update #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeProgressUpdate(index)}
                              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Progress Percentage */}
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                Completion %
                              </label>
                              <select
                                value={progress.percentage}
                                onChange={(e) => updateProgressPercentage(index, Number(e.target.value))}
                                className="w-full px-3 py-2 bg-[#151515]/80 border border-[#626262]/30 rounded-lg text-white text-xs focus:outline-none focus:border-[#EF6B23] focus:ring-1 focus:ring-[#EF6B23]/20 transition-all"
                              >
                                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map(p => (
                                  <option key={p} value={p}>{p}%</option>
                                ))}
                              </select>
                            </div>

                            {/* Progress Image */}
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                                Progress Image
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleProgressImageUpload(e, index)}
                                className="w-full px-3 py-2 bg-[#151515]/80 border border-[#626262]/30 rounded-lg text-white text-xs file:bg-[#EF6B23]/20 file:text-white file:border-0 file:rounded file:px-2 file:py-1 file:cursor-pointer file:text-xs hover:file:bg-[#EF6B23]/30 transition-all"
                              />
                            </div>
                          </div>

                          {/* Image Preview */}
                          {progress.imagePreview && (
                            <img
                              src={progress.imagePreview}
                              alt={`Progress ${index + 1}`}
                              className="w-20 h-16 object-cover rounded-lg border border-[#626262]/30"
                            />
                          )}
                        </div>
                      ))}

                      {uploadForm.progressUpdates.length === 0 && (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          No progress updates yet. Click "Add Progress" to add one.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Warning Banner Below Form - Only for New Projects */}
              {!editingProject && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-400 mb-1">Important Notice</h4>
                    <p className="text-xs text-blue-300/80">
                      Once the project is created, progress updates cannot be edited or deleted. Make sure all information is correct before submitting.
                    </p>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#EF6B23]/25 hover:scale-[1.02] transition-all border border-[#FA9C31]/20 text-sm"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-[#333333]/50 text-gray-300 rounded-xl hover:bg-white/10 transition-all border border-[#626262]/30 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="text-center py-20">
          <Building2 className="w-24 h-24 text-[#626262] mx-auto mb-6 opacity-50" />
          <p className="text-gray-400 text-xl font-semibold mb-2">No projects yet</p>
          <p className="text-[#626262] text-sm mb-8 max-w-md mx-auto opacity-80">Start managing your construction projects by adding your first project</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-3 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#EF6B23]/25 transition-all text-sm flex items-center gap-2 mx-auto"
          >
            <UploadCloud className="w-4 h-4" />
            Create First Project
          </button>
        </div>
      )}
    </div>
  );
}
