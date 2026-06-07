// -----------------------------------------------------------------------------
// Curated "Notable Asteroids" dataset — this is YOUR OWN content (17 real items),
// the project's required ~15+ hand-collected entries, separate from the live API.
// Facts are summarised from NASA / JPL public sources; rewrite the blurbs in your
// own words as you go so the content is genuinely yours.
//
// category is one of: "Impact event" | "Mission target" | "Close approacher" | "Record-breaker"
// -----------------------------------------------------------------------------
export const NOTABLE = [
  {
    name: "Chicxulub impactor",
    aka: "The dinosaur-killer",
    category: "Impact event",
    size: "~10 km",
    highlight: "~66 million years ago",
    hazardous: true,
    blurb:
      "The asteroid whose impact off Mexico's Yucatán Peninsula carved a 180 km crater and triggered the mass extinction that ended the age of the dinosaurs.",
  },
  {
    name: "99942 Apophis",
    aka: "The 2029 close-shave",
    category: "Close approacher",
    size: "~340 m",
    highlight: "Flyby on 13 Apr 2029",
    hazardous: true,
    blurb:
      "Will pass within about 32,000 km of Earth in 2029 — closer than our geostationary satellites — and will be visible to the naked eye across parts of the world.",
  },
  {
    name: "101955 Bennu",
    aka: "OSIRIS-REx target",
    category: "Mission target",
    size: "~490 m",
    highlight: "Sample returned 2023",
    hazardous: true,
    blurb:
      "A carbon-rich rubble-pile asteroid; NASA's OSIRIS-REx grabbed a sample and returned it to Earth in 2023. It is also one of the most potentially hazardous known objects.",
  },
  {
    name: "162173 Ryugu",
    aka: "Hayabusa2 target",
    category: "Mission target",
    size: "~900 m",
    highlight: "Sampled 2018–2020",
    hazardous: false,
    blurb:
      "Japan's Hayabusa2 returned ~5 grams of pristine material containing organic molecules and water-bearing minerals — clues to the early Solar System.",
  },
  {
    name: "433 Eros",
    aka: "NEAR Shoemaker target",
    category: "Mission target",
    size: "~16 km",
    highlight: "Orbited & landed 2000–01",
    hazardous: false,
    blurb:
      "The first asteroid ever orbited by a spacecraft, and the first on which one landed — a milestone for small-body exploration.",
  },
  {
    name: "25143 Itokawa",
    aka: "Hayabusa target",
    category: "Mission target",
    size: "~330 m",
    highlight: "First sample return, 2010",
    hazardous: false,
    blurb:
      "A peanut-shaped rubble pile and the source of the first-ever asteroid sample brought back to Earth, by Japan's original Hayabusa probe.",
  },
  {
    name: "Chelyabinsk meteor",
    aka: "The 2013 airburst",
    category: "Impact event",
    size: "~20 m",
    highlight: "15 Feb 2013",
    hazardous: true,
    blurb:
      "Exploded over Russia with roughly 30× the energy of the Hiroshima bomb, injuring ~1,500 people from shattered glass. It arrived completely undetected.",
  },
  {
    name: "Tunguska event",
    aka: "The 1908 Siberia blast",
    category: "Impact event",
    size: "~50–60 m",
    highlight: "30 Jun 1908",
    hazardous: true,
    blurb:
      "An airburst over Siberia flattened an estimated 2,000 km² of forest — the largest impact event in recorded human history.",
  },
  {
    name: "Didymos & Dimorphos",
    aka: "DART mission target",
    category: "Mission target",
    size: "780 m + 160 m moon",
    highlight: "DART impact 26 Sep 2022",
    hazardous: false,
    blurb:
      "Humanity's first planetary-defense test: NASA's DART spacecraft deliberately slammed into the moonlet Dimorphos and measurably changed its orbit.",
  },
  {
    name: "3122 Florence",
    aka: "The triple system",
    category: "Close approacher",
    size: "~4.4 km",
    highlight: "Flyby 1 Sep 2017",
    hazardous: true,
    blurb:
      "One of the largest near-Earth asteroids to pass close in modern times. Radar revealed it has two tiny moons of its own.",
  },
  {
    name: "4179 Toutatis",
    aka: "The tumbling rock",
    category: "Close approacher",
    size: "~4.5 km",
    highlight: "Chang'e 2 flyby, 2012",
    hazardous: true,
    blurb:
      "An elongated asteroid with a chaotic tumbling rotation that made repeated close approaches; China's Chang'e 2 probe imaged it up close in 2012.",
  },
  {
    name: "1566 Icarus",
    aka: "The Sun-grazer",
    category: "Record-breaker",
    size: "~1.4 km",
    highlight: "Discovered 1949",
    hazardous: false,
    blurb:
      "Travels closer to the Sun than Mercury at perihelion and was one of the first asteroids ever studied by radar.",
  },
  {
    name: "2008 TC3",
    aka: "Almahata Sitta",
    category: "Impact event",
    size: "~4 m",
    highlight: "7 Oct 2008",
    hazardous: false,
    blurb:
      "The first asteroid ever detected before it hit Earth. It was predicted hours ahead, and meteorite fragments were later recovered in Sudan.",
  },
  {
    name: "1862 Apollo",
    aka: "Namesake of the Apollos",
    category: "Record-breaker",
    size: "~1.5 km",
    highlight: "Discovered 1932",
    hazardous: false,
    blurb:
      "The namesake of the Apollo group — Earth-crossing asteroids whose orbits cross our own, the most-watched class for impact risk.",
  },
  {
    name: "1221 Amor",
    aka: "Namesake of the Amors",
    category: "Record-breaker",
    size: "~1 km",
    highlight: "Discovered 1932",
    hazardous: false,
    blurb:
      "Gives its name to the Amor group of near-Earth asteroids, which approach Earth's orbit from outside but do not cross it.",
  },
  {
    name: "16 Psyche",
    aka: "The metal world",
    category: "Mission target",
    size: "~220 km",
    highlight: "Psyche probe arrives 2029",
    hazardous: false,
    blurb:
      "A giant metal-rich body in the main asteroid belt, possibly the exposed core of an early planet. NASA's Psyche mission is on its way to study it.",
  },
  {
    name: "ʻOumuamua",
    aka: "The interstellar visitor",
    category: "Record-breaker",
    size: "~100–400 m",
    highlight: "Detected Oct 2017",
    hazardous: false,
    blurb:
      "The first confirmed interstellar object ever observed passing through our Solar System — a cigar-shaped wanderer from another star.",
  },
];
