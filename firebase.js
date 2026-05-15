// Backward-compatible Firebase module for legacy imports.
// The React MVP uses src/firebase.ts. Keep this file script-tag free.
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: window.__FIREBASE_CONFIG__?.apiKey,
  authDomain: window.__FIREBASE_CONFIG__?.authDomain,
  projectId: window.__FIREBASE_CONFIG__?.projectId,
  storageBucket: window.__FIREBASE_CONFIG__?.storageBucket,
  messagingSenderId: window.__FIREBASE_CONFIG__?.messagingSenderId,
  appId: window.__FIREBASE_CONFIG__?.appId,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
export const app = isFirebaseConfigured ? (getApps()[0] || initializeApp(firebaseConfig)) : undefined;
export const auth = app ? getAuth(app) : undefined;
export const db = app ? getFirestore(app) : undefined;
