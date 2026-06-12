/**
 * Renders Asteroid cards into a container element and owns the three required
 * UI states (loading / error / empty).
 *
 * Each card is a 3D flip card: the front shows headline stats and a "View
 * details" button; clicking it flips the card horizontally to reveal the full
 * data on the back. If an `api` is supplied, the back face also lazily loads
 * extra orbital data from the lookup endpoint (once per card).
 *
 * Used by both the Home page and the Live Tracker.
 */
export class CardGrid {
  #timers = new WeakMap(); // per-card timers that release the animated height

  /**
   * @param {HTMLElement} container
   * @param {{ api?: import("./api.js").NeoApi, watchlist?: import("./watchlist.js").Watchlist }} [options]
   */
  constructor(container, { api = null, watchlist = null } = {}) {
    this.container = container;
    this.api = api;
    this.watchlist = watchlist;
    // One delegated listener survives the innerHTML swaps in render().
    this.container.addEventListener("click", (e) => this.#onClick(e));
  }

  renderLoading(count = 6) {
    this.container.innerHTML = Array.from({ length: count })
      .map(() => `<div class="card-skel" aria-hidden="true"></div>`)
      .join("");
  }

  renderError(message) {
    this.container.innerHTML = `
      <div class="grid-state grid-state--error">
        <span class="grid-state__icon">⚠️</span>
        <p>${message}</p>
        <button class="btn btn-outline-light btn-sm" data-retry>Try again</button>
      </div>`;
  }

  renderEmpty(message = "No asteroids match your filters.") {
    this.container.innerHTML = `
      <div class="grid-state grid-state--empty">
        <span class="grid-state__icon">🔭</span>
        <p>${message}</p>
      </div>`;
  }

  render(asteroids) {
    if (!asteroids.length) return this.renderEmpty();
    this.container.innerHTML = asteroids.map((a) => this.#card(a)).join("");
  }

  /* ------------------------------------------------------------ flip logic -- */

  #onClick(e) {
    const star = e.target.closest("[data-action='star']");
    if (star && this.watchlist) {
      const watched = this.watchlist.toggle(star.closest(".flip").dataset.id);
      star.classList.toggle("is-on", watched);
      star.setAttribute("aria-pressed", String(watched));
      star.textContent = watched ? "★" : "☆";
      return;
    }
    // e.detail === 0 means the click came from the keyboard (Enter/Space) —
    // only then do we move focus, so mouse users keep pure hover behaviour.
    const viaKeyboard = e.detail === 0;
    const flipBtn = e.target.closest("[data-action='flip']");
    if (flipBtn) return this.#setFlipped(flipBtn.closest(".flip"), true, viaKeyboard);
    const backBtn = e.target.closest("[data-action='unflip']");
    if (backBtn) return this.#setFlipped(backBtn.closest(".flip"), false, viaKeyboard);
  }

  #setFlipped(flipEl, flipped, viaKeyboard = false) {
    if (!flipEl) return;
    const inner = flipEl.querySelector(".flip__inner");
    const front = flipEl.querySelector(".flip__front");
    const back = flipEl.querySelector(".flip__back");

    clearTimeout(this.#timers.get(flipEl));

    // Lock the current height, then animate to the face we're about to show:
    // the front sizes to its own (compact) content, the back to its full data.
    inner.style.height = `${inner.offsetHeight}px`;
    void inner.offsetHeight; // reflow so the start height "sticks" for the transition

    flipEl.classList.toggle("is-flipped", flipped);
    front.setAttribute("aria-hidden", String(flipped));
    back.setAttribute("aria-hidden", String(!flipped));

    if (flipped) {
      this.#loadOrbital(flipEl);
      inner.style.height = `${back.scrollHeight}px`;
      if (viaKeyboard) back.querySelector("[data-action='unflip']")?.focus();
    } else {
      inner.style.height = `${front.scrollHeight}px`;
      if (viaKeyboard) {
        front.querySelector("[data-action='flip']")?.focus();
      } else if (flipEl.contains(document.activeElement)) {
        // Drop any click-residue focus so :focus-within doesn't pin the
        // front's reveal panel open — mouse users collapse on mouse-out.
        document.activeElement.blur();
      }
      // Once shrunk, release the fixed height so hover can grow the front again.
      this.#timers.set(flipEl, setTimeout(() => (inner.style.height = ""), 500));
    }
  }

  /** Fetch extra detail for the back face (orbital data + close-approach
   *  history) — only once per card. The rows/space are already reserved in
   *  #card, so this only fills in content and never resizes the card; the
   *  values just fade in when they arrive. */
  async #loadOrbital(flipEl) {
    const slot = flipEl.querySelector("[data-orbital]");
    const history = flipEl.querySelector("[data-history]");
    if (!this.api || !slot || slot.dataset.loaded) return;
    slot.dataset.loaded = "1";

    let values;
    let approaches = null;
    try {
      const data = await this.api.lookup(flipEl.dataset.id);
      const orbit = data.orbital_data ?? {};
      values = {
        class: orbit.orbit_class?.orbit_class_type ?? "—",
        seen: orbit.first_observation_date ?? "—",
        period: orbit.orbital_period ? `${Math.round(orbit.orbital_period)} d` : "—",
      };
      approaches = data.close_approach_data ?? [];
    } catch {
      delete slot.dataset.loaded; // allow a later flip to retry the fetch
      values = { class: "n/a", seen: "n/a", period: "n/a" };
    }

    for (const [field, value] of Object.entries(values)) {
      const dd = slot.querySelector(`[data-field="${field}"]`);
      if (dd) {
        dd.textContent = value;
        dd.classList.remove("pending");
      }
    }
    if (history) {
      history.innerHTML = approaches
        ? this.#historyRows(approaches)
        : `<li><span>unavailable</span></li>`;
    }
  }

