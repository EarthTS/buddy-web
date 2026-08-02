export const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "buddy-93af3";

export const FIREBASE_MESSAGING_SENDER_ID =
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "76594166029";

export function getFirebaseApiKey() {
  return process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? null;
}

export function getFirebaseAppId() {
  return process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? null;
}

export function isFirebaseConfigured() {
  return Boolean(getFirebaseApiKey() && getFirebaseAppId());
}
