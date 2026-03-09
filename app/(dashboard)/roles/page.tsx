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
  UserCog,
  Eye,
  ShieldPlus,
  CheckCircle2,
  XCircle,
  Info,
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

type AdminRole = {
  id: string;
  role: Role;
};

type Admin = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  lastLoginAt: string | null;
  roles?: AdminRole[];
  _count?: { roles: number };
};

type ModalType =
  | "create-role"
  | "edit-role"
  | "assign-permissions"
  | "create-permission"
  | "edit-permission"
  | "create-admin"
  | "edit-admin"
  | "view-admin"
  | "assign-roles-to-admin"
  | null;

// ─── Toast ─────────────────────────────────────────────────────────────────────
type ToastItem = { id: number; message: string; type: "success" | "error" | "info" };

function ToastContainer({ toasts, onRemove }: { toasts: ToastItem[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 pl-3 pr-4 py-3 rounded-xl border shadow-2xl text-sm font-medium pointer-events-auto transition-all duration-300 ${
            toast.type === "success"
              ? "bg-[#1a1a1a] border-green-500/40 text-green-400 shadow-green-500/10"
              : toast.type === "error"
              ? "bg-[#1a1a1a] border-red-500/40 text-red-400 shadow-red-500/10"
              : "bg-[#1a1a1a] border-blue-500/40 text-blue-400 shadow-blue-500/10"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
          {toast.type === "error"   && <XCircle       className="w-4 h-4 flex-shrink-0" />}
          {toast.type === "info"    && <Info          className="w-4 h-4 flex-shrink-0" />}
          <span className="text-white/90">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="ml-1 opacity-40 hover:opacity-100 transition-opacity text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-b from-[#1f1f1f] to-[#181818] border border-white/10 rounded-xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-11 h-11 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-sm font-semibold text-white text-center mb-2">Confirm Delete</h3>
        <p className="text-xs text-gray-400 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all text-xs font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable Modal Wrapper ────────────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`bg-gradient-to-b from-[#1f1f1f] to-[#181818] border border-white/10 rounded-xl w-full ${
          wide ? "max-w-lg" : "max-w-md"
        } shadow-2xl`}
      >
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
  type = "text",
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="bg-[#141414] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EF6B23]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function RolesPermissionsPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "permissions" | "admins">("roles");

  // ── Roles State ──────────────────────────────────────────────────────────────
  const [roles,        setRoles]        = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roleSearch,   setRoleSearch]   = useState("");
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // ── Permissions State ────────────────────────────────────────────────────────
  const [permissions,  setPermissions]  = useState<Permission[]>([]);
  const [permsLoading, setPermsLoading] = useState(true);
  const [permSearch,   setPermSearch]   = useState("");

  // ── Admins State ─────────────────────────────────────────────────────────────
  const [admins,               setAdmins]               = useState<Admin[]>([]);
  const [adminsLoading,        setAdminsLoading]        = useState(false);
  const [adminSearch,          setAdminSearch]          = useState("");
  const [selectedAdminDetail,  setSelectedAdminDetail]  = useState<Admin | null>(null);
  const [adminDetailLoading,   setAdminDetailLoading]   = useState(false);

  // ── Modal State ──────────────────────────────────────────────────────────────
  const [modalType,     setModalType]     = useState<ModalType>(null);
  const [selectedRole,  setSelectedRole]  = useState<Role | null>(null);
  const [selectedPerm,  setSelectedPerm]  = useState<Permission | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  // ── Delete Confirm State ─────────────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // ── Form State ───────────────────────────────────────────────────────────────
  const [formName,         setFormName]         = useState("");
  const [formDesc,         setFormDesc]         = useState("");
  const [formEmail,        setFormEmail]        = useState("");
  const [formPassword,     setFormPassword]     = useState("");
  const [formIsActive,     setFormIsActive]     = useState(true);
  const [formIsSuperAdmin, setFormIsSuperAdmin] = useState(false);
  const [assignedPermIds,  setAssignedPermIds]  = useState<string[]>([]);
  const [assignedRoleIds,  setAssignedRoleIds]  = useState<string[]>([]);
  const [submitting,       setSubmitting]       = useState(false);
  const [formError,        setFormError]        = useState("");

  // ── Toast ────────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastItem["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const removeToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Fetch Roles ──────────────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/rbac/roles`);
      const data = await res.json();
      setRoles(data.data ?? []);
    } catch {
      showToast("Failed to fetch roles", "error");
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
      showToast("Failed to fetch permissions", "error");
    } finally {
      setPermsLoading(false);
    }
  }, []);

  // ── Fetch Admins ─────────────────────────────────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/rbac/admins`);
      const data = await res.json();
      setAdmins(data.data ?? []);
    } catch {
      showToast("Failed to fetch admins", "error");
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  // ── Fetch Admin By ID ────────────────────────────────────────────────────────
  const fetchAdminById = async (adminId: string) => {
    setAdminDetailLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/rbac/admins/${adminId}`);
      const data = await res.json();
      setSelectedAdminDetail(data.data ?? null);
    } catch {
      showToast("Failed to fetch admin details", "error");
    } finally {
      setAdminDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  useEffect(() => {
    if (activeTab === "admins") fetchAdmins();
  }, [activeTab, fetchAdmins]);

  // ── Open/Close Modals ────────────────────────────────────────────────────────
  const openModal = (
    type: ModalType,
    role?: Role,
    perm?: Permission,
    admin?: Admin
  ) => {
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
    } else if (type === "edit-admin" && admin) {
      setSelectedAdmin(admin);
      setFormName(admin.name);
      setFormEmail(admin.email);
      setFormPassword("");
      setFormIsActive(admin.isActive);
    } else if (type === "view-admin" && admin) {
      setSelectedAdmin(admin);
      fetchAdminById(admin.id);
    } else if (type === "assign-roles-to-admin" && admin) {
      setSelectedAdmin(admin);
      setAssignedRoleIds(admin.roles?.map((r) => r.role.id) ?? []);
    } else if (type === "create-admin") {
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setFormIsActive(true);
      setFormIsSuperAdmin(false);
      setAssignedRoleIds([]);
    } else {
      setFormName("");
      setFormDesc("");
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedRole(null);
    setSelectedPerm(null);
    setSelectedAdmin(null);
    setSelectedAdminDetail(null);
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
      showToast("Role created successfully!");
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
        { method: "PUT", body: JSON.stringify({ name: formName, description: formDesc }) }
      );
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchRoles();
      showToast("Role updated successfully!");
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = (roleId: string) => {
    setDeleteConfirm({
      message: "Delete this role? This cannot be undone.",
      onConfirm: async () => {
        setDeleteConfirm(null);
        try {
          await apiFetch(`${API_BASE_URL}/admin/rbac/roles/${roleId}`, { method: "DELETE" });
          await fetchRoles();
          showToast("Role deleted successfully!");
        } catch {
          showToast("Failed to delete role.", "error");
        }
      },
    });
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) return;
    setSubmitting(true);
    setFormError("");
    try {
      const res = await apiFetch(
        `${API_BASE_URL}/admin/rbac/roles/${selectedRole.id}/permissions`,
        { method: "POST", body: JSON.stringify({ permissionIds: assignedPermIds }) }
      );
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchRoles();
      showToast("Permissions assigned successfully!");
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
      showToast("Permission created successfully!");
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
        { method: "PUT", body: JSON.stringify({ name: formName, description: formDesc }) }
      );
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchPermissions();
      showToast("Permission updated successfully!");
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to update permission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePermission = (permId: string) => {
    setDeleteConfirm({
      message: "Delete this permission? This cannot be undone.",
      onConfirm: async () => {
        setDeleteConfirm(null);
        try {
          await apiFetch(`${API_BASE_URL}/admin/rbac/permissions/${permId}`, { method: "DELETE" });
          await fetchPermissions();
          showToast("Permission deleted successfully!");
        } catch {
          showToast("Failed to delete permission.", "error");
        }
      },
    });
  };

  // ── Admin CRUD ───────────────────────────────────────────────────────────────
  const handleCreateAdmin = async () => {
    if (!formName.trim()) return setFormError("Name is required.");
    if (!formEmail.trim()) return setFormError("Email is required.");
    if (!formPassword.trim()) return setFormError("Password is required.");
    setSubmitting(true);
    setFormError("");
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/rbac/admins`, {
        method: "POST",
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          isActive: formIsActive,
          isSuperAdmin: formIsSuperAdmin,
          roleIds: assignedRoleIds,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchAdmins();
      showToast("Admin created successfully!");
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditAdmin = async () => {
    if (!formName.trim() || !selectedAdmin) return setFormError("Name required.");
    setSubmitting(true);
    setFormError("");
    try {
      const body: Record<string, unknown> = {
        name: formName,
        email: formEmail,
        isActive: formIsActive,
      };
      if (formPassword.trim()) body.password = formPassword;
      const res = await apiFetch(
        `${API_BASE_URL}/admin/rbac/admins/${selectedAdmin.id}`,
        { method: "PUT", body: JSON.stringify(body) }
      );
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchAdmins();
      showToast("Admin updated successfully!");
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to update admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = (adminId: string, adminName: string) => {
    setDeleteConfirm({
      message: `Delete admin "${adminName}"? This cannot be undone.`,
      onConfirm: async () => {
        setDeleteConfirm(null);
        try {
          await apiFetch(`${API_BASE_URL}/admin/rbac/admins/${adminId}`, { method: "DELETE" });
          await fetchAdmins();
          showToast("Admin deleted successfully!");
        } catch {
          showToast("Failed to delete admin.", "error");
        }
      },
    });
  };

  const handleAssignRolesToAdmin = async () => {
    if (!selectedAdmin) return;
    setSubmitting(true);
    setFormError("");
    try {
      const res = await apiFetch(
        `${API_BASE_URL}/admin/rbac/admins/${selectedAdmin.id}/roles`,
        { method: "POST", body: JSON.stringify({ roleIds: assignedRoleIds }) }
      );
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchAdmins();
      showToast("Roles assigned successfully!");
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to assign roles");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggles ──────────────────────────────────────────────────────────────────
  const toggleAssignPerm = (id: string) =>
    setAssignedPermIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const toggleAssignRole = (id: string) =>
    setAssignedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
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

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(adminSearch.toLowerCase())
  );

  // ── Shared Submit Button ─────────────────────────────────────────────────────
  const SubmitBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
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

  // ── Toggle Row ────────────────────────────────────────────────────────────────
  const ToggleRow = ({
    id,
    name,
    description,
    checked,
    onToggle,
    accentColor = "#EF6B23",
  }: {
    id: string;
    name: string;
    description?: string;
    checked: boolean;
    onToggle: (id: string) => void;
    accentColor?: string;
  }) => (
    <label
      key={id}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 border ${
        checked ? "bg-[#EF6B23]/10 border-[#EF6B23]/30" : "bg-[#141414] border-white/5 hover:border-white/10"
      }`}
      style={checked ? { borderColor: `${accentColor}4D`, background: `${accentColor}1A` } : {}}
    >
      <div
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all"
        style={
          checked
            ? { background: accentColor, borderColor: accentColor }
            : { borderColor: "rgba(255,255,255,0.2)" }
        }
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={() => onToggle(id)} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white font-mono truncate">{name}</p>
        {description && <p className="text-[10px] text-gray-500 truncate">{description}</p>}
      </div>
    </label>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111111] text-white p-6">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#EF6B23]/20 to-[#EF6B23]/5 rounded-lg flex items-center justify-center border border-[#EF6B23]/20">
            <ShieldCheck className="w-4 h-4 text-[#EF6B23]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Roles & Permissions</h1>
            <p className="text-xs text-gray-500">Manage access control for your admin panel</p>
          </div>
        </div>
      </div>

      {/* ── Tabs + Action Button ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-lg p-1 gap-1">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
              activeTab === "roles" ? "bg-[#EF6B23] text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Roles
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${activeTab === "roles" ? "bg-white/20 text-white" : "bg-white/5 text-gray-500"}`}>
              {roles.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("permissions")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
              activeTab === "permissions" ? "bg-[#EF6B23] text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Permissions
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${activeTab === "permissions" ? "bg-white/20 text-white" : "bg-white/5 text-gray-500"}`}>
              {permissions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("admins")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
              activeTab === "admins" ? "bg-[#EF6B23] text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            <UserCog className="w-3.5 h-3.5" />
            Admins
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${activeTab === "admins" ? "bg-white/20 text-white" : "bg-white/5 text-gray-500"}`}>
              {admins.length}
            </span>
          </button>
        </div>

        <button
          onClick={() => {
            if (activeTab === "roles") openModal("create-role");
            else if (activeTab === "permissions") openModal("create-permission");
            else openModal("create-admin");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#EF6B23] hover:bg-[#d95e1a] text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {activeTab === "roles" ? "New Role" : activeTab === "permissions" ? "New Permission" : "New Admin"}
        </button>
      </div>

      {/* ══ ROLES TAB ══════════════════════════════════════════════════════════ */}
      {activeTab === "roles" && (
        <>
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
                  <div key={role.id} className="bg-gradient-to-br from-[#1c1c1c] to-[#181818] border border-white/10 rounded-xl overflow-hidden transition-all duration-200">
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#EF6B23]/15 to-transparent rounded-lg flex items-center justify-center border border-[#EF6B23]/20 flex-shrink-0">
                        <ShieldCheck className="w-4 h-4 text-[#EF6B23]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-white capitalize">{role.name}</p>
                          <span className="px-2 py-0.5 bg-[#EF6B23]/10 text-[#EF6B23] text-[10px] font-medium rounded-full border border-[#EF6B23]/20">
                            {role.adminRolePermissions.length} permissions
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{role.description || "No description"}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-1.5 text-gray-500 bg-white/5 rounded-lg px-2.5 py-1.5">
                        <Users className="w-3 h-3" />
                        <span className="text-[11px] font-medium">{role._count?.assignments ?? 0} admins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openModal("assign-permissions", role)} title="Assign Permissions" className="p-2 rounded-lg text-gray-400 hover:text-[#EF6B23] hover:bg-[#EF6B23]/10 transition-all">
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openModal("edit-role", role)} title="Edit" className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteRole(role.id)} title="Delete" className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setExpandedRole(isExpanded ? null : role.id)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-3 border-t border-white/5">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2.5">Assigned Permissions</p>
                        {role.adminRolePermissions.length === 0 ? (
                          <p className="text-xs text-gray-600 italic">No permissions assigned.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {role.adminRolePermissions.map((rp) => (
                              <span key={rp.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#141414] border border-white/10 text-gray-300 text-[11px] rounded-lg font-mono">
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

      {/* ══ PERMISSIONS TAB ════════════════════════════════════════════════════ */}
      {activeTab === "permissions" && (
        <>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPerms.map((perm) => (
                <div key={perm.id} className="bg-gradient-to-br from-[#1c1c1c] to-[#181818] border border-white/10 rounded-xl p-4 flex flex-col gap-3 group hover:border-white/20 transition-all duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/15 to-transparent rounded-lg flex items-center justify-center border border-purple-500/20 flex-shrink-0">
                      <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal("edit-permission", undefined, perm)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeletePermission(perm.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white font-mono">{perm.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{perm.description || "No description"}</p>
                  </div>
                  <div className="mt-auto pt-2 border-t border-white/5">
                    <p className="text-[10px] text-gray-600">
                      Used in{" "}
                      <span className="text-gray-400 font-medium">
                        {roles.filter((r) => r.adminRolePermissions.some((rp) => rp.permission.id === perm.id)).length}
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

      {/* ══ ADMINS TAB ═════════════════════════════════════════════════════════ */}
      {activeTab === "admins" && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search admins..."
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EF6B23]/50 transition-colors"
            />
          </div>

          {adminsLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 text-[#EF6B23] animate-spin" />
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <UserCog className="w-10 h-10 text-gray-700" />
              <p className="text-sm text-gray-500">No admins found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAdmins.map((admin) => (
                <div key={admin.id} className="bg-gradient-to-br from-[#1c1c1c] to-[#181818] border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-white/20 transition-all duration-200">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-transparent rounded-lg flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                    <span className="text-sm font-bold text-blue-400 uppercase">
                      {admin.name?.charAt(0) ?? "A"}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{admin.name}</p>
                      {admin.isSuperAdmin && (
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-[10px] font-medium rounded-full border border-yellow-500/20">
                          Super Admin
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${admin.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{admin.email}</p>
                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-gray-500 bg-white/5 rounded-lg px-2.5 py-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[11px] font-medium">{admin._count?.roles ?? 0} roles</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => openModal("view-admin", undefined, undefined, admin)} title="View Details" className="p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-all">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openModal("assign-roles-to-admin", undefined, undefined, admin)} title="Assign Roles" className="p-2 rounded-lg text-gray-400 hover:text-[#EF6B23] hover:bg-[#EF6B23]/10 transition-all">
                      <ShieldPlus className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openModal("edit-admin", undefined, undefined, admin)} title="Edit" className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteAdmin(admin.id, admin.name)} title="Delete Admin" className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══ MODALS ══════════════════════════════════════════════════════════════ */}

      {modalType === "create-role" && (
        <Modal title="Create New Role" onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Role Name" value={formName} onChange={setFormName} placeholder="e.g. content-manager" required />
            <Field label="Description" value={formDesc} onChange={setFormDesc} placeholder="What can this role do?" />
            {formError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{formError}</p>}
            <SubmitBtn label="Create Role" onClick={handleCreateRole} />
          </div>
        </Modal>
      )}

      {modalType === "edit-role" && (
        <Modal title="Edit Role" onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Role Name" value={formName} onChange={setFormName} placeholder="Role name" required />
            <Field label="Description" value={formDesc} onChange={setFormDesc} placeholder="Description" />
            {formError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{formError}</p>}
            <SubmitBtn label="Save Changes" onClick={handleEditRole} />
          </div>
        </Modal>
      )}

      {modalType === "assign-permissions" && selectedRole && (
        <Modal title={`Permissions — ${selectedRole.name}`} onClose={closeModal}>
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Toggle permissions to assign or unassign from this role.</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setAssignedPermIds(permissions.map((p) => p.id))} className="text-[11px] text-[#EF6B23] hover:underline">Select all</button>
              <span className="text-gray-700">·</span>
              <button onClick={() => setAssignedPermIds([])} className="text-[11px] text-gray-500 hover:text-white hover:underline">Clear all</button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1" style={{ scrollbarWidth: "thin" }}>
              {permissions.map((perm) => (
                <ToggleRow key={perm.id} id={perm.id} name={perm.name} description={perm.description} checked={assignedPermIds.includes(perm.id)} onToggle={toggleAssignPerm} />
              ))}
            </div>
            <p className="text-[10px] text-gray-600">{assignedPermIds.length} of {permissions.length} selected</p>
            {formError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{formError}</p>}
            <SubmitBtn label="Save Permissions" onClick={handleAssignPermissions} />
          </div>
        </Modal>
      )}

      {modalType === "create-permission" && (
        <Modal title="Create New Permission" onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Permission Name" value={formName} onChange={setFormName} placeholder="e.g. project.create" required />
            <Field label="Description" value={formDesc} onChange={setFormDesc} placeholder="What does this permission allow?" />
            {formError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{formError}</p>}
            <SubmitBtn label="Create Permission" onClick={handleCreatePermission} />
          </div>
        </Modal>
      )}

      {modalType === "edit-permission" && (
        <Modal title="Edit Permission" onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Permission Name" value={formName} onChange={setFormName} placeholder="Permission name" required />
            <Field label="Description" value={formDesc} onChange={setFormDesc} placeholder="Description" />
            {formError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{formError}</p>}
            <SubmitBtn label="Save Changes" onClick={handleEditPermission} />
          </div>
        </Modal>
      )}

      {modalType === "create-admin" && (
        <Modal title="Create New Admin" onClose={closeModal} wide>
          <div className="space-y-4">
            <Field label="Full Name" value={formName} onChange={setFormName} placeholder="e.g. John Admin" required />
            <Field label="Email" value={formEmail} onChange={setFormEmail} placeholder="admin@example.com" type="email" required />
            <Field label="Password" value={formPassword} onChange={setFormPassword} placeholder="••••••••" type="password" required />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setFormIsActive((v) => !v)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${formIsActive ? "bg-[#EF6B23]" : "bg-white/10"}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${formIsActive ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-xs text-gray-400">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setFormIsSuperAdmin((v) => !v)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${formIsSuperAdmin ? "bg-yellow-500" : "bg-white/10"}`}
                >
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${formIsSuperAdmin ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-xs text-gray-400">Super Admin</span>
              </label>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Assign Roles <span className="text-gray-600">(optional)</span></p>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1" style={{ scrollbarWidth: "thin" }}>
                {roles.map((role) => (
                  <ToggleRow key={role.id} id={role.id} name={role.name} description={role.description} checked={assignedRoleIds.includes(role.id)} onToggle={toggleAssignRole} accentColor="#EF6B23" />
                ))}
              </div>
            </div>
            {formError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{formError}</p>}
            <SubmitBtn label="Create Admin" onClick={handleCreateAdmin} />
          </div>
        </Modal>
      )}

      {modalType === "edit-admin" && selectedAdmin && (
        <Modal title={`Edit Admin — ${selectedAdmin.name}`} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Full Name" value={formName} onChange={setFormName} placeholder="Admin name" required />
            <Field label="Email" value={formEmail} onChange={setFormEmail} placeholder="admin@example.com" type="email" required />
            <Field label="New Password" value={formPassword} onChange={setFormPassword} placeholder="Leave blank to keep current" type="password" />
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setFormIsActive((v) => !v)}
                className={`w-8 h-4 rounded-full transition-colors relative ${formIsActive ? "bg-[#EF6B23]" : "bg-white/10"}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${formIsActive ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-xs text-gray-400">Active</span>
            </label>
            {formError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{formError}</p>}
            <SubmitBtn label="Save Changes" onClick={handleEditAdmin} />
          </div>
        </Modal>
      )}

      {modalType === "assign-roles-to-admin" && selectedAdmin && (
        <Modal title={`Assign Roles — ${selectedAdmin.name}`} onClose={closeModal}>
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Select roles to assign to this admin.</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setAssignedRoleIds(roles.map((r) => r.id))} className="text-[11px] text-[#EF6B23] hover:underline">Select all</button>
              <span className="text-gray-700">·</span>
              <button onClick={() => setAssignedRoleIds([])} className="text-[11px] text-gray-500 hover:text-white hover:underline">Clear all</button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1" style={{ scrollbarWidth: "thin" }}>
              {roles.map((role) => (
                <ToggleRow key={role.id} id={role.id} name={role.name} description={role.description} checked={assignedRoleIds.includes(role.id)} onToggle={toggleAssignRole} accentColor="#EF6B23" />
              ))}
            </div>
            <p className="text-[10px] text-gray-600">{assignedRoleIds.length} of {roles.length} selected</p>
            {formError && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{formError}</p>}
            <SubmitBtn label="Save Roles" onClick={handleAssignRolesToAdmin} />
          </div>
        </Modal>
      )}

      {modalType === "view-admin" && selectedAdmin && (
        <Modal title={`Admin Details — ${selectedAdmin.name}`} onClose={closeModal} wide>
          {adminDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-[#EF6B23] animate-spin" />
            </div>
          ) : selectedAdminDetail ? (
            <div className="space-y-4">
              <div className="bg-[#141414] border border-white/10 rounded-lg p-4 space-y-2.5">
                {[
                  ["Name",       selectedAdminDetail.name],
                  ["Email",      selectedAdminDetail.email],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">{k}</span>
                    <span className="text-xs font-medium text-white">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">Status</span>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${selectedAdminDetail.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {selectedAdminDetail.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">Super Admin</span>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${selectedAdminDetail.isSuperAdmin ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-white/5 text-gray-500 border-white/10"}`}>
                    {selectedAdminDetail.isSuperAdmin ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">Last Login</span>
                  <span className="text-xs text-gray-400">
                    {selectedAdminDetail.lastLoginAt
                      ? new Date(selectedAdminDetail.lastLoginAt).toLocaleString()
                      : "Never"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Assigned Roles</p>
                {!selectedAdminDetail.roles || selectedAdminDetail.roles.length === 0 ? (
                  <p className="text-xs text-gray-600 italic">No roles assigned.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedAdminDetail.roles.map((ar) => (
                      <div key={ar.id} className="bg-[#141414] border border-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#EF6B23]" />
                          <span className="text-xs font-semibold text-white capitalize">{ar.role.name}</span>
                        </div>
                        {ar.role.adminRolePermissions?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {ar.role.adminRolePermissions.map((rp) => (
                              <span key={rp.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1f1f1f] border border-white/10 text-gray-400 text-[10px] rounded font-mono">
                                <KeyRound className="w-2 h-2 text-purple-400" />
                                {rp.permission.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-white/10">
                <button onClick={closeModal} className="px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  Close
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-8">Failed to load admin details.</p>
          )}
        </Modal>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      {deleteConfirm && (
        <DeleteConfirmModal
          message={deleteConfirm.message}
          onConfirm={deleteConfirm.onConfirm}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* ── Toast Notifications ──────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

    </div>
  );
}
