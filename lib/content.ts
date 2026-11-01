// Shared, design-neutral brand content for every skill variant.
// Perfume names, notes and copy are placeholders written from the brief: replace with the real collection.

export type Lang = "fr" | "en";
export type T = Record<Lang, string>;

export type Tradition = "europe" | "arabie" | "afrique";

/** Bottle as data, so every variant can render (and morph) the same original flacons. */
export type Bottle = {
  profile: [number, number][]; // [height 0..1, radius] control points, bottom to shoulder
  height: number; // body height in scene units
  square: number; // superellipse exponent: 2 = round, 6+ = square
  depth: number; // z / x ratio (1 = full, 0.5 = flask)
  neck: { h: number; r: number };
  cap: { h: number; r: number; round: number; color: string; metal: number };
};

export type Perfume = {
  id: string;
  name: string; // perfume names are proper nouns, not translated
  juice: string; // colour of the liquid, also used as the page accent while active
  juiceDark: string; // lighter variant that reads on the dark theme
  family: T;
  traditions: Tradition[];
  story: T;
  notes: { top: T; heart: T; base: T };
  bottleNote: T;
  bottle: Bottle;
};

export const brand = {
  name: "Maison DOUDJO",
  tagline: {
    fr: "Parfums de niche, composés entre l'Europe, l'Arabie et l'Afrique.",
    en: "Niche perfumes composed between Europe, Arabia and Africa.",
  },
  heroLine: {
    fr: "Chaque parfum raconte une histoire. Chaque flacon est dessiné pour elle.",
    en: "Every perfume tells a story. Every bottle is designed for it.",
  },
  ctaCollection: { fr: "Découvrir la collection", en: "Explore the collection" },
  ctaSet: { fr: "Demander le coffret découverte", en: "Request the discovery set" },
};

export const ui = {
  notes: { fr: "Notes", en: "Notes" },
  top: { fr: "Tête", en: "Top" },
  heart: { fr: "Cœur", en: "Heart" },
  base: { fr: "Fond", en: "Base" },
  bottle: { fr: "Le flacon", en: "The bottle" },
  theme: { fr: "Thème", en: "Theme" },
  light: { fr: "Clair", en: "Light" },
  dark: { fr: "Sombre", en: "Dark" },
  traditions: {
    europe: { fr: "Europe", en: "Europe" },
    arabie: { fr: "Arabie", en: "Arabia" },
    afrique: { fr: "Afrique", en: "Africa" },
  } as Record<Tradition, T>,
};

