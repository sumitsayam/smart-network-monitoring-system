import {
  collection,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase/firestore';
import { INITIAL_MOCK_DEVICES, INITIAL_MOCK_ALERTS, generateMockTrafficHistory } from '../data/mockData';

export const CAMPUS_INITIAL_DEVICES = [
  {
    id: "dev-01",
    name: "Campus Core Router 01",
    ipAddress: "192.168.1.1",
    ip: "192.168.1.1",
    mac: "00:1A:2B:3C:4D:5E",
    type: "Router",
    location: "Main NOC Server Room",
    status: "online",
    uptime: 99.9,
    latency: 8,
    packetLoss: 0.0,
    bandwidthIn: 42.5,
    bandwidthOut: 18.2,
    download: 42.5,
    upload: 18.2,
    totalTrafficMb: 4820.5,
    priority: "Critical",
    lastActive: "Just now"
  },
  {
    id: "dev-02",
    name: "Computer Lab Server",
    ipAddress: "192.168.1.5",
    ip: "192.168.1.5",
    mac: "00:50:56:C0:00:08",
    type: "Server",
    location: "Lab Block A - Room 204",
    status: "online",
    uptime: 99.8,
    latency: 12,
    packetLoss: 0.1,
    bandwidthIn: 28.4,
    bandwidthOut: 14.6,
    download: 28.4,
    upload: 14.6,
    totalTrafficMb: 3250.0,
    priority: "Critical",
    lastActive: "Just now"
  },
  {
    id: "dev-03",
    name: "Admin Office PC",
    ipAddress: "192.168.1.10",
    ip: "192.168.1.10",
    mac: "3C:D9:2B:10:98:76",
    type: "Computer",
    location: "Administrative Wing",
    status: "online",
    uptime: 98.5,
    latency: 14,
    packetLoss: 0.0,
    bandwidthIn: 18.6,
    bandwidthOut: 6.2,
    download: 18.6,
    upload: 6.2,
    totalTrafficMb: 1420.5,
    priority: "High",
    lastActive: "Just now"
  },
  {
    id: "dev-04",
    name: "Student Lab Workstation 08",
    ipAddress: "192.168.1.15",
    ip: "192.168.1.15",
    mac: "08:00:27:5A:BC:DE",
    type: "Laptop",
    location: "Computer Lab 1",
    status: "online",
    uptime: 97.2,
    latency: 18,
    packetLoss: 0.2,
    bandwidthIn: 32.1,
    bandwidthOut: 8.4,
    download: 32.1,
    upload: 8.4,
    totalTrafficMb: 890.2,
    priority: "Normal",
    lastActive: "Just now"
  },
  {
    id: "dev-05",
    name: "Central Library Terminal",
    ipAddress: "192.168.1.30",
    ip: "192.168.1.30",
    mac: "00:14:22:01:23:45",
    type: "Computer",
    location: "Central Library 1st Floor",
    status: "online",
    uptime: 99.1,
    latency: 15,
    packetLoss: 0.0,
    bandwidthIn: 12.4,
    bandwidthOut: 3.1,
    download: 12.4,
    upload: 3.1,
    totalTrafficMb: 620.4,
    priority: "Normal",
    lastActive: "Just now"
  },
  {
    id: "dev-06",
    name: "Campus Security CCTV 01",
    ipAddress: "192.168.1.80",
    ip: "192.168.1.80",
    mac: "B8:27:EB:44:55:66",
    type: "IoT Camera",
    location: "Main Entrance Gate",
    status: "online",
    uptime: 99.9,
    latency: 11,
    packetLoss: 0.0,
    bandwidthIn: 2.2,
    bandwidthOut: 9.8,
    download: 2.2,
    upload: 9.8,
    totalTrafficMb: 1850.4,
    priority: "High",
    lastActive: "Just now"
  },
  {
    id: "dev-07",
    name: "Seminar Hall Smart TV",
    ipAddress: "192.168.1.60",
    ip: "192.168.1.60",
    mac: "68:DB:F5:11:22:33",
    type: "Smart Device",
    location: "Auditorium & Seminar Hall",
    status: "online",
    uptime: 96.4,
    latency: 22,
    packetLoss: 0.4,
    bandwidthIn: 15.6,
    bandwidthOut: 0.8,
    download: 15.6,
    upload: 0.8,
    totalTrafficMb: 780.0,
    priority: "Normal",
    lastActive: "Just now"
  },
  {
    id: "dev-08",
    name: "Faculty Lounge Laptop",
    ipAddress: "192.168.1.18",
    ip: "192.168.1.18",
    mac: "40:6C:8F:12:34:56",
    type: "Laptop",
    location: "Faculty Lounge",
    status: "offline",
    uptime: 91.0,
    latency: 0,
    packetLoss: 100,
    bandwidthIn: 0.0,
    bandwidthOut: 0.0,
    download: 0.0,
    upload: 0.0,
    totalTrafficMb: 310.0,
    priority: "Normal",
    lastActive: "25 mins ago"
  },
  {
    id: "dev-09",
    name: "Guest Mobile 04",
    ipAddress: "192.168.1.92",
    ip: "192.168.1.92",
    mac: "52:54:00:12:34:56",
    type: "Mobile",
    location: "Guest Wi-Fi Zone",
    status: "offline",
    uptime: 84.5,
    latency: 0,
    packetLoss: 100,
    bandwidthIn: 0.0,
    bandwidthOut: 0.0,
    download: 0.0,
    upload: 0.0,
    totalTrafficMb: 45.0,
    priority: "Low",
    lastActive: "2 hours ago"
  }
];

export const seedService = {
  // Check if Firestore is empty and populate with realistic campus monitoring telemetry
  async autoSeedIfEmpty() {
    if (!db) return false;
    try {
      const snap = await getDocs(collection(db, COLLECTIONS.DEVICES));
      if (snap.empty) {
        console.log('⚡ Firestore collections are empty. Seeding initial campus network data...');
        return await this.seedAllData();
      }
      return true;
    } catch (err) {
      console.warn('Auto-seed check error:', err.message);
      return false;
    }
  },

  // Full seed routine
  async seedAllData() {
    if (!db) return false;
    try {
      const batch = writeBatch(db);

      // 1. Seed Devices
      CAMPUS_INITIAL_DEVICES.forEach((dev) => {
        const docRef = doc(db, COLLECTIONS.DEVICES, dev.id);
        batch.set(docRef, {
          ...dev,
          lastUpdated: serverTimestamp()
        });
      });

      // 2. Seed Initial Traffic Samples
      const trafficPoints = generateMockTrafficHistory(15, 4);
      trafficPoints.forEach((pt, idx) => {
        const docRef = doc(db, COLLECTIONS.TRAFFIC, `sample-${idx + 1}`);
        batch.set(docRef, {
          deviceId: "gateway",
          bandwidthIn: pt.download,
          bandwidthOut: pt.upload,
          download: pt.download,
          upload: pt.upload,
          bandwidthPercent: pt.bandwidth,
          packetsIn: Math.round(pt.download * 150),
          packetsOut: Math.round(pt.upload * 120),
          time: pt.time,
          createdAt: serverTimestamp()
        });
      });

      // 3. Seed Alerts
      INITIAL_MOCK_ALERTS.forEach((alt) => {
        const docRef = doc(db, COLLECTIONS.ALERTS, alt.id);
        batch.set(docRef, {
          ...alt,
          resolved: alt.status === 'Resolved',
          createdAt: serverTimestamp()
        });
      });

      // 4. Seed Aggregate Network Stats
      const statsRef = doc(db, COLLECTIONS.NETWORK_STATS, 'current');
      batch.set(statsRef, {
        totalDevices: CAMPUS_INITIAL_DEVICES.length,
        onlineDevices: CAMPUS_INITIAL_DEVICES.filter(d => d.status === 'online').length,
        offlineDevices: CAMPUS_INITIAL_DEVICES.filter(d => d.status === 'offline').length,
        averageLatency: 14.2,
        packetLoss: 0.05,
        totalBandwidth: 151.7,
        totalDownloadMbps: 151.7,
        totalUploadMbps: 58.0,
        bandwidthPercent: 68,
        activeAlertsCount: 2,
        totalTrafficGb: 13.17,
        lastUpdated: serverTimestamp()
      });

      await batch.commit();
      console.log('✅ Firestore successfully seeded with campus network data!');
      return true;
    } catch (err) {
      console.error('Error seeding Firestore data:', err);
      return false;
    }
  }
};
