/**
 * Firestore TTL (Time To Live) Setup
 * 
 * This file contains instructions and helper functions for setting up
 * automatic deletion of visitor quote data based on expiration timestamps.
 * 
 * RECOMMENDED APPROACH: Use Firestore TTL policy instead of Cloud Functions
 * for automatic data deletion. This is more efficient and cost-effective.
 */

import * as admin from "firebase-admin";

/**
 * Setup Instructions for Firestore TTL:
 * 
 * IMPORTANT: Firebase CLI doesn't support TTL commands yet.
 * Use Firebase Console instead:
 * 
 * 1. Go to Firebase Console > Firestore Database
 * 2. Click on "TTL" tab in the left sidebar
 * 3. Create a new TTL policy with these settings:
 *    - Collection Group: visitors
 *    - Field: expiresAt
 *    - Database: temp
 *    - Apply to subcollections: Yes (important for quote data)
 * 
 * Alternative: Use Google Cloud CLI if available:
 * gcloud firestore databases ttl create \
 *   --database=temp \
 *   --collection-group=visitors \
 *   --field=expiresAt \
 *   --project=YOUR_PROJECT_ID
 * 
 * This will automatically delete all documents where expiresAt timestamp has passed.
 */

/**
 * Verify TTL setup - Call this to test if TTL is working
 */
export const verifyTTLSetup = async () => {
  const db = admin.firestore();
  
  // Create a test document that expires in 1 minute
  const testDoc = {
    testData: "This should be deleted automatically",
    createdAt: admin.firestore.Timestamp.now(),
    expiresAt: admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 60 * 1000) // 1 minute from now
    )
  };
  
  await db.collection('ttl-test').doc('test-doc').set(testDoc);
  console.log('✅ TTL test document created. It should be deleted automatically in 1 minute.');
  
  return { success: true, message: "TTL test document created" };
};

/**
 * Manual cleanup function (backup method)
 * Only use this if TTL is not available or as a backup
 */
export const manualCleanupExpiredData = async () => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  
  let deletedCount = 0;
  
  try {
    // Query for expired visitors
    const expiredVisitors = await db
      .collection('visitors')
      .where('expiresAt', '<', now)
      .limit(100) // Process in batches to avoid timeouts
      .get();
    
    if (expiredVisitors.empty) {
      console.log('✅ No expired visitor data found');
      return { deletedCount: 0, message: 'No expired data found' };
    }
    
    // Delete expired visitors and their subcollections
    const batch = db.batch();
    
    for (const visitorDoc of expiredVisitors.docs) {
      const visitorRef = visitorDoc.ref;
      
      // Delete all subcollections (quote data)
      const subcollections = ['quotes', 'dental_quotes', 'hospital_quotes', 'final_expense_quotes', 'cancer_quotes', 'misc_data'];
      
      for (const subcollectionName of subcollections) {
        const subcollectionRef = visitorRef.collection(subcollectionName);
        const subcollectionDocs = await subcollectionRef.get();
        
        subcollectionDocs.docs.forEach(doc => {
          batch.delete(doc.ref);
          deletedCount++;
        });
      }
      
      // Delete the visitor document itself
      batch.delete(visitorRef);
      deletedCount++;
    }
    
    await batch.commit();
    
    console.log(`✅ Manual cleanup completed. Deleted ${deletedCount} documents.`);
    return { deletedCount, message: `Deleted ${deletedCount} expired documents` };
    
  } catch (error) {
    console.error('❌ Error during manual cleanup:', error);
    throw error;
  }
};

/**
 * Get statistics about visitor data and expiration
 */
export const getVisitorDataStats = async () => {
  const db = admin.firestore();
  const now = admin.firestore.Timestamp.now();
  
  try {
    const [totalVisitors, expiredVisitors] = await Promise.all([
      db.collection('visitors').count().get(),
      db.collection('visitors').where('expiresAt', '<', now).count().get()
    ]);
    
    return {
      totalVisitors: totalVisitors.data().count,
      expiredVisitors: expiredVisitors.data().count,
      activeVisitors: totalVisitors.data().count - expiredVisitors.data().count
    };
  } catch (error) {
    console.error('❌ Error getting visitor stats:', error);
    throw error;
  }
};
