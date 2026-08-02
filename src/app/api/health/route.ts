import { NextResponse } from "next/server";
import {
  FIREBASE_PROJECT_ID,
  getFirebaseDiagnostics,
  isFirebaseConfigured,
} from "@/lib/firebase";

export async function GET() {
  return NextResponse.json({
    firebaseConfigured: isFirebaseConfigured(),
    projectId: FIREBASE_PROJECT_ID,
    vercel: Boolean(process.env.VERCEL),
    ...getFirebaseDiagnostics(),
  });
}
