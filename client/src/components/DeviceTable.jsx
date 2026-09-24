import React, { useState } from 'react';
import {
  Search,
  Laptop,
  Monitor,
  Server,
  Smartphone,
  Tv,
  Camera,
  ArrowDown,
  ArrowUp,
  MapPin,
  Clock
} from 'lucide-react';

const DEVICE_ICONS = {
  Computer: Monitor,
  Laptop: Laptop,
  Server: Server,
  Mobile: Smartphone,
  'Smart Device': Tv,
  'IoT Camera': Camera,
};

export default function DeviceTable({
  devices = [],
  totalCount = 0,
  onlineCount = 0,
  offlineCount = 0,
  search = '',
  setSearch,
  statusFilter = 'All',
  setStatusFilter,
  typeFilter = 'All',
  setTypeFilter
}) {
  const [copiedIp, setCopiedIp] = useState(null);

  const handleCopyIp = (ip) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const deviceTypes = ['All', 'Computer', 'Laptop', 'Server', 'Mobile', 'Smart Device', 'IoT Camera'];

  return (
    <div className="bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424] space-y-4">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
            Discovered Network Devices
          </h2>
          <p className="text-xs text-[#737373]">
            Real-time telemetry for connected hosts on the LAN
          </p>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-[#111111] border border-[#242424] flex items-center gap-2">
            <span className="text-[#737373]">Total:</span>
            <span className="font-mono font-bold text-[#F5F5F5]">{totalCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center gap-2 text-[#22C55E]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
            <span>Online:</span>
            <span className="font-mono font-bold">{onlineCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#111111] border border-[#242424] flex items-center gap-2 text-[#737373]">
            <span className="w-2 h-2 rounded-full bg-[#737373]"></span>
            <span>Offline:</span>
            <span className="font-mono font-bold text-[#A3A3A3]">{offlineCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Row */}
      <div className="flex flex-col md:flex-row gap-3 pt-1">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by device name, IP, MAC address, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-[#242424] focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F5F5] placeholder-[#737373] outline-none transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-[#0A0A0A] p-1 rounded-xl border border-[#242424] shrink-0">
          {['All', 'Online', 'Offline'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-[#FF6A00]/15 text-[#FF7A00] border border-[#FF6A00]/40'
                  : 'text-[#737373] hover:text-[#F5F5F5] border border-transparent'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Type Filter Select */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#0A0A0A] border border-[#242424] focus:border-[#FF6A00] rounded-xl px-3 py-2 text-xs text-[#A3A3A3] outline-none cursor-pointer"
        >
          {deviceTypes.map((t) => (
            <option key={t} value={t} className="bg-[#0D0D0D]">
              {t === 'All' ? 'All Device Types' : t}
            </option>
          ))}
        </select>
      </div>

      {/* Device Table */}
      <div className="overflow-x-auto rounded-xl border border-[#242424]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#080808] text-[#737373] uppercase tracking-wider font-semibold border-b border-[#242424]">
            <tr>
              <th className="py-3.5 px-4">Device / Host</th>
              <th className="py-3.5 px-4">IP & MAC Address</th>
              <th className="py-3.5 px-4">Type & Location</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Current Speed</th>
              <th className="py-3.5 px-4">Total Usage</th>
              <th className="py-3.5 px-4 text-right">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C1C] font-sans">
            {devices.length > 0 ? (
              devices.map((device) => {
                const IconComponent = DEVICE_ICONS[device.type] || Monitor;
                const isOnline = device.status === 'Online';

                return (
                  <tr
                    key={device.id}
                    className="hover:bg-[#171717] transition-colors group"
                  >
                    {/* Device Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isOnline ? 'bg-[#FF6A00]/10 text-[#FF6A00]' : 'bg-[#111111] text-[#737373]'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-[#F5F5F5] flex items-center gap-1.5">
                            <span>{device.name}</span>
                            {device.priority === 'Critical' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#EF4444]/20 text-[#EF4444] font-mono border border-[#EF4444]/30">
                                Critical
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#737373] flex items-center gap-1">
                            <span>Host ID: #{device.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* IP & MAC */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyIp(device.ip)}
                          title="Click to copy IP"
                          className="px-2 py-0.5 rounded bg-[#111111] border border-[#242424] hover:border-[#FF6A00]/40 text-[#F5F5F5] font-semibold text-[11px] transition-all"
                        >
                          {device.ip}
                        </button>
                        {copiedIp === device.ip && (
                          <span className="text-[10px] text-[#22C55E] font-sans">Copied!</span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#737373] mt-0.5">
                        {device.mac}
                      </div>
                    </td>

                    {/* Type & Location */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#111111] text-[#A3A3A3] border border-[#242424]">
                        {device.type}
                      </span>
                      <div className="text-[11px] text-[#737373] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#737373]" />
                        <span>{device.location || 'LAN'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          isOnline
                            ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30'
                            : 'bg-[#111111] text-[#737373] border border-[#242424]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOnline ? 'bg-[#22C55E]' : 'bg-[#737373]'
                          }`}
                        ></span>
                        {device.status}
                      </span>
                    </td>

                    {/* Download & Upload Speed */}
                    <td className="py-3.5 px-4 font-mono">
                      {isOnline ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[#FF7A00] text-xs">
                            <ArrowDown className="w-3 h-3 text-[#FF6A00]" />
                            <span className="font-bold">{device.download}</span>
                            <span className="text-[10px] text-[#737373]">Mbps</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#A3A3A3] text-xs">
                            <ArrowUp className="w-3 h-3 text-[#737373]" />
                            <span className="font-bold">{device.upload}</span>
                            <span className="text-[10px] text-[#737373]">Mbps</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#737373] italic font-sans text-xs">Idle (0.0 Mbps)</span>
                      )}
                    </td>

                    {/* Total Usage */}
                    <td className="py-3.5 px-4 font-mono text-[#A3A3A3]">
                      <div>{(device.totalTrafficMb || 0) > 1024 
                        ? `${((device.totalTrafficMb || 0) / 1024).toFixed(2)} GB` 
                        : `${(device.totalTrafficMb || 0).toFixed(1)} MB`}
                      </div>
                    </td>

                    {/* Last Active */}
                    <td className="py-3.5 px-4 text-right text-[#737373] text-xs">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3 text-[#737373]" />
                        <span>{device.lastActive}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#737373]">
                  No network devices matching the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
