import React from 'react';
import {
  Users,
  ArrowDown,
  ArrowUp,
  Percent,
  AlertTriangle,
  ShieldCheck,
  Server,
  Zap,
  ArrowRight,
  Download,
  Sliders
} from 'lucide-react';
import StatCard from '../components/StatCard';
import TrafficChart from '../components/TrafficChart';
import AlertCard from '../components/AlertCard';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const PIE_COLORS = ['#FF6A00', '#FF8C42', '#F5F5F5', '#A3A3A3', '#737373'];

export default function Dashboard({
  dashboardData,
  trafficHistory,
  networkStats,
  onResolveAlert,
  onDismissAlert,
  onNavigate,
  onOpenReportModal,
  onOpenConfigModal
}) {
  const rawMetrics = dashboardData?.metrics || {
    activeDevicesCount: 8,
    totalDevicesCount: 10,
    totalDownloadMbps: 85.2,
    totalUploadMbps: 24.1,
    bandwidthPercent: 68,
    activeAlertsCount: 2,
    totalTrafficGb: 8.89
  };

  // Firestore networkStats/current takes priority as source of truth
  const metrics = {
    activeDevicesCount: networkStats?.onlineDevices !== undefined ? networkStats.onlineDevices : rawMetrics.activeDevicesCount,
    totalDevicesCount: networkStats?.totalDevices !== undefined ? networkStats.totalDevices : rawMetrics.totalDevicesCount,
    totalDownloadMbps: networkStats?.totalDownloadMbps !== undefined ? networkStats.totalDownloadMbps : rawMetrics.totalDownloadMbps,
    totalUploadMbps: networkStats?.totalUploadMbps !== undefined ? networkStats.totalUploadMbps : rawMetrics.totalUploadMbps,
    bandwidthPercent: networkStats?.bandwidthPercent !== undefined ? networkStats.bandwidthPercent : rawMetrics.bandwidthPercent,
    activeAlertsCount: networkStats?.activeAlertsCount !== undefined ? networkStats.activeAlertsCount : rawMetrics.activeAlertsCount,
    totalTrafficGb: networkStats?.totalTrafficGb !== undefined ? networkStats.totalTrafficGb : rawMetrics.totalTrafficGb,
    totalBandwidth: networkStats?.totalBandwidth !== undefined ? networkStats.totalBandwidth : 150
  };

  const topUsers = dashboardData?.topUsers || [];
  const recentAlerts = dashboardData?.recentAlerts || [];
  const devicesSummary = {
    total: metrics.totalDevicesCount,
    online: metrics.activeDevicesCount,
    offline: networkStats?.offlineDevices !== undefined ? networkStats.offlineDevices : (metrics.totalDevicesCount - metrics.activeDevicesCount)
  };

  // Format data for Recharts Pie
  const pieData = topUsers.map(u => ({
    name: u.name,
    value: u.speedMbps
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424]">
        <div>
          <h1 className="text-xl font-bold text-[#F5F5F5] flex items-center gap-2">
            Network Operations Center Overview
          </h1>
          <p className="text-xs text-[#737373]">
            Real-time subnet health, host metrics, bandwidth capacity, and security anomaly logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {onOpenConfigModal && (
            <button
              onClick={onOpenConfigModal}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#111111] hover:bg-[#171717] text-[#F5F5F5] border border-[#242424] hover:border-[#FF6A00]/40 transition-all shadow-sm active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Configure Parameters</span>
            </button>
          )}

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#FF6A00]/10 hover:bg-[#FF6A00]/20 text-[#FF7A00] border border-[#FF6A00]/40 transition-all shadow-sm active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Export Snapshot Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Section: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* ACTIVE DEVICES */}
        <StatCard
          title="Active Devices"
          value={metrics.activeDevicesCount}
          unit={`/ ${metrics.totalDevicesCount}`}
          subtext={`${devicesSummary.offline} hosts offline`}
          icon={Users}
          color="neutral"
          trend="Stable"
          trendType="neutral"
        />

        {/* DOWNLOAD */}
        <StatCard
          title="Download Speed"
          value={metrics.totalDownloadMbps}
          unit="Mbps"
          subtext="Inbound WAN aggregate"
          icon={ArrowDown}
          color="orange"
          trend="+4.2%"
          trendType="up"
        />

        {/* UPLOAD */}
        <StatCard
          title="Upload Speed"
          value={metrics.totalUploadMbps}
          unit="Mbps"
          subtext="Outbound WAN aggregate"
          icon={ArrowUp}
          color="neutral"
          trend="-1.5%"
          trendType="down"
        />

        {/* BANDWIDTH USED */}
        <StatCard
          title="Bandwidth Used"
          value={metrics.bandwidthPercent}
          unit="%"
          subtext="Of 150 Mbps capacity"
          icon={Percent}
          color={metrics.bandwidthPercent > 80 ? 'rose' : metrics.bandwidthPercent > 60 ? 'amber' : 'emerald'}
          trend={metrics.bandwidthPercent > 80 ? 'Critical' : 'Normal'}
          trendType={metrics.bandwidthPercent > 80 ? 'down' : 'up'}
        />

        {/* ALERTS */}
        <StatCard
          title="Active Alerts"
          value={metrics.activeAlertsCount}
          unit="Alerts"
          subtext={metrics.activeAlertsCount > 0 ? "Requires Attention" : "All Clear"}
          icon={AlertTriangle}
          color={metrics.activeAlertsCount > 0 ? 'rose' : 'emerald'}
          trend={metrics.activeAlertsCount > 0 ? 'Action needed' : 'Protected'}
          trendType={metrics.activeAlertsCount > 0 ? 'down' : 'up'}
        />
      </div>

      {/* Main Grid: Live Traffic Graph + Top Bandwidth Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Traffic Graph */}
        <div className="lg:col-span-2">
          <TrafficChart
            data={trafficHistory}
            title="Real-Time Network Traffic"
            showTimeframeSelector={false}
            height={330}
          />
        </div>

        {/* Right 1 Col: Top Bandwidth Consumers */}
        <div className="bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF6A00]" />
                Top Bandwidth Users
              </h3>
              <span className="text-[11px] text-[#737373] font-mono">Live Share</span>
            </div>

            {/* Donut Chart */}
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="#0D0D0D"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${val} Mbps`, 'Current Usage']}
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
              <div className="absolute text-center pointer-events-none">
                <span className="text-lg font-bold font-mono text-[#F5F5F5]">
                  {metrics.totalDownloadMbps}
                </span>
                <span className="text-[10px] text-[#737373] block -mt-1">Mbps Total</span>
              </div>
            </div>

            {/* User List Breakdown */}
            <div className="space-y-2 mt-2">
              {topUsers.map((user, idx) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#111111] border border-[#242424]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    ></span>
                    <span className="font-semibold text-[#F5F5F5]">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-[#737373]">{user.speedMbps} Mbps</span>
                    <span className="font-bold text-[#FF7A00]">{user.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('devices')}
            className="w-full mt-4 py-2 text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5] bg-[#111111] hover:bg-[#171717] border border-[#242424] rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <span>View All Devices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Grid: Device Status Quick Summary & Recent Security Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Status Quick Card */}
        <div className="bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-[#22C55E]" />
              Network Host Status
            </h3>
            <p className="text-xs text-[#737373] mb-4">
              Overview of connected workstations, IoT sensors, and campus infrastructure.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-[#111111] border border-[#242424] flex items-center justify-between">
                <span className="text-[#A3A3A3] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span> Online Hosts
                </span>
                <span className="font-bold text-[#22C55E]">{devicesSummary.online} Hosts</span>
              </div>
              <div className="p-3 rounded-xl bg-[#111111] border border-[#242424] flex items-center justify-between">
                <span className="text-[#A3A3A3] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#737373]"></span> Offline Hosts
                </span>
                <span className="font-bold text-[#737373]">{devicesSummary.offline} Hosts</span>
              </div>
              <div className="p-3 rounded-xl bg-[#111111] border border-[#242424] flex items-center justify-between">
                <span className="text-[#A3A3A3] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF6A00]" /> Security State
                </span>
                <span className="font-bold text-[#FF7A00]">Enforced</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('traffic')}
            className="w-full mt-4 py-2 text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5] bg-[#111111] hover:bg-[#171717] border border-[#242424] rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <span>Detailed Traffic Gauges</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Alerts List */}
        <div className="lg:col-span-2 bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                Recent Security & Rule Alerts
              </h3>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs font-semibold text-[#FF7A00] hover:text-[#FF8C42]"
              >
                View All Alerts ({recentAlerts.length})
              </button>
            </div>

            <div className="space-y-3">
              {recentAlerts.length > 0 ? (
                recentAlerts.slice(0, 3).map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onResolve={onResolveAlert}
                    onDismiss={onDismissAlert}
                  />
                ))
              ) : (
                <div className="p-6 text-center text-[#737373] text-xs rounded-xl bg-[#111111] border border-[#242424]">
                  No active security alerts. Network is operating within normal boundaries.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#1C1C1C] mt-3 flex items-center justify-between text-xs text-[#737373]">
            <span>Rule Engine: <strong>Rule-based Threshold Anomaly Detection</strong></span>
            <span className="text-[#22C55E] font-mono font-semibold">Live Trigger Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
