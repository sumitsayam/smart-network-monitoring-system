import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../firebase/firestore';

const DEFAULT_STATS_DOC_ID = 'current';

export const networkStatsService = {
  // ==========================================
  // GET CURRENT NETWORK STATS
  // Reads: networkStats/current
  // ==========================================
  async getNetworkStats() {
    if (!db) {
      console.warn('Firebase database is not initialized.');
      return null;
    }

    try {
      const docRef = doc(db, COLLECTIONS.NETWORK_STATS, DEFAULT_STATS_DOC_ID);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        console.log('✅ Network stats loaded from Firestore:', data);
        return data;
      }

      console.warn('⚠️ networkStats/current does not exist in Firestore.');
      return null;
    } catch (error) {
      console.error('❌ Error fetching networkStats from Firestore:', error);
      return null;
    }
  },

  // ==========================================
  // REAL-TIME NETWORK STATS LISTENER
  // Watches: networkStats/current
  // ==========================================
  subscribeToNetworkStats(callback) {
    if (!db) {
      console.warn('Firebase database is not initialized.');
      return () => {};
    }

    try {
      const docRef = doc(db, COLLECTIONS.NETWORK_STATS, DEFAULT_STATS_DOC_ID);
      console.log('👀 Listening to Firestore:', `${COLLECTIONS.NETWORK_STATS}/${DEFAULT_STATS_DOC_ID}`);

      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('🔴 Firestore real-time networkStats update:', data);
            callback(data);
          } else {
            console.warn('⚠️ networkStats/current does not exist.');
            callback(null);
          }
        },
        (error) => {
          console.error('❌ Firestore networkStats listener error:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Could not attach Firestore listener:', error);
      return () => {};
    }
  },

  // ==========================================
  // SAVE / UPDATE NETWORK STATS
  // Writes to: networkStats/current with merge: true
  // ==========================================
  async updateNetworkStats(stats) {
    if (!db) {
      const err = new Error('Firebase database is not initialized.');
      console.error(err);
      throw err;
    }

    if (!stats || typeof stats !== 'object') {
      const err = new Error('Invalid network stats data payload.');
      console.error(err);
      throw err;
    }

    try {
      const docRef = doc(db, COLLECTIONS.NETWORK_STATS, DEFAULT_STATS_DOC_ID);

      // Clean out undefined values to satisfy Firestore constraints
      const cleanStats = {};
      Object.entries(stats).forEach(([key, val]) => {
        if (val !== undefined) {
          cleanStats[key] = val;
        }
      });

      // Save data to Firestore with merge
      await setDoc(
        docRef,
        {
          ...cleanStats,
          lastUpdated: serverTimestamp()
        },
        { merge: true }
      );

      console.log('✅ Network stats successfully saved to Firestore:', cleanStats);
      console.log('📍 Firestore location:', `${COLLECTIONS.NETWORK_STATS}/${DEFAULT_STATS_DOC_ID}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating networkStats in Firestore:', error);
      throw error;
    }
  },

  // ==========================================
  // INITIALIZE NETWORK STATS IF EMPTY
  // ==========================================
  async initializeNetworkStatsIfEmpty(defaultData = {}) {
    if (!db) return false;
    try {
      const docRef = doc(db, COLLECTIONS.NETWORK_STATS, DEFAULT_STATS_DOC_ID);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        const initialPayload = {
          totalDevices: 10,
          onlineDevices: 8,
          offlineDevices: 2,
          averageLatency: 14.2,
          packetLoss: 0.0,
          totalBandwidth: 150,
          totalDownloadMbps: 85.2,
          totalUploadMbps: 24.1,
          bandwidthPercent: 68,
          activeAlertsCount: 2,
          totalTrafficGb: 8.89,
          gatewayIP: '192.168.1.1',
          subnetMask: '255.255.255.0',
          interfaceName: 'eth0',
          interfaceSpeed: '1 Gbps',
          lastUpdated: serverTimestamp(),
          ...defaultData
        };

        await setDoc(docRef, initialPayload, { merge: true });
        console.log('🌱 Initialized networkStats/current with baseline values.');
      }
      return true;
    } catch (err) {
      console.warn('Initialize network stats notice:', err);
      return false;
    }
  },

  // ==========================================
  // TEST FIREBASE CONNECTION
  // ==========================================
  async testFirebaseConnection() {
    if (!db) {
      console.error('❌ Firebase database is not initialized.');
      return false;
    }

    try {
      const docRef = doc(db, COLLECTIONS.NETWORK_STATS, DEFAULT_STATS_DOC_ID);
      const testData = {
        onlineDevices: 999,
        offlineDevices: 0,
        totalDevices: 999,
        averageLatency: 1,
        packetLoss: 0,
        bandwidthPercent: 100,
        totalDownloadMbps: 999,
        totalUploadMbps: 999,
        totalTrafficGb: 999,
        testMode: true,
        lastUpdated: serverTimestamp()
      };

      await setDoc(docRef, testData, { merge: true });
      console.log('✅ FIREBASE CONNECTION TEST PASSED');
      return true;
    } catch (error) {
      console.error('❌ FIREBASE CONNECTION TEST FAILED:', error);
      return false;
    }
  }
};