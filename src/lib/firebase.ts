

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore, initializeFirestore, CACHE_SIZE_UNLIMITED, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions"; // Re-enabled for quote functionality
import { getAuth, type Auth } from "firebase/auth"; // Add Auth for Firebase Functions
import { getAnalytics } from "firebase/analytics";
import { getDataConnect, type DataConnect } from "firebase/data-connect"; // Add DataConnect
import type { FirebaseStorage } from 'firebase/storage';
import type { Functions } from 'firebase/functions'; // Re-enabled for quote functionality

const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAlxFZmc9fxLgwMuguAviHo36m0bwigvbQ",
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "medicareally.firebaseapp.com",
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "medicareally",
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "medicareally.firebasestorage.app",
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "168459812655",
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:168459812655:web:1d13f10e514b33f7672bda",
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-4EY6NJQ5L5"
      };

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null; // Firestore enabled for temporary quote storage
let storage: FirebaseStorage | null = null;
let functions: Functions | null = null; // Re-enabled for quote functionality
let dataConnect: DataConnect | null = null; // Add DataConnect
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
    db = getFirestore(app, 'temp'); // Connect to the 'temp' database for temporary quote storage
    storage = getStorage(app);
    functions = getFunctions(app, 'us-central1'); // Re-enabled for quote functionality with region
    auth = getAuth(app); // Add auth for Firebase Functions
    // Initialize DataConnect pointing to hawknest-admin service
    dataConnect = getDataConnect(app, {
      connector: 'default',
      service: 'hawknest-admin',
      location: 'us-central1'
    });
    // Only initialize analytics on the client side
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
    isFirebaseConfigured = true;
  } catch (e) {
    console.error("Firebase initialization error:", e);
    app = null;
    // auth = null;
    db = null; // Reset Firestore on error
    storage = null;
    functions = null;
    auth = null; // Reset auth on error
    isFirebaseConfigured = false;
  }
}

if (!isFirebaseConfigured) {
    console.warn("Firebase is not configured or failed to initialize. Please check your Firebase project setup. Database and storage features will be disabled.");
}

export { 
  app as default,
  auth,
  db, // Firestore enabled for temporary quote storage
  storage,
  functions, // Re-enabled for quote functionality
  dataConnect, // Add DataConnect export
  analytics,
  isFirebaseConfigured
};
