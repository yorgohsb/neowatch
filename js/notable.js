import { NOTABLE } from "./data/notable.js";

/**
 * Renders the curated "Notable Asteroids" dataset into the card grid, with
 * client-side search and category filtering. Reuses the same .card-neo styling
 * as the live tracker so the card-grid + hover requirement is shown off twice.
 */
class NotablePage {
  constructor() {
    this.container = document.querySelector("#notableGrid");
    this.search = document.querySelector("#notableSearch");
    this.filter = document.querySelector("#categoryFilter");

    const update = () => this.render(this.#apply());
    this.search.addEventListener("input", update);
    this.filter.addEventListener("change", update);

    this.render(NOTABLE);
  }

  #apply() {
    const query = this.search.value.trim().toLowerCase();
    const category = this.filter.value;
    return NOTABLE.filter((item) => {
      const haystack = `${item.name} ${item.aka} ${item.blurb}`.toLowerCase();
      const matchesText = haystack.includes(query);
      const matchesCategory = category === "all" || item.category === category;
      return matchesText && matchesCategory;
    });
  }

  render(items) {
    if (!items.length) {
      this.container.innerHTML = `
        <div class="grid-state grid-state--empty">
          <span class="grid-state__icon">🔭</span>
          <p>No notable asteroids match your search.</p>
        </div>`;
      return;
    }
    this.container.innerHTML = items.map((item) => this.#card(item)).join("");
  }

  #card(item) {
    return `
      <article class="card-neo ${item.hazardous ? "card--hazard" : ""}" tabindex="0">
        <header class="card-neo__head">
          <h3 class="card-neo__name">${item.name}</h3>
          <span class="badge-cat">${item.category}</span>
        </header>
        <p class="card-neo__aka">${item.aka}</p>

        <dl class="card-neo__stats">
          <div><dt>Size</dt><dd>${item.size}</dd></div>
          <div><dt>Highlight</dt><dd>${item.highlight}</dd></div>
        </dl>

        <div class="card-neo__reveal card-neo__reveal--text">
          <p>${item.blurb}</p>
        </div>
      </article>`;
  }
}

new NotablePage();
