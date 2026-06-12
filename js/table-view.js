/**
 * Compact table renderer for the Live Tracker's table view — the data-dense
 * alternative to the card grid. Numeric column headers carry `data-sort` keys;
 * TrackerPage listens for clicks on them and re-sorts (keeping the sort
 * dropdown in sync), so this class stays a pure renderer plus star handling.
 */
export class TableView {
  /**
   * @param {HTMLElement} container
   * @param {{ watchlist?: import("./watchlist.js").Watchlist }} [options]
   */
  constructor(container, { watchlist = null } = {}) {
    this.container = container;
    this.watchlist = watchlist;

    // Delegated star toggling (header clicks are TrackerPage's job).
    this.container.addEventListener("click", (e) => {
      const star = e.target.closest("[data-action='star']");
      if (!star || !this.watchlist) return;
      const watched = this.watchlist.toggle(star.dataset.id);
      star.classList.toggle("is-on", watched);
      star.setAttribute("aria-pressed", String(watched));
      star.textContent = watched ? "★" : "☆";
    });
  }

  renderLoading(rows = 6) {
    const skeletonRow = `<tr>${`<td><div class="skel-line"></div></td>`.repeat(7)}</tr>`;
    this.container.innerHTML = `
      <table class="neo-table" aria-busy="true">
        ${this.#head()}
        <tbody>${skeletonRow.repeat(rows)}</tbody>
      </table>`;
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

  /**
   * @param {import("./models.js").Asteroid[]} asteroids
   * @param {{ key: string, dir: string }} sort current sort, for header arrows
   */
  render(asteroids, sort = { key: "", dir: "" }) {
    if (!asteroids.length) return this.renderEmpty();
    this.container.innerHTML = `
      <table class="neo-table">
        ${this.#head(sort)}
        <tbody>${asteroids.map((a) => this.#row(a)).join("")}</tbody>
      </table>`;
  }

  #head(sort = {}) {
    const th = (label, key = null) => {
      if (!key) return `<th scope="col">${label}</th>`;
      const active = sort.key === key;
      const arrow = active ? (sort.dir === "asc" ? " ↑" : " ↓") : "";
      const ariaSort = active ? (sort.dir === "asc" ? "ascending" : "descending") : "none";
      return `<th scope="col" data-sort="${key}" aria-sort="${ariaSort}"
                title="Sort by ${label.toLowerCase()}">${label}${arrow}</th>`;
    };
    return `<thead><tr>
        <th scope="col"><span class="visually-hidden">Watchlist</span></th>
        ${th("Name")}
        ${th("Approach")}
        ${th("Diameter", "size")}
        ${th("Miss dist.", "distance")}
        ${th("Speed", "speed")}
        ${th("Danger", "danger")}
      </tr></thead>`;
  }

  #row(a) {
    const watched = this.watchlist?.has(a.id);
    const star = this.watchlist
      ? `<button type="button" class="star-btn ${watched ? "is-on" : ""}" data-action="star"
           data-id="${a.id}" aria-pressed="${watched}" aria-label="Toggle watchlist">${watched ? "★" : "☆"}</button>`
      : "";
    return `
      <tr>
        <td>${star}</td>
        <td class="neo-table__name">
          <a href="${a.jplUrl}" target="_blank" rel="noopener">${a.name}</a>
          ${a.isHazardous ? `<span class="hazard-dot" title="Potentially hazardous"></span>` : ""}
        </td>
        <td>${a.approachDate}</td>
        <td title="${a.sizeComparison}">${this.#fmt(a.diameterMeters)} m</td>
        <td>${a.missDistanceLunar.toFixed(1)} LD</td>
        <td>${this.#fmt(a.velocityKmh)} km/h</td>
        <td>${a.dangerScore}/100</td>
      </tr>`;
  }

  #fmt(n) {
    return Math.round(n).toLocaleString();
  }
}
