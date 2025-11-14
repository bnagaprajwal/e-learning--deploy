import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// These values should be set in your .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

if (!isFirebaseConfigured()) {
  console.error('Firebase configuration is missing! Please check your .env file.');
  console.error('Required environment variables:');
  console.error('- VITE_FIREBASE_API_KEY');
  console.error('- VITE_FIREBASE_AUTH_DOMAIN');
  console.error('- VITE_FIREBASE_PROJECT_ID');
  console.error('- VITE_FIREBASE_STORAGE_BUCKET');
  console.error('- VITE_FIREBASE_MESSAGING_SENDER_ID');
  console.error('- VITE_FIREBASE_APP_ID');
}

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } else {
    // Create dummy objects to prevent crashes
    console.warn('Firebase not configured. Authentication will not work.');
    // Create minimal mock objects to prevent undefined errors
    auth = {
      currentUser: null,
      onAuthStateChanged: () => () => {},
    };
    db = {};
    storage = {};
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create minimal mock objects even on error
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
  };
  db = {};
  storage = {};
}

export { auth, db, storage };
export default app;

