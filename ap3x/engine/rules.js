// AP3X — State Evaluation Rules
// Pure function: reads state → returns action type.
// NO side effects. NO storage writes.
// This is the brain of the Action OS.

// ─────────────────────────────────────────────
// ACTION TYPE CONSTANTS
// ─────────────────────────────────────────────

export const ACTION_TYPES = {
  RESET:            "reset",
  FOCUS:            "focus",
  RECOVERY:         "recovery",
  EXECUTION:        "execution",
  REDUCE_COMPLEXITY:"reduce_complexity",
};

export const INTENSITY = {
  LOW:    "low",
  MEDIUM: "medium",
  HIGH:   "high",
};

// ─────────────────────────────────────────────
// RULE ENGINE
// evaluateState(state) → { primary, secondary? }
// Returns action type directives only — no content.
// ─────────────────────────────────────────────

/**
 * evaluateState(state)
 *
 * Rules (in priority order):
 * 1. stress_level > 7          → single reset action (highest priority)
 * 2. cognitive_load = "high"   → reduce complexity action
 * 3. energy_level < 3          → recovery action
 * 4. focus_level < 4           → activation/focus action
 * 5. Default / healthy state   → execution action
 *
 * Always returns ONE primary action.
 * May return ONE optional secondary support action.
 */
export function evaluateState(state) {
  const {
    stress_level,
    focus_level,
    energy_level,
    cognitive_load,
    clarity_level,
  } = state;

  // ── RULE 1: HIGH STRESS ───────────────────────
  // Overrides everything. Single reset action.
  if (stress_level > 7) {
    return {
      primary: {
        action_type:       ACTION_TYPES.RESET,
        intensity:         _stressIntensity(stress_level),
        priority_level:    "critical",
        triggered_by:      "stress_level > 7",
      },
      secondary: null,
    };
  }

  // ── RULE 2: HIGH COGNITIVE LOAD ──────────────
  if (cognitive_load === "high") {
    const primary = {
      action_type:    ACTION_TYPES.REDUCE_COMPLEXITY,
      intensity:      INTENSITY.HIGH,
      priority_level: "high",
      triggered_by:   "cognitive_load = high",
    };

    // Support: if also low focus, add a gentle focus secondary
    const secondary = focus_level < 4
      ? {
          action_type:    ACTION_TYPES.FOCUS,
          intensity:      INTENSITY.LOW,
          priority_level: "medium",
          triggered_by:   "focus_level < 4 (secondary support)",
        }
      : null;

    return { primary, secondary };
  }

  // ── RULE 3: LOW ENERGY ───────────────────────
  if (energy_level < 3) {
    return {
      primary: {
        action_type:    ACTION_TYPES.RECOVERY,
        intensity:      energy_level < 1 ? INTENSITY.HIGH : INTENSITY.MEDIUM,
        priority_level: "high",
        triggered_by:   "energy_level < 3",
      },
      secondary: null,
    };
  }

  // ── RULE 4: LOW FOCUS ────────────────────────
  if (focus_level < 4) {
    const primary = {
      action_type:    ACTION_TYPES.FOCUS,
      intensity:      focus_level < 2 ? INTENSITY.HIGH : INTENSITY.MEDIUM,
      priority_level: "medium",
      triggered_by:   "focus_level < 4",
    };

    // Support: if energy is also low-ish, suggest recovery
    const secondary = energy_level < 5
      ? {
          action_type:    ACTION_TYPES.RECOVERY,
          intensity:      INTENSITY.LOW,
          priority_level: "low",
          triggered_by:   "energy_level < 5 (secondary support)",
        }
      : null;

    return { primary, secondary };
  }

  // ── DEFAULT: EXECUTION STATE ─────────────────
  // State is healthy — output execution action
  const executionIntensity = _executionIntensity(energy_level, focus_level, clarity_level);
  return {
    primary: {
      action_type:    ACTION_TYPES.EXECUTION,
      intensity:      executionIntensity,
      priority_level: "normal",
      triggered_by:   "default execution state",
    },
    secondary: null,
  };
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function _stressIntensity(level) {
  if (level >= 9) return INTENSITY.HIGH;
  if (level >= 8) return INTENSITY.MEDIUM;
  return INTENSITY.LOW;
}

function _executionIntensity(energy, focus, clarity) {
  const score = (energy + focus) / 2;
  const clarityBoost = clarity === "high" ? 1 : clarity === "low" ? -1 : 0;
  const adjusted = score + clarityBoost;
  if (adjusted >= 8) return INTENSITY.HIGH;
  if (adjusted >= 5) return INTENSITY.MEDIUM;
  return INTENSITY.LOW;
}
