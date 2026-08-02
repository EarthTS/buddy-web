import { NextRequest, NextResponse } from "next/server";
import { addHint, getHintsForParticipant } from "@/lib/hints-store";
import { getBuddyId, getParticipant } from "@/lib/participants";

function storageErrorResponse(error: unknown) {
  console.error("Hints storage error:", error);
  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Storage unavailable. Configure Vercel Blob on Vercel.",
    },
    { status: 503 },
  );
}

export async function GET(request: NextRequest) {
  const participantId = request.nextUrl.searchParams.get("participantId");

  if (!participantId || !getParticipant(participantId)) {
    return NextResponse.json({ error: "Invalid participant" }, { status: 400 });
  }

  try {
    const hints = await getHintsForParticipant(participantId);
    const sanitized = hints.map(({ id, text, createdAt }) => ({
      id,
      text,
      createdAt,
    }));

    return NextResponse.json({ hints: sanitized });
  } catch (error) {
    return storageErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  let body: { fromId?: string; text?: string };

  try {
    body = (await request.json()) as { fromId?: string; text?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fromId, text } = body;

  if (!fromId || !text?.trim()) {
    return NextResponse.json(
      { error: "Missing fromId or text" },
      { status: 400 },
    );
  }

  const participant = getParticipant(fromId);
  if (!participant) {
    return NextResponse.json({ error: "Invalid participant" }, { status: 400 });
  }

  const buddyId = getBuddyId(fromId);
  if (!buddyId) {
    return NextResponse.json(
      { error: "No buddy assigned for this participant" },
      { status: 400 },
    );
  }

  try {
    const hint = await addHint(fromId, buddyId, text);

    return NextResponse.json({
      hint: { id: hint.id, text: hint.text, createdAt: hint.createdAt },
    });
  } catch (error) {
    return storageErrorResponse(error);
  }
}
