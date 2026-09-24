import {
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase/firestore';

// Helper to normalize Firestore traffic doc
export function normalizeTrafficDoc(docSnapshot) {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    time: data.time || (data.timestamp?.toDate ? data.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
    download: typeof data.bandwidthIn === 'number' ? data.bandwidthIn : (data.download || 0),
    upload: typeof data.bandwidthOut === 'number' ? data.bandwidthOut : (data.upload || 0),
    bandwidth: data.bandwidthPercent || data.bandwidth || 50,
    packetsIn: data.packetsIn || 0,
    packetsOut: data.packetsOut || 0,
    deviceId: data.deviceId || 'gateway'
  };
}

export const trafficService = {
  // Fetch traffic history points
  async getTrafficHistory(maxPoints = 25) {
    if (!db) return [];
    try {
      const q = query(
        collection(db, COLLECTIONS.TRAFFIC),
        orderBy('createdAt', 'desc'),
        limit(maxPoints)
      );
      const querySnapshot = await getDocs(q);
      const points = [];
      querySnapshot.forEach((docSnap) => {
        points.push(normalizeTrafficDoc(docSnap));
      });
      return points.reverse(); // chronological order
    } catch (err) {
      console.warn('Error fetching traffic history from Firestore:', err.message);
      return [];
    }
  },

  // Real-time listener for traffic
  subscribeToTraffic(callback, maxPoints = 25) {
    if (!db) return () => {};
    try {
      const q = query(
        collection(db, COLLECTIONS.TRAFFIC),
        orderBy('createdAt', 'desc'),
        limit(maxPoints)
      );
      return onSnapshot(q, (querySnapshot) => {
        const points = [];
        querySnapshot.forEach((docSnap) => {
          points.push(normalizeTrafficDoc(docSnap));
        });
        callback(points.reverse());
      }, (error) => {
        console.warn('Firestore traffic listener error:', error.message);
      });
    } catch (err) {
      console.warn('Could not attach Firestore traffic listener:', err.message);
      return () => {};
    }
  },

  // Log a new traffic data point to Firestore
  async logTrafficRecord(trafficData) {
    if (!db) return false;
    try {
      await addDoc(collection(db, COLLECTIONS.TRAFFIC), {
        deviceId: trafficData.deviceId || 'gateway',
        bandwidthIn: trafficData.download || trafficData.bandwidthIn || 0,
        bandwidthOut: trafficData.upload || trafficData.bandwidthOut || 0,
        bandwidthPercent: trafficData.bandwidth || trafficData.bandwidthPercent || 50,
        packetsIn: trafficData.packetsIn || Math.round((trafficData.download || 10) * 150),
        packetsOut: trafficData.packetsOut || Math.round((trafficData.upload || 5) * 120),
        time: trafficData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        createdAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error('Error logging traffic record in Firestore:', err);
      return false;
    }
  }
};
