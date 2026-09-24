import React, { useState, useEffect } from 'react';
import AlertCard from '../components/AlertCard';
import { api } from '../services/api';
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  Info,
  CheckCircle2,
  Trash2,
  Filter
} from 'lucide-react';

export default function Alerts({
  alertsData,
  onResolveAlert,
  onDismissAlert,
  onClearResolved
}) {
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [alerts, setAlerts] = useState(alertsData?.alerts || []);
  const [counts, setCounts] = useState(alertsData?.counts || {
    total: 0,
    active: 0,
    high: 0,
    medium: 0,
    low: 0,
    resolved: 0
  });

  // Filter alerts when selection changes or parent data changes
  useEffect(() => {
    async function loadFilteredAlerts() {
      const res = await api.getAlerts({
        severity: severityFilter,
        status: statusFilter
      });
      if (res.data) {
        setAlerts(res.data.alerts || []);
        if (res.data.counts) setCounts(res.data.counts);
      }
    }
    loadFilteredAlerts();
  }, [severityFilter, statusFilter, alertsData]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#111111] border border-[#242424] text-[#FF6A00] shadow-md">
            <ShieldAlert className="w-6 h-6 text-[#FF6A00]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F5F5F5]">Security & Anomaly Alerts</h1>
            <p className="text-xs text-[#737373]">
              Rule-based network anomaly triggers, threshold violations, and device state events.
            </p>
          </div>
        </div>

        {/* Clear Resolved Action */}
        <div className="flex items-center gap-2">
          {counts.resolved > 0 && (
            <button
              onClick={onClearResolved}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#111111] hover:bg-[#171717] text-[#F5F5F5] border border-[#242424] transition-all active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#737373]" />
              <span>Clear Resolved ({counts.resolved})</span>
            </button>
          )}
        </div>
      </div>

      {/* Severity Counters Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* High Severity */}
        <div
          onClick={() => setSeverityFilter(severityFilter === 'HIGH' ? 'All' : 'HIGH')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            severityFilter === 'HIGH'
              ? 'bg-[#EF4444]/20 border-[#EF4444] shadow-md shadow-rose-500/10'
              : 'bg-[#0D0D0D] border-[#242424] hover:border-[#EF4444]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#EF4444] uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> High Severity
            </span>
            <span className="font-mono text-xl font-extrabold text-[#EF4444]">{counts.high}</span>
          </div>
          <p className="text-[11px] text-[#737373] mt-1">Spikes &gt; 70 Mbps</p>
        </div>

        {/* Medium Severity */}
        <div
          onClick={() => setSeverityFilter(severityFilter === 'MEDIUM' ? 'All' : 'MEDIUM')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            severityFilter === 'MEDIUM'
              ? 'bg-[#F59E0B]/20 border-[#F59E0B] shadow-md shadow-amber-500/10'
              : 'bg-[#0D0D0D] border-[#242424] hover:border-[#F59E0B]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Medium
            </span>
            <span className="font-mono text-xl font-extrabold text-[#F59E0B]">{counts.medium}</span>
          </div>
          <p className="text-[11px] text-[#737373] mt-1">Bandwidth &gt; 80%</p>
        </div>

        {/* Low Severity */}
        <div
          onClick={() => setSeverityFilter(severityFilter === 'LOW' ? 'All' : 'LOW')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            severityFilter === 'LOW'
              ? 'bg-[#171717] border-[#A3A3A3] shadow-md'
              : 'bg-[#0D0D0D] border-[#242424] hover:border-[#333333]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A3A3A3] uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Low
            </span>
            <span className="font-mono text-xl font-extrabold text-[#F5F5F5]">{counts.low}</span>
          </div>
          <p className="text-[11px] text-[#737373] mt-1">Device Offline events</p>
        </div>

        {/* Resolved */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Resolved' ? 'All' : 'Resolved')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'Resolved'
              ? 'bg-[#22C55E]/20 border-[#22C55E] shadow-md shadow-emerald-500/10'
              : 'bg-[#0D0D0D] border-[#242424] hover:border-[#22C55E]/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
            </span>
            <span className="font-mono text-xl font-extrabold text-[#22C55E]">{counts.resolved}</span>
          </div>
          <p className="text-[11px] text-[#737373] mt-1">Handled & cleared</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D0D0D] p-3 rounded-xl border border-[#242424]">
        <div className="flex items-center gap-2 text-xs text-[#737373] font-semibold">
          <Filter className="w-3.5 h-3.5 text-[#FF6A00]" />
          <span>Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#0A0A0A] p-1 rounded-lg border border-[#242424]">
            {['All', 'Active', 'Resolved'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  statusFilter === st
                    ? 'bg-[#FF6A00]/15 text-[#FF7A00] border border-[#FF6A00]/40'
                    : 'text-[#737373] hover:text-[#F5F5F5] border border-transparent'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Tabs */}
          <div className="flex items-center bg-[#0A0A0A] p-1 rounded-lg border border-[#242424]">
            {['All', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  severityFilter === sev
                    ? 'bg-[#FF6A00]/15 text-[#FF7A00] border border-[#FF6A00]/40'
                    : 'text-[#737373] hover:text-[#F5F5F5] border border-transparent'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map(alert => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={onResolveAlert}
              onDismiss={onDismissAlert}
            />
          ))
        ) : (
          <div className="bg-[#0D0D0D] p-12 text-center rounded-2xl border border-[#242424]">
            <CheckCircle2 className="w-10 h-10 text-[#22C55E] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#F5F5F5] mb-1">No Alerts Found</h3>
            <p className="text-xs text-[#737373]">
              There are currently no alerts matching your active filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* College Project Rule Explanation Card */}
      <div className="p-4 rounded-xl bg-[#080808] border border-[#242424] text-xs space-y-2">
        <h4 className="font-bold text-[#A3A3A3] uppercase tracking-wider text-[11px]">
          Rule-Based Alert Detection Engine (Evaluation Logic)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[#737373]">
          <div className="p-2.5 rounded-lg bg-[#0D0D0D] border border-[#242424]">
            <span className="text-[#EF4444] font-bold block mb-1">1. High Device Bandwidth</span>
            Triggers when any individual host exceeds 70 Mbps download rate.
          </div>
          <div className="p-2.5 rounded-lg bg-[#0D0D0D] border border-[#242424]">
            <span className="text-[#F59E0B] font-bold block mb-1">2. Network Capacity Warning</span>
            Triggers when total aggregated bandwidth exceeds 80% of network limit (150 Mbps).
          </div>
          <div className="p-2.5 rounded-lg bg-[#0D0D0D] border border-[#242424]">
            <span className="text-[#A3A3A3] font-bold block mb-1">3. Abrupt Device Offline</span>
            Triggers when a previously active host heartbeat times out.
          </div>
        </div>
      </div>
    </div>
  );
}
