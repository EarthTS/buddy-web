import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ?? "buddy-93af3";

const HINTS_COLLECTION = "hints";

function getServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (json) {
    return JSON.parse(json) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    return {
      project_id: FIREBASE_PROJECT_ID,
      client_email: clientEmail,
      private_key: privateKey,
    };
  }

  return null;
}

export function isFirebaseConfigured() {
  return getServiceAccount() !== null;
}

function getFirebaseApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    throw new Error("Firebase credentials not configured");
  }

  return initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });
}

export function getHintsCollection() {
  return getFirestore(getFirebaseApp()).collection(HINTS_COLLECTION);
}
