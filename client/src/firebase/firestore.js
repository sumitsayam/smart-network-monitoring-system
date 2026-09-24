import { getFirestore, collection } from 'firebase/firestore';
import { app, isFirebaseConfigured } from './config';

// Initialize Firestore safely
export const db = (isFirebaseConfigured && app) ? getFirestore(app) : null;

// Collection References
export const COLLECTIONS = {
  DEVICES: 'devices',
  TRAFFIC: 'traffic',
  ALERTS: 'alerts',
  NETWORK_STATS: 'networkStats'
};

export const getDevicesCol = () => db ? collection(db, COLLECTIONS.DEVICES) : null;
export const getTrafficCol = () => db ? collection(db, COLLECTIONS.TRAFFIC) : null;
export const getAlertsCol = () => db ? collection(db, COLLECTIONS.ALERTS) : null;
export const getNetworkStatsCol = () => db ? collection(db, COLLECTIONS.NETWORK_STATS) : null;
