import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "buddy-93af3";

const HINTS_COLLECTION = "hints";

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function parseServiceAccountJson(raw: string): ServiceAccount {
  let value = raw.trim();

  // Handle double-encoded JSON pasted into Vercel
  if (value.startsWith('"') && value.endsWith('"')) {
    value = JSON.parse(value) as string;
  }

  const parsed = JSON.parse(value) as ServiceAccount;

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Invalid service account JSON");
  }

  return {
    project_id: parsed.project_id ?? FIREBASE_PROJECT_ID,
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

function getServiceAccount(): ServiceAccount | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (json) {
    try {
      return parseServiceAccountJson(json);
    } catch {
      // fall through to individual env vars
    }
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

export function getFirebaseDiagnostics() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  let serviceAccountKeyValid = false;

  if (json) {
    try {
      parseServiceAccountJson(json);
      serviceAccountKeyValid = true;
    } catch {
      serviceAccountKeyValid = false;
    }
  }

  return {
    hasServiceAccountKey: Boolean(json),
    serviceAccountKeyValid,
    hasClientEmail: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
    hasPrivateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY),
  };
}

export function isFirebaseConfigured() {
  return getServiceAccount() !== null;
}

function getFirebaseApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    throw new Error("Firebase service account not configured");
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
