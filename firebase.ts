
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration from user
const firebaseConfig = {
  apiKey: "AIzaSyDHWfVfLP9qvCyJybo3g4p3MppB82QYMXw",
  authDomain: "drapicorn-fashion-ai-mvp.firebaseapp.com",
  projectId: "drapicorn-fashion-ai-mvp",
  storageBucket: "drapicorn-fashion-ai-mvp.firebasestorage.app",
  messagingSenderId: "972861980842",
  appId: "1:972861980842:web:7ad46320cea33f73eb90d3",
  measurementId: "G-XRZ742HWMS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
