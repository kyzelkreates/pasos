// AP3X — Storage Adapter
// Migrated from BCO core/storage-adapter.js
// Keeps same LocalStorage + MemoryAdapter pattern.
// All legacy module/session/tenant/LMS keys REMOVED.
// Only AP3X state + action + event keys are valid.

const _subscribers = new Map();

function _notify(key, value) {
  _subscribers.get(key)?.forEach((fn) => fn(value));
  _subscribers.get("*")?.forEach((fn) => fn({ key, value }));
}

export const LocalStorageAdapter = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    _notify(key, value);
  },

  update(key, fn) {
    const current = this.get(key);
    const updated = fn(current);
    this.set(key, updated);
    return updated;
  },

  delete(key) {
    localStorage.removeItem(key);
    _notify(key, null);
  },

  keys(prefix = "") {
    return Object.keys(localStorage).filter((k) =>
      prefix ? k.startsWith(prefix) : true
    );
  },

  clear(prefix = "") {
    this.keys(prefix).forEach((k) => localStorage.removeItem(k));
  },

  subscribe(key, callback) {
    if (!_subscribers.has(key)) _subscribers.set(key, new Set());
    _subscribers.get(key).add(callback);

    const crossTabHandler = (event) => {
      if (event.key === key) {
        try { callback(JSON.parse(event.newValue)); } catch { callback(null); }
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", crossTabHandler);
    }

    return () => {
      _subscribers.get(key)?.delete(callback);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", crossTabHandler);
      }
    };
  },

  subscribeAll(callback) {
    return this.subscribe("*", callback);
  }
};

// In-memory adapter for non-browser / test environments
export const MemoryAdapter = {
  _store: new Map(),
  get(key)         { return this._store.get(key) ?? null; },
  set(key, value)  { this._store.set(key, value); _notify(key, value); },
  update(key, fn)  { const v = fn(this.get(key)); this.set(key, v); return v; },
  delete(key)      { this._store.delete(key); _notify(key, null); },
  keys(prefix = "") {
    return [...this._store.keys()].filter((k) => prefix ? k.startsWith(prefix) : true);
  },
  clear(prefix = "") { this.keys(prefix).forEach((k) => this._store.delete(k)); },
  subscribe(key, callback) {
    if (!_subscribers.has(key)) _subscribers.set(key, new Set());
    _subscribers.get(key).add(callback);
    return () => _subscribers.get(key)?.delete(callback);
  },
  subscribeAll(callback) { return this.subscribe("*", callback); }
};

export const StorageAdapter =
  typeof window !== "undefined" && typeof localStorage !== "undefined"
    ? LocalStorageAdapter
    : MemoryAdapter;
