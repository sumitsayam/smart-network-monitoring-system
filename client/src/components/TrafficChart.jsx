import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111] border border-[#242424] p-3 rounded-xl shadow-xl backdrop-blur-md text-xs font-mono">
        <div className="text-[#A3A3A3] font-semibold mb-2 border-b border-[#242424] pb-1">
          Timestamp: {label}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-[#FF7A00]">
            <span className="flex items-center gap-1.5 font-sans text-[#A3A3A3]">
              <span className="w-2 h-2 rounded-full bg-[#FF6A00]"></span> Download:
            </span>
            <span className="font-bold">{payload[0]?.value} Mbps</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[#F5F5F5]">
            <span className="flex items-center gap-1.5 font-sans text-[#737373]">
              <span className="w-2 h-2 rounded-full bg-[#A3A3A3]"></span> Upload:
            </span>
            <span className="font-bold">{payload[1]?.value} Mbps</span>
          </div>
          {payload[2] && (
            <div className="flex items-center justify-between gap-4 text-[#22C55E] border-t border-[#242424] pt-1 mt-1">
              <span className="flex items-center gap-1.5 font-sans text-[#737373]">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span> Bandwidth:
              </span>
              <span className="font-bold">{payload[2]?.value}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function TrafficChart({
  data = [],
  timeframe = '1h',
  setTimeframe,
  title = "Network Traffic Throughput",
  showTimeframeSelector = true,
  height = 320
}) {
  return (
    <div className="bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424] flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
            {title}
          </h2>
          <p className="text-xs text-[#737373]">
            Live inbound & outbound transfer rates with telemetry
          </p>
        </div>

        {/* Timeframe Buttons */}
        {showTimeframeSelector && setTimeframe && (
          <div className="flex items-center bg-[#0A0A0A] p-1 rounded-xl border border-[#242424] self-start sm:self-auto">
            {['1h', '6h', 'today'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  timeframe === tf
                    ? 'bg-[#FF6A00]/15 text-[#FF7A00] border border-[#FF6A00]/40'
                    : 'text-[#737373] hover:text-[#F5F5F5] border border-transparent'
                }`}
              >
                {tf === '1h' ? 'Last 1 Hour' : tf === '6h' ? 'Last 6 Hours' : 'Today'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recharts Area Container */}
      <div style={{ width: '100%', height }}>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="downloadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FF6A00" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A3A3A3" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#A3A3A3" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#242424" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#737373"
                tick={{ fontSize: 11, fill: '#737373' }}
                tickLine={false}
                axisLine={{ stroke: '#242424' }}
              />
              <YAxis
                stroke="#737373"
                tick={{ fontSize: 11, fill: '#737373' }}
                tickLine={false}
                axisLine={{ stroke: '#242424' }}
                unit="M"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                iconType="circle"
              />

              <Area
                type="monotone"
                name="Download Speed"
                dataKey="download"
                stroke="#FF6A00"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#downloadGradient)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                name="Upload Speed"
                dataKey="upload"
                stroke="#A3A3A3"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#uploadGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-[#737373] text-xs">
            Loading traffic telemetry stream...
          </div>
        )}
      </div>

      {/* Metric badges under graph */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-2 border-t border-[#1C1C1C] text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#111111] border border-[#242424]">
          <ArrowDownCircle className="w-4 h-4 text-[#FF6A00] shrink-0" />
          <div>
            <div className="text-[#737373] text-[10px] uppercase">Peak Download</div>
            <div className="font-mono font-bold text-[#F5F5F5]">
              {data.length ? Math.max(...data.map(d => d.download || 0)).toFixed(1) : 0} Mbps
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#111111] border border-[#242424]">
          <ArrowUpCircle className="w-4 h-4 text-[#A3A3A3] shrink-0" />
          <div>
            <div className="text-[#737373] text-[10px] uppercase">Peak Upload</div>
            <div className="font-mono font-bold text-[#F5F5F5]">
              {data.length ? Math.max(...data.map(d => d.upload || 0)).toFixed(1) : 0} Mbps
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#111111] border border-[#242424]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></div>
          <div>
            <div className="text-[#737373] text-[10px] uppercase">Packet Health</div>
            <div className="font-mono font-bold text-[#22C55E]">99.8% (0 Loss)</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#111111] border border-[#242424]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]"></div>
          <div>
            <div className="text-[#737373] text-[10px] uppercase">Avg Latency</div>
            <div className="font-mono font-bold text-[#F5F5F5]">14 ms</div>
          </div>
        </div>
      </div>
    </div>
  );
}
