import React from 'react';
import TrafficChart from '../components/TrafficChart';
import StatCard from '../components/StatCard';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  HardDrive,
  Layers,
  Gauge,
  Download,
  Sliders
} from 'lucide-react';

export default function Traffic({
  trafficData,
  networkStats,
  onTimeframeChange,
  timeframe,
  onOpenReportModal,
  onOpenConfigModal
}) {
  const rawCurrent = trafficData?.current || {
    downloadMbps: 85.2,
    uploadMbps: 24.1,
    bandwidthPercent: 68,
    activeDevices: 8,
    totalTrafficGb: 8.89,
    capacityMbps: 150
  };

  const current = {
    downloadMbps: networkStats?.totalDownloadMbps !== undefined ? networkStats.totalDownloadMbps : rawCurrent.downloadMbps,
    uploadMbps: networkStats?.totalUploadMbps !== undefined ? networkStats.totalUploadMbps : rawCurrent.uploadMbps,
    bandwidthPercent: networkStats?.bandwidthPercent !== undefined ? networkStats.bandwidthPercent : rawCurrent.bandwidthPercent,
    activeDevices: networkStats?.onlineDevices !== undefined ? networkStats.onlineDevices : rawCurrent.activeDevices,
    totalTrafficGb: networkStats?.totalTrafficGb !== undefined ? networkStats.totalTrafficGb : rawCurrent.totalTrafficGb,
    capacityMbps: networkStats?.totalBandwidth !== undefined ? networkStats.totalBandwidth : rawCurrent.capacityMbps
  };

  const history = trafficData?.history || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#111111] border border-[#242424] text-[#FF6A00] shadow-md">
            <Activity className="w-6 h-6 text-[#FF6A00]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F5F5F5]">Traffic Monitoring Module</h1>
            <p className="text-xs text-[#737373]">
              High-resolution throughput analysis and bandwidth consumption timeline.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="text-[#737373] hidden sm:inline">Capacity: <strong className="text-[#FF7A00]">{current.capacityMbps} Mbps</strong></span>
          
          {onOpenConfigModal && (
            <button
              onClick={onOpenConfigModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111111] hover:bg-[#171717] text-[#F5F5F5] border border-[#242424] hover:border-[#FF6A00]/40 transition-all font-sans font-semibold active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Configure Capacity</span>
            </button>
          )}

          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF6A00]/10 hover:bg-[#FF6A00]/20 text-[#FF7A00] border border-[#FF6A00]/40 transition-all font-sans font-semibold active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Download Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Traffic Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Download"
          value={current.downloadMbps}
          unit="Mbps"
          subtext="Inbound WAN data flow"
          icon={ArrowDown}
          color="orange"
          trend="+5.8%"
          trendType="up"
        />

        <StatCard
          title="Current Upload"
          value={current.uploadMbps}
          unit="Mbps"
          subtext="Outbound WAN data flow"
          icon={ArrowUp}
          color="neutral"
          trend="-2.1%"
          trendType="down"
        />

        <StatCard
          title="Total Bandwidth Usage"
          value={current.bandwidthPercent}
          unit="%"
          subtext={`${(current.downloadMbps + current.uploadMbps).toFixed(1)} / ${current.capacityMbps} Mbps`}
          icon={Gauge}
          color={current.bandwidthPercent > 80 ? 'rose' : 'emerald'}
          trend={current.bandwidthPercent > 80 ? 'Heavy Load' : 'Optimal'}
          trendType={current.bandwidthPercent > 80 ? 'down' : 'up'}
        />

        <StatCard
          title="Total Data Transferred"
          value={current.totalTrafficGb}
          unit="GB"
          subtext={`Across ${current.activeDevices} active devices`}
          icon={HardDrive}
          color="neutral"
          trend="Session data"
          trendType="neutral"
        />
      </div>

      {/* Main Interactive Traffic Graph with Timeframe Selector */}
      <TrafficChart
        data={history}
        timeframe={timeframe}
        setTimeframe={onTimeframeChange}
        title="Live Bandwidth Utilization Graph"
        showTimeframeSelector={true}
        height={360}
      />

      {/* Traffic Log Interval Table */}
      <div className="bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF6A00]" />
              Recent Telemetry Sample Intervals
            </h3>
            <p className="text-xs text-[#737373]">
              Sampled periodic log stream collected at 3-second intervals
            </p>
          </div>
          <span className="text-xs font-mono text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-lg border border-[#22C55E]/20">
            {history.length} Data Points Sampled
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#242424]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080808] text-[#737373] uppercase tracking-wider font-semibold border-b border-[#242424]">
              <tr>
                <th className="py-3 px-4">Time Interval</th>
                <th className="py-3 px-4">Download Speed</th>
                <th className="py-3 px-4">Upload Speed</th>
                <th className="py-3 px-4">Total Throughput</th>
                <th className="py-3 px-4">Bandwidth Utilization</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C1C] font-mono">
              {history.slice(-8).reverse().map((pt, idx) => {
                const totalSpeed = (pt.download + pt.upload).toFixed(1);
                return (
                  <tr key={idx} className="hover:bg-[#171717] transition-colors">
                    <td className="py-3 px-4 text-[#F5F5F5] font-semibold">{pt.time}</td>
                    <td className="py-3 px-4 text-[#FF7A00]">{pt.download} Mbps</td>
                    <td className="py-3 px-4 text-[#A3A3A3]">{pt.upload} Mbps</td>
                    <td className="py-3 px-4 text-[#F5F5F5] font-bold">{totalSpeed} Mbps</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-[#111111] rounded-full h-2 overflow-hidden border border-[#242424]">
                          <div
                            className={`h-full rounded-full ${
                              pt.bandwidth > 80 ? 'bg-[#EF4444]' : pt.bandwidth > 60 ? 'bg-[#F59E0B]' : 'bg-[#FF6A00]'
                            }`}
                            style={{ width: `${Math.min(100, pt.bandwidth)}%` }}
                          ></div>
                        </div>
                        <span className="text-[#A3A3A3]">{pt.bandwidth}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pt.bandwidth > 80
                          ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                          : 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30'
                      }`}>
                        {pt.bandwidth > 80 ? 'Spike' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
