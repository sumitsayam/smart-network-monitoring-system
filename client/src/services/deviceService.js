import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase/firestore';

// Helper to normalize Firestore device docs to frontend format
export function normalizeDeviceDoc(docSnapshot) {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    name: data.name || 'Unknown Device',
    ip: data.ipAddress || data.ip || '192.168.1.x',
    ipAddress: data.ipAddress || data.ip || '192.168.1.x',
    mac: data.mac || '00:00:00:00:00:00',
    type: data.type || 'Computer',
    location: data.location || 'Campus Network',
    status: (data.status || 'online').charAt(0).toUpperCase() + (data.status || 'online').slice(1).toLowerCase(),
    download: typeof data.bandwidthIn === 'number' ? data.bandwidthIn : (data.download || 0),
    upload: typeof data.bandwidthOut === 'number' ? data.bandwidthOut : (data.upload || 0),
    bandwidthIn: typeof data.bandwidthIn === 'number' ? data.bandwidthIn : (data.download || 0),
    bandwidthOut: typeof data.bandwidthOut === 'number' ? data.bandwidthOut : (data.upload || 0),
    totalTrafficMb: data.totalTrafficMb || 0,
    uptime: data.uptime || 99.5,
    latency: data.latency || 12,
    packetLoss: data.packetLoss || 0.0,
    priority: data.priority || 'Normal',
    lastActive: data.lastActive || 'Just now',
    lastUpdated: data.lastUpdated || null
  };
}

export const deviceService = {
  // Fetch all devices from Firestore
  async getDevices() {
    if (!db) return [];
    try {
      const q = query(collection(db, COLLECTIONS.DEVICES));
      const querySnapshot = await getDocs(q);
      const devices = [];
      querySnapshot.forEach((docSnap) => {
        devices.push(normalizeDeviceDoc(docSnap));
      });
      return devices;
    } catch (err) {
      console.warn('Error fetching devices from Firestore:', err.message);
      return [];
    }
  },

  // Real-time listener for devices
  subscribeToDevices(callback) {
    if (!db) return () => {};
    try {
      const q = query(collection(db, COLLECTIONS.DEVICES));
      return onSnapshot(q, (querySnapshot) => {
        const devices = [];
        querySnapshot.forEach((docSnap) => {
          devices.push(normalizeDeviceDoc(docSnap));
        });
        callback(devices);
      }, (error) => {
        console.warn('Firestore devices listener error:', error.message);
      });
    } catch (err) {
      console.warn('Could not attach Firestore devices listener:', err.message);
      return () => {};
    }
  },

  // Save or update a single device
  async saveDevice(deviceId, deviceData) {
    if (!db) return false;
    try {
      const docRef = doc(db, COLLECTIONS.DEVICES, String(deviceId));
      await setDoc(docRef, {
        ...deviceData,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.error('Error saving device to Firestore:', err);
      return false;
    }
  },

  // Update specific fields on a device
  async updateDevice(deviceId, updates) {
    if (!db) return false;
    try {
      const docRef = doc(db, COLLECTIONS.DEVICES, String(deviceId));
      await updateDoc(docRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error('Error updating device in Firestore:', err);
      return false;
    }
  },

  // Toggle device online / offline status
  async toggleDeviceStatus(deviceId, currentStatus) {
    const isCurrentlyOnline = currentStatus.toLowerCase() === 'online';
    const newStatus = isCurrentlyOnline ? 'offline' : 'online';
    const updates = {
      status: newStatus,
      bandwidthIn: isCurrentlyOnline ? 0 : 18.5,
      bandwidthOut: isCurrentlyOnline ? 0 : 4.2,
      download: isCurrentlyOnline ? 0 : 18.5,
      upload: isCurrentlyOnline ? 0 : 4.2,
      lastActive: 'Just now'
    };
    return this.updateDevice(deviceId, updates);
  }
};
