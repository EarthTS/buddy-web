export const STORAGE_KEY = "buddy-participant-id";

export function getStoredParticipantId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredParticipantId(id: string) {
  localStorage.setItem(STORAGE_KEY, id);
}
