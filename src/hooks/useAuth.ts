import { useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  getRedirectResult
} from 'firebase/auth';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for redirect result on mount
    getRedirectResult(auth).catch((error) => {
      if (error.code !== 'auth/redirect-cancelled-by-user') {
        setError('Authentication failed. Please try again.');
        console.error('Error with redirect sign-in:', error);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL,
          email: user.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      // Try popup first
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      // If popup is blocked or fails, fallback to redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError: any) {
          setError('Authentication failed. Please try again.');
          console.error('Error with redirect sign-in:', redirectError);
        }
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please contact support.');
        console.error('Unauthorized domain error:', error);
      } else {
        setError('Authentication failed. Please try again.');
        console.error('Error signing in with Google:', error);
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      setError('Error signing out. Please try again.');
      console.error('Error signing out:', error);
    }
  };

  return { user, loading, error, signInWithGoogle, signOut };
}