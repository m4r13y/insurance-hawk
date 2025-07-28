

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
// import { getFirestore, type Firestore, initializeFirestore, CACHE_SIZE_UNLIMITED, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getFunctions } from "firebase/functions"; // Functions removed - not used in this app
import { getAnalytics } from "firebase/analytics";
import type { FirebaseStorage } from 'firebase/storage';
// import type { Functions } from 'firebase/functions'; // Functions removed - not used in this app

const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAlxFZmc9fxLgwMuguAviHo36m0bwigvbQ",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "medicareally.firebaseapp.com",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "medicareally",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "medicareally.firebasestorage.app",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "168459812655",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:168459812655:web:f9eeaeaecbd92275672bda",
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-HQKP8C1XX2"
      };

let app: FirebaseApp | null = null;
// let auth: Auth | null = null;
// let db: Firestore | null = null; // Firestore removed for this app
let storage: FirebaseStorage | null = null;
// let functions: Functions | null = null; // Functions removed - not used in this app
let analytics: any = null; // Analytics for this app - using any due to Firebase types
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
    // auth = getAuth(app);
    // Firestore removed for this app
    storage = getStorage(app);
    // functions = getFunctions(app); // Functions removed - not used in this app
    analytics = getAnalytics(app);
    isFirebaseConfigured = true;
  } catch (e) {
    console.error("Firebase initialization error:", e);
    app = null;
    // auth = null;
    // db = null; // Firestore removed for this app
    storage = null;
    // functions = null; // Functions removed - not used in this app
    isFirebaseConfigured = false;
  }
}

if (!isFirebaseConfigured) {
    console.warn("Firebase is not configured or failed to initialize. Please check your Firebase project setup. Database and storage features will be disabled.");
}

export { app, storage, analytics, isFirebaseConfigured };
