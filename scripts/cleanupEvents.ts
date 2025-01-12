const { getFirestore, collection, getDocs, deleteDoc, doc, listCollections } = require('firebase/firestore');
const { db } = require('../src/lib/firebase');

async function deleteCollection(collectionRef) {
  try {
    // Delete all documents in the collection
    const snapshot = await getDocs(collectionRef);
    const deletePromises = snapshot.docs.map(async (doc) => {
      // Recursively delete subcollections
      const subcollections = await listCollections(doc.ref);
      for (const subcollection of subcollections) {
        await deleteCollection(subcollection);
      }
      await deleteDoc(doc.ref);
      console.log(`Deleted document: ${collectionRef.id}/${doc.id}`);
    });
    
    await Promise.all(deletePromises);
    console.log(`Successfully deleted collection: ${collectionRef.id}`);
  } catch (error) {
    console.error(`Error deleting collection ${collectionRef.id}:`, error);
  }
}

async function deleteAllCollections() {
  try {
    console.log('Starting database cleanup...');
    
    // Get all root collections
    const collections = await listCollections(db);
    
    // Delete each collection recursively
    for (const collectionRef of collections) {
      await deleteCollection(collectionRef);
    }
    
    console.log('Database cleanup completed successfully');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  }
}

deleteAllCollections();
