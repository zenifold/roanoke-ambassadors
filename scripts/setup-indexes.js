import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('../service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createIndexes() {
  const db = admin.firestore();
  
  try {
    // Create index for notifications (userId, createdAt)
    await db.collection('notifications').where('userId', '==', '').orderBy('createdAt', 'desc').get();
    console.log('Created index for notifications (userId, createdAt)');

    console.log('All index creation requests sent successfully');
  } catch (error) {
    if (error.message && error.message.includes('missing index')) {
      console.log('Index creation link:', error.details);
    } else {
      console.error('Error creating indexes:', error);
    }
  }
}

createIndexes().then(() => process.exit(0)); 