export const perfumes: Perfume[] = [
  {
    id: "korhogo",
    name: "Toile de Korhogo",
    juice: "#7d7a48",
    juiceDark: "#b5b07a",
    family: { fr: "Boisé fumé", en: "Smoky woody" },
    traditions: ["afrique", "europe"],
    story: {
      fr: "À Korhogo, les peintres senoufo tracent des figures sur des toiles de coton tissées à la main, avec une encre de terre et de feuilles fermentées. Ce parfum sent la toile qui sèche au soleil, l'argile et la fumée des feux du soir.",
      en: "In Korhogo, Senoufo painters draw figures on hand-woven cotton with an ink of earth and fermented leaves. This perfume smells of cloth drying in the sun, of clay, and of evening fire smoke.",
    },
    notes: {
      top: { fr: "Fleur de coton, poivre noir", en: "Cotton flower, black pepper" },
      heart: { fr: "Galbanum, accord argile", en: "Galbanum, clay accord" },
      base: { fr: "Vétiver, bois fumé, karité", en: "Vetiver, smoked wood, shea" },
    },
    bottleNote: {
      fr: "Un flacon plat comme une toile tendue, bouchon en bois sculpté.",
      en: "A flat bottle like a stretched canvas, with a carved wooden cap.",
    },
    bottle: {
      profile: [[0, 0.58], [0.04, 0.66], [0.5, 0.64], [0.94, 0.62], [1, 0.48]],
      height: 2.1, square: 7, depth: 0.42,
      neck: { h: 0.18, r: 0.13 },
      cap: { h: 0.52, r: 0.26, round: 0, color: "#3a2a1c", metal: 0 },
    },
  },
  {
    id: "poids-dor",
    name: "Poids d'or",
    juice: "#c48a2a",
    juiceDark: "#e2b45e",
    family: { fr: "Oriental ambré", en: "Amber oriental" },
    traditions: ["arabie", "afrique"],
    story: {
      fr: "Les Baoulé pesaient la poudre d'or avec de petits poids en laiton, chacun sculpté d'une figure ou d'un proverbe. Un parfum dense et précieux, mesuré au grain près, comme une dot de famille.",
      en: "The Baoulé weighed gold dust with small brass weights, each one cast with a figure or a proverb. A dense, precious perfume, measured to the grain, like a family dowry.",
    },
    notes: {
      top: { fr: "Safran, cardamome", en: "Saffron, cardamom" },
      heart: { fr: "Rose de Taïf, miel", en: "Taif rose, honey" },
      base: { fr: "Oud, benjoin, ambre", en: "Oud, benzoin, amber" },
    },
    bottleNote: {
      fr: "Un flacon trapu aux angles adoucis, coiffé d'une sphère dorée.",
      en: "A squat bottle with softened corners, crowned with a golden sphere.",
    },
    bottle: {
      profile: [[0, 0.72], [0.12, 0.86], [0.55, 0.9], [0.9, 0.78], [1, 0.5]],
      height: 1.45, square: 3.6, depth: 1,
      neck: { h: 0.16, r: 0.16 },
      cap: { h: 0.56, r: 0.3, round: 1, color: "#c9a14a", metal: 1 },
    },
  },
  {
    id: "harmattan",
    name: "Harmattan",
    juice: "#cdb184",
    juiceDark: "#e6cfa6",
    family: { fr: "Boisé épicé sec", en: "Dry spicy woody" },
    traditions: ["arabie", "afrique"],
    story: {
      fr: "De décembre à février, le vent du Sahara descend jusqu'au nord ivoirien et voile le ciel de poussière ocre. Un parfum sec et lumineux, avec l'encens que les caravanes portaient d'Arabie.",
      en: "From December to February, the Sahara wind reaches northern Côte d'Ivoire and veils the sky in ochre dust. A dry, bright perfume, with the frankincense caravans carried from Arabia.",
    },
    notes: {
      top: { fr: "Cardamome, accord poussière", en: "Cardamom, dust accord" },
      heart: { fr: "Encens du Dhofar, myrrhe", en: "Dhofar frankincense, myrrh" },
      base: { fr: "Labdanum, ambre gris", en: "Labdanum, ambergris" },
    },
    bottleNote: {
      fr: "Une silhouette de dune, étirée vers le haut, bouchon en pierre claire.",
      en: "A dune silhouette drawn upward, with a pale stone cap.",
    },
    bottle: {
      profile: [[0, 0.42], [0.18, 0.74], [0.42, 0.8], [0.75, 0.52], [1, 0.22]],
      height: 2.3, square: 2, depth: 1,
      neck: { h: 0.12, r: 0.12 },
      cap: { h: 0.82, r: 0.12, round: 0.35, color: "#cbbca0", metal: 0 },
    },
  },
  {
    id: "lagune",
    name: "Lagune de minuit",
    juice: "#5f7f9e",
    juiceDark: "#94b3cf",
    family: { fr: "Aromatique aquatique", en: "Aromatic aquatic" },
    traditions: ["europe", "afrique"],
    story: {
      fr: "La lagune Ébrié la nuit, quand les lumières d'Abidjan tremblent sur l'eau et que l'air sent le sel et le bois mouillé des pirogues. Une fraîcheur poudrée, entre Florence et le Plateau.",
      en: "The Ébrié lagoon at night, when the lights of Abidjan tremble on the water and the air smells of salt and the wet wood of pirogues. A powdery freshness, between Florence and the Plateau.",
    },
    notes: {
      top: { fr: "Bergamote de Calabre, sel marin", en: "Calabrian bergamot, sea salt" },
      heart: { fr: "Iris de Florence, nénuphar", en: "Florentine iris, water lily" },
      base: { fr: "Bois flotté, musc blanc", en: "Driftwood, white musk" },
    },
    bottleNote: {
      fr: "Un galet de verre poli par l'eau, bouchon en métal brossé.",
      en: "A glass pebble polished by water, with a brushed metal cap.",
    },
    bottle: {
      profile: [[0, 0.3], [0.12, 0.72], [0.5, 0.92], [0.88, 0.72], [1, 0.3]],
      height: 1.7, square: 2, depth: 0.5,
      neck: { h: 0.14, r: 0.14 },
      cap: { h: 0.3, r: 0.34, round: 0.15, color: "#a7b4c0", metal: 0.85 },
    },
  },
  {
    id: "akwaba",
    name: "Akwaba",
    juice: "#8a3a2c",
    juiceDark: "#c97a69",
    family: { fr: "Floral gourmand", en: "Gourmand floral" },
    traditions: ["europe", "afrique"],
    story: {
      fr: "Akwaba veut dire bienvenue. C'est le parfum d'une maison qui reçoit : la noix de kola qu'on offre à l'arrivée, le jasmin du jardin, le cacao qui torréfie dans la cour.",
      en: "Akwaba means welcome. It is the scent of a house receiving guests: the kola nut offered on arrival, jasmine from the garden, cocoa roasting in the yard.",
    },
    notes: {
      top: { fr: "Noix de kola, gingembre", en: "Kola nut, ginger" },
      heart: { fr: "Jasmin de Grasse, tubéreuse", en: "Grasse jasmine, tuberose" },
      base: { fr: "Absolue de cacao, tonka", en: "Cocoa absolute, tonka" },
    },
    bottleNote: {
      fr: "Un flacon à taille fine, coiffé d'un disque plat comme la tête des poupées akwaba.",
      en: "A slim-waisted bottle topped with a flat disc, like the head of akwaba dolls.",
    },
    bottle: {
      profile: [[0, 0.62], [0.2, 0.66], [0.5, 0.44], [0.8, 0.6], [1, 0.4]],
      height: 2.0, square: 2.4, depth: 0.9,
      neck: { h: 0.32, r: 0.1 },
      cap: { h: 0.1, r: 0.46, round: 0, color: "#2b1812", metal: 0 },
    },
  },
];

