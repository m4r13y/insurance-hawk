const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
// Replace "/home/user/studio/medicareally-firebase-adminsdk-fbsvc-76abf59110.json" with the actual path to your service account key file.
const serviceAccountPath = "/home/user/studio/medicareally-firebase-adminsdk-fbsvc-76abf59110.json";

try {
  var serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const db = getFirestore(admin.app(), 'hawknest-database'); // Connect to your named database

const countDocumentsInSubcollections = async () => {
  console.log('Counting documents in subcollections...');

  try {
    // Count documents in the 'rows' subcollection
    const rowsSubcollectionRef = db.collection('bflic-cancer-quotes').doc('states').collection('GA_11');
    const rowsSnapshot = await rowsSubcollectionRef.get();
    const rowsCount = rowsSnapshot.size;
    console.log(`Documents in /bflic-cancer-quotes/states/GA_11: ${rowsCount}`);

  } catch (error) {
    console.error('Error counting documents:', error);
  }
};

countDocumentsInSubcollections().catch(console.error);