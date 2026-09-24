import React from 'react';
import { X, Download, FileText, Table, Code, Clock } from 'lucide-react';
import {
  generateReportData,
  openPrintableReport,
  downloadCsvReport,
  downloadJsonReport
} from '../services/reportGenerator';

export default function DownloadReportModal({
  isOpen,
  onClose,
  dashboardData,
  devicesData,
  trafficData,
  alertsData
}) {
  if (!isOpen) return null;

  const reportData = generateReportData({
    dashboardData,
    devicesData,
    trafficData,
    alertsData
  });

  const handlePrintPdf = () => {
    openPrintableReport(reportData);
  };

  const handleCsv = () => {
    downloadCsvReport(reportData);
  };

  const handleJson = () => {
    downloadJsonReport(reportData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0D0D0D] border border-[#242424] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 text-[#F5F5F5] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242424] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F5F5F5]">
                Download Network Monitoring Report
              </h2>
              <p className="text-xs text-[#737373]">
                Export comprehensive real-time network traffic, active devices, and security logs
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

        {/* Current Snapshot Summary Preview */}
        <div className="bg-[#080808] p-4 rounded-xl border border-[#242424] space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-[#242424] pb-2">
            <span className="text-[#737373] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FF6A00]" /> Snapshot Timestamp:
            </span>
            <span className="font-mono text-[#F5F5F5] font-bold">{reportData.meta.generatedAt}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-[#111111] border border-[#242424]">
              <div className="text-[10px] text-[#737373] uppercase">Active Devices</div>
              <div className="font-mono font-bold text-[#F5F5F5] text-sm mt-0.5">
                {reportData.metrics.activeDevicesCount} / {reportData.metrics.totalDevicesCount}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#111111] border border-[#242424]">
              <div className="text-[10px] text-[#737373] uppercase">Total Throughput</div>
              <div className="font-mono font-bold text-[#FF7A00] text-sm mt-0.5">
                {(reportData.metrics.totalDownloadMbps + reportData.metrics.totalUploadMbps).toFixed(1)} Mbps
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#111111] border border-[#242424]">
              <div className="text-[10px] text-[#737373] uppercase">Bandwidth %</div>
              <div className="font-mono font-bold text-[#22C55E] text-sm mt-0.5">
                {reportData.metrics.bandwidthPercent}%
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#111111] border border-[#242424]">
              <div className="text-[10px] text-[#737373] uppercase">Logged Alerts</div>
              <div className="font-mono font-bold text-[#EF4444] text-sm mt-0.5">
                {reportData.alerts.length}
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3]">
            Select Export Format:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. PDF / Printable Report */}
            <button
              onClick={handlePrintPdf}
              className="p-4 rounded-xl bg-[#111111] hover:bg-[#171717] border border-[#FF6A00]/40 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="p-2 rounded-lg bg-[#FF6A00]/15 text-[#FF6A00] w-fit mb-3 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#F5F5F5] mb-1">
                  PDF / Printable Report
                </h4>
                <p className="text-xs text-[#737373] leading-relaxed">
                  Full formatted diagnostic report ready for printing or saving as PDF.
                </p>
              </div>
              <span className="mt-4 text-xs font-bold text-[#FF7A00] flex items-center gap-1">
                Open & Save PDF →
              </span>
            </button>

            {/* 2. CSV Spreadsheet */}
            <button
              onClick={handleCsv}
              className="p-4 rounded-xl bg-[#111111] hover:bg-[#171717] border border-[#242424] text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="p-2 rounded-lg bg-[#22C55E]/10 text-[#22C55E] w-fit mb-3 group-hover:scale-105 transition-transform">
                  <Table className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#F5F5F5] mb-1">
                  CSV Spreadsheet
                </h4>
                <p className="text-xs text-[#737373] leading-relaxed">
                  Export devices inventory, traffic samples, and alerts log for Excel.
                </p>
              </div>
              <span className="mt-4 text-xs font-bold text-[#22C55E] flex items-center gap-1">
                Download .CSV →
              </span>
            </button>

            {/* 3. JSON Data Dump */}
            <button
              onClick={handleJson}
              className="p-4 rounded-xl bg-[#111111] hover:bg-[#171717] border border-[#242424] text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="p-2 rounded-lg bg-[#171717] text-[#A3A3A3] w-fit mb-3 group-hover:scale-105 transition-transform">
                  <Code className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#F5F5F5] mb-1">
                  JSON Audit Log
                </h4>
                <p className="text-xs text-[#737373] leading-relaxed">
                  Raw structured network telemetry payload with full JSON schema.
                </p>
              </div>
              <span className="mt-4 text-xs font-bold text-[#A3A3A3] flex items-center gap-1">
                Download .JSON →
              </span>
            </button>
          </div>
        </div>

        {/* Report Content Details */}
        <div className="p-3.5 rounded-xl bg-[#080808] border border-[#242424] text-xs text-[#737373] space-y-1">
          <div className="font-semibold text-[#A3A3A3]">Included in this report:</div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#737373]">
            <li>Subnet configuration (192.168.1.0/24) & Gateway status</li>
            <li>All {reportData.devices.length} network host IP/MAC addresses, throughput, and statuses</li>
            <li>Recent traffic throughput history (Upload, Download, Bandwidth %)</li>
            <li>Complete Security and Anomaly Alerts history with severity classifications</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#242424]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#171717] hover:bg-[#242424] text-[#F5F5F5] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
