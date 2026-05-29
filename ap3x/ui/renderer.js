// AP3X — UI Renderer
// Reads state + action output. Renders single-screen UI.
// Rule 7 preserved: UI reads state, never mutates it directly.
// NO nav, NO module list, NO course hierarchy, NO lessons.

import { getState } from "../core/state.js";
import { runEngine, updateStateAndRun, onStateChange } from "../engine/index.js";

// ─────────────────────────────────────────────
// MOUNT
// ─────────────────────────────────────────────

/**
 * mountApp(mountEl)
 * Renders the full single-screen UI.
 * Call once on startup.
 */
export function mountApp(mountEl) {
  if (!mountEl) throw new Error("[AP3X] Mount element not found.");

  mountEl.innerHTML = _buildShell();
  _attachClock();
  _attachControls();
  _bindStateSubscription();

  // Initial render
  const result = runEngine();
  _renderOutput(result);
}

// ─────────────────────────────────────────────
// HTML SHELL
// ─────────────────────────────────────────────

function _buildShell() {
  const state = getState();

  return `
    <!-- HEADER -->
    <header class="ap3x-header">
      <div class="ap3x-wordmark">AP<span>3</span>X</div>
      <div class="ap3x-time" id="ap3x-clock">--:--</div>
    </header>

    <!-- STATE METERS -->
    <section class="ap3x-state-meters" aria-label="Current State">
      <div class="ap3x-state-meters__title">Current State</div>
      ${_buildNumericMeter("energy_level",  "Energy",        state.energy_level,  10)}
      ${_buildNumericMeter("stress_level",  "Stress",        state.stress_level,  10)}
      ${_buildNumericMeter("focus_level",   "Focus",         state.focus_level,   10)}
      ${_buildCategoricalMeter("cognitive_load", "Cog. Load",   state.cognitive_load)}
      ${_buildCategoricalMeter("clarity_level",  "Clarity",     state.clarity_level)}
    </section>

    <!-- PRIMARY ACTION CARD -->
    <div id="ap3x-primary-card" role="main" aria-live="polite"></div>

    <!-- SECONDARY ACTION -->
    <div id="ap3x-secondary-card" aria-live="polite"></div>

    <!-- CONTROLS -->
    <section class="ap3x-controls" aria-label="Update State">
      <div class="ap3x-controls__title">Update Your State</div>
      ${_buildSlider("energy_level", "Energy",       state.energy_level)}
      ${_buildSlider("stress_level", "Stress",       state.stress_level)}
      ${_buildSlider("focus_level",  "Focus",        state.focus_level)}
      <div class="ap3x-slider-group">
        <div class="ap3x-slider-group__header">
          <span class="ap3x-slider-group__label">Cognitive Load</span>
        </div>
        ${_buildTagGroup("cognitive_load", ["low","medium","high"], state.cognitive_load)}
      </div>
      <div class="ap3x-slider-group">
        <div class="ap3x-slider-group__header">
          <span class="ap3x-slider-group__label">Clarity</span>
        </div>
        ${_buildTagGroup("clarity_level", ["low","medium","high"], state.clarity_level)}
      </div>
      <button class="ap3x-run-btn" id="ap3x-run-btn">Get My Next Action</button>
    </section>

    <!-- FOOTER -->
    <footer class="ap3x-footer">
      AP3X is a productivity guidance tool. Not medical or clinical advice.
    </footer>
  `;
}

// ─────────────────────────────────────────────
// RENDER OUTPUT
// ─────────────────────────────────────────────

function _renderOutput({ primary, secondary }) {
  // Primary card
  const primaryEl = document.getElementById("ap3x-primary-card");
  if (primaryEl && primary) {
    primaryEl.innerHTML = _buildPrimaryCard(primary);
  }

  // Secondary card
  const secondaryEl = document.getElementById("ap3x-secondary-card");
  if (secondaryEl) {
    if (secondary) {
      secondaryEl.innerHTML = _buildSecondaryCard(secondary);
      secondaryEl.classList.remove("ap3x-hidden");
    } else {
      secondaryEl.innerHTML = "";
      secondaryEl.classList.add("ap3x-hidden");
    }
  }

  // Update meters to reflect current state
  _refreshMeters();
}

// ─────────────────────────────────────────────
// CARD BUILDERS
// ─────────────────────────────────────────────

function _buildPrimaryCard(action) {
  return `
    <div class="ap3x-action-card" data-type="${action.action_type}">
      <div class="ap3x-action-card__label">
        <span class="ap3x-action-card__type-badge">${_formatType(action.action_type)}</span>
        <span class="ap3x-action-card__intensity">${action.intensity} intensity</span>
        <span class="ap3x-action-card__duration">${action.duration_estimate}</span>
      </div>
      <div class="ap3x-action-card__title">${action.action_title}</div>
      <div class="ap3x-action-card__description">${action.description}</div>
      <div class="ap3x-action-card__cue">${action.cue}</div>
    </div>
  `;
}

function _buildSecondaryCard(action) {
  const colorMap = {
    reset:            "var(--color-reset)",
    focus:            "var(--color-focus)",
    recovery:         "var(--color-recovery)",
    execution:        "var(--color-execution)",
    reduce_complexity:"var(--color-reduce)",
  };
  const color = colorMap[action.action_type] || "var(--color-accent)";

  return `
    <div class="ap3x-secondary-action" style="--action-color: ${color}">
      <div class="ap3x-secondary-action__dot"></div>
      <div class="ap3x-secondary-action__body">
        <div class="ap3x-secondary-action__title">${action.action_title}</div>
        <div class="ap3x-secondary-action__desc">${action.description}</div>
      </div>
      <div class="ap3x-secondary-action__duration">${action.duration_estimate}</div>
    </div>
  `;
}

