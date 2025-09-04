/**
 * TTL Testing Utilities for Insurance Hawk
 * 
 * These functions help you test and verify that Firestore TTL is working correctly
 * with your visitor quote data storage system.
 */

import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  limit
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

/**
 * Create a test document that should be deleted by TTL in 2 minutes
 * Use this to verify TTL is working before setting up production data
 */
export const createTTLTestDocument = async (): Promise<{ success: boolean; message: string; testDocId: string }> => {
  try {
    const db = getFirestore();
    const testDocId = `ttl-test-${Date.now()}`;
    
    // Create a test document that expires in 2 minutes
    const testData = {
      testMessage: "This document should be automatically deleted by TTL in ~2 minutes",
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 2 * 60 * 1000)), // 2 minutes from now
      testType: "ttl-verification",
      insuranceHawkProject: true
    };
    
    const testDocRef = doc(db, 'visitors', testDocId);
    await setDoc(testDocRef, testData);
    
    console.log(`✅ TTL test document created with ID: ${testDocId}`);
    console.log('📅 Document should be deleted automatically in ~2 minutes');
    console.log('⏰ Check back in 3-5 minutes to verify it was deleted');
    
    return {
      success: true,
      message: `Test document created. Check document ID '${testDocId}' in 3-5 minutes - it should be gone!`,
      testDocId
    };
  } catch (error) {
    console.error('❌ Error creating TTL test document:', error);
    return {
      success: false,
      message: `Failed to create test document: ${error}`,
      testDocId: ''
    };
  }
};

/**
 * Check if a TTL test document still exists
 * Use this 3-5 minutes after creating a test document
 */
export const checkTTLTestDocument = async (testDocId: string): Promise<{ exists: boolean; message: string }> => {
  try {
    const db = getFirestore();
    const testDocRef = doc(db, 'visitors', testDocId);
    const docSnap = await getDoc(testDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const expiresAt = data.expiresAt?.toDate();
      const now = new Date();
      
      if (expiresAt && now > expiresAt) {
        return {
          exists: true,
          message: `⚠️ Document still exists but should have been deleted (expired ${Math.round((now.getTime() - expiresAt.getTime()) / 1000 / 60)} minutes ago). TTL may not be configured or may take up to 24 hours.`
        };
      } else {
        return {
          exists: true,
          message: `📄 Document still exists and hasn't expired yet. TTL will delete it later.`
        };
      }
    } else {
      return {
        exists: false,
        message: `✅ SUCCESS! Test document was automatically deleted by TTL. Your TTL policy is working correctly!`
      };
    }
  } catch (error) {
    console.error('❌ Error checking TTL test document:', error);
    return {
      exists: false,
      message: `Error checking document: ${error}`
    };
  }
};

/**
 * Get statistics about visitor documents and their expiration status
 */
export const getVisitorExpirationStats = async (): Promise<{
  total: number;
  expired: number;
  active: number;
  expiringSoon: number; // expiring within 1 hour
}> => {
  try {
    const db = getFirestore();
    const visitorsRef = collection(db, 'visitors');
    const now = Timestamp.now();
    const oneHourFromNow = Timestamp.fromDate(new Date(Date.now() + 60 * 60 * 1000));
    
    // Get all visitors (limited to 1000 for performance)
    const allVisitorsQuery = query(visitorsRef, limit(1000));
    const allVisitorsSnap = await getDocs(allVisitorsQuery);
    
    let expired = 0;
    let active = 0;
    let expiringSoon = 0;
    
    allVisitorsSnap.docs.forEach(doc => {
      const data = doc.data();
      const expiresAt = data.expiresAt;
      
      if (expiresAt) {
        if (expiresAt.seconds < now.seconds) {
          expired++;
        } else if (expiresAt.seconds < oneHourFromNow.seconds) {
          expiringSoon++;
          active++;
        } else {
          active++;
        }
      } else {
        // Documents without expiresAt are considered active but should be updated
        active++;
      }
    });
    
    return {
      total: allVisitorsSnap.size,
      expired,
      active,
      expiringSoon
    };
  } catch (error) {
    console.error('❌ Error getting visitor stats:', error);
    return { total: 0, expired: 0, active: 0, expiringSoon: 0 };
  }
};

/**
 * Find visitor documents that don't have expiresAt field
 * These documents won't be cleaned up by TTL and should be updated
 */
export const findDocumentsWithoutTTL = async (): Promise<string[]> => {
  try {
    const db = getFirestore();
    const visitorsRef = collection(db, 'visitors');
    
    // Get a sample of documents to check
    const sampleQuery = query(visitorsRef, limit(100));
    const sampleSnap = await getDocs(sampleQuery);
    
    const documentsWithoutTTL: string[] = [];
    
    sampleSnap.docs.forEach(doc => {
      const data = doc.data();
      if (!data.expiresAt) {
        documentsWithoutTTL.push(doc.id);
      }
    });
    
    return documentsWithoutTTL;
  } catch (error) {
    console.error('❌ Error finding documents without TTL:', error);
    return [];
  }
};

/**
 * Helper function to log current TTL setup status
 */
export const logTTLStatus = async (): Promise<void> => {
  console.log('🔍 Insurance Hawk TTL Status Check');
  console.log('=====================================');
  
  // Check visitor stats
  const stats = await getVisitorExpirationStats();
  console.log(`📊 Visitor Document Stats:`);
  console.log(`   Total documents: ${stats.total}`);
  console.log(`   Active documents: ${stats.active}`);
  console.log(`   Expired documents: ${stats.expired}`);
  console.log(`   Expiring soon (< 1 hour): ${stats.expiringSoon}`);
  
  // Check for documents without TTL
  const withoutTTL = await findDocumentsWithoutTTL();
  if (withoutTTL.length > 0) {
    console.log(`⚠️  Found ${withoutTTL.length} documents without expiresAt field`);
    console.log(`   These documents won't be cleaned up by TTL`);
  } else {
    console.log(`✅ All sampled documents have expiresAt field`);
  }
  
  console.log('');
  console.log('💡 Next Steps:');
  console.log('   1. Create TTL policy in Firebase Console (Firestore > TTL tab)');
  console.log('   2. Run createTTLTestDocument() to test TTL functionality');
  console.log('   3. Check back in 3-5 minutes with checkTTLTestDocument()');
};

// Export all functions for easy importing
export const ttlTestUtils = {
  createTTLTestDocument,
  checkTTLTestDocument,
  getVisitorExpirationStats,
  findDocumentsWithoutTTL,
  logTTLStatus
};
