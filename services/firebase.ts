// ============================================
// 1. FIREBASE CONFIGURATION
// ============================================

// mobile-app/services/firebase.ts
import { initializeApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC8t54Pp8Gf7B2FUnEj3ZYyLSvYLdYtHvo",
  authDomain: "glide-x97x5q.firebaseapp.com",
  projectId: "glide-x97x5q",
  storageBucket: "glide-x97x5q.firebasestorage.app",
  messagingSenderId: "70442870803",
  appId: "1:70442870803:web:154ffd0681a33f9edc37e6",
  measurementId: "G-RXYYGBEB1P"
};

export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);