"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ALL_PARTICIPANTS, GROUP_A, GROUP_B } from "@/lib/participants";

const STORAGE_KEY = "buddy-participant-id";

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
    localStorage.setItem(STORAGE_KEY, selectedId);
    router.push("/buddy");
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
            เลือกชื่อของคุณเพื่อเริ่มต้น — คนอื่นจะไม่เห็นว่าคุณเป็นใคร
          </p>
        </header>

        <div className="mb-6">
          <input
            type="search"
            placeholder="ค้นหาชื่อ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
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
    </div>
  );
}
