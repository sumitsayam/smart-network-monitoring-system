import React, { useState, useEffect } from 'react';
import DeviceTable from '../components/DeviceTable';
import { api } from '../services/api';
import { RefreshCw, Network } from 'lucide-react';

export default function Devices({ devicesData, onRefresh }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [devices, setDevices] = useState(devicesData?.devices || []);
  const [totalCount, setTotalCount] = useState(devicesData?.totalCount || 0);
  const [onlineCount, setOnlineCount] = useState(devicesData?.onlineCount || 0);
  const [offlineCount, setOfflineCount] = useState(devicesData?.offlineCount || 0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter devices based on current state or query
  useEffect(() => {
    async function loadFilteredDevices() {
      const res = await api.getDevices({
        search,
        status: statusFilter,
        type: typeFilter
      });
      if (res.data) {
        setDevices(res.data.devices || []);
        setTotalCount(res.data.totalCount || 0);
        setOnlineCount(res.data.onlineCount || 0);
        setOfflineCount(res.data.offlineCount || 0);
      }
    }
    loadFilteredDevices();
  }, [search, statusFilter, typeFilter, devicesData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) await onRefresh();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0D0D0D] p-5 rounded-2xl border border-[#242424]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#111111] border border-[#242424] text-[#FF6A00] shadow-md">
            <Network className="w-6 h-6 text-[#FF6A00]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F5F5F5]">Device Discovery Module</h1>
            <p className="text-xs text-[#737373]">
              Discovers, maps, and monitors active host addresses across the local subnet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#111111] hover:bg-[#171717] text-[#F5F5F5] border border-[#242424] transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#FF6A00] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Scan Subnet</span>
          </button>
        </div>
      </div>

      {/* Main Table Component */}
      <DeviceTable
        devices={devices}
        totalCount={totalCount}
        onlineCount={onlineCount}
        offlineCount={offlineCount}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />
    </div>
  );
}
