

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore, initializeFirestore, CACHE_SIZE_UNLIMITED, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";
import type { FirebaseStorage } from 'firebase/storage';
import type { Functions } from 'firebase/functions';

const firebaseConfig = {
        apiKey: "AIzaSyAlxFZmc9fxLgwMuguAviHo36m0bwigvbQ",
        authDomain: "medicareally.firebaseapp.com",
        projectId: "medicareally",
        storageBucket: "medicareally.appspot.com",
        messagingSenderId: "168459812655",
        appId: "1:168459812655:web:401f6b21c424efb0672bda",
        measurementId: "G-GZ708G7D8W"
      };

let app: FirebaseApp | null = null;
// let auth: Auth | null = null;
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
    // auth = getAuth(app);
    // Connect to the hawknest-database to match the Cloud Function
    db = getFirestore(app, "hawknest-database");
    storage = getStorage(app);
    functions = getFunctions(app);
    isFirebaseConfigured = true;
  } catch (e) {
    console.error("Firebase initialization error:", e);
    app = null;
    // auth = null;
    db = null;
    storage = null;
    functions = null;
    isFirebaseConfigured = false;
  }
}

if (!isFirebaseConfigured) {
    console.warn("Firebase is not configured or failed to initialize. Please check your .env file and Firebase project setup. User-related features will be disabled.");
}

export { app, db, storage, functions, isFirebaseConfigured };
