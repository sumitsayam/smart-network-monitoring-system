import React from 'react';
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Clock,
  Zap
} from 'lucide-react';

const SEVERITY_CONFIG = {
  HIGH: {
    bg: 'bg-[#EF4444]/10',
    border: 'border-[#EF4444]/30',
    text: 'text-[#EF4444]',
    badge: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40',
    icon: AlertTriangle
  },
  MEDIUM: {
    bg: 'bg-[#F59E0B]/10',
    border: 'border-[#F59E0B]/30',
    text: 'text-[#F59E0B]',
    badge: 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40',
    icon: Zap
  },
  LOW: {
    bg: 'bg-[#111111]',
    border: 'border-[#242424]',
    text: 'text-[#A3A3A3]',
    badge: 'bg-[#171717] text-[#A3A3A3] border-[#333333]',
    icon: Info
  }
};

export default function AlertCard({
  alert,
  onResolve,
  onDismiss
}) {
  const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.LOW;
  const Icon = config.icon;
  const isResolved = alert.status === 'Resolved';

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isResolved
          ? 'bg-[#0A0A0A] border-[#242424] opacity-50'
          : `${config.bg} ${config.border} shadow-sm`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Alert Body */}
        <div className="flex items-start gap-3 min-w-0">
          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
            isResolved ? 'bg-[#111111] text-[#737373]' : `${config.badge}`
          }`}>
            <Icon className="w-4 h-4" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                isResolved ? 'bg-[#111111] text-[#737373] border-[#242424]' : config.badge
              }`}>
                {alert.severity}
              </span>

              <span className="text-xs font-bold text-[#F5F5F5] font-mono">
                {alert.type}
              </span>

              {alert.device && (
                <span className="text-xs text-[#A3A3A3] font-medium bg-[#111111] px-2 py-0.5 rounded border border-[#242424]">
                  {alert.device} ({alert.ip})
                </span>
              )}
            </div>

            <p className="text-xs text-[#F5F5F5] leading-relaxed break-words">
              {alert.message}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-[#737373] font-mono pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {alert.time}
              </span>
              <span>•</span>
              <span className={isResolved ? 'text-[#22C55E] font-semibold' : 'text-[#F59E0B] font-semibold'}>
                Status: {alert.status}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isResolved && onResolve && (
            <button
              onClick={() => onResolve(alert.id)}
              title="Mark alert as resolved"
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 transition-all flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resolve</span>
            </button>
          )}

          {onDismiss && (
            <button
              onClick={() => onDismiss(alert.id)}
              title="Dismiss / delete alert"
              className="p-1.5 text-[#737373] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
