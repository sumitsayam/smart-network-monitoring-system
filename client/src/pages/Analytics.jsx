import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  Zap,
  Globe,
  Activity,
  CheckCircle2
} from 'lucide-react';

const COLORS = ['#FF6A00', '#FF8C42', '#F5F5F5', '#A3A3A3', '#737373'];

export default function Analytics({ dashboardData, networkStats }) {
  const topUsers = dashboardData?.topUsers || [
    { name: 'Admin-PC', speedMbps: 35.4, percentage: 35 },
    { name: 'Student-Laptop', speedMbps: 28.6, percentage: 25 },
    { name: 'Lab-Server', speedMbps: 18.2, percentage: 18 },
    { name: 'Smart-TV', speedMbps: 15.6, percentage: 12 },
    { name: 'Library-Workstation', speedMbps: 12.4, percentage: 10 }
  ];

  const averageLatency = networkStats?.averageLatency !== undefined ? networkStats.averageLatency : 14.2;
  const packetLoss = networkStats?.packetLoss !== undefined ? networkStats.packetLoss : 0.0;

  // Protocol Distribution simulated telemetry
  const protocolData = [
    { name: 'HTTPS (Port 443)', value: 58, bandwidth: '62.4 Mbps' },
    { name: 'HTTP (Port 80)', value: 16, bandwidth: '17.2 Mbps' },
    { name: 'SSH / SFTP (Port 22)', value: 12, bandwidth: '12.8 Mbps' },
    { name: 'DNS (Port 53)', value: 8, bandwidth: '8.6 Mbps' },
    { name: 'Streaming / UDP', value: 6, bandwidth: '6.4 Mbps' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#111111] border border-[#242424] text-[#FF6A00] shadow-md">
            <BarChart3 className="w-6 h-6 text-[#FF6A00]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F5F5F5]">Network Analytics Dashboard</h1>
            <p className="text-xs text-[#737373]">
              Protocol breakdown, bandwidth consumption patterns, and host performance metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-mono font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
            Health Score: 98/100
          </span>
        </div>
      </div>

      {/* Grid 1: Top Bandwidth Consumers Bar Chart + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Consumers Bar Chart */}
        <div className="bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF6A00]" />
                Top Bandwidth Consuming Hosts
              </h3>
              <p className="text-xs text-[#737373]">Real-time throughput consumption by device</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topUsers}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#242424" horizontal={false} />
                <XAxis type="number" stroke="#737373" tick={{ fontSize: 11 }} unit="M" />
                <YAxis dataKey="name" type="category" stroke="#737373" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [`${value} Mbps`, 'Speed']}
                  contentStyle={{
                    backgroundColor: '#111111',
                    borderColor: '#242424',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F5F5F5'
                  }}
                />
                <Bar dataKey="speedMbps" fill="#FF6A00" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                  {topUsers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4 pt-3 border-t border-[#1C1C1C]">
            {topUsers.map((u, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-[#A3A3A3] font-medium">{u.name}</span>
                </div>
                <span className="font-mono text-[#FF7A00] font-bold">{u.percentage}% ({u.speedMbps} Mbps)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic by Protocol Breakdown */}
        <div className="bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#FF7A00]" />
                Network Protocol Distribution
              </h3>
              <p className="text-xs text-[#737373]">Traffic segmented by transport layer application</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={protocolData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {protocolData.map((entry, index) => (
                    <Cell key={`proto-${index}`} fill={COLORS[index % COLORS.length]} stroke="#0D0D0D" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Share']}
                  contentStyle={{
                    backgroundColor: '#111111',
                    borderColor: '#242424',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F5F5F5'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4 pt-3 border-t border-[#1C1C1C]">
            {protocolData.map((p, i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-[#A3A3A3] font-medium">{p.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[#737373]">{p.bandwidth}</span>
                  <span className="text-[#F5F5F5] font-bold">{p.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid 2: Network Health & Quality Diagnostics */}
      <div className="bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424]">
        <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-[#22C55E]" />
          Network Quality & SLA Diagnostics
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#111111] border border-[#242424]">
            <div className="text-[#737373] text-xs mb-1">Average RTT Latency</div>
            <div className="text-2xl font-bold font-mono text-[#F5F5F5]">{averageLatency} ms</div>
            <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
              averageLatency > 50 ? 'text-[#EF4444]' : averageLatency > 25 ? 'text-[#F59E0B]' : 'text-[#22C55E]'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> {averageLatency > 50 ? 'Degraded SLA' : averageLatency > 25 ? 'Moderate SLA' : 'Excellent SLA'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-[#242424]">
            <div className="text-[#737373] text-xs mb-1">Jitter Variance</div>
            <div className="text-2xl font-bold font-mono text-[#F5F5F5]">1.8 ms</div>
            <div className="text-xs text-[#22C55E] font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Stable Jitter
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-[#242424]">
            <div className="text-[#737373] text-xs mb-1">Packet Loss Rate</div>
            <div className="text-2xl font-bold font-mono text-[#F5F5F5]">{packetLoss.toFixed(2)} %</div>
            <div className={`text-xs font-semibold mt-1 flex items-center gap-1 ${
              packetLoss > 1 ? 'text-[#EF4444]' : packetLoss > 0 ? 'text-[#F59E0B]' : 'text-[#22C55E]'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> {packetLoss > 1 ? 'Packet Drops Detected' : 'Zero / Low Drop'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-[#242424]">
            <div className="text-[#737373] text-xs mb-1">DNS Resolution Time</div>
            <div className="text-2xl font-bold font-mono text-[#F5F5F5]">18.6 ms</div>
            <div className="text-xs text-[#FF7A00] font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Fast DNS Cache
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
