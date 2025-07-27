

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
// import { getFirestore, type Firestore, initializeFirestore, CACHE_SIZE_UNLIMITED, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import type { FirebaseStorage } from 'firebase/storage';
import type { Functions } from 'firebase/functions';

const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAlxFZmc9fxLgwMuguAviHo36m0bwigvbQ",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "medicareally.firebaseapp.com",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "medicareally",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "medicareally.appspot.com",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "168459812655",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:168459812655:web:401f6b21c424efb0672bda",
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-GZ708G7D8W"
      };

let app: FirebaseApp | null = null;
// let auth: Auth | null = null;
// let db: Firestore | null = null; // Firestore removed for this app
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
    // auth = getAuth(app);
    // Firestore removed for this app
    storage = getStorage(app);
    functions = getFunctions(app);
    isFirebaseConfigured = true;
  } catch (e) {
    console.error("Firebase initialization error:", e);
    app = null;
    // auth = null;
    // db = null; // Firestore removed for this app
    storage = null;
    functions = null;
    isFirebaseConfigured = false;
  }
}

if (!isFirebaseConfigured) {
    console.warn("Firebase is not configured or failed to initialize. Please check your Firebase project setup. Database and storage features will be disabled.");
}

export { app, storage, functions, isFirebaseConfigured };
