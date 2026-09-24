import { isFirebaseConfigured } from '../firebase/config';
import { db } from '../firebase/firestore';
import { deviceService } from './deviceService';
import { trafficService } from './trafficService';
import { alertService } from './alertService';
import { networkStatsService } from './networkStatsService';
import { seedService } from './seedService';
import {
  localDevices,
  localAlerts,
  localTraffic1h,
  localTraffic6h,
  localTrafficToday,
  simulateLocalTick
} from '../data/mockData';

// Attempt auto-seed once when Firebase is configured
let hasAttemptedSeed = false;
async function ensureFirestoreInitialized() {
  if (isFirebaseConfigured && db && !hasAttemptedSeed) {
    hasAttemptedSeed = true;
    try {
      await seedService.autoSeedIfEmpty();
    } catch (e) {
      console.warn('Initial Firestore seed attempt completed with notice:', e.message);
    }
  }
}

export const api = {
  // 1. Dashboard Overview
  async getDashboard() {
    await ensureFirestoreInitialized();

    if (isFirebaseConfigured && db) {
      try {
        const [devices, alerts, trafficHistory, stats] = await Promise.all([
          deviceService.getDevices(),
          alertService.getAlerts(),
          trafficService.getTrafficHistory(20),
          networkStatsService.getNetworkStats()
        ]);

        if (devices.length > 0 || stats) {
          const onlineDevices = devices.filter(d => d.status.toLowerCase() === 'online');
          const totalDownload = onlineDevices.reduce((sum, d) => sum + (d.download || 0), 0);
          const totalUpload = onlineDevices.reduce((sum, d) => sum + (d.upload || 0), 0);
          const bandwidthPercent = Math.min(100, Math.round(((totalDownload + totalUpload) / (stats?.totalBandwidth || 150)) * 100));
          const activeAlerts = alerts.filter(a => a.status === 'Active' && !a.resolved);
          const totalTrafficGb = (devices.reduce((sum, d) => sum + (d.totalTrafficMb || 0), 0) / 1024).toFixed(2);

          const totalCurrent = totalDownload + totalUpload || 1;
          const topUsers = onlineDevices
            .map(d => ({
              id: d.id,
              name: d.name,
              type: d.type,
              ip: d.ip,
              speedMbps: parseFloat(((d.download || 0) + (d.upload || 0)).toFixed(1)),
              percentage: Math.round((((d.download || 0) + (d.upload || 0)) / totalCurrent) * 100)
            }))
            .sort((a, b) => b.speedMbps - a.speedMbps)
            .slice(0, 5);

          return {
            data: {
              metrics: {
                activeDevicesCount: stats?.onlineDevices !== undefined ? stats.onlineDevices : onlineDevices.length,
                totalDevicesCount: stats?.totalDevices !== undefined ? stats.totalDevices : devices.length,
                totalDownloadMbps: stats?.totalDownloadMbps !== undefined ? stats.totalDownloadMbps : parseFloat(totalDownload.toFixed(1)),
                totalUploadMbps: stats?.totalUploadMbps !== undefined ? stats.totalUploadMbps : parseFloat(totalUpload.toFixed(1)),
                bandwidthPercent: stats?.bandwidthPercent !== undefined ? stats.bandwidthPercent : bandwidthPercent,
                activeAlertsCount: stats?.activeAlertsCount !== undefined ? stats.activeAlertsCount : activeAlerts.length,
                totalTrafficGb: stats?.totalTrafficGb !== undefined ? stats.totalTrafficGb : parseFloat(totalTrafficGb),
                averageLatency: stats?.averageLatency !== undefined ? stats.averageLatency : 14.2,
                packetLoss: stats?.packetLoss !== undefined ? stats.packetLoss : 0.0,
                totalBandwidth: stats?.totalBandwidth !== undefined ? stats.totalBandwidth : 150,
                gatewayIP: stats?.gatewayIP || '192.168.1.1',
                subnetMask: stats?.subnetMask || '255.255.255.0',
                interfaceName: stats?.interfaceName || 'eth0',
                interfaceSpeed: stats?.interfaceSpeed || '1 Gbps'
              },
              networkStats: stats,
              topUsers,
              recentAlerts: alerts.slice(0, 5),
              recentTraffic: trafficHistory.length > 0 ? trafficHistory.slice(-10) : localTraffic1h.slice(-10),
              devicesSummary: {
                total: stats?.totalDevices !== undefined ? stats.totalDevices : devices.length,
                online: stats?.onlineDevices !== undefined ? stats.onlineDevices : onlineDevices.length,
                offline: stats?.offlineDevices !== undefined ? stats.offlineDevices : (devices.length - onlineDevices.length)
              }
            },
            isBackendConnected: true,
            source: 'Firebase Firestore'
          };
        }
      } catch (err) {
        console.warn('Firestore getDashboard fallback:', err.message);
      }
    }

    // Fallback mode (runs only when Firebase is not yet configured)
    if (!isFirebaseConfigured || !db) {
      simulateLocalTick();
    }
    const onlineDevices = localDevices.filter(d => d.status === 'Online');
    const totalDownload = onlineDevices.reduce((sum, d) => sum + d.download, 0);
    const totalUpload = onlineDevices.reduce((sum, d) => sum + d.upload, 0);
    const bandwidthPercent = Math.min(100, Math.round(((totalDownload + totalUpload) / 150) * 100));
    const activeAlertsCount = localAlerts.filter(a => a.status === 'Active').length;
    const totalTrafficGb = (localDevices.reduce((sum, d) => sum + d.totalTrafficMb, 0) / 1024).toFixed(2);

    const totalCurrent = totalDownload + totalUpload || 1;
    const topUsers = onlineDevices
      .map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        ip: d.ip,
        speedMbps: parseFloat((d.download + d.upload).toFixed(1)),
        percentage: Math.round(((d.download + d.upload) / totalCurrent) * 100)
      }))
      .sort((a, b) => b.speedMbps - a.speedMbps)
      .slice(0, 5);

    return {
      data: {
        metrics: {
          activeDevicesCount: onlineDevices.length,
          totalDevicesCount: localDevices.length,
          totalDownloadMbps: parseFloat(totalDownload.toFixed(1)),
          totalUploadMbps: parseFloat(totalUpload.toFixed(1)),
          bandwidthPercent,
          activeAlertsCount,
          totalTrafficGb: parseFloat(totalTrafficGb),
          averageLatency: 14.2,
          packetLoss: 0.0,
          totalBandwidth: 150,
          gatewayIP: '192.168.1.1',
          subnetMask: '255.255.255.0',
          interfaceName: 'eth0',
          interfaceSpeed: '1 Gbps'
        },
        networkStats: null,
        topUsers,
        recentAlerts: localAlerts.slice(0, 5),
        recentTraffic: localTraffic1h.slice(-10),
        devicesSummary: {
          total: localDevices.length,
          online: onlineDevices.length,
          offline: localDevices.length - onlineDevices.length
        }
      },
      isBackendConnected: isFirebaseConfigured,
      source: isFirebaseConfigured ? 'Firebase Firestore' : 'Campus Telemetry Simulation'
    };
  },

  // 2. Devices Module
  async getDevices(params = {}) {
    await ensureFirestoreInitialized();

    let allDevices = [];
    if (isFirebaseConfigured && db) {
      try {
        allDevices = await deviceService.getDevices();
      } catch (err) {
        console.warn('Firestore getDevices fallback:', err.message);
      }
    }

    if (allDevices.length === 0) {
      allDevices = [...localDevices];
    }

    let filtered = [...allDevices];
    const { search, status, type } = params;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.ip.toLowerCase().includes(q) ||
        d.mac.toLowerCase().includes(q) ||
        (d.location && d.location.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'All') {
      filtered = filtered.filter(d => d.status.toLowerCase() === status.toLowerCase());
    }

    if (type && type !== 'All') {
      filtered = filtered.filter(d => d.type.toLowerCase() === type.toLowerCase());
    }

    const onlineCount = allDevices.filter(d => d.status.toLowerCase() === 'online').length;

    return {
      data: {
        devices: filtered,
        totalCount: allDevices.length,
        onlineCount,
        offlineCount: allDevices.length - onlineCount
      },
      isBackendConnected: isFirebaseConfigured
    };
  },

  // 3. Traffic Monitoring Data
  async getTraffic(timeframe = '1h') {
    await ensureFirestoreInitialized();

    let historyData = [];
    if (isFirebaseConfigured && db) {
      try {
        historyData = await trafficService.getTrafficHistory(25);
      } catch (err) {
        console.warn('Firestore getTraffic fallback:', err.message);
      }
    }

    if (historyData.length === 0) {
      historyData = timeframe === '6h' ? localTraffic6h : timeframe === 'today' ? localTrafficToday : localTraffic1h;
    }

    const currentPoint = historyData.length > 0 ? historyData[historyData.length - 1] : { download: 85.2, upload: 24.1, bandwidth: 68 };
    const online = localDevices.filter(d => d.status === 'Online');

    return {
      data: {
        current: {
          downloadMbps: parseFloat((currentPoint.download || 85.2).toFixed(1)),
          uploadMbps: parseFloat((currentPoint.upload || 24.1).toFixed(1)),
          bandwidthPercent: currentPoint.bandwidth || 68,
          activeDevices: online.length,
          totalTrafficGb: (localDevices.reduce((sum, d) => sum + d.totalTrafficMb, 0) / 1024).toFixed(2),
          capacityMbps: 150
        },
        timeframe,
        history: historyData
      },
      isBackendConnected: isFirebaseConfigured
    };
  },

  // 4. Alerts Module
  async getAlerts(params = {}) {
    await ensureFirestoreInitialized();

    let allAlerts = [];
    if (isFirebaseConfigured && db) {
      try {
        allAlerts = await alertService.getAlerts(params);
      } catch (err) {
        console.warn('Firestore getAlerts fallback:', err.message);
      }
    }

    if (allAlerts.length === 0) {
      allAlerts = [...localAlerts];
    }

    let filtered = [...allAlerts];
    const { severity, status } = params;

    if (severity && severity !== 'All') {
      filtered = filtered.filter(a => a.severity.toUpperCase() === severity.toUpperCase());
    }

    if (status && status !== 'All') {
      filtered = filtered.filter(a => a.status.toLowerCase() === status.toLowerCase());
    }

    return {
      data: {
        alerts: filtered,
        counts: {
          total: allAlerts.length,
          active: allAlerts.filter(a => a.status === 'Active' && !a.resolved).length,
          high: allAlerts.filter(a => a.severity === 'HIGH' && a.status === 'Active' && !a.resolved).length,
          medium: allAlerts.filter(a => a.severity === 'MEDIUM' && a.status === 'Active' && !a.resolved).length,
          low: allAlerts.filter(a => a.severity === 'LOW' && a.status === 'Active' && !a.resolved).length,
          resolved: allAlerts.filter(a => a.status === 'Resolved' || a.resolved).length
        }
      },
      isBackendConnected: isFirebaseConfigured
    };
  },

  // 5. Alert Actions
  async resolveAlert(id) {
    if (isFirebaseConfigured && db) {
      try {
        await alertService.resolveAlert(id);
      } catch (e) {
        console.warn('Firestore resolveAlert notice:', e.message);
      }
    }
    const alert = localAlerts.find(a => a.id === id);
    if (alert) alert.status = 'Resolved';
    return { success: true };
  },

  async dismissAlert(id) {
    if (isFirebaseConfigured && db) {
      try {
        await alertService.dismissAlert(id);
      } catch (e) {
        console.warn('Firestore dismissAlert notice:', e.message);
      }
    }
    const idx = localAlerts.findIndex(a => a.id === id);
    if (idx !== -1) localAlerts.splice(idx, 1);
    return { success: true };
  },

  async clearResolvedAlerts() {
    if (isFirebaseConfigured && db) {
      try {
        await alertService.clearResolvedAlerts();
      } catch (e) {
        console.warn('Firestore clearResolvedAlerts notice:', e.message);
      }
    }
    const activeOnly = localAlerts.filter(a => a.status === 'Active');
    localAlerts.length = 0;
    localAlerts.push(...activeOnly);
    return { success: true };
  },

  // 6. Presentation / Demo Simulation Triggers
  async triggerSpike() {
    const alertObj = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      type: 'TRAFFIC SPIKE',
      device: 'Student Lab Workstation 08',
      ip: '192.168.1.15',
      message: 'Unusual sudden traffic surge detected on Student Lab Workstation (94.5 Mbps).',
      severity: 'HIGH',
      time: 'Just now',
      status: 'Active',
      timestamp: Date.now()
    };

    if (isFirebaseConfigured && db) {
      try {
        await alertService.createAlert(alertObj);
        await trafficService.logTrafficRecord({
          download: 94.5,
          upload: 24.2,
          bandwidth: 88,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      } catch (e) {
        console.warn('Firestore spike log notice:', e.message);
      }
    }

    const target = localDevices.find(d => d.name === 'Student-Laptop' || d.status === 'Online');
    if (target) {
      target.download = 94.5;
      target.upload = 24.2;
      localAlerts.unshift(alertObj);
    }

    return { success: true, alert: alertObj };
  },

  async toggleOffline() {
    if (isFirebaseConfigured && db) {
      try {
        const devices = await deviceService.getDevices();
        const online = devices.filter(d => d.status.toLowerCase() === 'online' && !d.name.includes('Router'));
        if (online.length > 0) {
          const chosen = online[0];
          await deviceService.toggleDeviceStatus(chosen.id, chosen.status);
          await alertService.createAlert({
            id: `ALT-${Date.now().toString().slice(-4)}`,
            type: 'DEVICE OFFLINE',
            device: chosen.name,
            ip: chosen.ip,
            message: `${chosen.name} (${chosen.ip}) went offline abruptly.`,
            severity: 'LOW',
            time: 'Just now'
          });
          return { success: true, message: `${chosen.name} status toggled` };
        }
      } catch (e) {
        console.warn('Firestore toggleOffline notice:', e.message);
      }
    }

    const onlineDevs = localDevices.filter(d => d.status === 'Online' && d.name !== 'Lab-Server');
    if (onlineDevs.length > 0) {
      const chosen = onlineDevs[0];
      chosen.status = 'Offline';
      chosen.download = 0;
      chosen.upload = 0;
      const offlineAlert = {
        id: `ALT-${Date.now().toString().slice(-4)}`,
        type: 'DEVICE OFFLINE',
        device: chosen.name,
        ip: chosen.ip,
        message: `${chosen.name} (${chosen.ip}) went offline abruptly.`,
        severity: 'LOW',
        time: 'Just now',
        status: 'Active',
        timestamp: Date.now()
      };
      localAlerts.unshift(offlineAlert);
      return { success: true, message: `${chosen.name} toggled offline`, alert: offlineAlert };
    }

    return { success: false };
  },

  async resetSimulation() {
    if (isFirebaseConfigured && db) {
      try {
        await seedService.seedAllData();
        return { success: true, message: 'Firestore reset and re-seeded successfully' };
      } catch (e) {
        console.warn('Firestore reset notice:', e.message);
      }
    }
    return { success: true, message: 'Local simulation reset' };
  }
};
