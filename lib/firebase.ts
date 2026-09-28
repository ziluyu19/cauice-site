import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBoXOUTTSi0xO7BtUGGgxuxYERLV0iEqzE',
  authDomain: 'cauiice-site.firebaseapp.com',
  projectId: 'cauiice-site',
  storageBucket: 'cauiice-site.firebasestorage.app',
  messagingSenderId: '831214715055',
  appId: '1:831214715055:web:d6f7d4c7df63ddaeef945a',
  measurementId: 'G-K4XGBHMB89',
};

// Initialize Firebase (Safe for Next.js App Router SSR and HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics safely on client-side only
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, analytics, firebaseConfig };
export default app;
