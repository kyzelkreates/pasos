// AP3X — Single Import Barrel
// Full public API surface.
// All legacy BCO exports REMOVED.
// Import from here, never from individual files.

// ── Storage ──────────────────────────────────
export { StorageAdapter, LocalStorageAdapter, MemoryAdapter } from "./storage/adapter.js";
export { store, KEYS, _rawLog, migrateLegacyStorage }         from "./storage/store.js";

// ── Core State ───────────────────────────────
export { getState, setState, resetState, subscribeState, DEFAULT_STATE } from "./core/state.js";

// ── Engine ───────────────────────────────────
export { evaluateState, ACTION_TYPES, INTENSITY }              from "./engine/rules.js";
export { buildAction, buildActionPair }                        from "./engine/actions.js";
export { runEngine, updateStateAndRun, onStateChange }         from "./engine/index.js";

// ── Events ───────────────────────────────────
export { createEvent, logEvent, getEvents, getEventsByType }   from "./events/log.js";

// ── Init ─────────────────────────────────────
export { initAP3X }                                            from "./core/init.js";

// ── UI ───────────────────────────────────────
export { mountApp }                                            from "./ui/renderer.js";
