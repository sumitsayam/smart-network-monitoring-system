import React from 'react';
import { X, Shield, Cpu, Network, Activity, HelpCircle, ArrowRight } from 'lucide-react';

export default function VivaGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0D0D0D] border border-[#242424] w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-6 text-[#F5F5F5] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242424] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F5F5F5]">
                Project Architecture & Viva Defense Guide
              </h2>
              <p className="text-xs text-[#737373]">
                Smart Network Traffic Monitoring System • College Project Reference
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

        {/* 1. Complete Flow */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#FF7A00] mb-2 flex items-center gap-2">
            <span>1. End-to-End System Workflow</span>
          </h3>
          <div className="bg-[#080808] p-4 rounded-xl border border-[#242424] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-center">
            <div className="bg-[#111111] px-3 py-2 rounded-lg border border-[#242424]">
              <span className="text-[#F5F5F5] font-bold block">Network Devices</span>
              <span className="text-[10px] text-[#737373]">IP / MAC / Subnet</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#737373] shrink-0" />
            <div className="bg-[#111111] px-3 py-2 rounded-lg border border-[#242424]">
              <span className="text-[#FF7A00] font-bold block">Traffic Engine</span>
              <span className="text-[10px] text-[#737373]">Upload / Download</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#737373] shrink-0" />
            <div className="bg-[#111111] px-3 py-2 rounded-lg border border-[#242424]">
              <span className="text-[#A3A3A3] font-bold block">Analytics Engine</span>
              <span className="text-[10px] text-[#737373]">Bandwidth % & Top Users</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#737373] shrink-0" />
            <div className="bg-[#111111] px-3 py-2 rounded-lg border border-[#242424]">
              <span className="text-[#EF4444] font-bold block">Security Rule Trigger</span>
              <span className="text-[10px] text-[#737373]">Spike / Cap Breach</span>
            </div>
          </div>
        </div>

        {/* 2. The Four Core Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#080808] border border-[#242424] space-y-1.5">
            <div className="flex items-center gap-2 text-[#F5F5F5] font-bold text-sm">
              <Network className="w-4 h-4 text-[#FF6A00]" />
              <span>Module 1: Device Discovery</span>
            </div>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Maintains LAN inventory with IP, MAC, device type (PC, Laptop, Server, Smart TV), status (Online/Offline), and current throughput.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#080808] border border-[#242424] space-y-1.5">
            <div className="flex items-center gap-2 text-[#F5F5F5] font-bold text-sm">
              <Activity className="w-4 h-4 text-[#FF7A00]" />
              <span>Module 2: Traffic Monitoring</span>
            </div>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Continuously charts download and upload telemetry across customizable timeframes (1 Hour, 6 Hours, Today) with Recharts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#080808] border border-[#242424] space-y-1.5">
            <div className="flex items-center gap-2 text-[#F5F5F5] font-bold text-sm">
              <Cpu className="w-4 h-4 text-[#A3A3A3]" />
              <span>Module 3: Analytics Dashboard</span>
            </div>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Aggregates network bandwidth usage %, computes top bandwidth-consuming hosts, and summarizes network health.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#080808] border border-[#242424] space-y-1.5">
            <div className="flex items-center gap-2 text-[#F5F5F5] font-bold text-sm">
              <Shield className="w-4 h-4 text-[#EF4444]" />
              <span>Module 4: Security Alerts</span>
            </div>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Rule-based anomaly detection: triggers High Bandwidth alerts (&gt;75 Mbps), Network Overload alerts (&gt;80% capacity), and Device Offline events.
            </p>
          </div>
        </div>

        {/* 3. Top Viva Questions & Answers */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#FF8C42]">
            Frequently Asked Viva Questions
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-[#080808] border border-[#242424]">
              <span className="font-bold text-[#F5F5F5] block mb-1">
                Q1: Why use simulated telemetry instead of Wireshark / raw socket interception?
              </span>
              <p className="text-[#A3A3A3]">
                <span className="text-[#22C55E] font-semibold">Answer:</span> Raw packet capture requires elevated root/administrator privileges, OS-specific drivers (WinPcap/Npcap), and heavy CPU overhead. This architecture simulates the telemetry layer to maintain a clean, cross-platform, non-root web dashboard that can later be connected to standard SNMP / NetFlow export APIs.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#080808] border border-[#242424]">
              <span className="font-bold text-[#F5F5F5] block mb-1">
                Q2: How does the real-time simulation work?
              </span>
              <p className="text-[#A3A3A3]">
                <span className="text-[#22C55E] font-semibold">Answer:</span> The Express backend runs a timer loop every 3.5 seconds that applies smooth mathematical drift to active nodes, recalculates total bandwidth, and runs rule-based checks. The React frontend fetches this telemetry and dynamically repaints the Recharts graphs.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#242424]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#FF6A00] text-black font-bold hover:bg-[#FF7A00] transition-all active:scale-95"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
