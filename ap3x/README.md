# AP3X — Pure State Action OS

> A real-time decision + action guidance engine.
> It reads your state. It outputs your next action. Nothing else.

---

## What It Does

You tell AP3X how you feel right now — energy, stress, focus, cognitive load, clarity.

AP3X tells you exactly what to do next.

One action. Every time.

---

## What It Does NOT Do

- No courses
- No lessons
- No modules
- No learning paths
- No progression systems
- No multi-step curricula
- Not medical. Not clinical. Not therapeutic.

---

## How To Use

```
1. Open index.html
2. Set your current state using the sliders and buttons
3. Press "Get My Next Action"
4. Do the thing it says
```

---

## Quick Start (Dev)

```bash
# Serve from root (any static file server)
npx serve .
# or
python3 -m http.server 3000
```

Open `http://localhost:3000/ap3x/index.html`

---

## Core API

```js
import { initAP3X, runEngine, updateStateAndRun } from "./ap3x/index.js";

// Boot
initAP3X();

// Get current action output
const { state, primary, secondary } = runEngine();

// Update state + get new action
const result = updateStateAndRun({
  stress_level: 9,
  focus_level: 2,
});
// result.primary → { action_type: "reset", action_title: "Hard Reset", ... }
```

---

## State Model

| Field          | Type                          | Meaning               |
|----------------|-------------------------------|-----------------------|
| energy_level   | 0–10                          | Physical/mental energy|
| stress_level   | 0–10                          | Current stress        |
| focus_level    | 0–10                          | Attention bandwidth   |
| cognitive_load | low / medium / high           | Mental processing load|
| clarity_level  | low / medium / high           | Decision clarity      |

---

## Action Types

| Type              | When It Fires               |
|-------------------|-----------------------------|
| reset             | stress > 7                  |
| reduce_complexity | cognitive_load = high       |
| recovery          | energy < 3                  |
| focus             | focus < 4                   |
| execution         | healthy state (default)     |

---

## File Structure

```
ap3x/
├── index.html          ← Entry. Mount point.
├── index.js            ← Full API barrel
├── storage/            ← Adapter + SSOT store
├── core/               ← State model + init
├── engine/             ← Rules + action library + main loop
├── events/             ← Event log
├── ui/                 ← Renderer + CSS
└── pwa/                ← Manifest + service worker
```

---

## Migration From BCO

On boot, `initAP3X()` automatically:
- Purges all `bco_` localStorage keys
- Bootstraps fresh AP3X SSOT keys
- Logs SYSTEM_INIT event

Full migration is automatic. No manual steps.

---

## Safety Note

AP3X is a **productivity and personal assistance tool only**.
It is NOT a medical, diagnostic, clinical, or therapeutic system.
All outputs are guidance, not treatment.
