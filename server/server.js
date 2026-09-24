import express from 'express';
import cors from 'cors';
import { INITIAL_DEVICES, INITIAL_ALERTS, generateTrafficHistory } from './data/initialData.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory simulation state
let devices = JSON.parse(JSON.stringify(INITIAL_DEVICES));
let alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
let traffic1h = generateTrafficHistory(20, 3);
let traffic6h = generateTrafficHistory(24, 15);
let trafficToday = generateTrafficHistory(24, 60);

let totalCapacityMbps = 150; // Reference network capacity for % calculation

// Helper to compute aggregate stats
function calculateMetrics() {
  const onlineDevices = devices.filter(d => d.status === 'Online');
  const totalDownload = onlineDevices.reduce((sum, d) => sum + d.download, 0);
  const totalUpload = onlineDevices.reduce((sum, d) => sum + d.upload, 0);
  const bandwidthPercent = Math.min(100, Math.round(((totalDownload + totalUpload) / totalCapacityMbps) * 100));
  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;
  const totalTrafficGb = (devices.reduce((sum, d) => sum + d.totalTrafficMb, 0) / 1024).toFixed(2);

  return {
    activeDevicesCount: onlineDevices.length,
    totalDevicesCount: devices.length,
    totalDownloadMbps: parseFloat(totalDownload.toFixed(1)),
    totalUploadMbps: parseFloat(totalUpload.toFixed(1)),
    bandwidthPercent,
    activeAlertsCount,
    totalTrafficGb: parseFloat(totalTrafficGb)
  };
}

// Helper to calculate top bandwidth consumers
function getTopBandwidthUsers() {
  const online = devices.filter(d => d.status === 'Online');
  const totalCurrentBandwidth = online.reduce((sum, d) => sum + d.download + d.upload, 0) || 1;
  
  return online
    .map(d => {
      const devTotal = d.download + d.upload;
      return {
        id: d.id,
        name: d.name,
        type: d.type,
        ip: d.ip,
        speedMbps: parseFloat(devTotal.toFixed(1)),
        percentage: Math.round((devTotal / totalCurrentBandwidth) * 100)
      };
    })
    .sort((a, b) => b.speedMbps - a.speedMbps)
    .slice(0, 5);
}

// Background simulation ticker (updates telemetry every 3.5 seconds)
setInterval(() => {
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // 1. Jitter device traffic smoothly
  devices.forEach(dev => {
    if (dev.status === 'Online') {
      // Gentle random drift
      const downDelta = (Math.random() * 4 - 2);
      const upDelta = (Math.random() * 2 - 1);
      
      dev.download = Math.max(1.0, parseFloat((dev.download + downDelta).toFixed(1)));
      dev.upload = Math.max(0.5, parseFloat((dev.upload + upDelta).toFixed(1)));
      
      // Accumulate total MB
      dev.totalTrafficMb = parseFloat((dev.totalTrafficMb + (dev.download + dev.upload) * 0.05).toFixed(1));
      dev.lastActive = 'Just now';
    }
  });

  const metrics = calculateMetrics();

  // 2. Append new data point to 1h traffic stream
  const newPoint = {
    time: nowStr,
    download: metrics.totalDownloadMbps,
    upload: metrics.totalUploadMbps,
    bandwidth: metrics.bandwidthPercent
  };
  
  traffic1h.push(newPoint);
  if (traffic1h.length > 25) {
    traffic1h.shift();
  }

  // 3. Rule-based alert detection
  // Rule A: Bandwidth > 80%
  if (metrics.bandwidthPercent >= 80) {
    const recentWarning = alerts.find(a => a.type === 'BANDWIDTH WARNING' && (Date.now() - a.timestamp) < 60000);
    if (!recentWarning) {
      alerts.unshift({
        id: `ALT-${Date.now().toString().slice(-4)}`,
        type: 'BANDWIDTH WARNING',
        device: 'Gateway Router',
        ip: '192.168.1.1',
        message: `Network bandwidth utilization exceeded critical threshold (${metrics.bandwidthPercent}%).`,
        severity: 'MEDIUM',
        time: 'Just now',
        status: 'Active',
        timestamp: Date.now()
      });
    }
  }

  // Rule B: High device usage (> 70 Mbps)
  devices.forEach(d => {
    if (d.status === 'Online' && d.download >= 70) {
      const recentDeviceAlert = alerts.find(a => a.device === d.name && a.type === 'HIGH BANDWIDTH' && (Date.now() - a.timestamp) < 60000);
      if (!recentDeviceAlert) {
        alerts.unshift({
          id: `ALT-${Date.now().toString().slice(-4)}`,
          type: 'HIGH BANDWIDTH',
          device: d.name,
          ip: d.ip,
          message: `${d.name} is consuming abnormal bandwidth (${d.download} Mbps download).`,
          severity: 'HIGH',
          time: 'Just now',
          status: 'Active',
          timestamp: Date.now()
        });
      }
    }
  });

  // Limit alerts array to 30 items
  if (alerts.length > 30) {
    alerts = alerts.slice(0, 30);
  }
}, 3500);

// ===================== REST API ROUTES ===================== //

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), mode: 'SIMULATED NETWORK' });
});

// Dashboard overview
app.get('/api/dashboard', (req, res) => {
  const metrics = calculateMetrics();
  const topUsers = getTopBandwidthUsers();
  const recentAlerts = alerts.slice(0, 5);
  const recentTraffic = traffic1h.slice(-10);

  res.json({
    metrics,
    topUsers,
    recentAlerts,
    recentTraffic,
    devicesSummary: {
      total: devices.length,
      online: metrics.activeDevicesCount,
      offline: devices.length - metrics.activeDevicesCount
    }
  });
});