  /** Compact timeline: the 2 most recent past + 2 next future Earth passes. */
  #historyRows(approaches) {
    const today = new Date().toISOString().slice(0, 10);
    const earth = approaches.filter((c) => c.orbiting_body === "Earth");
    const past = earth.filter((c) => c.close_approach_date < today).slice(-2);
    const future = earth.filter((c) => c.close_approach_date >= today).slice(0, 2);

    const rows = [
      ...past.map((c) => this.#historyRow(c, "is-past")),
      ...future.map((c, i) => this.#historyRow(c, i === 0 ? "is-next" : "")),
    ];
    return rows.length ? rows.join("") : `<li><span>No other Earth passes on record</span></li>`;
  }

  #historyRow(c, cls) {
    const ld = Number(c.miss_distance.lunar).toFixed(1);
    const tag = cls === "is-next" ? `<em>next</em>` : "";
    return `<li class="${cls}"><span>${c.close_approach_date} ${tag}</span><span>${ld} LD</span></li>`;
  }

  /* ---------------------------------------------------------------- markup -- */

  #card(a) {
    const hazard = a.isHazardous ? "card--hazard" : "";
    const orbitalSlot = this.api
      ? `<dl class="card-neo__stats card-neo__stats--orbital" data-orbital>
           <div><dt>Orbit class</dt><dd data-field="class" class="pending">—</dd></div>
           <div><dt>First seen</dt><dd data-field="seen" class="pending">—</dd></div>
           <div><dt>Orbital period</dt><dd data-field="period" class="pending">—</dd></div>
         </dl>
         <div class="card-neo__history">
           <span class="history-label">Earth close approaches</span>
           <ul class="history-list" data-history>
             <li class="pending"><span>loading…</span></li>
           </ul>
         </div>`
      : "";

    const watched = this.watchlist?.has(a.id);
    const star = this.watchlist
      ? `<button type="button" class="star-btn ${watched ? "is-on" : ""}" data-action="star"
           aria-pressed="${watched}" aria-label="Toggle watchlist" title="Watchlist">${watched ? "★" : "☆"}</button>`
      : "";

    return `
      <div class="flip" data-id="${a.id}">
        <div class="flip__inner">
          <article class="card-neo flip__face flip__front ${hazard}">
            <header class="card-neo__head">
              <h3 class="card-neo__name">${a.name}</h3>
              <div class="card-neo__tools">
                ${a.isHazardous ? `<span class="badge-hazard">Hazardous</span>` : ""}
                ${star}
              </div>
            </header>
            <dl class="card-neo__stats">
              <div><dt>Diameter</dt><dd>${this.#fmt(a.diameterMeters)} m</dd></div>
              <div><dt>Miss dist.</dt><dd>${a.missDistanceLunar.toFixed(1)} LD</dd></div>
              <div><dt>Speed</dt><dd>${this.#fmt(a.velocityKmh)} km/h</dd></div>
              <div><dt>Approach</dt><dd>${a.approachDate}</dd></div>
            </dl>
            <p class="card-neo__compare">📏 ${a.sizeComparison}</p>
            <div class="card-neo__reveal">
              <span class="meter-label">Danger index: ${a.dangerScore}/100</span>
              <div class="meter"><span class="meter__bar" style="--val:${a.dangerScore}%"></span></div>
              <button type="button" class="btn btn-sm btn-light card-neo__details" data-action="flip">
                View details ↻
              </button>
            </div>
          </article>

          <article class="card-neo flip__face flip__back ${hazard}" aria-hidden="true">
            <header class="card-neo__head">
              <h3 class="card-neo__name">${a.name}</h3>
              <button type="button" class="flip__close" data-action="unflip" aria-label="Flip back">↩</button>
            </header>
            <dl class="card-neo__stats">
              <div><dt>Hazardous</dt><dd>${a.isHazardous ? "Yes" : "No"}</dd></div>
              <div><dt>Diameter</dt><dd>${this.#fmt(a.diameterMeters)} m</dd></div>
              <div><dt>Miss (km)</dt><dd>${this.#fmt(a.missDistanceKm)}</dd></div>
              <div><dt>Miss (LD)</dt><dd>${a.missDistanceLunar.toFixed(1)}</dd></div>
              <div><dt>Speed</dt><dd>${this.#fmt(a.velocityKmh)} km/h</dd></div>
              <div><dt>Approach</dt><dd>${a.approachDate}</dd></div>
            </dl>
            ${orbitalSlot}
            <a class="btn btn-sm btn-outline-light mt-auto" href="${a.jplUrl}" target="_blank" rel="noopener">
              NASA JPL page ↗
            </a>
          </article>
        </div>
      </div>`;
  }

  #fmt(n) {
    return Math.round(n).toLocaleString();
  }
}
