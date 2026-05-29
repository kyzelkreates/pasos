# AP3X — Pure State Action OS
## Architecture Document

---

## What This Is

AP3X is a **real-time decision + action guidance engine**.

It reads the user's current state. It interprets that state. It outputs exactly one next action.

Nothing else.

---

## What This Is NOT

- NOT a learning system
- NOT a course or lesson system
- NOT a planning or goal-tracking system
- NOT a multi-step guided curriculum
- NOT medical, diagnostic, or clinical

---

## Core Loop

```
USER STATE
    ↓
RULE ENGINE  (evaluateState)
    ↓
ACTION OUTPUT  (buildActionPair)
    ↓
EVENT LOG  (logEvent)
    ↓
UI RENDER  (renderOutput)
```

One loop. No branches. No module routing.

---

## Folder Structure

```
ap3x/
├── index.html                  ← Entry point. Single screen.
├── index.js                    ← Full public API barrel
│
├── storage/
│   ├── adapter.js              ← LocalStorage + Memory adapter (from BCO)
│   └── store.js                ← SSOT — AP3X keys only. Legacy BCO keys purged.
│
├── core/
│   ├── state.js                ← User state model + read/write
│   └── init.js                 ← Boot sequence (migration + SSOT init)
│
├── engine/
│   ├── rules.js                ← State → action type (pure function)
│   ├── actions.js              ← Action library + object factory
│   └── index.js                ← runEngine() — the main loop
│
├── events/
│   └── log.js                  ← Event log (audit trail of state + actions)
│
├── ui/
│   ├── app.css                 ← Single-screen styles. Dark. Minimal.
│   └── renderer.js             ← DOM renderer. Read-only. No state mutations.
│
└── pwa/
    ├── manifest.json           ← PWA manifest
    └── sw.js                   ← Service worker (offline cache)
```

---

## Data Models

### User State
```js
{
  energy_level:   0–10,          // physical/mental energy
  stress_level:   0–10,          // perceived stress
  focus_level:    0–10,          // attention bandwidth
  cognitive_load: "low"|"medium"|"high",
  clarity_level:  "low"|"medium"|"high",
}
```

### Action Output
```js
{
  action_id:         "uuid",
  action_title:      "string",
  action_type:       "reset"|"focus"|"recovery"|"execution"|"reduce_complexity",
  intensity:         "low"|"medium"|"high",
  description:       "string",
  cue:               "string",        // the actual instruction
  duration_estimate: "string",
  priority_level:    "critical"|"high"|"medium"|"normal"|"low",
  triggered_by:      "string",        // which rule fired
  timestamp:         "ISO string",
}
```

### Event Record
```js
{
  id:        "uuid",
  type:      "ENGINE_RUN"|"STATE_SNAPSHOT"|"SYSTEM_INIT"|...,
  payload:   { state_snapshot, triggered_action, ... },
  source:    "user"|"system",
  timestamp: "ISO string",
}
```

---

## State Evaluation Rules (Priority Order)

| Priority | Condition              | Output                 |
|----------|------------------------|------------------------|
| 1 (HIGH) | stress_level > 7       | Reset action           |
| 2        | cognitive_load = high  | Reduce Complexity      |
| 3        | energy_level < 3       | Recovery action        |
| 4        | focus_level < 4        | Focus/Activation       |
| 5 (DEF)  | Otherwise              | Execution action       |

Secondary actions are optional, only added when a second condition also fires alongside the primary.

---

## Storage Keys (SSOT)

Only four keys exist. All others from BCO are purged on init.

```
ap3x_user_state    — current state snapshot
ap3x_actions       — action output log (last 100)
ap3x_events        — event audit log (last 500)
ap3x_alerts        — system alerts
```

---

## Architecture Invariants (Preserved from BCO Run 0)

- **SSOT** — one state store. No duplicates.
- **Storage abstraction** — swappable adapter (LocalStorage → Supabase future)
- **UI is read-only** — renderer never mutates state directly
- **No circular deps** — rawLog() breaks events↔storage cycle
- **Safety gate** — non-medical, non-clinical, productivity only

---

## Removed from BCO

All of the following are fully deleted/disabled:

- modules/ (module registry, module rules, module SSOT)
- agents/ (agent-core, planner, coordinator, self-optimise)
- ai/ (insight engine, patterns, forecasting, risk)
- saas/ (tenants, billing, marketplace)
- ecosystem/ (registry, install engine)
- governance/ (audit, compliance, autonomy-control)
- nocode/ (workflow engine, templates, scheduler)
- auth/permissions (roles)
- brand/brand-engine
- pwa/pwa.js (replaced with sw.js)
- All SSOT keys: bco_modules, bco_users, bco_roles, bco_sessions, bco_logs

---

## Migration Plan

On first `initAP3X()` call:
1. All `bco_` prefixed localStorage keys are cleared via `migrateLegacyStorage()`
2. AP3X SSOT keys bootstrapped with defaults
3. SYSTEM_INIT event logged

No data needs to be migrated — BCO state is incompatible with AP3X state model.
