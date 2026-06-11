import { NOTABLE } from "./data/notable.js";

/**
 * Notable Asteroids page — an editorial "spotlight" layout: each curated object
 * gets its own full-width band (catalog number + cosmic orb + story), with
 * client-side search and category filtering over the dataset.
 */
class NotablePage {
  #glyphs = {
    "Impact event": "💥",
    "Mission target": "🛰️",
    "Close approacher": "☄️",
    "Record-breaker": "⭐",
  };

  constructor() {
    // Tag each item with a stable, zero-padded catalog number.
    this.items = NOTABLE.map((item, i) => ({ ...item, no: String(i + 1).padStart(2, "0") }));

    this.list = document.querySelector("#notableList");
    this.count = document.querySelector("#notableCount");
    this.search = document.querySelector("#notableSearch");
    this.filter = document.querySelector("#categoryFilter");

    const update = () => this.render(this.#apply());
    this.search.addEventListener("input", update);
    this.filter.addEventListener("change", update);

    this.render(this.items);
  }

  #apply() {
    const query = this.search.value.trim().toLowerCase();
    const category = this.filter.value;
    return this.items.filter((item) => {
      const haystack = `${item.name} ${item.aka} ${item.blurb}`.toLowerCase();
      const matchesText = haystack.includes(query);
      const matchesCategory = category === "all" || item.category === category;
      return matchesText && matchesCategory;
    });
  }

  render(items) {
    this.count.textContent = `${items.length} of ${this.items.length} objects`;

    if (!items.length) {
      this.list.innerHTML = `
        <div class="grid-state grid-state--empty">
          <span class="grid-state__icon">🔭</span>
          <p>No notable asteroids match your search.</p>
        </div>`;
      return;
    }
    this.list.innerHTML = items.map((item) => this.#spotlight(item)).join("");
  }

  #spotlight(item) {
    const glyph = this.#glyphs[item.category] ?? "🪨";
    const flag = item.hazardous
      ? ` · <span class="spotlight__flag">Potentially hazardous</span>`
      : "";
    return `
      <article class="spotlight ${item.hazardous ? "spotlight--hazard" : ""}">
        <div class="spotlight__visual" aria-hidden="true">
          <span class="spotlight__index">${item.no}</span>
          <span class="spotlight__glyph">${glyph}</span>
        </div>
        <div class="spotlight__body">
          <p class="spotlight__eyebrow">${item.category}${flag}</p>
          <h2 class="spotlight__name">${item.name}</h2>
          <p class="spotlight__aka">${item.aka}</p>
          <p class="spotlight__blurb">${item.blurb}</p>
          <dl class="spotlight__facts">
            <div><dt>Size</dt><dd>${item.size}</dd></div>
            <div><dt>Highlight</dt><dd>${item.highlight}</dd></div>
          </dl>
        </div>
      </article>`;
  }
}

new NotablePage();
