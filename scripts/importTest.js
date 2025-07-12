const admin = require('firebase-admin');
const path = require('path');
const { getFirestore } = require('firebase-admin/firestore');

const readline = require('readline'); // Import readline
// Initialize Firebase Admin SDK
const serviceAccountPath = "/home/user/studio/medicareally-firebase-adminsdk-fbsvc-76abf59110.json";

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1); // Exit the script if initialization fails
}

const db = getFirestore(admin.app(), 'hawknest-database'); // Get Firestore instance for named database
const collectionRef = db.collection('bflic-cancer-quotes'); // Reference to your Firestore collection

async function runTestWrite() {
  try {
    const testDocId = 'simpleConnectionTestDoc';
    const testData = {
      message: 'Hello from importTest.js!',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await collectionRef.doc(testDocId).set(testData);

    console.log(`Successfully wrote test document with ID: ${testDocId}`);

  } catch (error) {
    console.error('Error writing test document to Firestore:', error);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    console.error('Error metadata:', error.metadata);
  }
}

runTestWrite(); // Run the test write function