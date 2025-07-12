const admin = require('firebase-admin');
const path = require('path');
const { getFirestore } = require('firebase-admin/firestore');

const readline = require('readline'); // Import readline
// Initialize Firebase Admin SDK
// Replace '/home/user/studio/medicareally-firebase-adminsdk-fbsvc-76abf59110.json'
// with the actual absolute path to your service account key file if it's different.
const serviceAccountPath = '/home/user/studio/medicareally-firebase-adminsdk-fbsvc-76abf59110.json';

try {
  var serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1); // Exit the script if initialization fails
}


const db = getFirestore(admin.app(), 'hawknest-database'); // Connect to your named database

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Wrap main logic in a function
async function runDeletion() {
  // --- Prompt for Target Path ---
  rl.question('Enter the Firestore collection path to delete from (e.g., yourCollection): ', async (targetPath) => {
    if (!targetPath) {
      console.error('No target path provided. Exiting.');
      rl.close();
      return;
    }

    // --- Prompt for Confirmation ---
    rl.question(`You entered the path: ${targetPath}. This script will delete documents with IDs starting with "5" in this collection. Are you sure you want to proceed? (yes/no): `, async (confirmation) => {
      if (confirmation.toLowerCase() !== 'yes') {
        console.log('Operation cancelled by user.');
        rl.close();
        return;
      }

      console.log(`Proceeding with deletion in: ${targetPath}`);

      const collectionRef = db.collection(targetPath);

      const batchLimit = 499;
      let deleteBatch = db.batch();
      let batchCount = 0;
      let totalDocumentsDeleted = 0;

      try {
        // Query Documents with IDs starting with "5"
        const snapshot = await collectionRef
          .orderBy(admin.firestore.FieldPath.documentId())
          .startAt('5')
          .endAt('5\uf8ff') // \uf8ff is a special Unicode character that is after all possible characters
          .get();

        const documents = snapshot.docs;

        if (documents.length === 0) {
          console.log('No documents found with IDs starting with "5" in the specified collection.');
          rl.close();
          return;
        }

        console.log(`Found ${documents.length} documents with IDs starting with "5" to delete.`);

        for (let i = 0; i < documents.length; i++) {
          const doc = documents[i];
          const docId = doc.id;

          batchCount = 0;
          let deleteBatch = db.batch();

          // Prepare Batched Deletes
          const docRef = collectionRef.doc(docId);
          deleteBatch.delete(docRef);
          await deleteBatch.commit(); // Commit each deletion immediately
          totalDocumentsDeleted++;
          console.log(`Deleted document: ${docId}`);
        }

        console.log(`Deletion finished. Total documents deleted: ${totalDocumentsDeleted}.`);
        rl.close(); // Close readline on success

      } catch (error) {
        console.error('Error during deletion:', error);
        rl.close(); // Close readline on error
      }
    }); // End of confirmation question
  }); // End of path question
}

runDeletion().catch(console.error); // Call the main function