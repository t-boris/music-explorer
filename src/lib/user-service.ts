import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Ensure a user document exists in Firestore.
 * Called after successful sign-in on the client side.
 *
 * - If the document does not exist, creates it with initial fields.
 * - If it exists, updates the lastLogin timestamp.
 */
export async function ensureUserDocument(
  uid: string,
  displayName: string | null,
  email: string | null,
  photoURL: string | null
): Promise<void> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      displayName: displayName ?? "User",
      email: email ?? "",
      photoURL: photoURL ?? null,
      currentLevel: 0,
      progressSummary: {},
      streakDays: 0,
      totalPracticeMinutes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}