// Device Discovery List
app.get('/api/devices', (req, res) => {
  const { search, status, type } = req.query;
  let filtered = [...devices];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.ip.toLowerCase().includes(q) ||
      d.mac.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q)
    );
  }

  if (status && status !== 'All') {
    filtered = filtered.filter(d => d.status.toLowerCase() === status.toLowerCase());
  }

  if (type && type !== 'All') {
    filtered = filtered.filter(d => d.type.toLowerCase() === type.toLowerCase());
  }

  const metrics = calculateMetrics();

  res.json({
    devices: filtered,
    totalCount: devices.length,
    onlineCount: metrics.activeDevicesCount,
    offlineCount: devices.length - metrics.activeDevicesCount
  });
});

// Traffic Monitoring Data
app.get('/api/traffic', (req, res) => {
  const timeframe = req.query.timeframe || '1h';
  let historyData = traffic1h;

  if (timeframe === '6h') {
    historyData = traffic6h;
  } else if (timeframe === 'today') {
    historyData = trafficToday;
  }

  const metrics = calculateMetrics();

  res.json({
    current: {
      downloadMbps: metrics.totalDownloadMbps,
      uploadMbps: metrics.totalUploadMbps,
      bandwidthPercent: metrics.bandwidthPercent,
      activeDevices: metrics.activeDevicesCount,
      totalTrafficGb: metrics.totalTrafficGb,
      capacityMbps: totalCapacityMbps
    },
    timeframe,
    history: historyData
  });
});

// Alerts list
app.get('/api/alerts', (req, res) => {
  const { severity, status } = req.query;
  let filtered = [...alerts];

  if (severity && severity !== 'All') {
    filtered = filtered.filter(a => a.severity.toUpperCase() === severity.toUpperCase());
  }

  if (status && status !== 'All') {
    filtered = filtered.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  res.json({
    alerts: filtered,
    counts: {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'Active').length,
      high: alerts.filter(a => a.severity === 'HIGH' && a.status === 'Active').length,
      medium: alerts.filter(a => a.severity === 'MEDIUM' && a.status === 'Active').length,
      low: alerts.filter(a => a.severity === 'LOW' && a.status === 'Active').length,
      resolved: alerts.filter(a => a.status === 'Resolved').length
    }
  });
});

// Mark alert as resolved
app.post('/api/alerts/:id/resolve', (req, res) => {
  const { id } = req.params;
  const alert = alerts.find(a => a.id === id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  alert.status = 'Resolved';
  res.json({ success: true, alert });
});

// Dismiss / delete alert
app.post('/api/alerts/:id/dismiss', (req, res) => {
  const { id } = req.params;
  const initialLen = alerts.length;
  alerts = alerts.filter(a => a.id !== id);
  
  if (alerts.length === initialLen) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  res.json({ success: true, message: 'Alert removed' });
});

// Clear all resolved alerts
app.post('/api/alerts/clear-resolved', (req, res) => {
  alerts = alerts.filter(a => a.status === 'Active');
  res.json({ success: true, remaining: alerts.length });
});

// ===================== DEMO / PRESENTATION TRIGGERS ===================== //

// Trigger instant traffic spike on a device for live viva demo
app.post('/api/simulate-spike', (req, res) => {
  const target = devices.find(d => d.name === 'Student-Laptop' || d.status === 'Online');
  if (target) {
    target.download = 96.5;
    target.upload = 28.4;
    target.status = 'Online';
    target.lastActive = 'Just now';
    
    // Inject alert immediately
    const spikeAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      type: 'TRAFFIC SPIKE',
      device: target.name,
      ip: target.ip,
      message: `Unusual sudden traffic surge detected on ${target.name} (${target.download} Mbps).`,
      severity: 'HIGH',
      time: 'Just now',
      status: 'Active',
      timestamp: Date.now()
    };
    alerts.unshift(spikeAlert);
    
    return res.json({
      success: true,
      message: `Traffic spike triggered on ${target.name}`,
      device: target,
      alert: spikeAlert
    });
  }
  res.status(400).json({ error: 'No online device available' });
});

// Toggle random device offline for demo
app.post('/api/simulate-offline', (req, res) => {
  const onlineDevs = devices.filter(d => d.status === 'Online' && d.name !== 'Lab-Server');
  if (onlineDevs.length > 0) {
    const chosen = onlineDevs[Math.floor(Math.random() * onlineDevs.length)];
    chosen.status = 'Offline';
    chosen.download = 0;
    chosen.upload = 0;
    chosen.lastActive = 'Just now';

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
    alerts.unshift(offlineAlert);

    return res.json({
      success: true,
      message: `${chosen.name} toggled offline`,
      device: chosen,
      alert: offlineAlert
    });
  }

  // If none, turn one online
  const offlineDevs = devices.filter(d => d.status === 'Offline');
  if (offlineDevs.length > 0) {
    const chosen = offlineDevs[0];
    chosen.status = 'Online';
    chosen.download = 14.5;
    chosen.upload = 3.2;
    chosen.lastActive = 'Just now';
    return res.json({ success: true, message: `${chosen.name} reconnected online`, device: chosen });
  }

  res.json({ success: false, message: 'No change possible' });
});

// Reset simulation to fresh baseline
app.post('/api/reset', (req, res) => {
  devices = JSON.parse(JSON.stringify(INITIAL_DEVICES));
  alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
  traffic1h = generateTrafficHistory(20, 3);
  res.json({ success: true, message: 'Simulation state reset successfully' });
});

app.listen(PORT, () => {
  console.log(`Smart Network Monitoring Server listening on http://localhost:${PORT}`);
});
