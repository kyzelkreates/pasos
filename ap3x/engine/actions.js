// AP3X — Action Output Engine
// Generates fully-formed action objects from rule directives.
// NOT a learning system. NOT a planning system.
// ONLY outputs: what to do next, right now.

import { ACTION_TYPES, INTENSITY } from "./rules.js";

// ─────────────────────────────────────────────
// ACTION LIBRARY
// Pure lookup. No state. No side effects.
// Each entry is keyed by action_type + intensity.
// ─────────────────────────────────────────────

const ACTION_LIBRARY = {

  // ── RESET ──────────────────────────────────
  reset: {
    low: {
      action_title:      "Micro Reset",
      description:       "Step away. Breathe slowly for 2 minutes.",
      duration_estimate: "2 min",
      cue:               "Close your eyes. Inhale 4 counts. Exhale 4 counts. Repeat.",
    },
    medium: {
      action_title:      "Full Stop Reset",
      description:       "Stop everything. Step away from the screen now.",
      duration_estimate: "5–10 min",
      cue:               "Walk away. Breathe. No phone. No tasks. Just decompress.",
    },
    high: {
      action_title:      "Hard Reset",
      description:       "Complete stop. Remove yourself from the current environment.",
      duration_estimate: "15–30 min",
      cue:               "Leave the space. Walk outside. No screens, no decisions.",
    },
  },

  // ── FOCUS ──────────────────────────────────
  focus: {
    low: {
      action_title:      "Gentle Activation",
      description:       "Clear your workspace. Set a single intention.",
      duration_estimate: "3 min",
      cue:               "Remove clutter. Write one sentence: what needs to happen right now.",
    },
    medium: {
      action_title:      "Focus Lock",
      description:       "Enter a distraction-free window. Single task only.",
      duration_estimate: "25 min block",
      cue:               "Close all tabs. Silence notifications. Pick ONE task. Start.",
    },
    high: {
      action_title:      "Deep Focus Protocol",
      description:       "Full isolation. Maximum cognitive input required.",
      duration_estimate: "45–90 min block",
      cue:               "No interruptions. Headphones. One file open. Execute.",
    },
  },

  // ── RECOVERY ───────────────────────────────
  recovery: {
    low: {
      action_title:      "Light Recharge",
      description:       "Short rest. Hydrate. Reduce output temporarily.",
      duration_estimate: "10 min",
      cue:               "Drink water. Sit back. Let your mind idle for a moment.",
    },
    medium: {
      action_title:      "Energy Recovery",
      description:       "Stop active work. Rest your body and mind.",
      duration_estimate: "20–30 min",
      cue:               "Lie down or sit quietly. No screens. Let your system recharge.",
    },
    high: {
      action_title:      "Full Recovery Mode",
      description:       "Suspend non-critical tasks. Prioritise restoration.",
      duration_estimate: "1–2 hours",
      cue:               "Sleep if possible. Otherwise completely disengage. This is not optional.",
    },
  },

  // ── REDUCE COMPLEXITY ──────────────────────
  reduce_complexity: {
    low: {
      action_title:      "Simplify",
      description:       "Cut the current task list in half. Do less.",
      duration_estimate: "5 min",
      cue:               "Look at your list. Cross out everything except the top 2 items.",
    },
    medium: {
      action_title:      "Context Collapse",
      description:       "Close everything. Reduce to one single visible task.",
      duration_estimate: "10 min",
      cue:               "One tab. One task. One outcome. Everything else can wait.",
    },
    high: {
      action_title:      "System Reduction",
      description:       "Stop all parallel work. Collapse to single-thread mode.",
      duration_estimate: "Until cognitive load drops",
      cue:               "Pick the single most important thing. Do only that. No multitasking.",
    },
  },

  // ── EXECUTION ──────────────────────────────
  execution: {
    low: {
      action_title:      "Steady Forward",
      description:       "Conditions are stable. Work at a comfortable pace.",
      duration_estimate: "Open-ended",
      cue:               "No urgency. Pick your next task and move through it steadily.",
    },
    medium: {
      action_title:      "Productive Window",
      description:       "You're in a solid state. Use this time well.",
      duration_estimate: "30–60 min",
      cue:               "This is a good window. Take on something meaningful. Execute.",
    },
    high: {
      action_title:      "Peak Execution",
      description:       "Optimal state. Attack your highest-value work now.",
      duration_estimate: "60–90 min",
      cue:               "You're at peak. Tackle your hardest or most important task immediately.",
    },
  },
};

// ─────────────────────────────────────────────
// ACTION FACTORY
// ─────────────────────────────────────────────

/**
 * buildAction(directive)
 * Takes a rule directive { action_type, intensity, priority_level, triggered_by }
 * Returns a full action object.
 */
export function buildAction(directive) {
  if (!directive) return null;

  const { action_type, intensity, priority_level, triggered_by } = directive;
  const library = ACTION_LIBRARY[action_type]?.[intensity]
    || ACTION_LIBRARY[action_type]?.[INTENSITY.MEDIUM]
    || { action_title: "Pause", description: "Take a moment.", duration_estimate: "5 min", cue: "Breathe." };

  return {
    action_id:         crypto.randomUUID(),
    action_title:      library.action_title,
    action_type,
    intensity,
    description:       library.description,
    duration_estimate: library.duration_estimate,
    cue:               library.cue,
    priority_level:    priority_level || "normal",
    triggered_by,
    timestamp:         new Date().toISOString(),
  };
}

/**
 * buildActionPair(evalResult)
 * Takes evaluateState() output → returns { primary, secondary }
 * as full action objects.
 */
export function buildActionPair(evalResult) {
  return {
    primary:   buildAction(evalResult.primary),
    secondary: buildAction(evalResult.secondary),
  };
}
