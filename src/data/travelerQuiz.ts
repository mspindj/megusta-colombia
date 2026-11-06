// Quiz de perfil de viajero (/quiz).
//
// Las cifras de los resultados salen SOLO de lo verificado el 29 sep 2026, la misma
// lista que usa idea-to-queue (VERIFIED_FACTS): TransMilenio 3,550 COP y Tullave 8,000;
// Metro de Medellín 4,400 (turista) y 3,820 (frecuente); Transcaribe 3,900; taxi de
// Bogotá con mínima 8,000, recargo de aeropuerto 8,000 y nocturno 3,800 (8 p.m. a 5 a.m.).
// Si cambian las tarifas, se cambian aquí y en idea-to-queue. Nada de precios de
// restaurantes, hoteles o tours: no están verificados.

export type ProfileId = "shoestring" | "glam" | "classic" | "topshelf";
export type CityId = "bogota" | "medellin" | "cartagena" | "several";

type Scores = Partial<Record<ProfileId, number>>;

export interface QuizOption {
  label: string;
  value: string;
  scores?: Scores;
}

export interface QuizQuestion {
  id: "city" | "purpose" | "length" | "sleep" | "evening" | "move" | "budget";
  question: string;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "city",
    question: "Where are you headed?",
    options: [
      { label: "Bogotá", value: "bogota" },
      { label: "Medellín", value: "medellin" },
      { label: "Cartagena", value: "cartagena" },
      { label: "More than one city, or not sure yet", value: "several" },
    ],
  },
  {
    id: "purpose",
    question: "What brings you to Colombia?",
    options: [
      { label: "Vacation", value: "vacation" },
      { label: "Working remotely", value: "remote" },
      { label: "Moving here, or staying a few months", value: "moving" },
      { label: "Visiting family, a partner or friends", value: "family" },
      { label: "Business trip", value: "business" },
    ],
  },
  {
    id: "length",
    question: "How long is the trip?",
    options: [
      { label: "A long weekend", value: "weekend", scores: { topshelf: 1, classic: 1 } },
      { label: "About a week", value: "week", scores: { classic: 1, glam: 1 } },
      { label: "Two to three weeks", value: "weeks", scores: { glam: 1, shoestring: 1 } },
      { label: "A month or more", value: "month", scores: { shoestring: 2 } },
    ],
  },
  {
    id: "sleep",
    question: "Where do you want to sleep?",
    options: [
      { label: "A hostel bed, I'm barely there", value: "dorm", scores: { shoestring: 3 } },
      { label: "A private room in a hostel or a small guesthouse", value: "private", scores: { glam: 2, shoestring: 1 } },
      { label: "A good hotel or apartment with character", value: "boutique", scores: { classic: 2, glam: 1 } },
      { label: "The best hotel in town", value: "luxury", scores: { topshelf: 3 } },
    ],
  },
  {
    id: "evening",
    question: "Pick your ideal night out.",
    options: [
      { label: "Street food and a cold beer with people I just met", value: "street", scores: { shoestring: 2, glam: 1 } },
      { label: "One great dinner, then a rooftop", value: "rooftop", scores: { glam: 3 } },
      { label: "A relaxed dinner and an early night", value: "dinner", scores: { classic: 3 } },
      { label: "A table booked at the place everyone talks about", value: "tasting", scores: { topshelf: 3 } },
    ],
  },
  {
    id: "move",
    question: "How do you like to get around?",
    options: [
      { label: "On foot and public transit", value: "transit", scores: { shoestring: 3 } },
      { label: "Transit by day, an app at night", value: "mix", scores: { glam: 2, classic: 1 } },
      { label: "Apps and taxis, door to door", value: "apps", scores: { classic: 2, topshelf: 1 } },
      { label: "A private driver", value: "driver", scores: { topshelf: 3 } },
    ],
  },
  {
    id: "budget",
    question: "Daily budget, not counting where you sleep?",
    options: [
      { label: "Under $40", value: "u40", scores: { shoestring: 3 } },
      { label: "$40 to $100", value: "40-100", scores: { glam: 2, classic: 1 } },
      { label: "$100 to $250", value: "100-250", scores: { classic: 2, glam: 1 } },
      { label: "More than $250", value: "250plus", scores: { topshelf: 3 } },
    ],
  },
];

export interface Profile {
  id: ProfileId;
  name: string;
  line: string;
  description: string;
  moves: string[];
  habit: string;
}

