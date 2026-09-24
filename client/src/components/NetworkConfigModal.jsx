import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  Globe,
  Activity,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Server,
  Zap,
  Percent
} from 'lucide-react';
import { networkStatsService } from '../services/networkStatsService';

const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export default function NetworkConfigModal({
  isOpen,
  onClose,
  currentStats,
  onSaved
}) {
  // Form state
  const [formData, setFormData] = useState({
    gatewayIP: '192.168.1.1',
    subnetMask: '255.255.255.0',
    interfaceName: 'eth0',
    interfaceSpeed: '1 Gbps',
    totalBandwidth: 150,
    onlineDevices: 8,
    offlineDevices: 2,
    totalDownloadMbps: 85.2,
    totalUploadMbps: 24.1,
    bandwidthPercent: 68,
    averageLatency: 14.2,
    packetLoss: 0.0,
    totalTrafficGb: 8.89,
    activeAlertsCount: 2
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // 'idle' | 'saving' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');

  // Synchronize initial form data from Firestore currentStats when modal opens
  useEffect(() => {
    if (isOpen && currentStats) {
      setFormData({
        gatewayIP: currentStats.gatewayIP || '192.168.1.1',
        subnetMask: currentStats.subnetMask || '255.255.255.0',
        interfaceName: currentStats.interfaceName || 'eth0',
        interfaceSpeed: currentStats.interfaceSpeed || '1 Gbps',
        totalBandwidth: currentStats.totalBandwidth !== undefined ? currentStats.totalBandwidth : 150,
        onlineDevices: currentStats.onlineDevices !== undefined ? currentStats.onlineDevices : 8,
        offlineDevices: currentStats.offlineDevices !== undefined ? currentStats.offlineDevices : 2,
        totalDownloadMbps: currentStats.totalDownloadMbps !== undefined ? currentStats.totalDownloadMbps : 85.2,
        totalUploadMbps: currentStats.totalUploadMbps !== undefined ? currentStats.totalUploadMbps : 24.1,
        bandwidthPercent: currentStats.bandwidthPercent !== undefined ? currentStats.bandwidthPercent : 68,
        averageLatency: currentStats.averageLatency !== undefined ? currentStats.averageLatency : 14.2,
        packetLoss: currentStats.packetLoss !== undefined ? currentStats.packetLoss : 0.0,
        totalTrafficGb: currentStats.totalTrafficGb !== undefined ? currentStats.totalTrafficGb : 8.89,
        activeAlertsCount: currentStats.activeAlertsCount !== undefined ? currentStats.activeAlertsCount : 2
      });
      setErrors({});
      setStatus('idle');
      setStatusMessage('');
    }
  }, [isOpen, currentStats]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.gatewayIP || !IP_REGEX.test(formData.gatewayIP.trim())) {
      errs.gatewayIP = 'Enter a valid IPv4 address (e.g. 192.168.1.1)';
    }

    if (!formData.subnetMask || !IP_REGEX.test(formData.subnetMask.trim())) {
      errs.subnetMask = 'Enter a valid Subnet Mask (e.g. 255.255.255.0)';
    }

    if (!formData.interfaceName?.trim()) {
      errs.interfaceName = 'Interface name is required (e.g. eth0)';
    }

    const numBandwidth = Number(formData.totalBandwidth);
    if (isNaN(numBandwidth) || numBandwidth <= 0) {
      errs.totalBandwidth = 'Capacity must be greater than 0 Mbps';
    }

    const numOnline = Number(formData.onlineDevices);
    if (isNaN(numOnline) || numOnline < 0) {
      errs.onlineDevices = 'Online devices count cannot be negative';
    }

    const numOffline = Number(formData.offlineDevices);
    if (isNaN(numOffline) || numOffline < 0) {
      errs.offlineDevices = 'Offline devices count cannot be negative';
    }

    const numDown = Number(formData.totalDownloadMbps);
    if (isNaN(numDown) || numDown < 0) {
      errs.totalDownloadMbps = 'Download speed cannot be negative';
    }

    const numUp = Number(formData.totalUploadMbps);
    if (isNaN(numUp) || numUp < 0) {
      errs.totalUploadMbps = 'Upload speed cannot be negative';
    }

    const numBwPct = Number(formData.bandwidthPercent);
    if (isNaN(numBwPct) || numBwPct < 0 || numBwPct > 100) {
      errs.bandwidthPercent = 'Utilization must be between 0% and 100%';
    }

    const numLat = Number(formData.averageLatency);
    if (isNaN(numLat) || numLat < 0) {
      errs.averageLatency = 'Latency cannot be negative';
    }

    const numLoss = Number(formData.packetLoss);
    if (isNaN(numLoss) || numLoss < 0 || numLoss > 100) {
      errs.packetLoss = 'Packet loss must be between 0% and 100%';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setStatus('saving');
    setStatusMessage('Saving...');

    try {
      const payload = {
        gatewayIP: formData.gatewayIP.trim(),
        subnetMask: formData.subnetMask.trim(),
        interfaceName: formData.interfaceName.trim(),
        interfaceSpeed: formData.interfaceSpeed.trim(),
        totalBandwidth: parseFloat(Number(formData.totalBandwidth).toFixed(1)),
        onlineDevices: parseInt(formData.onlineDevices, 10),
        offlineDevices: parseInt(formData.offlineDevices, 10),
        totalDevices: parseInt(formData.onlineDevices, 10) + parseInt(formData.offlineDevices, 10),
        totalDownloadMbps: parseFloat(Number(formData.totalDownloadMbps).toFixed(1)),
        totalUploadMbps: parseFloat(Number(formData.totalUploadMbps).toFixed(1)),
        bandwidthPercent: Math.min(100, Math.max(0, parseInt(formData.bandwidthPercent, 10))),
        averageLatency: parseFloat(Number(formData.averageLatency).toFixed(2)),
        packetLoss: parseFloat(Number(formData.packetLoss).toFixed(2)),
        totalTrafficGb: parseFloat(Number(formData.totalTrafficGb).toFixed(2)),
        activeAlertsCount: parseInt(formData.activeAlertsCount, 10)
      };

      await networkStatsService.updateNetworkStats(payload);

      setStatus('success');
      setStatusMessage('Saved successfully ✓');

      if (onSaved) {
        onSaved(payload);
      }

      setTimeout(() => {
        if (status !== 'error') {
          onClose();
        }
      }, 1400);

    } catch (err) {
      console.error('❌ Failed to save network stats to Firestore:', err);
      setStatus('error');
      setStatusMessage('Failed to save data');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0D0D0D] border border-[#242424] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 text-[#F5F5F5] space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#242424] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F5F5F5] flex items-center gap-2">
                Network Configuration & Parameters
              </h2>
              <p className="text-xs text-[#737373]">
                Edit local network node settings and telemetry values • Writes to Firestore (networkStats/current)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#737373] hover:text-[#F5F5F5] hover:bg-[#171717] rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION 1: Local Network Node Parameters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF7A00]">
              <Globe className="w-4 h-4 text-[#FF6A00]" />
              <span>Local Network Node & Subnet</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Gateway IP */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Gateway IP Address
                </label>
                <input
                  type="text"
                  value={formData.gatewayIP}
                  onChange={(e) => handleChange('gatewayIP', e.target.value)}
                  placeholder="192.168.1.1"
                  className={`w-full bg-[#080808] border ${
                    errors.gatewayIP ? 'border-[#EF4444]' : 'border-[#242424] focus:border-[#FF6A00]'
                  } rounded-xl px-3 py-2 text-xs text-[#F5F5F5] font-mono outline-none transition-all`}
                />
                {errors.gatewayIP && (
                  <p className="text-[10px] text-[#EF4444] mt-1">{errors.gatewayIP}</p>
                )}
              </div>

              {/* Subnet Mask */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Subnet Mask
                </label>
                <input
                  type="text"
                  value={formData.subnetMask}
                  onChange={(e) => handleChange('subnetMask', e.target.value)}
                  placeholder="255.255.255.0"
                  className={`w-full bg-[#080808] border ${
                    errors.subnetMask ? 'border-[#EF4444]' : 'border-[#242424] focus:border-[#FF6A00]'
                  } rounded-xl px-3 py-2 text-xs text-[#F5F5F5] font-mono outline-none transition-all`}
                />
                {errors.subnetMask && (
                  <p className="text-[10px] text-[#EF4444] mt-1">{errors.subnetMask}</p>
                )}
              </div>

              {/* Interface Name */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Network Interface
                </label>
                <input
                  type="text"
                  value={formData.interfaceName}
                  onChange={(e) => handleChange('interfaceName', e.target.value)}
                  placeholder="eth0"
                  className="w-full bg-[#080808] border border-[#242424] focus:border-[#FF6A00] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] font-mono outline-none transition-all"
                />
              </div>

              {/* Interface Speed */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Interface Link Speed
                </label>
                <input
                  type="text"
                  value={formData.interfaceSpeed}
                  onChange={(e) => handleChange('interfaceSpeed', e.target.value)}
                  placeholder="1 Gbps"
                  className="w-full bg-[#080808] border border-[#242424] focus:border-[#FF6A00] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] font-mono outline-none transition-all"
                />
              </div>

              {/* Total Bandwidth Capacity */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Total Capacity (Mbps)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={formData.totalBandwidth}
                  onChange={(e) => handleChange('totalBandwidth', e.target.value)}
                  placeholder="150"
                  className={`w-full bg-[#080808] border ${
                    errors.totalBandwidth ? 'border-[#EF4444]' : 'border-[#242424] focus:border-[#FF6A00]'
                  } rounded-xl px-3 py-2 text-xs text-[#F5F5F5] font-mono outline-none transition-all`}
                />
                {errors.totalBandwidth && (
                  <p className="text-[10px] text-[#EF4444] mt-1">{errors.totalBandwidth}</p>
                )}
              </div>

              {/* Total Traffic GB */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Total Traffic (GB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalTrafficGb}
                  onChange={(e) => handleChange('totalTrafficGb', e.target.value)}
                  placeholder="8.89"
                  className="w-full bg-[#080808] border border-[#242424] focus:border-[#FF6A00] rounded-xl px-3 py-2 text-xs text-[#F5F5F5] font-mono outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Network Throughput & Hosts Telemetry */}
          <div className="space-y-3 pt-4 border-t border-[#242424]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF7A00]">
              <Activity className="w-4 h-4 text-[#FF6A00]" />
              <span>Throughput & Connected Hosts Values</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Online Devices */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Online Devices
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.onlineDevices}
                  onChange={(e) => handleChange('onlineDevices', e.target.value)}
                  className={`w-full bg-[#080808] border ${
                    errors.onlineDevices ? 'border-[#EF4444]' : 'border-[#242424] focus:border-[#FF6A00]'
                  } rounded-xl px-3 py-2 text-xs text-[#22C55E] font-mono font-bold outline-none transition-all`}
                />
                {errors.onlineDevices && (
                  <p className="text-[10px] text-[#EF4444] mt-1">{errors.onlineDevices}</p>
                )}
              </div>

              {/* Offline Devices */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Offline Devices
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.offlineDevices}
                  onChange={(e) => handleChange('offlineDevices', e.target.value)}
                  className={`w-full bg-[#080808] border ${
                    errors.offlineDevices ? 'border-[#EF4444]' : 'border-[#242424] focus:border-[#FF6A00]'
                  } rounded-xl px-3 py-2 text-xs text-[#737373] font-mono outline-none transition-all`}
                />
              </div>

              {/* Download Speed Mbps */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Download Speed (Mbps)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.totalDownloadMbps}
                  onChange={(e) => handleChange('totalDownloadMbps', e.target.value)}
                  className={`w-full bg-[#080808] border ${
                    errors.totalDownloadMbps ? 'border-[#EF4444]' : 'border-[#242424] focus:border-[#FF6A00]'
                  } rounded-xl px-3 py-2 text-xs text-[#FF7A00] font-mono font-bold outline-none transition-all`}
                />
                {errors.totalDownloadMbps && (
                  <p className="text-[10px] text-[#EF4444] mt-1">{errors.totalDownloadMbps}</p>
                )}
              </div>

              {/* Upload Speed Mbps */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Upload Speed (Mbps)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.totalUploadMbps}
                  onChange={(e) => handleChange('totalUploadMbps', e.target.value)}
                  className={`w-full bg-[#080808] border ${
                    errors.totalUploadMbps ? 'border-[#EF4444]' : 'border-[#242424] focus:border-[#FF6A00]'
                  } rounded-xl px-3 py-2 text-xs text-[#F5F5F5] font-mono outline-none transition-all`}
                />
                {errors.totalUploadMbps && (
                  <p className="text-[10px] text-[#EF4444] mt-1">{errors.totalUploadMbps}</p>
                )}
              </div>

              {/* Bandwidth Usage % */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Bandwidth Utilization (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.bandwidthPercent}
                  onChange={(e) => handleChange('bandwidthPercent', e.target.value)}
                  className={`w-full bg-[#080808] border ${
                    errors.bandwidthPercent ? 'border-[#EF4444]' : 'border-[#242424] focus:border-[#FF6A00]'
                  } rounded-xl px-3 py-2 text-xs text-[#F5F5F5] font-mono outline-none transition-all`}
                />
                {errors.bandwidthPercent && (
                  <p className="text-[10px] text-[#EF4444] mt-1">{errors.bandwidthPercent}</p>
                )}
              </div>

              {/* Active Alerts Count */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Active Alerts Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.activeAlertsCount}
                  onChange={(e) => handleChange('activeAlertsCount', e.target.value)}
                  className="w-full bg-[#080808] border border-[#242424] focus:border-[#FF6A00] rounded-xl px-3 py-2 text-xs text-[#EF4444] font-mono outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Quality & Diagnostics (SLA) */}
          <div className="space-y-3 pt-4 border-t border-[#242424]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF7A00]">
              <Zap className="w-4 h-4 text-[#FF6A00]" />
              <span>SLA Diagnostics (Latency & Packet Loss)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Latency */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Average Latency (ms)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.averageLatency}
                  onChange={(e) => handleChange('averageLatency', e.target.value)}
                  placeholder="14.2"
                  className={`w-full bg-[#080808] border ${
                    errors.averageLatency ? 'border-[#EF4444]' : 'border-[#242424] focus:border-[#FF6A00]'
                  } rounded-xl px-3 py-2 text-xs text-[#F5F5F5] font-mono outline-none transition-all`}
                />
                {errors.averageLatency && (
                  <p className="text-[10px] text-[#EF4444] mt-1">{errors.averageLatency}</p>
                )}
              </div>

              {/* Packet Loss */}
              <div>
                <label className="block text-xs font-semibold text-[#A3A3A3] mb-1">
                  Packet Loss Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.packetLoss}
                  onChange={(e) => handleChange('packetLoss', e.target.value)}
                  placeholder="0.0"
                  className={`w-full bg-[#080808] border ${
                    errors.packetLoss ? 'border-[#EF4444]' : 'border-[#242424] focus:border-[#FF6A00]'
                  } rounded-xl px-3 py-2 text-xs text-[#F5F5F5] font-mono outline-none transition-all`}
                />
                {errors.packetLoss && (
                  <p className="text-[10px] text-[#EF4444] mt-1">{errors.packetLoss}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action and Feedback Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#242424]">
            {/* Status Feedback Indicator */}
            <div className="flex items-center gap-2 text-xs font-medium">
              {status === 'saving' && (
                <div className="flex items-center gap-2 text-[#FF7A00]">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#FF6A00]" />
                  <span>Saving...</span>
                </div>
              )}
              {status === 'success' && (
                <div className="flex items-center gap-2 text-[#22C55E]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved successfully ✓</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-2 text-[#EF4444]">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to save data</span>
                </div>
              )}
              {status === 'idle' && (
                <span className="text-[#737373] text-[11px]">
                  All values will be immediately synced to Cloud Firestore.
                </span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={status === 'saving'}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-xl bg-[#111111] hover:bg-[#171717] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#242424] transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={status === 'saving'}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#FF6A00] hover:bg-[#FF7A00] text-black transition-all shadow-lg shadow-orange-500/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Save className="w-3.5 h-3.5 text-black" />
                <span>{status === 'saving' ? 'Saving...' : 'Save Parameters'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
