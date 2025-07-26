

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, initializeFirestore, CACHE_SIZE_UNLIMITED, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import type { FirebaseStorage } from 'firebase/storage';
import type { Functions } from 'firebase/functions';

const firebaseConfig =
  typeof process !== "undefined" && process.env.FIREBASE_WEBAPP_CONFIG
    ? JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG)
    : {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      };

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let functions: Functions | null = null;
let isFirebaseConfigured = false;

const hasEssentialConfig = !!(
    firebaseConfig.apiKey && 
    firebaseConfig.authDomain && 
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket
);

if (hasEssentialConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // Connect to the hawknest-database to match the Cloud Function
    db = getFirestore(app, "hawknest-database");
    storage = getStorage(app);
    functions = getFunctions(app);
    isFirebaseConfigured = true;
  } catch (e) {
    console.error("Firebase initialization error:", e);
    app = null;
    auth = null;
    db = null;
    storage = null;
    functions = null;
    isFirebaseConfigured = false;
  }
}

if (!isFirebaseConfigured) {
    console.warn("Firebase is not configured or failed to initialize. Please check your .env file and Firebase project setup. User-related features will be disabled.");
}

export { app, auth, db, storage, functions, isFirebaseConfigured };
