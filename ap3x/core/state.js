// AP3X — User State Model
// Defines the canonical USER STATE schema.
// This is the ONLY data model. No modules, courses, lessons, or progressions.

import { store, KEYS, _rawLog } from "../storage/store.js";

// ─────────────────────────────────────────────
// STATE SCHEMA
// ─────────────────────────────────────────────

/**
 * Default user state.
 * All values represent real-time conditions — not history, not goals.
 *
 * energy_level:    0–10  (physical/mental energy available)
 * stress_level:    0–10  (current perceived stress)
 * focus_level:     0–10  (current attention bandwidth)
 * cognitive_load:  "low" | "medium" | "high"  (mental processing load)
 * clarity_level:   "low" | "medium" | "high"  (decision-making clarity)
 */
export const DEFAULT_STATE = {
  energy_level:   5,
  stress_level:   3,
  focus_level:    5,
  cognitive_load: "medium",
  clarity_level:  "medium",
};

// ─────────────────────────────────────────────
// STATE READERS
// ─────────────────────────────────────────────

export function getState() {
  return store.get(KEYS.USER_STATE) || { ...DEFAULT_STATE };
}

// ─────────────────────────────────────────────
// STATE WRITERS
// All writes log a STATE_SNAPSHOT event
// ─────────────────────────────────────────────

/**
 * setState(partial)
 * Merges partial updates into current state.
 * Validates all values before writing.
 */
export function setState(partial) {
  const current = getState();
  const validated = _validateState({ ...current, ...partial });
  store.set(KEYS.USER_STATE, validated);

  _rawLog("STATE_SNAPSHOT", { state: validated }, "user");
  return validated;
}

/**
 * resetState()
 * Returns state to defaults.
 */
export function resetState() {
  store.set(KEYS.USER_STATE, { ...DEFAULT_STATE });
  _rawLog("STATE_RESET", { state: DEFAULT_STATE }, "system");
  return { ...DEFAULT_STATE };
}

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────

function _validateState(state) {
  return {
    energy_level:   _clamp(state.energy_level, 0, 10),
    stress_level:   _clamp(state.stress_level, 0, 10),
    focus_level:    _clamp(state.focus_level, 0, 10),
    cognitive_load: _oneOf(state.cognitive_load, ["low", "medium", "high"], "medium"),
    clarity_level:  _oneOf(state.clarity_level,  ["low", "medium", "high"], "medium"),
  };
}

function _clamp(val, min, max) {
  const n = Number(val);
  if (isNaN(n)) return Math.floor((min + max) / 2);
  return Math.min(max, Math.max(min, n));
}

function _oneOf(val, options, fallback) {
  return options.includes(val) ? val : fallback;
}

// ─────────────────────────────────────────────
// SUBSCRIPTIONS
// ─────────────────────────────────────────────

export function subscribeState(callback) {
  return store.subscribe(KEYS.USER_STATE, callback);
}
