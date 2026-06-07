/**
 * Renders Asteroid cards into a container element and owns the three required
 * UI states: loading (skeletons), error, and empty. Used by both the Home page
 * and the Live Tracker so the card markup stays consistent.
 */
export class CardGrid {
  constructor(container) {
    this.container = container;
  }

  /** Skeleton placeholders shown while the API request is in flight. */
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

  /** Markup for a single asteroid card. The .card-neo__reveal block is hidden
   *  until hover/focus — see the custom-requirement comment in css/style.css. */
  #card(a) {
    return `
      <article class="card-neo ${a.isHazardous ? "card--hazard" : ""}" data-id="${a.id}" tabindex="0">
        <header class="card-neo__head">
          <h3 class="card-neo__name">${a.name}</h3>
          ${a.isHazardous ? `<span class="badge-hazard">Hazardous</span>` : ""}
        </header>

        <dl class="card-neo__stats">
          <div><dt>Diameter</dt><dd>${this.#fmt(a.diameterMeters)} m</dd></div>
          <div><dt>Miss dist.</dt><dd>${a.missDistanceLunar.toFixed(1)} LD</dd></div>
          <div><dt>Speed</dt><dd>${this.#fmt(a.velocityKmh)} km/h</dd></div>
          <div><dt>Approach</dt><dd>${a.approachDate}</dd></div>
        </dl>

        <div class="card-neo__reveal">
          <span class="meter-label">Danger index: ${a.dangerScore}/100</span>
          <div class="meter"><span class="meter__bar" style="--val:${a.dangerScore}%"></span></div>
          <button class="btn btn-sm btn-light card-neo__details" data-id="${a.id}">View details</button>
        </div>
      </article>`;
  }

  #fmt(n) {
    return Math.round(n).toLocaleString();
  }
}
