import { ANALYTICS_KEY, THREE_DAYS_MS } from "./state.js";

export function getAnalyticsSnapshot() {
  const raw = localStorage.getItem(ANALYTICS_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function buildAnalytics() {
  const previous = getAnalyticsSnapshot();
  const base = previous ? previous.metrics : {
    instagram: 18420,
    tiktok: 11200,
    youtube: 6400,
    totalClicks: 9730
  };

  const grow = (value, min, max) => value + Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    updatedAt: Date.now(),
    metrics: {
      instagram: grow(base.instagram, 120, 520),
      tiktok: grow(base.tiktok, 90, 430),
      youtube: grow(base.youtube, 40, 210),
      totalClicks: grow(base.totalClicks, 180, 650)
    }
  };
}

export function ensureAnalytics() {
  const snapshot = getAnalyticsSnapshot();
  const now = Date.now();

  if (!snapshot || !snapshot.updatedAt || now - snapshot.updatedAt >= THREE_DAYS_MS) {
    const next = buildAnalytics();
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(next));
    return next;
  }

  return snapshot;
}

export function saveAnalytics(snapshot) {
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(snapshot));
}

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}
