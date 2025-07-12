
import * as admin from 'firebase-admin';

const serviceAccountPath = "/home/user/studio/medicareally-firebase-adminsdk-fbsvc-76abf59110.json";

function getAdminApp(): admin.app.App {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    try {
        const serviceAccount = require(serviceAccountPath);
        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
        throw new Error("Could not initialize Firebase Admin SDK. Please check service account credentials.");
    }
}

export { getAdminApp };
