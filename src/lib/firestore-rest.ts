import {
  FIREBASE_PROJECT_ID,
  getFirebaseApiKey,
  isFirebaseConfigured,
} from "@/lib/firebase";

type FirestoreValue = { stringValue: string };

type FirestoreDocument = {
  name?: string;
  fields: Record<string, FirestoreValue>;
};

function apiKeyOrThrow() {
  const apiKey = getFirebaseApiKey();
  if (!apiKey) {
    throw new Error(
      "ยังไม่ได้ตั้งค่า Firebase — เพิ่ม NEXT_PUBLIC_FIREBASE_API_KEY ใน Vercel แล้ว Redeploy",
    );
  }
  return apiKey;
}

function baseUrl() {
  return `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
}

async function firestoreRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const apiKey = apiKeyOrThrow();
  const separator = path.includes("?") ? "&" : "?";
  const url = `${baseUrl()}${path}${separator}key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        body.includes("PERMISSION_DENIED")
          ? "Firestore ปฏิเสธการเข้าถึง — ตั้ง Rules ให้ allow read, write ที่ collection hints"
          : `Firestore error (${response.status}): ${body.slice(0, 200)}`,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Firebase ใช้เวลานานเกินไป — ตรวจสอบ Firestore Rules และ API key");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function toFirestoreFields(data: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, { stringValue: value }]),
  );
}

export function fromFirestoreDocument(doc: FirestoreDocument) {
  const read = (key: string) => doc.fields[key]?.stringValue ?? "";

  return {
    id: read("id"),
    fromId: read("fromId"),
    toId: read("toId"),
    text: read("text"),
    createdAt: read("createdAt"),
  };
}

export async function queryHintsByRecipient(toId: string) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase not configured");
  }

  const result = await firestoreRequest<{ document?: FirestoreDocument }[]>(
    ":runQuery",
    {
      method: "POST",
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "hints" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "toId" },
              op: "EQUAL",
              value: { stringValue: toId },
            },
          },
        },
      }),
    },
  );

  return result
    .filter((row) => row.document)
    .map((row) => fromFirestoreDocument(row.document!));
}

export async function createHintDocument(hint: {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  createdAt: string;
}) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase not configured");
  }

  await firestoreRequest(`/hints?documentId=${encodeURIComponent(hint.id)}`, {
    method: "POST",
    body: JSON.stringify({ fields: toFirestoreFields(hint) }),
  });
}
