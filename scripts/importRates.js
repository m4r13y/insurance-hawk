const admin = require('firebase-admin');
const fs = require('fs');
const { getFirestore } = require('firebase-admin/firestore'); // Import getFirestore
const readline = require('readline'); // Import readline
const path = require('path');

// Initialize Firebase Admin SDK
// Replace '/home/user/studio/medicareally-firebase-adminsdk-fbsvc-76abf59110.json' with the full absolute path to your service account key file.
// Make sure this file is secure and not publicly accessible.
try {
  var serviceAccount = require('/home/user/studio/medicareally-firebase-adminsdk-fbsvc-76abf59110.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)});
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1); // Exit the script if initialization fails
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const db = getFirestore(admin.app(), 'hawknest-database'); // Use getFirestore with app and database name


async function runImport() {

  // --- Prompt for CSV File Path ---
  rl.question('Enter the absolute path to the CSV file to import: ', async (csvFilePath) => {
    if (!csvFilePath) {
      console.error('No CSV file path provided. Exiting.');
      rl.close();
      return;
    }

    // Optional: Check if the file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error(`Error: CSV file not found at ${csvFilePath}. Exiting.`);
      rl.close();
      return;
    }

    // --- Prompt for Confirmation for CSV File ---
    rl.question(`You entered the CSV file path: ${csvFilePath}. Are you sure you want to import data from this file? (yes/no): `, async (csvConfirmation) => {
      if (csvConfirmation.toLowerCase() !== 'yes') {
        console.log('CSV file import cancelled by user.');
        rl.close();
        return;
      }

      console.log(`Proceeding with import from: ${csvFilePath}`);

      // --- Prompt for Target Firestore Path ---
      rl.question('Enter the target Firestore path (e.g., collection/document/subcollection): ', async (targetPath) => {
        if (!targetPath) {
          console.error('No target path provided. Exiting.');
          rl.close();
          return;
        }

        // --- Prompt for Confirmation for Firestore Path ---
        rl.question(`You entered the Firestore path: ${targetPath}. Are you sure you want to import data to this path? (yes/no): `, async (firestoreConfirmation) => {
          if (firestoreConfirmation.toLowerCase() !== 'yes') {
            console.log('Firestore import cancelled by user.');
            rl.close();
            return;
          }

          console.log(`Proceeding with import to Firestore path: ${targetPath}`);

          // --- Use the Provided Path for Firestore Operations ---
          const pathSegments = targetPath.split('/');
          let currentRef = db;

          for (let i = 0; i < pathSegments.length; i++) {
            if (i % 2 === 0) { // Collection segment
              currentRef = currentRef.collection(pathSegments[i]);
            } else { // Document segment
              currentRef = currentRef.doc(pathSegments[i]);
            }
          }

          // At this point, currentRef points to the target collection or a document within a collection/subcollection.
          // We need to determine if the last segment was a collection or a document.
          // If the number of path segments is odd, the last segment was a collection.
          // If the number of path segments is even, the last segment was a document, and we should be writing to a subcollection under it.
          // Assuming the user provides a path that ends in a collection or subcollection:
          const targetCollectionRef = currentRef;

          // --- CSV parsing and mapping logic ---
          console.log('Starting CSV data processing...');
          const allRows = [];
          const csvParser = require('csv-parser'); // Require here to ensure it's within the async flow

          await new Promise((resolve, reject) => {
            fs.createReadStream(csvFilePath)
              .pipe(csvParser())
              .on('data', (row) => {
                // Ensure data types are correct for ALL relevant fields
                const rowData = {
                  lookup: row.lookup,
                  comp: row.comp,
                  plan: row.plan,
                  sex: row.sex,
                  state: row.state,
                  units: row.units,
                  age: parseInt(row.age, 10),
                  inprem: row.inprem,
                  reprem: row.reprem,
                  area: row.area,
                  effdate: row.effdate,
                  areach: row.areach,
                  agetype: row.agetype,
                  comm: row.comm,
                  tobacco: row.tobacco,
                  // e.g., isActive: row.isActive === 'TRUE', // for boolean
                  // e.g., startDate: admin.firestore.Timestamp.fromDate(new Date(row.startDate)), // for date/timestamp
                };
                allRows.push(rowData); // Store the mapped row data
              })
              .on('end', () => {
                console.log(`Finished parsing CSV. Found ${allRows.length} rows.`);
                resolve(); // Resolve the promise when parsing is complete
              })
              .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                reject(error); // Reject the promise on error
              });
          });

          // --- Batch Writing Logic (use targetCollectionRef) ---
          const batchLimit = 499; // Firestore batch limit is 500, so 499 is safe
          let currentBatch = db.batch();
          let batchCount = 0;
          let totalDocumentsImported = 0;

          console.log(`Starting Firestore writes in batches of up to ${batchLimit}...`);

          for (let i = 0; i < allRows.length; i++) {
            const rowData = allRows[i];
            // Use the 'lookup' value from the CSV as the document ID
            const docRef = targetCollectionRef.doc(rowData.lookup);

            // Remove the lookup field from the document data itself if you don't want it repeated
            const documentData = { ...rowData };
            delete documentData.lookup;

            currentBatch.set(docRef, documentData); // Use documentData here, not rowData
            batchCount++;

            if (batchCount === batchLimit || i === allRows.length - 1) { // Commit if batch limit reached or it's the last document
              try {
                await currentBatch.commit(); // AWAIT THE COMMIT!
                totalDocumentsImported += batchCount;
                console.log(`Batch committed. Documents imported so far: ${totalDocumentsImported}`);
                currentBatch = db.batch(); // Start a new batch
                batchCount = 0; // Reset batch counter
              } catch (error) {
                console.error(`Error committing batch at index ${i}:`, error);
                console.error('Batch commit failed. Stopping import.');
                // Log failed batch documents (optional, can be resource intensive for large batches)
                // const failedBatchDocs = allRows.slice(i - batchCount + 1, i + 1);
                // console.error('Lookup values in the failed batch:');
                // failedBatchDocs.forEach(doc => console.error(doc.lookup));

                rl.close(); // Close readline on error
                return; // Exit the async function
              }
            }
          }

          // Check if there were any documents processed at all
          if (totalDocumentsImported > 0) {
            console.log(`Data import finished. Total documents imported: ${totalDocumentsImported}.`);
          } else if (allRows.length > 0) {
             console.log('CSV data parsed, but no documents were imported (e.g., issue in batch processing or data mapping).');
          } else {
            console.log('CSV file parsed, but no rows found to import.');
          }

          rl.close(); // Close readline on success

        }); // End of Firestore confirmation question
      }); // End of Firestore path question
    }); // End of CSV file confirmation question
  }); // End of CSV file path question
};

runImport().catch(console.error);