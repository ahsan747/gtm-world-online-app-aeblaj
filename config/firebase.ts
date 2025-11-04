
// Firebase configuration is no longer used
// The app now uses Supabase for authentication and database
// This file is kept for reference only

import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyB6eHOr4yO54zIQ-SFNbAUu4r2XBvLfp_8",
  authDomain: "gtmworldonline.firebaseapp.com",
  projectId: "gtmworldonline",
  storageBucket: "gtmworldonline.firebasestorage.app",
  messagingSenderId: "389741347733",
  appId: "1:389741347733:web:766a01a8200b7bf72cec9c",
  measurementId: "G-TRYSESQ8BG"
};

// Initialize Firebase (not used in the app anymore)
const app = initializeApp(firebaseConfig);

console.log('⚠️ Firebase is configured but not actively used. The app uses Supabase for authentication and database.');

export default app;
