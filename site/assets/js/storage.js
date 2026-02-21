import { STORAGE_KEY, initialState } from "./state.js";

export function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(initialState);

  try {
    const parsed = JSON.parse(saved);
    return {
      showInstagramFeed: typeof parsed.showInstagramFeed === "boolean"
        ? parsed.showInstagramFeed
        : initialState.showInstagramFeed,
      links: Array.isArray(parsed.links) && parsed.links.length
        ? parsed.links
        : structuredClone(initialState.links),
      products: Array.isArray(parsed.products)
        ? parsed.products
        : structuredClone(initialState.products)
    };
  } catch {
    return structuredClone(initialState);
  }
}

export function persistState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function createSafeUrl(value) {
  if (!value) return "#";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}
