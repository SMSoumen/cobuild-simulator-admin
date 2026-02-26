"use client";
import { useState, useEffect } from 'react';
import { Gift, Edit3, Trash2, RefreshCw, Plus, X, AlertTriangle, Play, CheckCircle, XCircle, Zap, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { apiFetch, auth } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

interface RewardRule {
  id: string;
  name: string;
  amount: number;
  asset: string;
  fundSource: string;
  frequency: string;
  conditionKey: string;
  isActive: boolean;
  createdAt: string;
}

interface FormState {
  name: string;
  amount: string;
  asset: string;
  fundSource: string;
  frequency: string;
  conditionKey: string;
  isActive: boolean;
}

const DEFAULT_FORM: FormState = {
  name: "",
  amount: "",
  asset: "USD",
  fundSource: "PROMOTIONAL",
  frequency: "DAILY",
  conditionKey: "ALLUSERS",
  isActive: true,
};

function StatCard({ title, value, variant = "default", icon }: {
  title: string;
  value: string | number;
  variant?: "default" | "primary";
  icon?: ReactNode;
}) {
  if (variant === "primary") {
    return (
      <div className="group relative bg-gradient-to-br from-[#EF6B23] to-[#E4782C] p-4 rounded-xl shadow-lg shadow-[#EF6B23]/20 text-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#EF6B23]/30 hover:scale-[1.02] border border-[#FA9C31]/20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/0 to-transparent opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h3 className="text-white/80 text-xs font-medium uppercase tracking-wide">{title}</h3>
            <p className="text-xl font-bold tracking-tight drop-shadow-lg">{value}</p>
          </div>
          {icon && (
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20">
              <div className="scale-90">{icon}</div>
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
          <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wide">{title}</h3>
          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF6B23] to-[#FA9C31]">{value}</p>
        </div>
        {icon && (
          <div className="w-8 h-8 bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20 rounded-lg flex items-center justify-center text-[#EF6B23] group-hover:scale-110 transition-transform border border-[#EF6B23]/20 backdrop-blur-sm">
            <div className="scale-90">{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const FREQ_CLS: Record<string, string> = {
  DAILY: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  WEEKLY: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ONETIME: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

const COND_CLS: Record<string, string> = {
  ALLUSERS: "bg-green-500/20 text-green-400 border-green-500/30",
  ACTIVEUSERS: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  HASINVESTMENT: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const inputCls = "w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white placeholder-[#626262] focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all text-sm";
const selectCls = "w-full px-4 py-3 bg-[#151515]/80 border border-[#626262]/30 rounded-xl text-white focus:outline-none focus:border-[#EF6B23] focus:ring-2 focus:ring-[#EF6B23]/20 transition-all text-sm";

export default function RewardCampaignsPage() {
  const [rules, setRules] = useState<RewardRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<RewardRule | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [processResult, setProcessResult] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      alert("Please login first");
      window.location.href = "/login";
      return;
    }
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setIsLoadingRules(true);
    try {
      if (!API_BASE_URL) throw new Error("API_BASE_URL is not configured.");
      const res = await apiFetch(`${API_BASE_URL}/admin/reward-campaigns`, { method: "GET" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.success) setRules(data.data || []);
      else throw new Error(data.message || "Failed to fetch rules");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to load reward rules.");
    } finally {
      setIsLoadingRules(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!API_BASE_URL) { alert("API not configured"); return; }
    setIsLoading(true);
    try {
      const payload = {
        name: form.name,
        amount: Number(form.amount),
        asset: form.asset,
        fundSource: form.fundSource,
        frequency: form.frequency,
        conditionKey: form.conditionKey,
        ...(editingRule && { isActive: form.isActive }),
      };

      const url = editingRule
        ? `${API_BASE_URL}/admin/reward-campaigns/${editingRule.id}`
        : `${API_BASE_URL}/admin/reward-campaigns`;

      const res = await apiFetch(url, {
        method: editingRule ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Operation failed");

      alert(editingRule ? "Reward rule updated!" : "Reward rule created!");
      closeModal();
      fetchRules();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Operation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRule = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setIsLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/reward-campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");
      alert("Rule deleted successfully!");
      fetchRules();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete rule.");
    } finally {
      setIsLoading(false);
    }
  };

  const processRewards = async () => {
    if (!confirm("Manually trigger reward processing for all active rules?")) return;
    setIsProcessing(true);
    setProcessResult(null);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/reward-campaigns/process`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Processing failed");
      setProcessResult(data.message || "Rewards processed successfully!");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to process rewards.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startEdit = (rule: RewardRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      amount: rule.amount.toString(),
      asset: rule.asset,
      fundSource: rule.fundSource,
      frequency: rule.frequency,
      conditionKey: rule.conditionKey,
      isActive: rule.isActive,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRule(null);
    setForm(DEFAULT_FORM);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const activeCount = rules.filter(r => r.isActive).length;
  const totalAmount = rules.reduce((s, r) => s + r.amount, 0);
  const dailyCount = rules.filter(r => r.frequency === "DAILY").length;

  return (
    <div className="min-h-screen bg-[#1a1a1a] space-y-6 p-4 sm:p-6 lg:p-8">

      {!API_BASE_URL && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-500 mb-1">API Configuration Missing</h4>
            <p className="text-xs text-red-400/80">Please set NEXT_PUBLIC_API_BASE_URL in your .env.local file.</p>
          </div>
        </div>
      )}

      {processResult && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-400">{processResult}</p>
          </div>
          <button onClick={() => setProcessResult(null)} className="p-1 hover:bg-white/10 rounded-lg">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            Reward Campaigns <Gift className="w-6 h-6 text-[#EF6B23]" />
          </h1>
          <p className="text-sm text-gray-400">Create and manage automated reward rules for users.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRules}
            disabled={isLoadingRules}
            className="p-2 bg-gradient-to-r from-[#EF6B23]/20 to-[#E4782C]/20 text-[#EF6B23] rounded-lg hover:from-[#EF6B23]/30 hover:to-[#E4782C]/30 transition-all border border-[#EF6B23]/30"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${isLoadingRules ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={processRewards}
            disabled={isProcessing || !API_BASE_URL}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 hover:scale-[1.02] transition-all flex items-center gap-2 text-sm border border-green-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
            ) : (
              <><Play className="w-4 h-4" />Process Rewards</>
            )}
          </button>
          <button
            onClick={() => setShowModal(true)}
            disabled={!API_BASE_URL}
            className="px-4 py-2 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#EF6B23]/25 hover:scale-[1.02] transition-all flex items-center gap-2 text-sm border border-[#FA9C31]/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />New Rule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Rules" value={rules.length} variant="primary" icon={<Gift className="w-4 h-4" />} />
        <StatCard title="Active Rules" value={activeCount} icon={<CheckCircle className="w-4 h-4" />} />
        <StatCard title="Daily Rules" value={dailyCount} icon={<Zap className="w-4 h-4" />} />
        <StatCard title="Total Pool" value={`${totalAmount} USD`} icon={<DollarSign className="w-4 h-4" />} />
      </div>

      {/* Table / empty */}
      {isLoadingRules ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#EF6B23]/30 border-t-[#EF6B23] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading reward rules...</p>
          </div>
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-[#2a2a2a] to-[#232323] rounded-xl border border-white/10">
          <Gift className="w-12 h-12 text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg font-medium mb-1">No reward rules yet</p>
          <p className="text-gray-500 text-sm mb-5">Create your first reward campaign to get started.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold text-sm flex items-center gap-2 border border-[#FA9C31]/20"
          >
            <Plus className="w-4 h-4" />Create First Rule
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] rounded-xl border border-white/10 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-[#1a1a1a]/60">
                  {["Name", "Amount", "Frequency", "Condition", "Fund Source", "Status", "Created", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3.5 last:text-right">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, i) => (
                  <tr key={rule.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 !== 0 ? "bg-white/[0.02]" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#EF6B23]/20 to-[#E4782C]/20 rounded-lg flex items-center justify-center text-[#EF6B23] border border-[#EF6B23]/20 flex-shrink-0">
                          <Gift className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-white">{rule.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EF6B23] to-[#FA9C31]">
                        {rule.amount} {rule.asset}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${FREQ_CLS[rule.frequency] || "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                        {rule.frequency}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${COND_CLS[rule.conditionKey] || "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                        {rule.conditionKey}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{rule.fundSource}</td>
                    <td className="px-5 py-4">
                      {rule.isActive ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-400"><CheckCircle className="w-3.5 h-3.5" />Active</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-500"><XCircle className="w-3.5 h-3.5" />Inactive</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{formatDate(rule.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(rule)}
                          disabled={isLoading}
                          className="p-2 bg-gradient-to-r from-[#EF6B23]/20 to-[#E4782C]/20 text-[#EF6B23] rounded-lg hover:from-[#EF6B23]/30 hover:to-[#E4782C]/30 transition-all border border-[#EF6B23]/20 disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id, rule.name)}
                          disabled={isLoading}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/20 disabled:opacity-50"
                          title="Delete"
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
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#2a2a2a] to-[#232323] backdrop-blur-xl rounded-2xl border border-white/10 w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-[#333333]/50 flex items-center justify-between sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {editingRule ? "Edit Reward Rule" : "New Reward Rule"}
                <Gift className="w-5 h-5 text-[#EF6B23]" />
              </h3>
              <button onClick={closeModal} disabled={isLoading} className="p-2 hover:bg-white/10 rounded-xl transition-all group">
                <X className="w-5 h-5 text-gray-400 group-hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Rule Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className={inputCls} placeholder="e.g. Daily Login Bonus" required disabled={isLoading} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount *</label>
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    className={inputCls} placeholder="e.g. 10" required min={0} disabled={isLoading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Asset</label>
                  <select value={form.asset} onChange={e => setForm({ ...form, asset: e.target.value })} className={selectCls} disabled={isLoading}>
                    <option value="USD">USD</option>
                    {/* <option value="NFCTOKEN">NFCTOKEN</option> */}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Frequency *</label>
                  <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} className={selectCls} disabled={isLoading}>
                    <option value="DAILY">Daily</option>
                    {/* <option value="WEEKLY">Weekly</option>
                    <option value="ONETIME">One Time</option> */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Fund Source</label>
                  <select value={form.fundSource} onChange={e => setForm({ ...form, fundSource: e.target.value })} className={selectCls} disabled={isLoading}>
                    {/* <option value="PROMOTIONAL">Promotional</option> */}
                    <option value="DUMMY">Dummy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Condition Key</label>
                <select value={form.conditionKey} onChange={e => setForm({ ...form, conditionKey: e.target.value })} className={selectCls} disabled={isLoading}>
                  <option value="ALLUSERS">All Users</option>
                  <option value="ACTIVEUSERS">Active Users</option>
                  <option value="HASINVESTMENT">Has Investment</option>
                </select>
              </div>

              {editingRule && (
                <div className="flex items-center justify-between p-4 bg-[#1a1a1a]/50 rounded-xl border border-white/10">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Rule Status</p>
                    <p className="text-xs text-gray-500 mt-0.5">Toggle to activate or deactivate this rule.</p>
                  </div>
                  <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })} disabled={isLoading} className="flex items-center gap-2">
                    {form.isActive
                      ? <><ToggleRight className="w-8 h-8 text-[#EF6B23]" /><span className="text-sm font-semibold text-green-400">Active</span></>
                      : <><ToggleLeft className="w-8 h-8 text-gray-500" /><span className="text-sm font-semibold text-gray-500">Inactive</span></>
                    }
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-[#151515]/80 border border-[#626262]/30 text-white rounded-xl font-semibold hover:bg-[#1a1a1a] transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading || !API_BASE_URL}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#EF6B23] to-[#E4782C] text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-[#EF6B23]/25 transition-all flex items-center justify-center gap-2 border border-[#FA9C31]/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{editingRule ? "Updating..." : "Creating..."}</>
                    : <><Gift className="w-4 h-4" />{editingRule ? "Update Rule" : "Create Rule"}</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}