export const perfumer = {
  title: { fr: "Le parfumeur", en: "The perfumer" },
  intro: {
    fr: "Le fondateur de Maison DOUDJO se présente d'abord comme un artiste. Il compose des parfums comme on peint une toile, et dessine lui-même chaque flacon.",
    en: "The founder of Maison DOUDJO calls himself an artist first. He composes perfumes the way one paints a canvas, and draws every bottle himself.",
  },
  father: {
    title: { fr: "De son père, senoufo", en: "From his father, Senoufo" },
    text: {
      fr: "La patience des peintres de Korhogo et des sculpteurs du bois, et l'idée qu'un objet doit porter un sens.",
      en: "The patience of Korhogo painters and wood carvers, and the idea that an object must carry meaning.",
    },
  },
  mother: {
    title: { fr: "De sa mère, baoulé", en: "From his mother, Baoulé" },
    text: {
      fr: "Le goût de l'or, du poids juste et de la mesure, et l'art de recevoir.",
      en: "A taste for gold, for the right weight and measure, and the art of welcoming.",
    },
  },
  statement: {
    fr: [
      "Je compose avec des matières d'Europe, d'Arabie et d'Afrique.",
      "Je ne cherche pas à les mélanger jusqu'à ce qu'on ne les reconnaisse plus.",
      "Je veux qu'on sente d'où vient chaque note,",
      "et qu'on garde le flacon longtemps après l'avoir vidé.",
    ],
    en: [
      "I compose with materials from Europe, Arabia and Africa.",
      "I do not blend them until they can no longer be told apart.",
      "I want you to smell where each note comes from,",
      "and to keep the bottle long after it is empty.",
    ],
  },
};

export const materials: { tradition: Tradition; items: { name: T; place: T }[] }[] = [
  {
    tradition: "europe",
    items: [
      { name: { fr: "Jasmin", en: "Jasmine" }, place: { fr: "Grasse, France", en: "Grasse, France" } },
      { name: { fr: "Iris", en: "Iris" }, place: { fr: "Florence, Italie", en: "Florence, Italy" } },
      { name: { fr: "Bergamote", en: "Bergamot" }, place: { fr: "Calabre, Italie", en: "Calabria, Italy" } },
    ],
  },
  {
    tradition: "arabie",
    items: [
      { name: { fr: "Encens", en: "Frankincense" }, place: { fr: "Dhofar, Oman", en: "Dhofar, Oman" } },
      { name: { fr: "Rose", en: "Rose" }, place: { fr: "Taïf, Arabie saoudite", en: "Taif, Saudi Arabia" } },
      { name: { fr: "Oud", en: "Oud" }, place: { fr: "Tradition du Golfe", en: "Gulf tradition" } },
    ],
  },
  {
    tradition: "afrique",
    items: [
      { name: { fr: "Karité", en: "Shea" }, place: { fr: "Pays senoufo, Côte d'Ivoire", en: "Senoufo country, Côte d'Ivoire" } },
      { name: { fr: "Cacao", en: "Cocoa" }, place: { fr: "Soubré, Côte d'Ivoire", en: "Soubré, Côte d'Ivoire" } },
      { name: { fr: "Noix de kola", en: "Kola nut" }, place: { fr: "Côte d'Ivoire", en: "Côte d'Ivoire" } },
    ],
  },
];

