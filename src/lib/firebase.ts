import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  collection,
  getFirestore,
  type Firestore,
} from "firebase/firestore";

export const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "buddy-93af3";

export const FIREBASE_MESSAGING_SENDER_ID =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "76594166029";

const HINTS_COLLECTION = "hints";

function getFirebaseConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !appId) return null;

  return {
    apiKey,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
      `${FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
      `${FIREBASE_PROJECT_ID}.firebasestorage.app`,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId,
  };
}

export function isFirebaseConfigured() {
  return getFirebaseConfig() !== null;
}

function getFirebaseApp(): FirebaseApp {
  const existing = getApps()[0];
  if (existing) return existing;

  const config = getFirebaseConfig();
  if (!config) {
    throw new Error("Firebase config not configured");
  }

  return initializeApp(config);
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getHintsCollection() {
  return collection(getDb(), HINTS_COLLECTION);
}
