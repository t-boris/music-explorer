import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Returns true if Firebase config has a valid API key.
 * When running without credentials (local dev), Firebase operations are skipped gracefully.
 */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey);
}

function getApp() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_API_KEY to .env.local"
    );
  }
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

/**
 * Lazy getters that defer Firebase initialization until first access.
 * This prevents build-time errors when NEXT_PUBLIC_FIREBASE_API_KEY is empty
 * (e.g., during static page generation in `next build`).
 *
 * Returns null when Firebase is not configured (no API key in env).
 */
export function getFirebaseAuth() {
  if (!isFirebaseConfigured()) return null;
  return getAuth(getApp());
}

export function getFirebaseDb() {
  if (!isFirebaseConfigured()) return null;
  return getFirestore(getApp());
}

export function getFirebaseStorage() {
  if (!isFirebaseConfigured()) return null;
  return getStorage(getApp());
}
