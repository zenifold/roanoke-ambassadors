import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDdmHsGSXcKhvnZjzAHBXf3Zt4g0xz4nxE",
  authDomain: "roanoke-ambassadors.firebaseapp.com",
  projectId: "roanoke-ambassadors",
  storageBucket: "roanoke-ambassadors.appspot.com",
  messagingSenderId: "1039460737782",
  appId: "1:1039460737782:web:c9e9f2c4c5e6f4f4f4f4f4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function initializeAdminUser(email) {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const userDoc = querySnapshot.docs[0];
    
    if (userDoc) {
      const userRef = doc(db, 'users', userDoc.id);
      await updateDoc(userRef, {
        role: 'admin',
        updatedAt: new Date()
      });
      console.log(`Successfully set user ${email} as admin`);
    } else {
      console.error('User not found:', email);
    }
  } catch (error) {
    console.error('Error setting admin user:', error);
  }
}

const email = 'maxkmurphy@gmail.com';
initializeAdminUser(email); 