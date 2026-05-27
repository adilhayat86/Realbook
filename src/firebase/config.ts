import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { hasFirebaseEnv } from './status';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getConfiguredFirebaseApp(): FirebaseApp | null {
  if (!hasFirebaseEnv()) return null;
  if (app) return app;

  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function getConfiguredFirebaseAuth(): Auth | null {
  if (auth) return auth;

  const firebaseApp = getConfiguredFirebaseApp();
  if (!firebaseApp) return null;

  auth = getAuth(firebaseApp);
  return auth;
}

export function getConfiguredFirestore(): Firestore | null {
  if (db) return db;

  const firebaseApp = getConfiguredFirebaseApp();
  if (!firebaseApp) return null;

  db = getFirestore(firebaseApp);
  return db;
}

export { app, auth, db };
