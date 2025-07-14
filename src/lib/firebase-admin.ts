
import * as admin from 'firebase-admin';
import serviceAccount from '../../medicareally-firebase-adminsdk-fbsvc-76abf59110.json';

function getAdminApp(): admin.app.App {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    try {
        // The type assertion is necessary because the JSON file is not a standard module.
        const typedServiceAccount = serviceAccount as admin.ServiceAccount;
        
        return admin.initializeApp({
            credential: admin.credential.cert(typedServiceAccount)
        });
    } catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
        throw new Error("Could not initialize Firebase Admin SDK. Please check service account credentials.");
    }
}

export { getAdminApp };
