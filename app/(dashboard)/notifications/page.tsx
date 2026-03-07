"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  Send,
  Radio,
  User,
  Calendar,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  Info,
  Zap,
  Megaphone,
} from "lucide-react";
import { apiFetch } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ─── Types ─────────────────────────────────────────────────────────────────────
type NotifType = "SYSTEM" | "ANNOUNCEMENT" | "INVESTMENT" | "REWARD";
type NotifPriority = "HIGH" | "URGENT";
type NotifStatus = "SENT" | "PENDING" | "SCHEDULED";

type Notification = {
  id: string;
  userId?: string;
  type: NotifType;
  priority: NotifPriority;
  title: string;
  message: string;
  actionUrl?: string | null;
  status: NotifStatus;
  scheduledFor?: string | null;
  sentAt?: string | null;
  isRead?: boolean;
  broadcastId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string } | null;
};

type ModalType =
  | "create-targeted"
  | "create-broadcast"
  | "edit"
  | "edit-broadcast"
  | null;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  NotifType,
  { label: string; color: string; bg: string; border: string; Icon: React.ElementType }
> = {
  SYSTEM:       { label: "System",       color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   Icon: Info },
  ANNOUNCEMENT: { label: "Announcement", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", Icon: Megaphone },
  INVESTMENT:   { label: "Investment",   color: "text-green-400",  bg: "bg-green-400/10",  border: "border-green-400/20",  Icon: Zap },
  REWARD:       { label: "Reward",       color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", Icon: AlertCircle },
};

const PRIORITY_CONFIG: Record<
  NotifPriority,
  { label: string; color: string; bg: string }
> = {
  HIGH:   { label: "High",   color: "text-orange-400", bg: "bg-orange-400/10" },
  URGENT: { label: "Urgent", color: "text-red-400",    bg: "bg-red-400/10"    },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Modal Wrapper ──────────────────────────────────────────────────────────────
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
        className={`bg-gradient-to-b from-[#1f1f1f] to-[#181818] border border-white/10 rounded-xl shadow-2xl w-full ${
          wide ? "max-w-lg" : "max-w-md"
        } max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
          <h2 className="text-white font-semibold text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Field Components ──────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
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
        className="bg-[#141414] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EF6B23]/50 transition-colors"
      />
    </div>
  );
}

function TextArea({
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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="bg-[#141414] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EF6B23]/50 transition-colors resize-none"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#141414] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#EF6B23]/50 transition-colors appearance-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#1a1a1a]">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "broadcast">("all");

  // ── Data ─────────────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // ── Modal ─────────────────────────────────────────────────────────────────────
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  // ── Form ──────────────────────────────────────────────────────────────────────
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formType, setFormType] = useState<NotifType>("SYSTEM");
  const [formPriority, setFormPriority] = useState<NotifPriority>("HIGH");
  const [formUserId, setFormUserId] = useState("");
  const [formScheduled, setFormScheduled] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const url =
        typeFilter !== "ALL"
          ? `${API_BASE_URL}/admin/notifications?type=${typeFilter}`
          : `${API_BASE_URL}/admin/notifications`;
      const res = await apiFetch(url);
      const data = await res.json();
      setNotifications(data.data ?? []);
    } catch {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── Open Modal ────────────────────────────────────────────────────────────────
  const openModal = (type: ModalType, notif?: Notification) => {
    setFormError("");
    setModalType(type);

    if ((type === "edit" || type === "edit-broadcast") && notif) {
      setSelectedNotif(notif);
      setFormTitle(notif.title);
      setFormMessage(notif.message);
      setFormType(notif.type);
      setFormPriority(notif.priority);
      setFormScheduled(notif.scheduledFor ?? "");
    } else {
      setFormTitle("");
      setFormMessage("");
      setFormType("SYSTEM");
      setFormPriority("HIGH");
      setFormUserId("");
      setFormScheduled("");
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedNotif(null);
    setFormError("");
  };

  // ── Create Targeted ───────────────────────────────────────────────────────────
  const handleCreateTargeted = async () => {
    if (!formTitle.trim() || !formMessage.trim())
      return setFormError("Title and message are required.");
    setSubmitting(true);
    setFormError("");
    try {
      const body: Record<string, unknown> = {
        title: formTitle,
        message: formMessage,
        type: formType,
        priority: formPriority,
      };
      if (formUserId.trim()) body.userId = formUserId.trim();
      if (formScheduled) body.scheduledFor = formScheduled;

      const res = await apiFetch(`${API_BASE_URL}/admin/notifications`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchNotifications();
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to create notification");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Create Broadcast ──────────────────────────────────────────────────────────
  const handleCreateBroadcast = async () => {
    if (!formTitle.trim() || !formMessage.trim())
      return setFormError("Title and message are required.");
    setSubmitting(true);
    setFormError("");
    try {
      const body: Record<string, unknown> = {
        title: formTitle,
        message: formMessage,
        type: formType,
        priority: formPriority,
      };
      if (formScheduled) body.scheduledFor = formScheduled;

      const res = await apiFetch(
        `${API_BASE_URL}/admin/notifications/broadcast`,
        { method: "POST", body: JSON.stringify(body) }
      );
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchNotifications();
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to broadcast");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Update ────────────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!selectedNotif) return;
    setSubmitting(true);
    setFormError("");
    try {
      const isBroadcast = modalType === "edit-broadcast";
      const endpoint = isBroadcast
        ? `${API_BASE_URL}/admin/notifications/broadcast/${selectedNotif.broadcastId}`
        : `${API_BASE_URL}/admin/notifications/${selectedNotif.id}`;

      const body: Record<string, unknown> = {
        title: formTitle,
        message: formMessage,
      };
      if (formScheduled) body.scheduledFor = formScheduled;

      const res = await apiFetch(endpoint, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      await fetchNotifications();
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (notif: Notification) => {
    const isBroadcast = !!notif.broadcastId;
    const label = isBroadcast ? "broadcast notification" : "notification";
    if (!confirm(`Delete this ${label}? This cannot be undone.`)) return;

    try {
      const endpoint = isBroadcast
        ? `${API_BASE_URL}/admin/notifications/broadcast/${notif.broadcastId}`
        : `${API_BASE_URL}/admin/notifications/${notif.id}`;
      await apiFetch(endpoint, { method: "DELETE" });
      await fetchNotifications();
    } catch {
      alert("Failed to delete notification.");
    }
  };

  // ── Filtered ──────────────────────────────────────────────────────────────────
  const allNotifs = notifications.filter((n) => !n.broadcastId);
  const broadcastNotifs = notifications.filter((n) => !!n.broadcastId);
  const activeList = activeTab === "all" ? allNotifs : broadcastNotifs;

  const filtered = activeList.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase()) ||
      (n.user?.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // ── Submit Button ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#111111] text-white p-6">

      {/* ── Page Header ────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#EF6B23]/20 to-[#EF6B23]/5 rounded-lg flex items-center justify-center border border-[#EF6B23]/20">
            <Bell className="w-4 h-4 text-[#EF6B23]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">
              Notification Management
            </h1>
            <p className="text-xs text-gray-500">
              Send, broadcast and manage admin notifications
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total",      value: notifications.length,                      color: "text-white" },
          { label: "Broadcasts", value: broadcastNotifs.length,                    color: "text-yellow-400" },
          { label: "Targeted",   value: allNotifs.length,                          color: "text-blue-400" },
          { label: "Unread",     value: notifications.filter((n) => !n.isRead).length, color: "text-red-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-gradient-to-br from-[#1c1c1c] to-[#181818] border border-white/10 rounded-xl p-3"
          >
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
              {s.label}
            </p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs + Actions ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Tabs */}
        <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-lg p-1 gap-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
              activeTab === "all"
                ? "bg-[#EF6B23] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Targeted
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                activeTab === "all" ? "bg-white/20" : "bg-white/5 text-gray-500"
              }`}
            >
              {allNotifs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-all ${
              activeTab === "broadcast"
                ? "bg-[#EF6B23] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Broadcasts
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                activeTab === "broadcast"
                  ? "bg-white/20"
                  : "bg-white/5 text-gray-500"
              }`}
            >
              {broadcastNotifs.length}
            </span>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#1a1a1a] border border-white/10 rounded-lg pl-3 pr-8 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#EF6B23]/50 appearance-none"
            >
              <option value="ALL">All Types</option>
              <option value="SYSTEM">System</option>
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="INVESTMENT">Investment</option>
              <option value="REWARD">Reward</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchNotifications}
            className="p-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Create buttons */}
          <button
            onClick={() => openModal("create-targeted")}
            className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-white/10 hover:border-[#EF6B23]/30 text-gray-300 hover:text-white text-xs font-medium rounded-lg transition-all"
          >
            <Send className="w-3.5 h-3.5 text-[#EF6B23]" />
            Targeted
          </button>
          <button
            onClick={() => openModal("create-broadcast")}
            className="flex items-center gap-2 px-3 py-2 bg-[#EF6B23] hover:bg-[#d95e1a] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Radio className="w-3.5 h-3.5" />
            Broadcast
          </button>
        </div>
      </div>

      {/* ── Search ─────────────────────────────────────────────────────────────── */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
        <input
          type="text"
          placeholder="Search by title, message or user email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EF6B23]/50 transition-colors"
        />
      </div>

      {/* ── Notifications List ─────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-[#EF6B23] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Bell className="w-10 h-10 text-gray-700" />
          <p className="text-sm text-gray-500">No notifications found</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((notif) => {
            const tc = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.SYSTEM;
            const pc = PRIORITY_CONFIG[notif.priority] ?? PRIORITY_CONFIG.HIGH;
            const TypeIcon = tc.Icon;
            const isBroadcast = !!notif.broadcastId;

            return (
              <div
                key={notif.id}
                className="bg-gradient-to-br from-[#1c1c1c] to-[#181818] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start gap-3">
                  {/* Type icon */}
                  <div
                    className={`w-8 h-8 ${tc.bg} rounded-lg flex items-center justify-center flex-shrink-0 border ${tc.border} mt-0.5`}
                  >
                    <TypeIcon className={`w-3.5 h-3.5 ${tc.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">
                          {notif.title}
                        </p>

                        {/* Type badge */}
                        <span
                          className={`px-2 py-0.5 ${tc.bg} ${tc.color} text-[10px] font-medium rounded-full border ${tc.border}`}
                        >
                          {tc.label}
                        </span>

                        {/* Priority badge */}
                        <span
                          className={`px-2 py-0.5 ${pc.bg} ${pc.color} text-[10px] font-medium rounded-full`}
                        >
                          {pc.label}
                        </span>

                        {/* Broadcast badge */}
                        {isBroadcast && (
                          <span className="px-2 py-0.5 bg-yellow-400/10 text-yellow-400 text-[10px] font-medium rounded-full border border-yellow-400/20 flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5" />
                            Broadcast
                          </span>
                        )}
                      </div>

                      {/* Actions — visible on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() =>
                            openModal(
                              isBroadcast ? "edit-broadcast" : "edit",
                              notif
                            )
                          }
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(notif)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {notif.message}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {notif.user && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <User className="w-3 h-3" />
                          {notif.user.email}
                        </span>
                      )}
                      {notif.scheduledFor && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Calendar className="w-3 h-3" />
                          Scheduled: {formatDate(notif.scheduledFor)}
                        </span>
                      )}
                      {notif.sentAt && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Send className="w-3 h-3" />
                          Sent: {formatDate(notif.sentAt)}
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-medium ${
                          notif.status === "SENT"
                            ? "text-green-400"
                            : notif.status === "SCHEDULED"
                            ? "text-yellow-400"
                            : "text-gray-500"
                        }`}
                      >
                        {notif.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}

      {/* Create Targeted */}
      {modalType === "create-targeted" && (
        <Modal title="Send Targeted Notification" onClose={closeModal} wide>
          <div className="space-y-4">
            <Field
              label="Title"
              value={formTitle}
              onChange={setFormTitle}
              placeholder="Notification title"
              required
            />
            <TextArea
              label="Message"
              value={formMessage}
              onChange={setFormMessage}
              placeholder="Notification message..."
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Type"
                value={formType}
                onChange={(v) => setFormType(v as NotifType)}
                options={[
                  { value: "SYSTEM",       label: "System" },
                  { value: "ANNOUNCEMENT", label: "Announcement" },
                  { value: "INVESTMENT",   label: "Investment" },
                  { value: "REWARD",       label: "Reward" },
                ]}
                required
              />
              <SelectField
                label="Priority"
                value={formPriority}
                onChange={(v) => setFormPriority(v as NotifPriority)}
                options={[
                  { value: "HIGH",   label: "High" },
                  { value: "URGENT", label: "Urgent" },
                ]}
                required
              />
            </div>
            <Field
              label="User ID (optional — leave blank for general)"
              value={formUserId}
              onChange={setFormUserId}
              placeholder="e.g. fe802aeb-85fc-4e43-83b8-..."
            />
            <Field
              label="Schedule For (optional)"
              value={formScheduled}
              onChange={setFormScheduled}
              type="datetime-local"
            />
            {formError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            <SubmitBtn label="Send Notification" onClick={handleCreateTargeted} />
          </div>
        </Modal>
      )}

      {/* Create Broadcast */}
      {modalType === "create-broadcast" && (
        <Modal title="Broadcast to All Users" onClose={closeModal} wide>
          <div className="space-y-4">
            {/* Info banner */}
            <div className="flex items-start gap-2.5 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
              <Radio className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-300">
                This will send a notification to <strong>all users</strong> in the system.
              </p>
            </div>
            <Field
              label="Title"
              value={formTitle}
              onChange={setFormTitle}
              placeholder="Broadcast title"
              required
            />
            <TextArea
              label="Message"
              value={formMessage}
              onChange={setFormMessage}
              placeholder="Broadcast message..."
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Type"
                value={formType}
                onChange={(v) => setFormType(v as NotifType)}
                options={[
                  { value: "SYSTEM",       label: "System" },
                  { value: "ANNOUNCEMENT", label: "Announcement" },
                  { value: "INVESTMENT",   label: "Investment" },
                  { value: "REWARD",       label: "Reward" },
                ]}
                required
              />
              <SelectField
                label="Priority"
                value={formPriority}
                onChange={(v) => setFormPriority(v as NotifPriority)}
                options={[
                  { value: "HIGH",   label: "High" },
                  { value: "URGENT", label: "Urgent" },
                ]}
                required
              />
            </div>
            <Field
              label="Schedule For (optional)"
              value={formScheduled}
              onChange={setFormScheduled}
              type="datetime-local"
            />
            {formError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            <SubmitBtn label="Broadcast Now" onClick={handleCreateBroadcast} />
          </div>
        </Modal>
      )}

      {/* Edit Notification / Broadcast */}
      {(modalType === "edit" || modalType === "edit-broadcast") && (
        <Modal
          title={
            modalType === "edit-broadcast"
              ? "Edit Broadcast Notification"
              : "Edit Notification"
          }
          onClose={closeModal}
          wide
        >
          <div className="space-y-4">
            <Field
              label="Title"
              value={formTitle}
              onChange={setFormTitle}
              placeholder="Title"
              required
            />
            <TextArea
              label="Message"
              value={formMessage}
              onChange={setFormMessage}
              placeholder="Message"
              required
            />
            <Field
              label="Schedule For (optional)"
              value={formScheduled}
              onChange={setFormScheduled}
              type="datetime-local"
            />
            {formError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            <SubmitBtn label="Save Changes" onClick={handleUpdate} />
          </div>
        </Modal>
      )}
    </div>
  );
}
