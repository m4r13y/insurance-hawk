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
  process.exit(1);
}

const db = getFirestore(admin.app(), 'hawknest-database'); // Connect to your named database

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Wrap main move logic in a function
const moveDocuments = async () => {
  console.log('Starting document move...');

  const batchLimit = 499;
  let writeBatch = db.batch();
  let deleteBatch = db.batch();
  let batchCount = 0;
  let totalDocumentsMoved = 0;
  let totalDocumentsSkipped = 0;

  // --- Prompt for Source Path ---
  rl.question('Enter the source Firestore collection or subcollection path (e.g., collection or collection/document/subcollection): ', async (sourcePath) => {
    if (!sourcePath) {
      console.error('No source path provided. Exiting.');
      rl.close();
      return;
    }

    // --- Prompt for Target Path ---
    rl.question('Enter the target Firestore subcollection path (e.g., collection/document/subcollection): ', async (targetPath) => {
      if (!targetPath) {
        console.error('No target path provided. Exiting.');
        rl.close();
        return;
      }

      // --- Prompt for Confirmation ---
      rl.question(`You entered source path: ${sourcePath} and target path: ${targetPath}. Are you sure you want to proceed with moving documents? (yes/no): `, async (confirmation) => {
        if (confirmation.toLowerCase() !== 'yes') {
          console.log('Operation cancelled by user.');
          rl.close();
          return;
        }

        console.log(`Proceeding with moving documents from ${sourcePath} to ${targetPath}`);

        try {
          // Construct source collection/subcollection reference
          const sourcePathSegments = sourcePath.split('/');
          let sourceRef = db;
          for (let i = 0; i < sourcePathSegments.length; i++) {
            if (i % 2 === 0) { // Even index: collection
              sourceRef = sourceRef.collection(sourcePathSegments[i]);
            } else { // Odd index: document or subcollection segment
              sourceRef = sourceRef.doc(sourcePathSegments[i]);
            }
          }

          // The last segment determines if it's a collection or subcollection
          const sourceCollectionRef = (sourcePathSegments.length % 2 !== 0)
              ? sourceRef.collection(sourcePathSegments[sourcePathSegments.length - 1]) // It's a document path, treat it as a subcollection
              : sourceRef; // It's a collection path

          const targetPathSegments = targetPath.split('/');

          let targetRef = db;
          for (let i = 0; i < targetPathSegments.length; i++) {
            if (i % 2 === 0) { // Even index: collection
              targetRef = targetRef.collection(targetPathSegments[i]);
            } else { // Odd index: document or subcollection segment
              targetRef = targetRef.doc(targetPathSegments[i]);
            }
          }

          // The target must end in a subcollection path
          const targetSubcollectionRef = (targetPathSegments.length % 2 !== 0)
              ? targetRef.collection(targetPathSegments[targetPathSegments.length - 1]) : null;

          // Get Documents from Source Collection
          const snapshot = await sourceCollectionRef.get();
          const documents = snapshot.docs;

          if (documents.length === 0) {
            console.log('No documents found in the source collection.');
            // Keep rl open for next prompts
            return;
          }

          console.log(`Found ${documents.length} documents in the source collection.`);

          for (let i = 0; i < documents.length; i++) {
            const doc = documents[i];
            const docId = doc.id;
            const docData = doc.data();

            // Condition to only move documents whose ID starts with a number
            if (/^\d/.test(docId)) {
              // Prepare Batched Writes and Deletes
              const targetDocRef = targetSubcollectionRef.doc(docId);
              writeBatch.set(targetDocRef, docData);

              const sourceDocRef = sourceCollectionRef.doc(docId);
              deleteBatch.delete(sourceDocRef);

              batchCount++;
              totalDocumentsMoved++;

              // Execute Batches when limit is reached or all documents processed
              if (batchCount === batchLimit || i === documents.length - 1) {
                try {
                  await writeBatch.commit();
                  await deleteBatch.commit();

                  console.log(`Successfully moved batch of ${batchCount} documents.`);

                  // Start new batches
                  writeBatch = db.batch();
                  deleteBatch = db.batch();
                  batchCount = 0;
                } catch (error) {
                  console.error(`Error moving batch at index ${i}:`, error);
                  console.error('Batch move failed. Stopping process.');
                  // Decide how to handle this error: log and continue or stop
                  throw error; // Throw error to be caught by outer try-catch
                }
              }
            } else {
              totalDocumentsSkipped++;
              // console.log(`Skipping document with ID ${docId} as it does not start with a number.`);
            }
          }

          console.log(`Document move finished. Total documents moved: ${totalDocumentsMoved}. Total documents skipped: ${totalDocumentsSkipped}.`);
          // Keep rl open for next prompts

        } catch (error) {
          console.error('Error during document move:', error);
          rl.close(); // Close readline on error
        }
      }); // End of confirmation question
    }); // End of target path question
  }); // End of source path question
};

moveDocuments().catch(console.error);

moveDocuments().catch(console.error);