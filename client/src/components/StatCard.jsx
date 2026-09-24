import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  unit = '',
  subtext,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'up' | 'down' | 'neutral'
  color = 'orange' // 'orange' | 'emerald' | 'amber' | 'rose' | 'neutral'
}) {
  const colorMap = {
    orange: {
      border: 'border-[#242424] hover:border-[#FF6A00]/40',
      iconBg: 'bg-[#FF6A00]/10 text-[#FF6A00]',
      glow: 'shadow-orange-500/5'
    },
    emerald: {
      border: 'border-[#242424] hover:border-[#22C55E]/40',
      iconBg: 'bg-[#22C55E]/10 text-[#22C55E]',
      glow: 'shadow-emerald-500/5'
    },
    amber: {
      border: 'border-[#242424] hover:border-[#F59E0B]/40',
      iconBg: 'bg-[#F59E0B]/10 text-[#F59E0B]',
      glow: 'shadow-amber-500/5'
    },
    rose: {
      border: 'border-[#242424] hover:border-[#EF4444]/40',
      iconBg: 'bg-[#EF4444]/10 text-[#EF4444]',
      glow: 'shadow-rose-500/5'
    },
    neutral: {
      border: 'border-[#242424] hover:border-[#333333]',
      iconBg: 'bg-[#171717] text-[#A3A3A3]',
      glow: ''
    }
  };

  const currentTheme = colorMap[color] || colorMap.orange;

  return (
    <div className={`bg-[#0D0D0D] p-5 rounded-2xl border transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg ${currentTheme.border} ${currentTheme.glow}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-[#F5F5F5] font-mono">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-semibold text-[#737373] font-sans">
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${currentTheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1C1C1C]">
        <span className="text-[#737373] truncate">{subtext}</span>

        {trend && (
          <div className={`flex items-center gap-1 font-medium font-mono ${
            trendType === 'up' 
              ? 'text-[#22C55E]' 
              : trendType === 'down' 
              ? 'text-[#EF4444]' 
              : 'text-[#A3A3A3]'
          }`}>
            {trendType === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
            {trendType === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}
