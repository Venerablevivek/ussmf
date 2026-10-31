// The eight air sports disciplines, ported from the design. Shared by the homepage,
// the eligibility check, the application wizard, the admin portal and certificates.

export const DISCIPLINES = [
  {
    id: "skydiving",
    name: "Skydiving",
    tone: "coral",
    icon: "parachute",
    altitude: "Exit altitude ~13,000 ft",
    lead: "Freefall at up to 120 mph, then canopy deployment and a high-energy landing.",
    risks: [
      "Lower-limb and spinal landing injuries",
      "Ear and sinus barotrauma during descent",
      "Deployment shock through neck and shoulders",
      "Adrenaline-driven cardiac stress",
    ],
    screenings: [
      "Resting ECG and blood pressure",
      "Spine and lower-limb exam",
      "ENT and ear-pressure check",
      "Vision and depth perception",
    ],
    certificateClass: "Class 2 · Sport, Class 1 for competition and instructors",
  },
  {
    id: "paragliding",
    name: "Paragliding",
    tone: "blue",
    icon: "paraglider",
    altitude: "Cross-country flights to 18,000 ft",
    lead: "Hours in thermals bring cold, altitude and long stretches of sustained concentration.",
    risks: [
      "Hypoxia on high cross-country flights",
      "Back and ankle injuries on launch and landing",
      "Cold exposure and dehydration",
      "Fatigue affecting judgment",
    ],
    screenings: [
      "Cardiovascular and respiratory review",
      "Spine and ankle exam",
      "Vision and color vision",
      "Fatigue and sleep history",
    ],
    certificateClass: "Class 2 · Sport",
  },
  {
    id: "hang",
    name: "Hang Gliding",
    tone: "mint",
    icon: "hang",
    altitude: "Prone flight to 15,000 ft",
    lead: "Pilots fly prone and steer the wing by shifting their body weight.",
    risks: [
      "Upper-body strain from weight-shift control",
      "Neck strain from the prone position",
      "Impact injuries on landing",
      "Hypoxia at altitude",
    ],
    screenings: [
      "Shoulder, neck and grip strength",
      "Cardiovascular review",
      "Vision",
      "Neurological screen",
    ],
    certificateClass: "Class 2 · Sport",
  },
  {
    id: "gliding",
    name: "Gliding",
    tone: "sun",
    icon: "glider",
    altitude: "Wave soaring above 20,000 ft",
    lead: "Long soaring flights, sometimes in wave far above oxygen-free altitudes.",
    risks: [
      "Hypoxia and supplemental oxygen needs",
      "Dehydration and fatigue on long flights",
      "G-loads in competition turns",
      "Hearing strain",
    ],
    screenings: [
      "Cardiovascular review with ECG",
      "Vision including color vision",
      "Respiratory review",
      "Hearing test",
    ],
    certificateClass: "Class 2 · Sport, Class 1 for competition",
  },
  {
    id: "paramotor",
    name: "Paramotoring",
    tone: "lav",
    icon: "paramotor",
    altitude: "Up to 30 kg of motor on the back",
    lead: "A foot-launched wing with an engine strapped to the pilot’s back.",
    risks: [
      "Spinal loading on the take-off run",
      "Propeller and burn hazards",
      "Noise exposure",
      "Knee and ankle injuries on launch",
    ],
    screenings: ["Spine and knee exam", "Hearing test", "Cardiovascular review", "Vision"],
    certificateClass: "Class 2 · Sport",
  },
  {
    id: "ballooning",
    name: "Ballooning",
    tone: "coral",
    icon: "balloon",
    altitude: "Typical flights 1,000–10,000 ft",
    lead: "Gentle flight with physically demanding launch, burner work and recovery.",
    risks: [
      "Hard landings and basket-tip injuries",
      "Burns from burners and propane",
      "Long periods standing",
      "Heat and sun exposure",
    ],
    screenings: [
      "Musculoskeletal fitness for landings",
      "Cardiovascular review",
      "Vision",
      "Mobility and balance",
    ],
    certificateClass: "Class 2 · Pilot",
  },
  {
    id: "aerobatics",
    name: "Aerobatics",
    tone: "blue",
    icon: "aero",
    altitude: "Sustained loads from +6 G to −4 G",
    lead: "Precision maneuvers expose pilots to rapid, sustained G-forces.",
    risks: [
      "G-induced loss of consciousness (G-LOC)",
      "Neck strain under load",
      "Spatial disorientation",
      "Cardiovascular strain",
    ],
    screenings: [
      "ECG and exercise tolerance",
      "Vestibular and balance testing",
      "Cervical spine exam",
      "Vision",
    ],
    certificateClass: "Class 1 · Elite",
  },
  {
    id: "drone",
    name: "Drone Racing",
    tone: "lav",
    icon: "drone",
    altitude: "Gates at 100+ mph through FPV goggles",
    lead: "Pilots race from the ground through immersive first-person-view goggles.",
    risks: [
      "Motion sickness and visual fatigue",
      "Eye strain and headaches",
      "Repetitive strain in hands and wrists",
      "Photosensitive seizure risk",
    ],
    screenings: [
      "Vision and binocular function",
      "Seizure history",
      "Hand and wrist exam",
      "Vestibular screen",
    ],
    certificateClass: "Class 3 · Recreational and youth, Class 2 for competition",
  },
];

export const DISCIPLINE_IDS = DISCIPLINES.map((d) => d.id);

export const DEFAULT_DISCIPLINE = "paragliding";

// Window event the hero's orbiting chips dispatch to select a tab in the Disciplines section.
export const SELECT_DISCIPLINE_EVENT = "ussmf:select-discipline";

export function getDiscipline(id) {
  return DISCIPLINES.find((d) => d.id === id) || null;
}

export function disciplineName(id) {
  return getDiscipline(id)?.name || id || "—";
}

// The six disciplines shown orbiting the hero certificate, in the design's order and sizes.
export const ORBIT_CHIPS = [
  { id: "skydiving", tone: "coral", icon: "parachute", size: 66, label: "Skydiving" },
  { id: "paragliding", tone: "blue", icon: "paraglider", size: 62, label: "Paragliding" },
  { id: "ballooning", tone: "sun", icon: "balloon", size: 58, label: "Ballooning" },
  { id: "drone", tone: "lav", icon: "drone", size: 62, label: "Drone Racing", ariaLabel: "Drone racing" },
  { id: "gliding", tone: "mint", icon: "glider", size: 60, label: "Gliding" },
  { id: "aerobatics", tone: "blue", icon: "aero", size: 56, label: "Aerobatics" },
];

export const LEVELS = [
  { id: "recreational", name: "Recreational" },
  { id: "club", name: "Club" },
  { id: "national", name: "National" },
  { id: "international", name: "International" },
];

export const LEVEL_IDS = LEVELS.map((l) => l.id);

export function levelName(id) {
  return LEVELS.find((l) => l.id === id)?.name || id || "—";
}

export const FEDERATIONS = [
  { id: "USASF", name: "U.S.A.S.F." },
  { id: "WASF", name: "W.A.S.F." },
  { id: "BOTH", name: "Both" },
  { id: "NONE", name: "None yet" },
];

export const FEDERATION_IDS = FEDERATIONS.map((f) => f.id);

export function federationName(id) {
  return FEDERATIONS.find((f) => f.id === id)?.name || "—";
}

export const CERTIFICATE_CLASSES = [
  "Class 1 · Elite",
  "Class 2 · Sport",
  "Class 2 · Pilot",
  "Class 3 · Recreational",
];
