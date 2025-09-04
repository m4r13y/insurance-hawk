#!/usr/bin/env node

/**
 * TTL Setup Test Script for Insurance Hawk
 * 
 * Run this script to test your Firestore TTL configuration:
 * 
 * Usage:
 *   npm run test-ttl
 *   or
 *   node scripts/test-ttl.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp,
  collection,
  query,
  limit,
  getDocs
} = require('firebase/firestore');

// Initialize Firebase (you may need to adjust this based on your setup)
const firebaseConfig = {
  // Add your Firebase config here, or ensure it's loaded from environment
  // For testing, you can use your existing app initialization
};

// Simple TTL test function
const testTTL = async () => {
  try {
    console.log('🔥 Insurance Hawk TTL Test');
    console.log('===========================');
    
    const db = getFirestore();
    const testDocId = `ttl-test-${Date.now()}`;
    
    // Create test document that expires in 2 minutes
    const testData = {
      testMessage: "TTL Test Document - Should be deleted automatically",
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 2 * 60 * 1000)), // 2 minutes
      testType: "ttl-verification"
    };
    
    console.log(`📝 Creating test document: ${testDocId}`);
    await setDoc(doc(db, 'visitors', testDocId), testData);
    
    console.log('✅ Test document created successfully!');
    console.log('⏰ Document should be deleted in ~2 minutes by TTL');
    console.log('');
    console.log('🔍 To verify TTL is working:');
    console.log(`   1. Wait 3-5 minutes`);
    console.log(`   2. Check if document '${testDocId}' still exists in Firestore Console`);
    console.log(`   3. If it's gone, TTL is working! 🎉`);
    console.log(`   4. If it's still there after 10+ minutes, TTL may not be configured`);
    
    return testDocId;
  } catch (error) {
    console.error('❌ Error testing TTL:', error);
    return null;
  }
};

// Check visitor document structure
const checkVisitorDocs = async () => {
  try {
    console.log('');
    console.log('📊 Checking existing visitor documents...');
    
    const db = getFirestore();
    const visitorsRef = collection(db, 'visitors');
    const sampleQuery = query(visitorsRef, limit(5));
    const sampleSnap = await getDocs(sampleQuery);
    
    if (sampleSnap.empty) {
      console.log('📭 No visitor documents found');
      return;
    }
    
    let docsWithTTL = 0;
    let docsWithoutTTL = 0;
    
    sampleSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.expiresAt) {
        docsWithTTL++;
      } else {
        docsWithoutTTL++;
        console.log(`⚠️  Document ${doc.id} missing expiresAt field`);
      }
    });
    
    console.log(`✅ ${docsWithTTL} documents have expiresAt field`);
    if (docsWithoutTTL > 0) {
      console.log(`⚠️  ${docsWithoutTTL} documents missing expiresAt field`);
    }
  } catch (error) {
    console.error('❌ Error checking visitor documents:', error);
  }
};

// Main execution
const main = async () => {
  try {
    // Note: You'll need to initialize Firebase app first
    console.log('⚠️  Make sure Firebase is initialized in your app first');
    console.log('');
    
    // Test TTL
    const testDocId = await testTTL();
    
    // Check existing docs
    await checkVisitorDocs();
    
    console.log('');
    console.log('📋 TTL Setup Checklist:');
    console.log('  □ Create TTL policy in Firebase Console');
    console.log('  □ Collection Group: visitors');
    console.log('  □ Field: expiresAt');
    console.log('  □ Database: temp');
    console.log('  □ Apply to subcollections: YES');
    console.log('');
    console.log('🌟 Once TTL is configured, expired documents will be');
    console.log('   automatically deleted within 24 hours of expiration!');
    
  } catch (error) {
    console.error('❌ Error in main execution:', error);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { testTTL, checkVisitorDocs };
