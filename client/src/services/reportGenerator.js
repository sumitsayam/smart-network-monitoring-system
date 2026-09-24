/**
 * Network Telemetry & Monitoring Report Generator
 * Generates formatted PDF/Printable HTML, CSV, and JSON audit logs of the current network state.
 */

export function generateReportData({ dashboardData, devicesData, trafficData, alertsData }) {
  const timestamp = new Date();
  const dateStr = timestamp.toLocaleDateString();
  const timeStr = timestamp.toLocaleTimeString();

  const metrics = dashboardData?.metrics || {
    activeDevicesCount: 8,
    totalDevicesCount: 10,
    totalDownloadMbps: 85.2,
    totalUploadMbps: 24.1,
    bandwidthPercent: 68,
    activeAlertsCount: 2,
    totalTrafficGb: 8.89
  };

  const devices = devicesData?.devices || [];
  const trafficHistory = trafficData?.history || dashboardData?.recentTraffic || [];
  const alerts = alertsData?.alerts || dashboardData?.recentAlerts || [];
  const topUsers = dashboardData?.topUsers || [];

  return {
    meta: {
      title: "Smart Network Traffic Monitoring System - Audit Report",
      generatedAt: `${dateStr} ${timeStr}`,
      subnet: "192.168.1.0/24",
      gateway: "192.168.1.1",
      mode: "Simulated Network Telemetry (College MVP)",
      healthScore: "98/100 (Optimal)"
    },
    metrics,
    topUsers,
    devices,
    trafficHistory,
    alerts
  };
}

