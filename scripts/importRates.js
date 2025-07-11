const admin = require('firebase-admin');
const fs = require('fs');
const csvParser = require('csv-parser');
const path = require('path');

// Update: Use path.join for a more robust path
// Assuming your service account JSON is in the same directory as this script,
// or adjust the path accordingly.
var serviceAccount = require(path.join(__dirname, "medicareally-firebase-adminsdk-fbsvc-76abf59110.json"));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const collectionRef = db.collection('rates');

const importData = async () => {
  console.log('Starting CSV import...');

  // ADD: Array to hold all parsed rows
  const allRows = [];

  // Wrap the CSV parsing in a Promise to await its completion
  await new Promise((resolve, reject) => {
    fs.createReadStream('your_rates.csv') // Make sure this CSV file is in the correct location
      .pipe(csvParser())
      .on('data', (row) => {
        // Ensure data types are correct for ALL relevant fields
        const rateData = {
          plan: row.plan,
          location: row.location,
          age: parseInt(row.age, 10), // Always use a radix with parseInt
          rate: parseFloat(row.rate),
          // Add other fields from your CSV here, and ensure their types:
          // e.g., isActive: row.isActive === 'TRUE', // for boolean
          // e.g., startDate: admin.firestore.Timestamp.fromDate(new Date(row.startDate)), // for date/timestamp
        };
        allRows.push(rateData); // Add processed row to the array
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

  // Now that all rows are parsed, process them in batches
  const batchLimit = 499; // Firestore batch limit is 500, so 499 is safe
  let currentBatch = db.batch();
  let batchCount = 0;
  let totalDocumentsImported = 0;

  console.log(`Starting Firestore writes in batches of up to ${batchLimit}...`);

  for (let i = 0; i < allRows.length; i++) {
    const rowData = allRows[i];
    const docRef = collectionRef.doc(); // Automatically generate document ID

    currentBatch.set(docRef, rowData);
    batchCount++;

    if (batchCount === batchLimit) {
      try {
        await currentBatch.commit(); // AWAIT THE COMMIT!
        totalDocumentsImported += batchCount;
        console.log(`Batch ${Math.ceil(totalDocumentsImported / batchLimit)} committed. Documents imported so far: ${totalDocumentsImported}`);
        currentBatch = db.batch(); // Start a new batch
        batchCount = 0; // Reset batch counter
      } catch (error) {
        console.error(`Error committing batch at index ${i}:`, error);
        // Decide how to handle this critical error:
        // You might want to throw the error to stop the whole process,
        // or log it and continue if partial import is acceptable.
        throw new Error('Batch commit failed. Stopping import.');
      }
    }
  }

  // Commit any remaining documents in the last batch
  if (batchCount > 0) {
    try {
      await currentBatch.commit(); // AWAIT THE FINAL COMMIT!
      totalDocumentsImported += batchCount;
      console.log(`Final batch committed. Total documents imported: ${totalDocumentsImported}`);
    } catch (error) {
      console.error('Error committing final batch:', error);
      throw new Error('Final batch commit failed. Partial import may have occurred.');
    }
  } else if (totalDocumentsImported === 0 && allRows.length === 0) {
      console.log('CSV import complete: No rows found to import.');
  }

  console.log('CSV import process finished.');
};

// Run the import function and catch any top-level errors
importData().catch(console.error); // Catch any unhandled promise rejections
