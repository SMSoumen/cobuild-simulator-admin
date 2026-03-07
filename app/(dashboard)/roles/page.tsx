"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  KeyRound,
  Users,
  Search,
} from "lucide-react";
import { apiFetch } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Types ─────────────────────────────────────────────────────────────────────
type Permission = {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
};

type AdminRolePermission = {
  id: string;
  adminRoleId: string;
  permissionId: string;
  permission: Permission;
};

type Role = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  adminRolePermissions: AdminRolePermission[];
  _count?: { assignments: number };
};

type ModalType =
  | "create-role"
  | "edit-role"
  | "assign-permissions"
  | "create-permission"
  | "edit-permission"
  | null;

// ─── Reusable Modal Wrapper ────────────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-[#1f1f1f] to-[#181818] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white font-semibold text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Input Field ───────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#141414] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EF6B23]/50 transition-colors"
      />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RolesPermissionsPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

  // ── Roles State ──────────────────────────────────────────────────────────────
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleSearch, setRoleSearch] = useState("");
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // ── Permissions State ────────────────────────────────────────────────────────
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permsLoading, setPermsLoading] = useState(true);
  const [permSearch, setPermSearch] = useState("");

  // ── Modal State ──────────────────────────────────────────────────────────────
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPerm, setSelectedPerm] = useState<Permission | null>(null);

  // ── Form State ───────────────────────────────────────────────────────────────
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [assignedPermIds, setAssignedPermIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // ── Fetch Roles ──────────────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/rbac/roles`);
      const data = await res.json();
      setRoles(data.data ?? []);
    } catch {
      console.error("Failed to fetch roles");
    } finally {
      setRolesLoading(false);
    }
  }, []);

  // ── Fetch Permissions ────────────────────────────────────────────────────────
  const fetchPermissions = useCallback(async () => {
    setPermsLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/rbac/permissions`);
      const data = await res.json();
      setPermissions(data.data ?? []);
    } catch {
      console.error("Failed to fetch permissions");
    } finally {
      setPermsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  // ── Open/Close Modals ────────────────────────────────────────────────────────
  const openModal = (type: ModalType, role?: Role, perm?: Permission) => {
    setFormError("");
    setModalType(type);

    if (type === "edit-role" && role) {
      setSelectedRole(role);
      setFormName(role.name);
      setFormDesc(role.description ?? "");
    } else if (type === "assign-permissions" && role) {
      setSelectedRole(role);
      setAssignedPermIds(role.adminRolePermissions.map((rp) => rp.permission.id));
    } else if (type === "edit-permission" && perm) {
      setSelectedPerm(perm);
      setFormName(perm.name);
      setFormDesc(perm.description ?? "");
    } else {
      setFormName("");
      setFormDesc("");
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedRole(null);
    setSelectedPerm(null);
    setFormError("");
  };

  // ── Role CRUD ────────────────────────────────────────────────────────────────
  const handleCreateRole = async () => {
    if (!formName.trim()) return setFormError("Role name is required.");
    setSubmitting(true);
    setFormError("");
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/rbac/roles`, {
        method: "POST",
        body: JSON.stringify({ name: formName, description: formDesc }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchRoles();
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to create role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRole = async () => {
    if (!formName.trim() || !selectedRole) return setFormError("Name required.");
    setSubmitting(true);
    setFormError("");
    try {
      const res = await apiFetch(
        `${API_BASE_URL}/admin/rbac/roles/${selectedRole.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ name: formName, description: formDesc }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchRoles();
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Delete this role? This cannot be undone.")) return;
    try {
      await apiFetch(`${API_BASE_URL}/admin/rbac/roles/${roleId}`, {
        method: "DELETE",
      });
      await fetchRoles();
    } catch {
      alert("Failed to delete role.");
    }
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) return;
    setSubmitting(true);
    setFormError("");
    try {
      const res = await apiFetch(
        `${API_BASE_URL}/admin/rbac/roles/${selectedRole.id}/permissions`,
        {
          method: "POST",
          body: JSON.stringify({ permissionIds: assignedPermIds }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchRoles();
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to assign permissions");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Permission CRUD ──────────────────────────────────────────────────────────
  const handleCreatePermission = async () => {
    if (!formName.trim()) return setFormError("Permission name is required.");
    setSubmitting(true);
    setFormError("");
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/rbac/permissions`, {
        method: "POST",
        body: JSON.stringify({ name: formName, description: formDesc }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchPermissions();
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to create permission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPermission = async () => {
    if (!formName.trim() || !selectedPerm) return setFormError("Name required.");
    setSubmitting(true);
    setFormError("");
    try {
      const res = await apiFetch(
        `${API_BASE_URL}/admin/rbac/permissions/${selectedPerm.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ name: formName, description: formDesc }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchPermissions();
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to update permission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePermission = async (permId: string) => {
    if (!confirm("Delete this permission? This cannot be undone.")) return;
    try {
      await apiFetch(`${API_BASE_URL}/admin/rbac/permissions/${permId}`, {
        method: "DELETE",
      });
      await fetchPermissions();
    } catch {
      alert("Failed to delete permission.");
    }
  };

  const toggleAssignPerm = (id: string) =>
    setAssignedPermIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  // ── Filtered Data ────────────────────────────────────────────────────────────
  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
      (r.description ?? "").toLowerCase().includes(roleSearch.toLowerCase())
  );

  const filteredPerms = permissions.filter(
    (p) =>
      p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(permSearch.toLowerCase())
  );

  // ── Shared Submit Button ─────────────────────────────────────────────────────
  const SubmitBtn = ({
    label,
    onClick,
  }: {
    label: string;
    onClick: () => void;
  }) => (
    <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-white/10">
      <button
        onClick={closeModal}
        className="px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
      >
        Cancel
      </button>
      <button
        onClick={onClick}
        disabled={submitting}
        className="flex items-center gap-2 px-4 py-2 bg-[#EF6B23] hover:bg-[#d95e1a] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
      >
        {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
        {label}
      </button>
    </div>
  );

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111111] text-white p-6">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#EF6B23]/20 to-[#EF6B23]/5 rounded-lg flex items-center justify-center border border-[#EF6B23]/20">
            <ShieldCheck className="w-4 h-4 text-[#EF6B23]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">
              Roles & Permissions
            </h1>
            <p className="text-xs text-gray-500">
              Manage access control for your admin panel
            </p>
          </div>
        </div>
      </div>

      {/* ── Tabs + Action Button ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        {/* Tabs */}
        <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-lg p-1 gap-1">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
              activeTab === "roles"
                ? "bg-[#EF6B23] text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Roles
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                activeTab === "roles"
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-gray-500"
              }`}
            >
              {roles.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
              activeTab === "permissions"
                ? "bg-[#EF6B23] text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Permissions
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                activeTab === "permissions"
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-gray-500"
              }`}
            >
              {permissions.length}
            </span>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={() =>
            openModal(activeTab === "roles" ? "create-role" : "create-permission")
          }
          className="flex items-center gap-2 px-4 py-2 bg-[#EF6B23] hover:bg-[#d95e1a] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {activeTab === "roles" ? "New Role" : "New Permission"}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ROLES TAB                                                              */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "roles" && (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search roles..."
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EF6B23]/50 transition-colors"
            />
          </div>

          {rolesLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 text-[#EF6B23] animate-spin" />
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <ShieldCheck className="w-10 h-10 text-gray-700" />
              <p className="text-sm text-gray-500">No roles found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRoles.map((role) => {
                const isExpanded = expandedRole === role.id;
                return (
                  <div
                    key={role.id}
                    className="bg-gradient-to-br from-[#1c1c1c] to-[#181818] border border-white/10 rounded-xl overflow-hidden transition-all duration-200"
                  >
                    {/* Role Row */}
                    <div className="flex items-center gap-4 p-4">
                      {/* Icon */}
                      <div className="w-9 h-9 bg-gradient-to-br from-[#EF6B23]/15 to-transparent rounded-lg flex items-center justify-center border border-[#EF6B23]/20 flex-shrink-0">
                        <ShieldCheck className="w-4 h-4 text-[#EF6B23]" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-white capitalize">
                            {role.name}
                          </p>
                          <span className="px-2 py-0.5 bg-[#EF6B23]/10 text-[#EF6B23] text-[10px] font-medium rounded-full border border-[#EF6B23]/20">
                            {role.adminRolePermissions.length} permissions
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {role.description || "No description"}
                        </p>
                      </div>

                      {/* Assignment count */}
                      <div className="hidden sm:flex items-center gap-1.5 text-gray-500 bg-white/5 rounded-lg px-2.5 py-1.5">
                        <Users className="w-3 h-3" />
                        <span className="text-[11px] font-medium">
                          {role._count?.assignments ?? 0} admins
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openModal("assign-permissions", role)}
                          title="Assign Permissions"
                          className="p-2 rounded-lg text-gray-400 hover:text-[#EF6B23] hover:bg-[#EF6B23]/10 transition-all"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openModal("edit-role", role)}
                          title="Edit"
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          title="Delete"
                          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setExpandedRole(isExpanded ? null : role.id)
                          }
                          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded: Permissions chips */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-3 border-t border-white/5">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2.5">
                          Assigned Permissions
                        </p>
                        {role.adminRolePermissions.length === 0 ? (
                          <p className="text-xs text-gray-600 italic">
                            No permissions assigned.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {role.adminRolePermissions.map((rp) => (
                              <span
                                key={rp.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-white/10 text-gray-300 text-[11px] rounded-lg font-mono"
                              >
                                <KeyRound className="w-2.5 h-2.5 text-[#EF6B23]" />
                                {rp.permission.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PERMISSIONS TAB                                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "permissions" && (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={permSearch}
              onChange={(e) => setPermSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EF6B23]/50 transition-colors"
            />
          </div>

          {permsLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 text-[#EF6B23] animate-spin" />
            </div>
          ) : filteredPerms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <KeyRound className="w-10 h-10 text-gray-700" />
              <p className="text-sm text-gray-500">No permissions found</p>
            </div>
          ) : (
            /* Grid layout for permissions */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPerms.map((perm) => (
                <div
                  key={perm.id}
                  className="bg-gradient-to-br from-[#1c1c1c] to-[#181818] border border-white/10 rounded-xl p-4 flex flex-col gap-3 group hover:border-white/20 transition-all duration-200"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/15 to-transparent rounded-lg flex items-center justify-center border border-purple-500/20 flex-shrink-0">
                      <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal("edit-permission", undefined, perm)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeletePermission(perm.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <p className="text-xs font-semibold text-white font-mono">
                      {perm.name}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                      {perm.description || "No description"}
                    </p>
                  </div>

                  {/* Used in roles */}
                  <div className="mt-auto pt-2 border-t border-white/5">
                    <p className="text-[10px] text-gray-600">
                      Used in{" "}
                      <span className="text-gray-400 font-medium">
                        {
                          roles.filter((r) =>
                            r.adminRolePermissions.some(
                              (rp) => rp.permission.id === perm.id
                            )
                          ).length
                        }
                      </span>{" "}
                      role(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}

      {/* Create Role */}
      {modalType === "create-role" && (
        <Modal title="Create New Role" onClose={closeModal}>
          <div className="space-y-4">
            <Field
              label="Role Name"
              value={formName}
              onChange={setFormName}
              placeholder="e.g. content-manager"
              required
            />
            <Field
              label="Description"
              value={formDesc}
              onChange={setFormDesc}
              placeholder="What can this role do?"
            />
            {formError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            <SubmitBtn label="Create Role" onClick={handleCreateRole} />
          </div>
        </Modal>
      )}

      {/* Edit Role */}
      {modalType === "edit-role" && (
        <Modal title="Edit Role" onClose={closeModal}>
          <div className="space-y-4">
            <Field
              label="Role Name"
              value={formName}
              onChange={setFormName}
              placeholder="Role name"
              required
            />
            <Field
              label="Description"
              value={formDesc}
              onChange={setFormDesc}
              placeholder="Description"
            />
            {formError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            <SubmitBtn label="Save Changes" onClick={handleEditRole} />
          </div>
        </Modal>
      )}

      {/* Assign Permissions to Role */}
      {modalType === "assign-permissions" && selectedRole && (
        <Modal
          title={`Permissions — ${selectedRole.name}`}
          onClose={closeModal}
        >
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Toggle permissions to assign or unassign from this role.
            </p>

            {/* Select All / Clear */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setAssignedPermIds(permissions.map((p) => p.id))
                }
                className="text-[11px] text-[#EF6B23] hover:underline"
              >
                Select all
              </button>
              <span className="text-gray-700">·</span>
              <button
                onClick={() => setAssignedPermIds([])}
                className="text-[11px] text-gray-500 hover:text-white hover:underline"
              >
                Clear all
              </button>
            </div>

            {/* Scrollable permission list */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1" style={{ scrollbarWidth: "thin" }}>
              {permissions.map((perm) => {
                const checked = assignedPermIds.includes(perm.id);
                return (
                  <label
                    key={perm.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 border ${
                      checked
                        ? "bg-[#EF6B23]/10 border-[#EF6B23]/30"
                        : "bg-[#141414] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
                        checked
                          ? "bg-[#EF6B23] border-[#EF6B23]"
                          : "border-white/20"
                      }`}
                    >
                      {checked && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={checked}
                      onChange={() => toggleAssignPerm(perm.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white font-mono truncate">
                        {perm.name}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {perm.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            <p className="text-[10px] text-gray-600">
              {assignedPermIds.length} of {permissions.length} selected
            </p>

            {formError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            <SubmitBtn
              label="Save Permissions"
              onClick={handleAssignPermissions}
            />
          </div>
        </Modal>
      )}

      {/* Create Permission */}
      {modalType === "create-permission" && (
        <Modal title="Create New Permission" onClose={closeModal}>
          <div className="space-y-4">
            <Field
              label="Permission Name"
              value={formName}
              onChange={setFormName}
              placeholder="e.g. project.create"
              required
            />
            <Field
              label="Description"
              value={formDesc}
              onChange={setFormDesc}
              placeholder="What does this permission allow?"
            />
            {formError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            <SubmitBtn
              label="Create Permission"
              onClick={handleCreatePermission}
            />
          </div>
        </Modal>
      )}

      {/* Edit Permission */}
      {modalType === "edit-permission" && (
        <Modal title="Edit Permission" onClose={closeModal}>
          <div className="space-y-4">
            <Field
              label="Permission Name"
              value={formName}
              onChange={setFormName}
              placeholder="Permission name"
              required
            />
            <Field
              label="Description"
              value={formDesc}
              onChange={setFormDesc}
              placeholder="Description"
            />
            {formError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            <SubmitBtn label="Save Changes" onClick={handleEditPermission} />
          </div>
        </Modal>
      )}
    </div>
  );
}
