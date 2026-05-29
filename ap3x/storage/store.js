// AP3X — Core State Store
// Migration from BCO core/storage.js
// ONLY AP3X-relevant SSOT keys remain.
// Legacy keys (MODULES, ROLES, SESSIONS, USERS, LOGS) REMOVED.

import { StorageAdapter } from "./adapter.js";

// ─────────────────────────────────────────────
// AP3X SSOT KEYS — the only valid storage keys
// ─────────────────────────────────────────────

export const KEYS = {
  USER_STATE:   "ap3x_user_state",    // current user state snapshot
  ACTIONS:      "ap3x_actions",       // action output log
  EVENTS:       "ap3x_events",        // event log (state snapshots + triggered actions)
  ALERTS:       "ap3x_alerts",        // system alerts (non-medical, non-clinical)
};

// ─────────────────────────────────────────────
// STORAGE API
// ─────────────────────────────────────────────

export const store = {
  get(key)            { return StorageAdapter.get(key); },
  set(key, value)     { StorageAdapter.set(key, value); _rawLog("STATE_WRITE", { key }); },
  update(key, fn)     { StorageAdapter.update(key, fn); _rawLog("STATE_UPDATE", { key }); },
  delete(key)         { StorageAdapter.delete(key); _rawLog("STATE_DELETE", { key }); },
  subscribe(key, cb)  { return StorageAdapter.subscribe(key, cb); },
  subscribeAll(cb)    { return StorageAdapter.subscribeAll(cb); },
};

// ─────────────────────────────────────────────
// RAW LOG (cycle-safe internal writer)
// Do NOT call from outside — use logEvent() in events/log.js
// ─────────────────────────────────────────────

export function _rawLog(type, payload, source = "system") {
  const raw = StorageAdapter.get(KEYS.EVENTS) || [];
  raw.push({
    id: crypto.randomUUID(),
    type,
    payload,
    source,
    timestamp: new Date().toISOString()
  });
  StorageAdapter.set(KEYS.EVENTS, raw);
}

// ─────────────────────────────────────────────
// MIGRATION UTIL
// Purges all legacy BCO keys on first run
// ─────────────────────────────────────────────

export function migrateLegacyStorage() {
  const legacyPrefixes = ["bco_"];
  legacyPrefixes.forEach((prefix) => StorageAdapter.clear(prefix));
  console.log("[AP3X] Legacy BCO storage cleared.");
}
