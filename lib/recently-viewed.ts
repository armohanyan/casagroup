const STORAGE_KEY = "casagroup-recently-viewed";
const CHANGE_EVENT = "casagroup-recently-viewed-change";
const MAX_ITEMS = 8;

export type RecentListing = {
  apartmentId: string;
  projectSlug: string;
  title: string;
  price: number;
  image?: string;
  viewedAt: number;
};

const EMPTY_SNAPSHOT: RecentListing[] = [];

let cachedSnapshot: RecentListing[] = EMPTY_SNAPSHOT;
let cachedRaw: string | null = null;

function readFromStorage(): RecentListing[] {
  if (typeof window === "undefined") return EMPTY_SNAPSHOT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSnapshot;

    cachedRaw = raw;
    if (!raw) {
      cachedSnapshot = EMPTY_SNAPSHOT;
      return cachedSnapshot;
    }

    const parsed = JSON.parse(raw) as RecentListing[];
    cachedSnapshot = parsed.length === 0 ? EMPTY_SNAPSHOT : parsed;
    return cachedSnapshot;
  } catch {
    cachedRaw = null;
    cachedSnapshot = EMPTY_SNAPSHOT;
    return cachedSnapshot;
  }
}

/** Read recently viewed from localStorage (cached snapshot). */
export function getRecentlyViewedSnapshot(): RecentListing[] {
  return readFromStorage();
}

export function subscribeRecentlyViewed(callback: () => void): () => void {
  const onChange = () => callback();
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getRecentlyViewed(): RecentListing[] {
  return getRecentlyViewedSnapshot();
}

export function addRecentlyViewed(listing: Omit<RecentListing, "viewedAt">) {
  const current = readFromStorage().filter((r) => r.apartmentId !== listing.apartmentId);
  const next: RecentListing[] = [{ ...listing, viewedAt: Date.now() }, ...current].slice(0, MAX_ITEMS);
  const raw = JSON.stringify(next);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedSnapshot = next;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
