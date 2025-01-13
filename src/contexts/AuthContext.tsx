import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile, getUserProfile, updateUserProfile } from '../lib/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if user profile exists, if not create it
        const profile = await getUserProfile(user.uid);
        if (!profile) {
          // For Google sign-in users, we can get their name
          const firstName = user.displayName?.split(' ')[0] || '';
          const lastName = user.displayName?.split(' ').slice(1).join(' ') || '';
          await createUserProfile(user.uid, user.email || '', 'ambassador', firstName, lastName);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Create user profile immediately after signup
    await createUserProfile(userCredential.user.uid, email, 'ambassador');
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if profile exists
    const profile = await getUserProfile(user.uid);
    if (!profile) {
      // Create profile with Google user's name
      const firstName = user.displayName?.split(' ')[0] || '';
      const lastName = user.displayName?.split(' ').slice(1).join(' ') || '';
      await createUserProfile(user.uid, user.email || '', 'ambassador', firstName, lastName);
    }
  };

  const logOut = () => firebaseSignOut(auth);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 