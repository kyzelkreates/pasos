// AP3X — Event Log
// Migrated from BCO core/events.js
// Stripped of module system, rule evaluation pipeline.
// AP3X events are pure audit records: state snapshot + triggered action.

import { store, KEYS, _rawLog } from "../storage/store.js";

// ─────────────────────────────────────────────
// EVENT FACTORY
// ─────────────────────────────────────────────

export function createEvent(type, payload, source = "system") {
  return {
    id:        crypto.randomUUID(),
    type,
    payload,
    source,
    timestamp: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────
// LOG (external callers)
// ─────────────────────────────────────────────

export function logEvent(type, payload, source = "system") {
  const event = createEvent(type, payload, source);
  const events = store.get(KEYS.EVENTS) || [];
  events.push(event);
  // Retain last 500 events
  store.set(KEYS.EVENTS, events.slice(-500));
  return event;
}

// ─────────────────────────────────────────────
// READERS
// ─────────────────────────────────────────────

export function getEvents(limit = 50) {
  const all = store.get(KEYS.EVENTS) || [];
  return all.slice(-limit).reverse();
}

export function getEventsByType(type, limit = 20) {
  const all = store.get(KEYS.EVENTS) || [];
  return all.filter((e) => e.type === type).slice(-limit).reverse();
}
