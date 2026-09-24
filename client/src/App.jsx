import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import VivaGuideModal from './components/VivaGuideModal';
import DownloadReportModal from './components/DownloadReportModal';
import NetworkConfigModal from './components/NetworkConfigModal';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Traffic from './pages/Traffic';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import { api } from './services/api';
import { networkStatsService } from './services/networkStatsService';
import { ShieldAlert, Zap, WifiOff, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isSpiking, setIsSpiking] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Core telemetry state
  const [dashboardData, setDashboardData] = useState(null);
  const [devicesData, setDevicesData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [networkStats, setNetworkStats] = useState(null);
  const [trafficTimeframe, setTrafficTimeframe] = useState('1h');

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Main data sync routine
  const refreshAllData = useCallback(async () => {
    try {
      const [dashRes, devRes, trafRes, altRes] = await Promise.all([
        api.getDashboard(),
        api.getDevices(),
        api.getTraffic(trafficTimeframe),
        api.getAlerts()
      ]);

      setIsBackendConnected(dashRes.isBackendConnected);
      if (dashRes.data) {
        setDashboardData(dashRes.data);
        if (dashRes.data.networkStats) {
          setNetworkStats(dashRes.data.networkStats);
        }
      }
      if (devRes.data) setDevicesData(devRes.data);
      if (trafRes.data) setTrafficData(trafRes.data);
      if (altRes.data) setAlertsData(altRes.data);
    } catch (err) {
      console.error('Error refreshing telemetry:', err);
    }
  }, [trafficTimeframe]);

  // Initial fetch and baseline initialization
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Real-time Firestore networkStats listener
  useEffect(() => {
    const unsubscribe = networkStatsService.subscribeToNetworkStats((stats) => {
      if (stats) {
        setNetworkStats(stats);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Periodic background telemetry refresh (only runs refreshAllData without local random ticks)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAllData();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshAllData]);

  // Handle Presentation Triggers
  const handleTriggerSpike = async () => {
    setIsSpiking(true);
    showToast('⚡ Simulating Sudden High Bandwidth Spike on Student-Laptop...', 'warning');
    await api.triggerSpike();
    await refreshAllData();
    setTimeout(() => setIsSpiking(false), 3000);
  };

  const handleToggleOffline = async () => {
    showToast('🔌 Simulating Host Disconnect Event...', 'warning');
    await api.toggleOffline();
    await refreshAllData();
  };

  const handleResetSimulation = async () => {
    showToast('🔄 Resetting network simulation state...', 'info');
    await api.resetSimulation();
    await refreshAllData();
  };

  const handleResolveAlert = async (id) => {
    await api.resolveAlert(id);
    showToast(`Alert ${id} marked as Resolved`, 'success');
    await refreshAllData();
  };

  const handleDismissAlert = async (id) => {
    await api.dismissAlert(id);
    showToast(`Alert ${id} dismissed`, 'info');
    await refreshAllData();
  };

  const handleClearResolved = async () => {
    await api.clearResolvedAlerts();
    showToast('Cleared all resolved alerts', 'info');
    await refreshAllData();
  };

  const activeAlertsCount = networkStats?.activeAlertsCount !== undefined
    ? networkStats.activeAlertsCount
    : (dashboardData?.metrics?.activeAlertsCount || alertsData?.counts?.active || 0);

  const onlineDevicesCount = networkStats?.onlineDevices !== undefined
    ? networkStats.onlineDevices
    : (dashboardData?.metrics?.activeDevicesCount || devicesData?.onlineCount || 0);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col font-sans selection:bg-[#FF6A00] selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        isBackendConnected={isBackendConnected}
        onTriggerSpike={handleTriggerSpike}
        onToggleOffline={handleToggleOffline}
        onReset={handleResetSimulation}
        onOpenVivaModal={() => setIsVivaModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        isSpiking={isSpiking}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeAlertsCount={activeAlertsCount}
          onlineDevicesCount={onlineDevicesCount}
          networkStats={networkStats}
          onOpenConfigModal={() => setIsConfigModalOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              dashboardData={dashboardData}
              trafficHistory={trafficData?.history || dashboardData?.recentTraffic || []}
              networkStats={networkStats}
              onResolveAlert={handleResolveAlert}
              onDismissAlert={handleDismissAlert}
              onNavigate={setActiveTab}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onOpenConfigModal={() => setIsConfigModalOpen(true)}
            />
          )}

          {activeTab === 'devices' && (
            <Devices
              devicesData={devicesData}
              networkStats={networkStats}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'traffic' && (
            <Traffic
              trafficData={trafficData}
              networkStats={networkStats}
              timeframe={trafficTimeframe}
              onTimeframeChange={(tf) => setTrafficTimeframe(tf)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onOpenConfigModal={() => setIsConfigModalOpen(true)}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics
              dashboardData={dashboardData}
              networkStats={networkStats}
            />
          )}

          {activeTab === 'alerts' && (
            <Alerts
              alertsData={alertsData}
              onResolveAlert={handleResolveAlert}
              onDismissAlert={handleDismissAlert}
              onClearResolved={handleClearResolved}
              onRefreshAlerts={refreshAllData}
            />
          )}
        </main>
      </div>

      {/* Floating Presentation Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#111111] border border-[#242424] shadow-2xl text-xs font-semibold animate-slideUp text-[#F5F5F5]">
          {toastMessage.type === 'warning' && <Zap className="w-4 h-4 text-[#F59E0B]" />}
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />}
          {toastMessage.type === 'info' && <ShieldAlert className="w-4 h-4 text-[#FF6A00]" />}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Network Configuration & Parameters Modal */}
      <NetworkConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentStats={networkStats || dashboardData?.metrics}
        onSaved={(saved) => {
          setNetworkStats(prev => ({ ...prev, ...saved }));
          showToast('Network parameters saved to Firestore', 'success');
        }}
      />

      {/* Download Report Modal */}
      <DownloadReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        dashboardData={dashboardData}
        devicesData={devicesData}
        trafficData={trafficData}
        alertsData={alertsData}
      />

      {/* Viva / Architecture Guide Modal */}
      <VivaGuideModal
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
      />
    </div>
  );
}
