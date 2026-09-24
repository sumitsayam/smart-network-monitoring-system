import React from 'react';
import { Activity, Radio, Zap, RefreshCw, WifiOff, HelpCircle, Download, Sliders } from 'lucide-react';

export default function Navbar({
  isBackendConnected,
  onTriggerSpike,
  onToggleOffline,
  onReset,
  onOpenVivaModal,
  onOpenReportModal,
  onOpenConfigModal,
  isSpiking
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#080808]/95 backdrop-blur-md border-b border-[#242424] px-4 lg:px-8 py-3 transition-all">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#111111] border border-[#242424] text-[#FF6A00] shadow-md shadow-orange-500/5">
            <Activity className="w-5 h-5 animate-pulse text-[#FF6A00]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7A00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6A00]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-[#F5F5F5] flex items-center gap-2">
                Smart Network Traffic Monitoring System
              </h1>
            </div>
            <p className="text-xs text-[#737373] font-mono hidden sm:block">
              Network Operations Center (NOC) • Subnet 192.168.1.0/24
            </p>
          </div>
        </div>

        {/* Center/Right: Badges, Report Download, and Interactive Demo Trigger Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Live Monitoring Badge */}
          <div className="cyber-badge bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-[#22C55E] -ml-3.5"></span>
            <span className="ml-1 font-semibold">LIVE MONITORING</span>
          </div>

          {/* Demo Mode Badge */}
          <div className="cyber-badge bg-[#111111] text-[#A3A3A3] border border-[#242424]">
            <Radio className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>SIMULATED NETWORK</span>
          </div>

          {/* Backend indicator */}
          <div className={`cyber-badge text-xs hidden lg:inline-flex ${
            isBackendConnected 
              ? 'bg-[#111111] text-[#A3A3A3] border border-[#242424]' 
              : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-[#22C55E]' : 'bg-[#F59E0B]'}`}></span>
            <span>{isBackendConnected ? 'Firebase Connected' : 'Campus Simulation'}</span>
          </div>

          <div className="h-6 w-px bg-[#242424] hidden sm:block"></div>

          {/* Configure Network Stats Button */}
          {onOpenConfigModal && (
            <button
              onClick={onOpenConfigModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#111111] hover:bg-[#171717] text-[#F5F5F5] border border-[#242424] hover:border-[#FF6A00]/40 transition-all shadow-sm active:scale-95"
              title="Edit & Save Network Stats to Firebase (networkStats/current)"
            >
              <Sliders className="w-3.5 h-3.5 text-[#FF6A00]" />
              <span>Configure Node</span>
            </button>
          )}

          {/* Download Report Button - Orange Highlight */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF6A00]/10 hover:bg-[#FF6A00]/20 text-[#FF7A00] border border-[#FF6A00]/40 transition-all shadow-sm active:scale-95"
            title="Download current network monitoring & traffic report (PDF, CSV, JSON)"
          >
            <Download className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Download Report</span>
          </button>

          {/* Interactive Presentation Actions */}
          <div className="flex items-center gap-1.5 bg-[#0A0A0A] p-1 rounded-lg border border-[#242424]">
            <button
              onClick={onTriggerSpike}
              disabled={isSpiking}
              title="Simulate sudden traffic spike on Student-Laptop for presentation"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                isSpiking
                  ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50 animate-pulse'
                  : 'bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 border border-[#EF4444]/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#EF4444]" />
              <span className="hidden sm:inline">Simulate</span> Spike
            </button>

            <button
              onClick={onToggleOffline}
              title="Toggle a device offline to trigger device discovery change"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 border border-[#F59E0B]/20 transition-all"
            >
              <WifiOff className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="hidden sm:inline">Toggle</span> Device
            </button>

            <button
              onClick={onReset}
              title="Reset simulation to default state"
              className="p-1.5 text-[#737373] hover:text-[#F5F5F5] hover:bg-[#171717] rounded-md transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Viva Guide Modal button */}
          <button
            onClick={onOpenVivaModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#111111] hover:bg-[#171717] text-[#A3A3A3] hover:text-[#F5F5F5] border border-[#242424] transition-all shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Viva Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
}
