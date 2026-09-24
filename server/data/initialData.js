export const INITIAL_DEVICES = [
  {
    id: 1,
    name: "Admin-PC",
    ip: "192.168.1.10",
    mac: "00:1A:2B:3C:4D:5E",
    type: "Computer",
    status: "Online",
    download: 35.4,
    upload: 12.2,
    totalTrafficMb: 1420.5,
    lastActive: "Just now",
    priority: "High",
    location: "Admin Block"
  },
  {
    id: 2,
    name: "Student-Laptop",
    ip: "192.168.1.15",
    mac: "08:00:27:5A:BC:DE",
    type: "Laptop",
    status: "Online",
    download: 28.6,
    upload: 5.4,
    totalTrafficMb: 890.2,
    lastActive: "Just now",
    priority: "Normal",
    location: "Computer Lab 1"
  },
  {
    id: 3,
    name: "Lab-Server",
    ip: "192.168.1.5",
    mac: "00:50:56:C0:00:08",
    type: "Server",
    status: "Online",
    download: 18.2,
    upload: 8.5,
    totalTrafficMb: 3250.0,
    lastActive: "Just now",
    priority: "Critical",
    location: "Server Room"
  },
  {
    id: 4,
    name: "Office-PC",
    ip: "192.168.1.22",
    mac: "00:14:22:01:23:45",
    type: "Computer",
    status: "Online",
    download: 8.1,
    upload: 2.3,
    totalTrafficMb: 410.8,
    lastActive: "1 min ago",
    priority: "Normal",
    location: "Staff Room"
  },
  {
    id: 5,
    name: "Library-Workstation",
    ip: "192.168.1.30",
    mac: "3C:D9:2B:10:98:76",
    type: "Computer",
    status: "Online",
    download: 12.4,
    upload: 3.1,
    totalTrafficMb: 620.4,
    lastActive: "Just now",
    priority: "Normal",
    location: "Central Library"
  },
  {
    id: 6,
    name: "Mobile-01",
    ip: "192.168.1.45",
    mac: "A4:C3:61:9F:80:12",
    type: "Mobile",
    status: "Online",
    download: 4.8,
    upload: 1.2,
    totalTrafficMb: 195.3,
    lastActive: "2 mins ago",
    priority: "Low",
    location: "Campus Wi-Fi"
  },
  {
    id: 7,
    name: "Smart-TV",
    ip: "192.168.1.60",
    mac: "68:DB:F5:11:22:33",
    type: "Smart Device",
    status: "Online",
    download: 15.6,
    upload: 0.8,
    totalTrafficMb: 780.0,
    lastActive: "Just now",
    priority: "Normal",
    location: "Seminar Hall"
  },
  {
    id: 8,
    name: "Security-CCTV-01",
    ip: "192.168.1.80",
    mac: "B8:27:EB:44:55:66",
    type: "IoT Camera",
    status: "Online",
    download: 2.2,
    upload: 9.8,
    totalTrafficMb: 1850.4,
    lastActive: "Just now",
    priority: "High",
    location: "Main Gate"
  },
  {
    id: 9,
    name: "Faculty-MacBook",
    ip: "192.168.1.18",
    mac: "40:6C:8F:12:34:56",
    type: "Laptop",
    status: "Offline",
    download: 0.0,
    upload: 0.0,
    totalTrafficMb: 310.0,
    lastActive: "25 mins ago",
    priority: "Normal",
    location: "Faculty Lounge"
  },
  {
    id: 10,
    name: "Guest-Phone-04",
    ip: "192.168.1.92",
    mac: "52:54:00:12:34:56",
    type: "Mobile",
    status: "Offline",
    download: 0.0,
    upload: 0.0,
    totalTrafficMb: 45.0,
    lastActive: "2 hours ago",
    priority: "Low",
    location: "Guest Wi-Fi"
  }
];

export const INITIAL_ALERTS = [
  {
    id: "ALT-101",
    type: "HIGH BANDWIDTH",
    device: "Student-Laptop",
    ip: "192.168.1.15",
    message: "Student-Laptop is using unusually high bandwidth (92 Mbps).",
    severity: "HIGH",
    time: "2 mins ago",
    status: "Active",
    timestamp: Date.now() - 120000
  },
  {
    id: "ALT-102",
    type: "BANDWIDTH WARNING",
    device: "Network Gateway",
    ip: "192.168.1.1",
    message: "Overall network bandwidth usage reached 85% threshold.",
    severity: "MEDIUM",
    time: "8 mins ago",
    status: "Active",
    timestamp: Date.now() - 480000
  },
  {
    id: "ALT-103",
    type: "DEVICE OFFLINE",
    device: "Faculty-MacBook",
    ip: "192.168.1.18",
    message: "Faculty-MacBook has gone offline unexpectedly.",
    severity: "LOW",
    time: "25 mins ago",
    status: "Resolved",
    timestamp: Date.now() - 1500000
  }
];

export function generateTrafficHistory(points = 20, intervalMins = 5) {
  const history = [];
  const now = new Date();
  
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * intervalMins * 60 * 1000);
    const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Realistic fluctuating baseline
    const baseDownload = 55 + Math.sin(i * 0.4) * 20 + (Math.random() * 15 - 7.5);
    const baseUpload = 20 + Math.cos(i * 0.4) * 8 + (Math.random() * 6 - 3);
    
    history.push({
      time: timeStr,
      download: Math.max(5, parseFloat(baseDownload.toFixed(1))),
      upload: Math.max(2, parseFloat(baseUpload.toFixed(1))),
      bandwidth: Math.min(98, Math.max(15, Math.round(((baseDownload + baseUpload) / 130) * 100)))
    });
  }
  return history;
}
