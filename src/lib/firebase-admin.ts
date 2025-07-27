
// Firebase Admin disabled for public-facing app
// Admin SDK is not needed for public apps without user authentication

// import * as admin from 'firebase-admin';
// import serviceAccount from '../../medicareally-firebase-adminsdk-fbsvc-76abf59110.json';

// function getAdminApp(): admin.app.App {
//     if (admin.apps.length > 0) {
//         return admin.app();
//     }

//     try {
//         const typedServiceAccount = serviceAccount as admin.ServiceAccount;
        
//         return admin.initializeApp({
//             credential: admin.credential.cert(typedServiceAccount)
//         });
//     } catch (error) {
//         console.error('Error initializing Firebase Admin SDK:', error);
//         throw new Error("Could not initialize Firebase Admin SDK. Please check service account credentials.");
//     }
// }

// For public apps, use the regular Firebase client SDK instead
export function getAdminApp() {
    console.warn("Firebase Admin SDK disabled for public app. Use regular Firebase client SDK instead.");
    return null;
}
