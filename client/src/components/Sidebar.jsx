import React from 'react';
import {
  LayoutDashboard,
  Server,
  Activity,
  BarChart3,
  ShieldAlert,
  Globe,
  Sliders
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'devices', label: 'Devices', icon: Server, badge: null },
  { id: 'traffic', label: 'Traffic Monitoring', icon: Activity, badge: null },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
  { id: 'alerts', label: 'Security Alerts', icon: ShieldAlert, badge: 'alerts' }
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  activeAlertsCount = 0,
  onlineDevicesCount = 0,
  networkStats,
  onOpenConfigModal
}) {
  const gatewayIP = networkStats?.gatewayIP || '192.168.1.1';
  const subnetMask = networkStats?.subnetMask || '255.255.255.0';
  const activeHosts = networkStats?.onlineDevices !== undefined ? networkStats.onlineDevices : onlineDevicesCount;
  const interfaceName = networkStats?.interfaceName || 'eth0';
  const interfaceSpeed = networkStats?.interfaceSpeed || '1 Gbps';

  return (
    <aside className="w-full lg:w-64 bg-[#080808] border-b lg:border-b-0 lg:border-r border-[#242424] flex flex-col justify-between shrink-0 select-none">
      {/* Navigation List */}
      <div className="p-3 lg:p-4">
        <div className="text-[11px] font-semibold tracking-wider text-[#737373] uppercase px-3 mb-2 hidden lg:block">
          Monitoring Modules
        </div>
        
        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showAlertBadge = item.badge === 'alerts' && activeAlertsCount > 0;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap lg:w-full ${
                  isActive
                    ? 'bg-[#FF6A00]/15 text-[#FF7A00] border border-[#FF6A00]/40 shadow-sm shadow-orange-500/5'
                    : 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#171717] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#FF6A00]' : 'text-[#737373]'
                  }`} />
                  <span>{item.label}</span>
                </div>

                {showAlertBadge && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 animate-pulse">
                    {activeAlertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Network Environment Overview Widget (Footer) */}
      <div className="p-4 hidden lg:block border-t border-[#242424] bg-[#0A0A0A]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] font-semibold text-[#A3A3A3] uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#FF6A00]" />
            <span>Local Network Node</span>
          </div>
          {onOpenConfigModal && (
            <button
              onClick={onOpenConfigModal}
              title="Configure Network Parameters & Node Settings"
              className="p-1 rounded-md text-[#737373] hover:text-[#FF7A00] hover:bg-[#171717] transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="space-y-1.5 text-xs font-mono text-[#F5F5F5] bg-[#0D0D0D] p-2.5 rounded-lg border border-[#242424]">
          <div className="flex justify-between items-center text-[#737373]">
            <span>Gateway IP:</span>
            <span className="text-[#A3A3A3]">{gatewayIP}</span>
          </div>
          <div className="flex justify-between items-center text-[#737373]">
            <span>Subnet Mask:</span>
            <span className="text-[#A3A3A3]">{subnetMask}</span>
          </div>
          <div className="flex justify-between items-center text-[#737373]">
            <span>Active Hosts:</span>
            <span className="text-[#22C55E] font-semibold">{activeHosts} Online</span>
          </div>
          <div className="flex justify-between items-center text-[#737373]">
            <span>Interface:</span>
            <span className="text-[#FF7A00] font-semibold">{interfaceName} ({interfaceSpeed})</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