/** Real ingredient photos (Wikimedia Commons, hotlinked). One per tradition. */
export const commons = (file: string, width = 1600) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;
export const commonsPage = (file: string) =>
  `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`;

export const ingredientPhotos: Record<Tradition, { file: string; alt: T; license: string }> = {
  europe: { file: "Starr-090806-3874-Jasminum grandiflorum-flowers-Wailuku-Maui (24853461072).jpg", alt: { fr: "Fleurs de jasmin", en: "Jasmine flowers" }, license: "CC BY 3.0" },
  arabie: { file: "Frankincense Weihrauch im Gefäß 01.jpg", alt: { fr: "Larmes d'encens", en: "Frankincense tears" }, license: "CC BY-SA 4.0" },
  afrique: { file: "Grand Frais (Beynost) noix de cola de Côte d'Ivoire (août 2023).jpg", alt: { fr: "Noix de kola de Côte d'Ivoire", en: "Kola nuts from Côte d'Ivoire" }, license: "CC0" },
};

/** Heritage photos (Wikimedia Commons, mostly museum CC0). Father: Senoufo. Mother: Baoulé (Akan). */
export const heritagePhotos: { side: "father" | "mother"; file: string; alt: T; license: string }[] = [
  { side: "father", file: "Toile de Fakaha (Côte d'Ivoire).jpg", alt: { fr: "Toile peinte de Fakaha, près de Korhogo", en: "Painted cloth from Fakaha, near Korhogo" }, license: "CC0" },
  { side: "father", file: "Korhogo cloth, Senufo people, Ivory Coast 01.jpg", alt: { fr: "Toile de Korhogo, art senoufo", en: "Korhogo cloth, Senufo art" }, license: "CC BY-SA 4.0" },
  { side: "father", file: "A Senufo rhythm pounder (Déblé).jpg", alt: { fr: "Déblé, pilon rythmique senoufo", en: "Déblé, Senufo rhythm pounder" }, license: "CC BY 4.0" },
  { side: "mother", file: "Akan Goldweights.jpg", alt: { fr: "Poids à peser l'or, art akan", en: "Akan gold weights" }, license: "CC BY 4.0" },
  { side: "mother", file: "Baule mblo portrait mask from Côte d’Ivorie.jpg", alt: { fr: "Masque portrait mblo baoulé", en: "Baoulé mblo portrait mask" }, license: "CC0" },
  { side: "mother", file: "Akan MHNT.ETH.2010.25.101-fond blanc.jpg", alt: { fr: "Poids à peser l'or en laiton", en: "Brass gold weight" }, license: "CC BY-SA 4.0" },
];

export const order = {
  title: { fr: "Sentir avant de choisir", en: "Smell before you choose" },
  text: {
    fr: "Le coffret découverte réunit les cinq parfums en flacons de 2 ml. Il est expédié depuis Abidjan vers l'Europe, l'Afrique et le Golfe. Vous pouvez aussi venir sentir la collection à l'atelier, sur rendez-vous.",
    en: "The discovery set holds all five perfumes in 2 ml vials. It ships from Abidjan to Europe, Africa and the Gulf. You can also smell the collection at the Abidjan atelier, by appointment.",
  },
  choiceLabel: { fr: "Je souhaite", en: "I would like" },
  choiceSet: { fr: "Recevoir le coffret découverte", en: "Receive the discovery set" },
  choiceVisit: { fr: "Visiter l'atelier à Abidjan", en: "Visit the atelier in Abidjan" },
  emailLabel: { fr: "Votre e-mail", en: "Your email" },
  emailHelp: { fr: "Nous vous répondons sous 48 heures avec les tarifs et l'expédition.", en: "We reply within 48 hours with prices and shipping." },
  emailError: { fr: "Ajoutez une adresse complète, par exemple nom@domaine.com.", en: "Add a complete address, for example name@domain.com." },
  sending: { fr: "Envoi de la demande", en: "Sending request" },
  sent: { fr: "Demande envoyée. Nous vous écrivons sous 48 heures.", en: "Request sent. We will write within 48 hours." },
};
