const STORAGE_KEY = "neowatch.watchlist";

/**
 * A persistent set of asteroid ids the user has starred, backed by
 * localStorage so it survives reloads. Every toggle dispatches a
 * "watchlist:change" event on `document` so any page section (e.g. the
 * tracker's "Watchlist only" filter) can react without tight coupling.
 */
export class Watchlist {
  #ids;

  constructor() {
    try {
      this.#ids = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []);
    } catch {
      this.#ids = new Set(); // corrupted storage — start fresh
    }
  }

  has(id) {
    return this.#ids.has(String(id));
  }

  get size() {
    return this.#ids.size;
  }

  /** Add/remove an id. Returns the new watched state. */
  toggle(id) {
    id = String(id);
    this.#ids.has(id) ? this.#ids.delete(id) : this.#ids.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.#ids]));
    const watched = this.#ids.has(id);
    document.dispatchEvent(
      new CustomEvent("watchlist:change", { detail: { id, watched } })
    );
    return watched;
  }
}
