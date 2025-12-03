"use client";
import { useState } from 'react';
import { Folder, UploadCloud, Building2, Home, Edit3, Trash2, Percent, Layers, BarChart3, Image as ImageIcon, X } from 'lucide-react';
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

interface Project {
  id: number;
  name: string;
  image: string;
  phase: 'Phase 1' | 'Phase 2' | 'Phase 3';
  completion: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      name: "Skyline Tower",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop",
      phase: "Phase 2",
      completion: 65
    },
    {
      id: 2,
      name: "Green Valley Residences",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=250&fit=crop",
      phase: "Phase 1",
      completion: 25
    },
    {
      id: 3,
      name: "Urban Plaza Complex",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76fdd9e4?w=400&h=250&fit=crop",
      phase: "Phase 3",
      completion: 90
    },
    {
      id: 4,
      name: "Riverfront Villas",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop",
      phase: "Phase 2",
      completion: 45
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    image: null as File | null,
    imagePreview: "" as string,
    phase: "Phase 1" as 'Phase 1' | 'Phase 2' | 'Phase 3',
    completion: 0
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

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadForm.name && (uploadForm.image || uploadForm.imagePreview)) {
      const newProject: Project = {
        id: Date.now(),
        name: uploadForm.name,
        image: uploadForm.imagePreview,
        phase: uploadForm.phase,
        completion: uploadForm.completion
      };
      setProjects([newProject, ...projects]);
      closeModal();
    }
  };

  const updateProjectCompletion = (projectId: number, newCompletion: number) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, completion: newCompletion } : p
    ));
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
      phase: project.phase,
      completion: project.completion
    });
    setShowModal(true);
  };

  const handleEditProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject && uploadForm.name) {
      setProjects(projects.map(p => 
        p.id === editingProject.id 
          ? { ...p, name: uploadForm.name, phase: uploadForm.phase, completion: uploadForm.completion, image: uploadForm.imagePreview }
          : p
      ));
      closeModal();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setUploadForm({ name: "", image: null, imagePreview: "", phase: "Phase 1", completion: 0 });
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
        <StatCard title="Total" value={projects.length} icon={<Building2 className="w-4 h-4" />} />
        <StatCard title="Phase 1" value="2" variant="primary" icon={<Layers className="w-4 h-4" />} />
        <StatCard title="Phase 2" value="2" icon={<BarChart3 className="w-4 h-4" />} />
        <StatCard title="Phase 3" value="1" icon={<Percent className="w-4 h-4" />} />
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

      {/* Projects Grid - FIXED HEIGHT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map((project) => (
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

            {/* Content Section - Fixed Layout */}
            <div className="p-4 flex flex-col gap-2.5 flex-grow">
              {/* Project Info */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-white line-clamp-1 flex-1">{project.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EAAB2A]/20 text-[#EAAB2A] border border-[#EAAB2A]/30 whitespace-nowrap flex-shrink-0">
                  {project.phase}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-semibold text-white">{project.completion}%</span>
                </div>
                <div className="w-full bg-[#333333]/50 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-[#EF6B23] to-[#FA9C31] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${project.completion}%` }}
                  />
                </div>
              </div>

              {/* Completion Dropdown */}
              <select
                value={project.completion}
                onChange={(e) => updateProjectCompletion(project.id, Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#151515]/90 border border-[#626262]/40 rounded-lg text-white text-xs focus:outline-none focus:border-[#EF6B23] focus:ring-1 focus:ring-[#EF6B23]/30 transition-all"
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map(p => (
                  <option key={p} value={p}>{p}%</option>
                ))}
              </select>

              {/* ACTION BUTTONS - FULL WIDTH, GUARANTEED VISIBLE */}
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
        ))}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Phase
                  </label>
                  <select
                    value={uploadForm.phase}
                    onChange={(e) => setUploadForm({ ...uploadForm, phase: e.target.value as 'Phase 1' | 'Phase 2' | 'Phase 3' })}
                    className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all backdrop-blur-sm text-sm"
                  >
                    <option value="Phase 1">Phase 1 - Planning</option>
                    <option value="Phase 2">Phase 2 - Construction</option>
                    <option value="Phase 3">Phase 3 - Completion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Completion
                  </label>
                  <select
                    value={uploadForm.completion}
                    onChange={(e) => setUploadForm({ ...uploadForm, completion: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all backdrop-blur-sm text-sm"
                  >
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map(p => (
                      <option key={p} value={p}>{p}%</option>
                    ))}
                  </select>
                </div>
              </div>

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
