import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const app = initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore(app, "hawknest-database");

async function checkUserData() {
  try {
    console.log('Checking user data in hawknest-database...');
    
    // List all users
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} users in the collection`);
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`User ID: ${doc.id}`);
      console.log('User data:', JSON.stringify(userData, null, 2));
      console.log('---');
    });
    
    // Also check user-data collection
    const userDataSnapshot = await db.collection('user-data').get();
    console.log(`Found ${userDataSnapshot.size} documents in user-data collection`);
    
    userDataSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log(`User-data ID: ${doc.id}`);
      console.log('User-data content:', JSON.stringify(userData, null, 2));
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkUserData();