export const PROFILES: Record<ProfileId, Profile> = {
  shoestring: {
    id: "shoestring",
    name: "The Shoestring Backpacker",
    line: "You make every peso go further.",
    description:
      "You travel to see as much as you can for as little as you can. Hostels, street food and public transit are part of the trip for you, not a compromise.",
    moves: [
      "Bogotá: TransMilenio is 3,550 COP a ride. Buy a Tullave card (8,000 COP) at a station on day one.",
      "Medellín: the Metro is 4,400 COP a ride on the tourist card and 3,820 on a frequent Cívica card. Staying a while? Ask at the station about the frequent one.",
      "Cartagena: the Transcaribe bus is 3,900 COP a ride, and the walled city is easy to cover on foot.",
      "For lunch, ask \"¿Qué tiene de menú del día?\" at a neighborhood comedor. It's the set meal locals eat.",
    ],
    habit: "Nights out: carry one card and some cash, and leave the rest locked up where you sleep.",
  },
  glam: {
    id: "glam",
    name: "The Glam Backpacker",
    line: "Hostel budget, boutique taste.",
    description:
      "You save on the basics so you can spend on the moments you'll remember: one great dinner, a rooftop, a day on a boat. You know exactly where your splurge goes.",
    moves: [
      "Choose one splurge per city and plan the rest of the days around it.",
      "Medellín: Laureles works as a walkable base, and El Poblado is easy to reach for a night out.",
      "Cartagena: before you pay for a boat day, ask what's included: lunch, island entrance, snorkel gear.",
      "Bogotá at night, use an app or a metered taxi. The minimum taximeter fare is 8,000 COP, plus a 3,800 COP surcharge from 8 p.m. to 5 a.m.",
    ],
    habit: "Phone away while you walk, and back in your pocket before you leave the restaurant.",
  },
  classic: {
    id: "classic",
    name: "The Classic Explorer",
    line: "Comfort where it counts, curiosity everywhere else.",
    description:
      "You want a good room, an easy way around and a plan that doesn't eat the trip. You'll pay for convenience when it saves you time.",
    moves: [
      "Fly between cities and give each one a few days. Two cities in a week is plenty.",
      "Bogotá: La Candelaria by day, Chapinero or Zona G for dinner, Usaquén for a slower afternoon.",
      "From El Dorado, take the official taxi line or an app. The airport surcharge on the taximeter is 8,000 COP.",
      "Tell your bank you're traveling, and carry a card and some cash.",
    ],
    habit: "Ask your hotel which blocks to skip after dark, and which ones are fine on foot.",
  },
  topshelf: {
    id: "topshelf",
    name: "The Top-Shelf Traveler",
    line: "You want it handled.",
    description:
      "You'd rather spend money than spend time figuring things out. Best rooms, transfers waiting, tables booked ahead.",
    moves: [
      "Book a private transfer before you land, so someone is waiting with your name at arrivals.",
      "Book ahead for the dinners you care about, especially on weekends.",
      "Cartagena: a private boat day to the Rosario Islands or Barú. Agree on the total and what's included in writing first.",
      "Medellín: a day trip to Guatapé with a private driver. Confirm the return time the night before.",
    ],
    habit: "Leave the watch and the jewelry at the hotel when you go out walking.",
  },
};

export const PROFILE_ORDER: ProfileId[] = ["glam", "classic", "shoestring", "topshelf"];

export interface CityGuide {
  label: string;
  price: string;
  link: string;
}

export const CITY_GUIDES: Record<CityId, CityGuide> = {
  bogota: { label: "Bogotá 72-hour guide", price: "$17", link: "https://megustacomco.gumroad.com/l/bogota72hours" },
  medellin: { label: "Medellín 72-hour guide", price: "$17", link: "https://megustacomco.gumroad.com/l/medellin-survival-vault" },
  cartagena: { label: "Cartagena 72-hour guide", price: "$17", link: "https://megustacomco.gumroad.com/l/cartagena-survival-vault" },
  several: { label: "Explorer Bundle, all three cities", price: "$37", link: "https://megustacomco.gumroad.com/l/explorer-bundle" },
};

export type Answers = Partial<Record<QuizQuestion["id"], string>>;

export function scoreProfile(answers: Answers): ProfileId {
  const totals: Record<ProfileId, number> = { shoestring: 0, glam: 0, classic: 0, topshelf: 0 };
  for (const q of QUESTIONS) {
    const opt = q.options.find((o) => o.value === answers[q.id]);
    if (!opt?.scores) continue;
    for (const [id, pts] of Object.entries(opt.scores) as [ProfileId, number][]) totals[id] += pts;
  }
  // Empate: gana el que va primero en PROFILE_ORDER.
  return PROFILE_ORDER.reduce((best, id) => (totals[id] > totals[best] ? id : best), PROFILE_ORDER[0]);
}

const CITY_PREFIX: Record<string, string> = { bogota: "Bogotá", medellin: "Medellín", cartagena: "Cartagena" };

// Los consejos de la ciudad elegida van primero; el resto conserva su orden.
export function orderedMoves(profile: Profile, city?: string): string[] {
  const prefix = city ? CITY_PREFIX[city] : undefined;
  if (!prefix) return profile.moves;
  const first = profile.moves.filter((m) => m.startsWith(prefix));
  return [...first, ...profile.moves.filter((m) => !m.startsWith(prefix))];
}

// Una línea extra según el tipo de viaje. No cambia el perfil: se puede ser
// Glam Backpacker de vacaciones o trabajando en remoto.
export const PURPOSE_LINES: Record<string, string> = {
  vacation: "On vacation: two or three days per city works better than squeezing in one more stop.",
  remote: "Working remotely: pick a walkable neighborhood as your base and test the Wi-Fi on day one before you commit to a long stay.",
  moving: "Staying a few months: the frequent-rider transit fares and a neighborhood you can walk matter more than any single sight.",
  family: "Visiting people you know: ask them which apps they use at night and which blocks they skip.",
  business: "On a business trip: book your airport transfer before you land and keep your evenings close to where you stay.",
};