export function downloadJsonReport(reportData) {
  const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Network_Report_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCsvReport(reportData) {
  const { meta, metrics, devices, alerts, trafficHistory } = reportData;

  let csvContent = "";

  // 1. Header
  csvContent += `"SMART NETWORK TRAFFIC MONITORING SYSTEM - AUDIT REPORT"\n`;
  csvContent += `"Generated At","${meta.generatedAt}"\n`;
  csvContent += `"Subnet","${meta.subnet}"\n`;
  csvContent += `"Gateway","${meta.gateway}"\n`;
  csvContent += `"Total Bandwidth Utilization","${metrics.bandwidthPercent}%"\n`;
  csvContent += `"Total Download Rate","${metrics.totalDownloadMbps} Mbps"\n`;
  csvContent += `"Total Upload Rate","${metrics.totalUploadMbps} Mbps"\n`;
  csvContent += `"Active Devices","${metrics.activeDevicesCount} of ${metrics.totalDevicesCount}"\n`;
  csvContent += `"Total Session Traffic","${metrics.totalTrafficGb} GB"\n\n`;

  // 2. Devices Table
  csvContent += `"--- NETWORK DEVICES INVENTORY ---"\n`;
  csvContent += `"Device ID","Device Name","IP Address","MAC Address","Device Type","Status","Download (Mbps)","Upload (Mbps)","Total Usage (MB)","Location","Last Active"\n`;
  devices.forEach(d => {
    csvContent += `"${d.id}","${d.name}","${d.ip}","${d.mac}","${d.type}","${d.status}","${d.download}","${d.upload}","${d.totalTrafficMb}","${d.location || 'LAN'}","${d.lastActive}"\n`;
  });
  csvContent += `\n`;

  // 3. Traffic History Samples
  csvContent += `"--- RECENT TRAFFIC TELEMETRY SAMPLES ---"\n`;
  csvContent += `"Timestamp","Download (Mbps)","Upload (Mbps)","Bandwidth Utilization (%)"\n`;
  trafficHistory.forEach(t => {
    csvContent += `"${t.time}","${t.download}","${t.upload}","${t.bandwidth}%"\n`;
  });
  csvContent += `\n`;

  // 4. Alerts Log
  csvContent += `"--- SECURITY & ANOMALY ALERTS LOG ---"\n`;
  csvContent += `"Alert ID","Severity","Type","Target Device","IP Address","Message","Status","Time"\n`;
  alerts.forEach(a => {
    csvContent += `"${a.id}","${a.severity}","${a.type}","${a.device || 'N/A'}","${a.ip || 'N/A'}","${a.message.replace(/"/g, '""')}","${a.status}","${a.time}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Network_Report_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function openPrintableReport(reportData) {
  const { meta, metrics, devices, alerts, trafficHistory } = reportData;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the printable report.');
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Network Monitoring Audit Report - ${meta.generatedAt}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      @page { margin: 1.5cm; size: A4; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #171717;
      background: #fafafa;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
      font-size: 13px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e5e5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #FF6A00;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .header h1 {
      margin: 0 0 4px 0;
      font-size: 22px;
      color: #050505;
    }
    .header p {
      margin: 0;
      color: #737373;
      font-size: 12px;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-orange { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
    .badge-green { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .badge-red { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .badge-amber { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e5e5e5;
    }
    .stat-title {
      font-size: 11px;
      font-weight: 600;
      color: #737373;
      text-transform: uppercase;
    }
    .stat-value {
      font-size: 18px;
      font-weight: bold;
      color: #050505;
      margin-top: 4px;
    }
    h2 {
      font-size: 15px;
      color: #050505;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 6px;
      margin: 24px 0 12px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 12px;
    }
    th {
      background: #f5f5f5;
      color: #525252;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 2px solid #e5e5e5;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #f5f5f5;
    }
    .mono { font-family: monospace; font-size: 11px; }
    .btn-print {
      background: #FF6A00;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      font-size: 12px;
    }
    .btn-print:hover { background: #ea580c; }
    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #e5e5e5;
      font-size: 11px;
      color: #a3a3a3;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="no-print" style="margin-bottom: 16px; display: flex; justify-content: flex-end; gap: 8px;">
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>

    <div class="header">
      <div>
        <h1>Smart Network Traffic Monitoring System</h1>
        <p>Comprehensive Telemetry & Network Infrastructure Audit Report</p>
      </div>
      <div style="text-align: right;">
        <span class="badge badge-orange">SIMULATED NETWORK</span>
        <p style="margin-top: 6px; font-size: 11px;">Timestamp: <strong>${meta.generatedAt}</strong></p>
      </div>
    </div>

    <!-- KPI Summary Grid -->
    <div class="grid-4">
      <div class="stat-card">
        <div class="stat-title">Active Devices</div>
        <div class="stat-value">${metrics.activeDevicesCount} <span style="font-size: 12px; font-weight: normal; color: #737373;">/ ${metrics.totalDevicesCount}</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Current Download</div>
        <div class="stat-value">${metrics.totalDownloadMbps} <span style="font-size: 12px; font-weight: normal; color: #737373;">Mbps</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Current Upload</div>
        <div class="stat-value">${metrics.totalUploadMbps} <span style="font-size: 12px; font-weight: normal; color: #737373;">Mbps</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Bandwidth Utilization</div>
        <div class="stat-value">${metrics.bandwidthPercent}% <span style="font-size: 12px; font-weight: normal; color: #737373;">(150M cap)</span></div>
      </div>
    </div>

    <!-- Network Configuration Overview -->
    <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; border: 1px solid #e5e5e5; margin-bottom: 20px; font-size: 12px; display: flex; justify-content: space-between;">
      <div><strong>Local Gateway:</strong> <span class="mono">${meta.gateway}</span></div>
      <div><strong>Monitored Subnet:</strong> <span class="mono">${meta.subnet}</span></div>
      <div><strong>Network Health Score:</strong> <span style="color: #16a34a; font-weight: bold;">${meta.healthScore}</span></div>
      <div><strong>Active Security Alerts:</strong> <span style="color: #dc2626; font-weight: bold;">${metrics.activeAlertsCount}</span></div>
    </div>

    <!-- Discovered Devices Inventory -->
    <h2>1. Discovered Network Devices Inventory (${devices.length} Hosts)</h2>
    <table>
      <thead>
        <tr>
          <th>Device Name</th>
          <th>IP Address</th>
          <th>MAC Address</th>
          <th>Type</th>
          <th>Status</th>
          <th>Download</th>
          <th>Upload</th>
          <th>Total Session</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>
        ${devices.map(d => `
          <tr>
            <td><strong>${d.name}</strong></td>
            <td class="mono">${d.ip}</td>
            <td class="mono" style="color: #737373;">${d.mac}</td>
            <td>${d.type}</td>
            <td><span class="badge ${d.status === 'Online' ? 'badge-green' : 'badge-amber'}">${d.status}</span></td>
            <td class="mono">${d.download} Mbps</td>
            <td class="mono">${d.upload} Mbps</td>
            <td class="mono">${d.totalTrafficMb} MB</td>
            <td>${d.location || 'LAN'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Recent Traffic Telemetry Samples -->
    <h2>2. Network Traffic Telemetry Samples (Latest Interval)</h2>
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Download Rate</th>
          <th>Upload Rate</th>
          <th>Total Throughput</th>
          <th>Bandwidth %</th>
        </tr>
      </thead>
      <tbody>
        ${trafficHistory.slice(-8).reverse().map(t => `
          <tr>
            <td class="mono"><strong>${t.time}</strong></td>
            <td class="mono" style="color: #ea580c;">${t.download} Mbps</td>
            <td class="mono" style="color: #737373;">${t.upload} Mbps</td>
            <td class="mono"><strong>${(t.download + t.upload).toFixed(1)} Mbps</strong></td>
            <td><span class="badge ${t.bandwidth > 80 ? 'badge-red' : 'badge-orange'}">${t.bandwidth}%</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Security & Rule Alerts Log -->
    <h2>3. Security & Anomaly Alerts Log (${alerts.length} Records)</h2>
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Type</th>
          <th>Target Host</th>
          <th>Diagnostic Message</th>
          <th>Status</th>
          <th>Logged</th>
        </tr>
      </thead>
      <tbody>
        ${alerts.map(a => `
          <tr>
            <td><span class="badge ${a.severity === 'HIGH' ? 'badge-red' : a.severity === 'MEDIUM' ? 'badge-amber' : 'badge-orange'}">${a.severity}</span></td>
            <td><strong>${a.type}</strong></td>
            <td class="mono">${a.device || 'Gateway'} (${a.ip || '192.168.1.1'})</td>
            <td>${a.message}</td>
            <td><strong>${a.status}</strong></td>
            <td style="color: #737373;">${a.time}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="footer">
      <div>Smart Network Traffic Monitoring System • College Project MVP</div>
      <div>Confidential Network Telemetry Log</div>
    </div>
  </div>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
