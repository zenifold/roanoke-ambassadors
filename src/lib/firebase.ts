import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCCRq6kIwruyoRppzE2mPf2-Bbv37nzbEM",
  authDomain: "roanoke-ambassadors.firebaseapp.com",
  projectId: "roanoke-ambassadors",
  storageBucket: "roanoke-ambassadors.firebasestorage.app",
  messagingSenderId: "341366290868",
  appId: "1:341366290868:web:62661c4c702aae8669dae1",
  measurementId: "G-P6KPE2F4Z6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