// ─────────────────────────────────────────────
// METER BUILDERS
// ─────────────────────────────────────────────

function _buildNumericMeter(field, label, value, max) {
  const pct = Math.round((value / max) * 100);
  return `
    <div class="ap3x-meter" data-field="${field}">
      <span class="ap3x-meter__label">${label}</span>
      <div class="ap3x-meter__bar-track">
        <div class="ap3x-meter__bar-fill" style="width: ${pct}%"></div>
      </div>
      <span class="ap3x-meter__value">${value}</span>
    </div>
  `;
}

function _buildCategoricalMeter(field, label, value) {
  const opts = ["low", "medium", "high"];
  const tags = opts.map((o) =>
    `<span class="ap3x-meter__tag${o === value ? " active" : ""}">${o}</span>`
  ).join("");
  return `
    <div class="ap3x-meter" data-field="${field}">
      <span class="ap3x-meter__label">${label}</span>
      <div class="ap3x-meter__tags">${tags}</div>
    </div>
  `;
}

// ─────────────────────────────────────────────
// CONTROL BUILDERS
// ─────────────────────────────────────────────

function _buildSlider(field, label, value) {
  return `
    <div class="ap3x-slider-group">
      <div class="ap3x-slider-group__header">
        <span class="ap3x-slider-group__label">${label}</span>
        <span class="ap3x-slider-group__val" id="val-${field}">${value}</span>
      </div>
      <input
        type="range"
        class="ap3x-slider"
        id="slider-${field}"
        data-field="${field}"
        min="0" max="10" step="1"
        value="${value}"
      >
    </div>
  `;
}

function _buildTagGroup(field, options, current) {
  return `
    <div class="ap3x-tag-group" data-field="${field}">
      ${options.map((o) => `
        <button
          class="ap3x-tag-btn${o === current ? " active" : ""}"
          data-field="${field}"
          data-value="${o}"
        >${o}</button>
      `).join("")}
    </div>
  `;
}

// ─────────────────────────────────────────────
// LIVE METER REFRESH (after state changes)
// ─────────────────────────────────────────────

function _refreshMeters() {
  const state = getState();
  const numericFields = ["energy_level","stress_level","focus_level"];
  const catFields     = ["cognitive_load","clarity_level"];

  numericFields.forEach((field) => {
    const meterEl = document.querySelector(`.ap3x-meter[data-field="${field}"]`);
    if (!meterEl) return;
    const fill  = meterEl.querySelector(".ap3x-meter__bar-fill");
    const label = meterEl.querySelector(".ap3x-meter__value");
    if (fill)  fill.style.width = `${Math.round((state[field] / 10) * 100)}%`;
    if (label) label.textContent = state[field];
  });

  catFields.forEach((field) => {
    const meterEl = document.querySelector(`.ap3x-meter[data-field="${field}"]`);
    if (!meterEl) return;
    meterEl.querySelectorAll(".ap3x-meter__tag").forEach((tag) => {
      tag.classList.toggle("active", tag.textContent === state[field]);
    });
  });
}

// ─────────────────────────────────────────────
// CONTROLS WIRING
// ─────────────────────────────────────────────

function _attachControls() {
  // Sliders
  document.querySelectorAll(".ap3x-slider").forEach((slider) => {
    slider.addEventListener("input", (e) => {
      const field = e.target.dataset.field;
      const val   = Number(e.target.value);
      const valEl = document.getElementById(`val-${field}`);
      if (valEl) valEl.textContent = val;
    });
  });

  // Tag buttons
  document.querySelectorAll(".ap3x-tag-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const { field, value } = e.target.dataset;
      document.querySelectorAll(`.ap3x-tag-btn[data-field="${field}"]`)
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
    });
  });

  // Run button
  const runBtn = document.getElementById("ap3x-run-btn");
  if (runBtn) {
    runBtn.addEventListener("click", () => {
      const partial = _collectControlState();
      const result  = updateStateAndRun(partial);
      _renderOutput(result);
      _syncControlsToState(result.state);
    });
  }
}

function _collectControlState() {
  const partial = {};

  // Numeric sliders
  document.querySelectorAll(".ap3x-slider").forEach((slider) => {
    partial[slider.dataset.field] = Number(slider.value);
  });

  // Active tag buttons
  document.querySelectorAll(".ap3x-tag-group").forEach((group) => {
    const field  = group.dataset.field;
    const active = group.querySelector(".ap3x-tag-btn.active");
    if (active) partial[field] = active.dataset.value;
  });

  return partial;
}

function _syncControlsToState(state) {
  document.querySelectorAll(".ap3x-slider").forEach((slider) => {
    const field = slider.dataset.field;
    if (state[field] !== undefined) {
      slider.value = state[field];
      const valEl = document.getElementById(`val-${field}`);
      if (valEl) valEl.textContent = state[field];
    }
  });
}

// ─────────────────────────────────────────────
// LIVE SUBSCRIPTION
// ─────────────────────────────────────────────

function _bindStateSubscription() {
  onStateChange((result) => {
    _renderOutput(result);
  });
}

// ─────────────────────────────────────────────
// CLOCK
// ─────────────────────────────────────────────

function _attachClock() {
  const clockEl = document.getElementById("ap3x-clock");
  if (!clockEl) return;

  const tick = () => {
    clockEl.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit"
    });
  };
  tick();
  setInterval(tick, 1000);
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function _formatType(type) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
