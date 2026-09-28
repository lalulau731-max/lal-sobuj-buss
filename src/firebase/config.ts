import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

export const PRODUCTION_HOSTING_URL = 'https://lal-sobuj-bus.web.app';
export const ALT_HOSTING_URL = 'https://lal-sobuj-bus.firebaseapp.com';

// The user's official Firebase configuration with verified correct RTDB endpoint
export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBTH6BMyBY-TMBXPFtN5aBiRNTGN7OVbQA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lal-sobuj-bus.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lal-sobuj-bus",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lal-sobuj-bus.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "264678413384",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:264678413384:web:bffa20bd827ff91570747d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QCQPT62LHV",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://lal-sobuj-default-rtdb.firebaseio.com",
};

// Alternative candidate RTDB URLs depending on region
export const RTDB_URL_CANDIDATES = [
  {
    name: 'US Central (Verified Live Instance)',
    url: 'https://lal-sobuj-default-rtdb.firebaseio.com',
  },
  {
    name: 'Default Subdomain',
    url: 'https://lal-sobuj-bus-default-rtdb.firebaseio.com',
  },
  {
    name: 'Asia Southeast 1 (Singapore)',
    url: 'https://lal-sobuj-default-rtdb.asia-southeast1.firebasedatabase.app',
  },
];

// Initialize Firebase App
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

// Export Firestore Database
export const firestore: Firestore = getFirestore(app);

// Initialize Analytics conditionally
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        getAnalytics(app);
      } catch (err) {
        // Analytics non-critical
      }
    }
  });
}

// Get Realtime Database instance
export function getFirebaseDatabase(databaseUrl?: string): Database {
  const url = databaseUrl || FIREBASE_CONFIG.databaseURL;
  return getDatabase(app, url);
}
