import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase/firestore';

// Helper to normalize Firestore alert doc
export function normalizeAlertDoc(docSnapshot) {
  const data = docSnapshot.data();
  const severity = (data.severity || 'LOW').toUpperCase();
  const isResolved = data.resolved === true || data.status?.toLowerCase() === 'resolved';

  return {
    id: docSnapshot.id,
    type: data.type || 'SECURITY ALERT',
    device: data.device || data.deviceName || (data.deviceId ? `Device ${data.deviceId}` : 'Network Gateway'),
    deviceId: data.deviceId || null,
    ip: data.ip || data.ipAddress || '192.168.1.1',
    message: data.message || 'Anomaly detected on monitored network channel.',
    severity: severity === 'HIGH' || severity === 'CRITICAL' ? 'HIGH' : severity === 'MEDIUM' || severity === 'WARNING' ? 'MEDIUM' : 'LOW',
    time: data.time || 'Just now',
    status: isResolved ? 'Resolved' : 'Active',
    resolved: isResolved,
    timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now())
  };
}

export const alertService = {
  // Fetch alerts from Firestore
  async getAlerts(params = {}) {
    if (!db) return [];
    try {
      const q = query(
        collection(db, COLLECTIONS.ALERTS),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const alerts = [];
      querySnapshot.forEach((docSnap) => {
        alerts.push(normalizeAlertDoc(docSnap));
      });
      return alerts;
    } catch (err) {
      console.warn('Error fetching alerts from Firestore:', err.message);
      return [];
    }
  },

  // Real-time listener for alerts
  subscribeToAlerts(callback) {
    if (!db) return () => {};
    try {
      const q = query(
        collection(db, COLLECTIONS.ALERTS),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      return onSnapshot(q, (querySnapshot) => {
        const alerts = [];
        querySnapshot.forEach((docSnap) => {
          alerts.push(normalizeAlertDoc(docSnap));
        });
        callback(alerts);
      }, (error) => {
        console.warn('Firestore alerts listener error:', error.message);
      });
    } catch (err) {
      console.warn('Could not attach Firestore alerts listener:', err.message);
      return () => {};
    }
  },

  // Create a new alert
  async createAlert(alertData) {
    if (!db) return false;
    try {
      const alertId = alertData.id || `ALT-${Date.now().toString().slice(-4)}`;
      const docRef = doc(db, COLLECTIONS.ALERTS, alertId);
      await setDoc(docRef, {
        type: alertData.type || 'SECURITY ALERT',
        device: alertData.device || 'Network Host',
        deviceId: alertData.deviceId || null,
        ip: alertData.ip || '192.168.1.15',
        message: alertData.message || 'Alert threshold triggered',
        severity: alertData.severity || 'HIGH',
        status: 'Active',
        resolved: false,
        time: 'Just now',
        createdAt: serverTimestamp()
      });
      return alertId;
    } catch (err) {
      console.error('Error creating alert in Firestore:', err);
      return false;
    }
  },

  // Mark alert as resolved
  async resolveAlert(alertId) {
    if (!db) return false;
    try {
      const docRef = doc(db, COLLECTIONS.ALERTS, String(alertId));
      await updateDoc(docRef, {
        status: 'Resolved',
        resolved: true,
        resolvedAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error('Error resolving alert in Firestore:', err);
      return false;
    }
  },

  // Delete / dismiss alert
  async dismissAlert(alertId) {
    if (!db) return false;
    try {
      const docRef = doc(db, COLLECTIONS.ALERTS, String(alertId));
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.error('Error deleting alert from Firestore:', err);
      return false;
    }
  },

  // Clear all resolved alerts
  async clearResolvedAlerts() {
    if (!db) return false;
    try {
      const alerts = await this.getAlerts();
      const resolved = alerts.filter(a => a.resolved);
      const deletePromises = resolved.map(a => deleteDoc(doc(db, COLLECTIONS.ALERTS, a.id)));
      await Promise.all(deletePromises);
      return true;
    } catch (err) {
      console.error('Error clearing resolved alerts from Firestore:', err);
      return false;
    }
  }
};
