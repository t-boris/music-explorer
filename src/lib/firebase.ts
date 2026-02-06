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

function getApp() {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

/**
 * Lazy getters that defer Firebase initialization until first access.
 * This prevents build-time errors when NEXT_PUBLIC_FIREBASE_API_KEY is empty
 * (e.g., during static page generation in `next build`).
 */
export function getFirebaseAuth() {
  return getAuth(getApp());
}

export function getFirebaseDb() {
  return getFirestore(getApp());
}

export function getFirebaseStorage() {
  return getStorage(getApp());
}

// Direct exports for convenience — only safe to use at runtime (not during build/SSR prerender)
// Use the getter functions above when access may happen during build
export const auth = typeof window !== "undefined" ? getFirebaseAuth() : (null as unknown as ReturnType<typeof getAuth>);
export const db = typeof window !== "undefined" ? getFirebaseDb() : (null as unknown as ReturnType<typeof getFirestore>);
export const storage = typeof window !== "undefined" ? getFirebaseStorage() : (null as unknown as ReturnType<typeof getStorage>);
