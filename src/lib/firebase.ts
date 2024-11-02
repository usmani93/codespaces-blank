import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBFWCYjfS7UQfzIni5ygHk_WzTIy5DM7KE",
  authDomain: "devoverflow-20469.firebaseapp.com",
  projectId: "devoverflow-20469",
  storageBucket: "devoverflow-20469.firebasestorage.app",
  messagingSenderId: "116461918700",
  appId: "1:116461918700:web:e616a255915ac0723c48c9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();