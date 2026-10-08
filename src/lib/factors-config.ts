export interface FactorSceneItem {
  id: "space" | "air" | "fire" | "water" | "earth";
  hi: string;
  en: string;
  t: string;
  x: number;
  y: number;
  s: "t" | "b";
  sh: number;
  f: [number, number, string, number]; // [width, height, borderRadius, isGlow]
}

export const FACTOR_SCENE_ITEMS: FactorSceneItem[] = [
  {
    id: "space",
    hi: "आकाश",
    en: "Space",
    t: "Openness. Light. Stillness.",
    x: 74.2,
    y: 10.5,
    s: "b",
    sh: 0,
    f: [120, 120, "50%", 0],
  },
  {
    id: "air",
    hi: "वायु",
    en: "Air",
    t: "Breath. Movement. Freshness.",
    x: 149.3,
    y: 28.7,
    s: "b",
    sh: -90,
    f: [110, 110, "50%", 0],
  },
  {
    id: "fire",
    hi: "अग्नि",
    en: "Fire",
    t: "Warmth. Energy. Sunlight.",
    x: 84,
    y: 31.6,
    s: "t",
    sh: 0,
    f: [140, 140, "50%", 1],
  },
  {
    id: "water",
    hi: "जल",
    en: "Water",
    t: "Calmness. Flow. Reflection.",
    x: 114.8,
    y: 67,
    s: "t",
    sh: -80,
    f: [170, 84, "50%", 0],
  },
  {
    id: "earth",
    hi: "पृथ्वी",
    en: "Earth",
    t: "Stability. Texture. Grounding.",
    x: 47.8,
    y: 61.2,
    s: "t",
    sh: 50,
    f: [90, 90, "14px", 0],
  },
];
