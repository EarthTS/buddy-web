"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ALL_PARTICIPANTS, getParticipant, GROUP_A, GROUP_B } from "@/lib/participants";
import { getStoredParticipantId, setStoredParticipantId } from "@/lib/session";

function ParticipantList({
  title,
  participants,
  selectedId,
  onSelect,
}: {
  title: string;
  participants: typeof GROUP_A;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-violet-600">
        {title}
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {participants.map((person) => {
          const isSelected = selectedId === person.id;
          return (
            <li key={person.id}>
              <button
                type="button"
                onClick={() => onSelect(person.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  isSelected
                    ? "border-violet-500 bg-violet-50 text-violet-900 shadow-sm ring-2 ring-violet-200"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-violet-300 hover:bg-violet-50/50"
                }`}
              >
                {person.name}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [checking, setChecking] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedParticipant = selectedId
    ? ALL_PARTICIPANTS.find((p) => p.id === selectedId)
    : undefined;

  useEffect(() => {
    const stored = getStoredParticipantId();
    if (stored && getParticipant(stored)) {
      router.replace("/buddy");
      return;
    }
    setChecking(false);
  }, [router]);

  const filteredA = useMemo(
    () =>
      GROUP_A.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const filteredB = useMemo(
    () =>
      GROUP_B.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  function handleContinue() {
    if (!selectedId) return;
    setShowConfirm(true);
  }

  function handleConfirm() {
    if (!selectedId) return;
    setStoredParticipantId(selectedId);
    router.replace("/buddy");
  }

  if (checking) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
        <p className="text-zinc-500">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      <main className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-10 sm:px-6">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-2xl text-white shadow-lg shadow-violet-200">
            🤝
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Buddy Hint
          </h1>
          <p className="mt-2 text-zinc-600">
            เลือกชื่อของคุณ — เลือกได้ครั้งเดียวและเก็บไว้ในเครื่องนี้เท่านั้น
          </p>
        </header>

        <div className="mb-6">
          <input
            type="search"
            placeholder="ค้นหาชื่อ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-black shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div className="flex-1 space-y-8">
          {filteredA.length > 0 && (
            <ParticipantList
              title="กลุ่ม A"
              participants={filteredA}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
          {filteredB.length > 0 && (
            <ParticipantList
              title="กลุ่ม B"
              participants={filteredB}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
          {filteredA.length === 0 && filteredB.length === 0 && (
            <p className="text-center text-zinc-500">ไม่พบชื่อที่ค้นหา</p>
          )}
        </div>

        <footer className="sticky bottom-0 mt-8 border-t border-zinc-200/80 bg-gradient-to-t from-white via-white to-white/80 pt-4 pb-2 backdrop-blur-sm">
          <button
            type="button"
            disabled={!selectedId}
            onClick={handleContinue}
            className="w-full rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
          >
            {selectedId
              ? `เริ่มต้น (${ALL_PARTICIPANTS.find((p) => p.id === selectedId)?.name})`
              : "เลือกชื่อของคุณก่อน"}
          </button>
        </footer>
      </main>

      {showConfirm && selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2
              id="confirm-title"
              className="text-lg font-semibold text-zinc-900"
            >
              ยืนยันตัวตนของคุณ
            </h2>
            <p className="mt-3 text-sm text-zinc-600">
              คุณเลือกเป็น{" "}
              <span className="font-semibold text-violet-700">
                {selectedParticipant.name}
              </span>
            </p>
            <p className="mt-2 text-sm text-amber-700">
              เลือกได้ครั้งเดียวเท่านั้น และไม่สามารถเปลี่ยนได้ภายหลัง
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
