
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyB6eHOr4yO54zIQ-SFNbAUu4r2XBvLfp_8",
  authDomain: "gtmworldonline.firebaseapp.com",
  projectId: "gtmworldonline",
  storageBucket: "gtmworldonline.firebasestorage.app",
  messagingSenderId: "389741347733",
  appId: "1:389741347733:web:766a01a8200b7bf72cec9c",
  measurementId: "G-TRYSESQ8BG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;
