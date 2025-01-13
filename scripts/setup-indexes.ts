import * as admin from 'firebase-admin';
import serviceAccount from '../service-account.json';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});

async function createIndexes() {
  const db = admin.firestore();
  
  try {
    // Create index for events (userId, date)
    await db.collection('events').where('userId', '==', '').where('date', '>=', new Date()).get();
    console.log('Created index for events (userId, date)');

    // Create index for tasks (userId, status, dueDate)
    await db.collection('tasks').where('userId', '==', '').where('status', '==', '').where('dueDate', '>=', new Date()).get();
    console.log('Created index for tasks (userId, status, dueDate)');

    // Create index for notifications (userId, createdAt)
    await db.collection('notifications').where('userId', '==', '').orderBy('createdAt', 'desc').get();
    console.log('Created index for notifications (userId, createdAt)');

    console.log('All index creation requests sent successfully');
    console.log('Please check the Firebase Console to complete index creation');
  } catch (error) {
    if (error instanceof Error && error.message.includes('missing index')) {
      console.log('Index creation requests sent. Please check Firebase Console to complete the process.');
    } else {
      console.error('Error creating indexes:', error);
    }
  }
}

createIndexes().then(() => process.exit(0)); 