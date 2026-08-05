"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getBuddy, getParticipant } from "@/lib/participants";
import { getStoredParticipantId } from "@/lib/session";

type HintItem = {
  id: string;
  text: string;
  createdAt: string;
};

export default function BuddyPage() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [hints, setHints] = useState<HintItem[]>([]);
  const [sentHints, setSentHints] = useState<HintItem[]>([]);
  const [hintText, setHintText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const participant = participantId ? getParticipant(participantId) : undefined;
  const buddy = participantId ? getBuddy(participantId) : undefined;
  const hasBuddy = Boolean(buddy);

  const loadHints = useCallback(async (id: string) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);
      const [receivedRes, sentRes] = await Promise.all([
        fetch(`/api/hints?participantId=${encodeURIComponent(id)}`, {
          signal: controller.signal,
        }),
        fetch(
          `/api/hints?participantId=${encodeURIComponent(id)}&direction=sent`,
          { signal: controller.signal },
        ),
      ]);
      clearTimeout(timeout);
      if (receivedRes.ok) {
        const data = (await receivedRes.json()) as { hints: HintItem[] };
        setHints(data.hints);
      }
      if (sentRes.ok) {
        const data = (await sentRes.json()) as { hints: HintItem[] };
        setSentHints(data.hints);
      }
    } catch {
      setMessage("โหลดคำใบ้ไม่สำเร็จ — ลองรีเฟรชอีกครั้ง");
    }
  }, []);

  useEffect(() => {
    const stored = getStoredParticipantId();
    if (!stored || !getParticipant(stored)) {
      router.replace("/");
      return;
    }
    setParticipantId(stored);
    loadHints(stored).finally(() => setLoading(false));
  }, [router, loadHints]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!participantId || !hintText.trim() || !hasBuddy) return;

    setSubmitting(true);
    setMessage("");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);

      const res = await fetch("/api/hints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromId: participantId, text: hintText }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setMessage(data.error ?? "ส่งคำใบ้ไม่สำเร็จ");
        return;
      }

      setHintText("");
      setMessage("ส่งคำใบ้ให้ Buddy แล้ว!");
      await loadHints(participantId);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessage("ส่งคำใบ้ช้าเกินไป — ตรวจสอบ Firebase/Firestore แล้วลองใหม่");
      } else {
        setMessage("ส่งคำใบ้ไม่สำเร็จ — ลองอีกครั้ง");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !participant) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
        <p className="text-zinc-500">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <div>
            <p className="text-sm font-medium text-violet-600">
              สวัสดี, {participant.name}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900">
              Buddy ของคุณ
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Buddy จะไม่เห็นชื่อของคุณในคำใบ้ที่คุณส่ง
            </p>
          </div>

          {hasBuddy ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              ระบบจับคู่ Buddy ให้คุณแล้ว — ส่งคำใบ้เพื่อช่วย Buddy ทายว่าคุณคือใคร
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              คุณยังไม่มี Buddy ในระบบ
            </div>
          )}
        </header>

        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-zinc-900">
            คำใบ้ที่ได้รับ
          </h2>
          <p className="mb-4 text-sm text-zinc-500">
            จาก Buddy ของคุณ (ไม่แสดงชื่อผู้ส่ง)
          </p>

          {hints.length === 0 ? (
            <p className="rounded-xl bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
              ยังไม่มีคำใบ้ — Buddy ของคุณอาจกำลังเขียนอยู่
            </p>
          ) : (
            <ul className="space-y-3">
              {hints.map((hint) => (
                <li
                  key={hint.id}
                  className="rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3"
                >
                  <p className="text-zinc-800">{hint.text}</p>
                  <time
                    dateTime={hint.createdAt}
                    className="mt-2 block text-xs text-zinc-400"
                  >
                    {new Date(hint.createdAt).toLocaleString("th-TH")}
                  </time>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => participantId && loadHints(participantId)}
            className="mt-4 text-sm text-violet-600 hover:text-violet-800"
          >
            รีเฟรชคำใบ้
          </button>
        </section>

        {hasBuddy && (
          <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold text-zinc-900">
              ส่งคำใบ้ให้ Buddy
            </h2>
            <p className="mb-4 text-sm text-zinc-500">
              เขียนคำใบ้ที่ช่วยให้ Buddy ทายตัวตนของคุณได้
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={hintText}
                onChange={(e) => setHintText(e.target.value)}
                placeholder="เช่น ฉันชอบกินของหวาน, มักใส่เสื้อสีฟ้า, มาจาก..."
                rows={4}
                maxLength={500}
                className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm text-black outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {hintText.length}/500
                </span>
                <button
                  type="submit"
                  disabled={submitting || !hintText.trim()}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  {submitting ? "กำลังส่ง..." : "ส่งคำใบ้"}
                </button>
              </div>
              {message && (
                <p
                  className={`text-sm ${message.includes("แล้ว") ? "text-emerald-600" : "text-red-600"}`}
                >
                  {message}
                </p>
              )}
            </form>
          </section>
        )}

        {hasBuddy && (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold text-zinc-900">
              คำใบ้ที่ส่งไปแล้ว
            </h2>
            <p className="mb-4 text-sm text-zinc-500">
              คำใบ้ที่คุณใบ้ให้ Buddy แล้ว — เฉพาะคุณเท่านั้นที่เห็น
            </p>

            {sentHints.length === 0 ? (
              <p className="rounded-xl bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
                ยังไม่เคยส่งคำใบ้
              </p>
            ) : (
              <ul className="space-y-3">
                {sentHints.map((hint) => (
                  <li
                    key={hint.id}
                    className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/50 px-4 py-3"
                  >
                    <p className="text-zinc-800">{hint.text}</p>
                    <time
                      dateTime={hint.createdAt}
                      className="mt-2 block text-xs text-zinc-400"
                    >
                      {new Date(hint.createdAt).toLocaleString("th-TH")}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

      </main>
    </div>
  );
}
