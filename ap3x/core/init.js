// AP3X — System Initialisation
// Migrated from BCO core/init.js
// Removed: module hydration, tenant init, role bootstrap.
// AP3X init: storage migration → SSOT bootstrap → ready.

import { store, KEYS, migrateLegacyStorage } from "../storage/store.js";
import { logEvent } from "../events/log.js";
import { DEFAULT_STATE } from "./state.js";

let _initialised = false;

/**
 * initAP3X()
 * Boot sequence:
 * 1. Purge legacy BCO storage
 * 2. Bootstrap SSOT keys
 * 3. Log SYSTEM_INIT event
 */
export function initAP3X() {
  if (_initialised) return;

  // Step 1 — Clear legacy BCO keys
  migrateLegacyStorage();

  // Step 2 — Bootstrap SSOT keys if not present
  if (!store.get(KEYS.USER_STATE)) {
    store.set(KEYS.USER_STATE, { ...DEFAULT_STATE });
  }
  if (!store.get(KEYS.ACTIONS)) {
    store.set(KEYS.ACTIONS, []);
  }
  if (!store.get(KEYS.EVENTS)) {
    store.set(KEYS.EVENTS, []);
  }
  if (!store.get(KEYS.ALERTS)) {
    store.set(KEYS.ALERTS, []);
  }

  // Step 3 — Log init event
  logEvent("SYSTEM_INIT", {
    mode: "AP3X",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });

  _initialised = true;
  console.log("[AP3X] System initialised.");
}
