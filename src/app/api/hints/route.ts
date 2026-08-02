import { NextRequest, NextResponse } from "next/server";
import { addHint, getHintsForParticipant } from "@/lib/hints-store";
import { getBuddyId, getParticipant } from "@/lib/participants";

export async function GET(request: NextRequest) {
  const participantId = request.nextUrl.searchParams.get("participantId");

  if (!participantId || !getParticipant(participantId)) {
    return NextResponse.json({ error: "Invalid participant" }, { status: 400 });
  }

  const hints = await getHintsForParticipant(participantId);
  const sanitized = hints.map(({ id, text, createdAt }) => ({
    id,
    text,
    createdAt,
  }));

  return NextResponse.json({ hints: sanitized });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    fromId?: string;
    text?: string;
  };

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

  const hint = await addHint(fromId, buddyId, text);

  return NextResponse.json({
    hint: { id: hint.id, text: hint.text, createdAt: hint.createdAt },
  });
}
