// AP3X — Action Engine (Main Entry)
// Composes state → rules → actions into a single call.
// This is the core loop of the entire system.

import { getState, setState, subscribeState } from "../core/state.js";
import { evaluateState } from "./rules.js";
import { buildActionPair } from "./actions.js";
import { logEvent } from "../events/log.js";
import { store, KEYS } from "../storage/store.js";

// ─────────────────────────────────────────────
// CORE LOOP
// ─────────────────────────────────────────────

/**
 * runEngine()
 * Reads current state → evaluates rules → builds actions → logs event.
 * Returns { state, primary, secondary }
 *
 * This is the ONLY function UI should call to get output.
 */
export function runEngine() {
  const state = getState();
  const evaluation = evaluateState(state);
  const { primary, secondary } = buildActionPair(evaluation);

  // Persist action to log
  _persistActions(primary, secondary);

  // Log the event
  logEvent("ENGINE_RUN", {
    state_snapshot: state,
    triggered_action: primary?.action_id,
    secondary_action: secondary?.action_id || null,
  });

  return { state, primary, secondary };
}

/**
 * updateStateAndRun(partial)
 * Merges partial state update, then immediately runs the engine.
 * Returns full engine output.
 */
export function updateStateAndRun(partial) {
  setState(partial);
  return runEngine();
}

// ─────────────────────────────────────────────
// SUBSCRIPTION
// ─────────────────────────────────────────────

/**
 * onStateChange(callback)
 * Subscribes to state changes. Automatically re-runs engine on change.
 * callback receives { state, primary, secondary }
 */
export function onStateChange(callback) {
  return subscribeState(() => {
    const result = runEngine();
    callback(result);
  });
}

// ─────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────

function _persistActions(primary, secondary) {
  const actions = store.get(KEYS.ACTIONS) || [];
  if (primary)   actions.push(primary);
  if (secondary) actions.push(secondary);
  // Keep only last 100 actions
  store.set(KEYS.ACTIONS, actions.slice(-100));
}
