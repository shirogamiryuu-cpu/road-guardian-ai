// Curated subset of the Motor Vehicles (Amendment) Act 2019 + common state variants.
// Source: MV Act 2019 official notification + state govt. circulars (sample dataset).

export type Violation = {
  id: string;
  label: string;
  section: string;
  baseFine: number;
  repeatFine?: number;
  imprisonment?: string;
  licenseImpact?: string;
  appliesTo: ("two_wheeler" | "four_wheeler" | "commercial" | "all")[];
  description: string;
  prevention: string;
  stateOverrides?: Record<string, { fine?: number; note?: string }>;
};

export const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Gujarat", "Haryana", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal",
] as const;

export const VIOLATIONS: Violation[] = [
  {
    id: "no_helmet",
    label: "Riding without helmet",
    section: "MV Act §194D",
    baseFine: 1000,
    licenseImpact: "Disqualification for 3 months",
    appliesTo: ["two_wheeler"],
    description: "Rider or pillion riding without an ISI-marked protective helmet.",
    prevention: "Always wear and properly fasten a BIS/ISI-certified full-face helmet, including the pillion rider.",
    stateOverrides: {
      "Tamil Nadu": { fine: 1000 },
      "Karnataka": { fine: 500, note: "Reduced from national rate by state notification" },
      "Maharashtra": { fine: 500 },
    },
  },
  {
    id: "no_seatbelt",
    label: "Not wearing seatbelt",
    section: "MV Act §194B",
    baseFine: 1000,
    appliesTo: ["four_wheeler", "commercial"],
    description: "Driver or any front/back passenger not wearing seatbelt.",
    prevention: "Wear seatbelts in every seat. Most modern cars beep until clipped in.",
  },
  {
    id: "drunk_driving",
    label: "Drunk driving / DUI",
    section: "MV Act §185",
    baseFine: 10000,
    repeatFine: 15000,
    imprisonment: "Up to 6 months (first offence), up to 2 years (repeat)",
    licenseImpact: "Suspension of driving licence",
    appliesTo: ["all"],
    description: "Driving with blood alcohol > 30mg / 100ml or under influence of drugs.",
    prevention: "Use a cab, designated driver, or rideshare. Never drive after drinking.",
  },
  {
    id: "overspeeding_lmv",
    label: "Over-speeding (LMV)",
    section: "MV Act §183",
    baseFine: 1000,
    repeatFine: 2000,
    appliesTo: ["two_wheeler", "four_wheeler"],
    description: "Driving a light motor vehicle above the prescribed speed limit.",
    prevention: "Watch posted limits. City roads default to 50 km/h; highways vary 80–120 km/h.",
  },
  {
    id: "overspeeding_hmv",
    label: "Over-speeding (HMV / commercial)",
    section: "MV Act §183",
    baseFine: 2000,
    repeatFine: 4000,
    appliesTo: ["commercial"],
    description: "Heavy / commercial vehicle exceeding speed limit.",
    prevention: "Commercial vehicles must obey lower limits; tachograph or speed governor required.",
  },
  {
    id: "mobile_use",
    label: "Using mobile phone while driving",
    section: "MV Act §184 (Dangerous driving)",
    baseFine: 5000,
    repeatFine: 10000,
    appliesTo: ["all"],
    description: "Holding or using a mobile phone (calls/texts) while the vehicle is in motion.",
    prevention: "Use a Bluetooth headset or pull over safely. Even handheld GPS counts.",
  },
  {
    id: "signal_jump",
    label: "Jumping red light / signal",
    section: "MV Act §184 / §177",
    baseFine: 1000,
    repeatFine: 2000,
    appliesTo: ["all"],
    description: "Crossing a stop line after the traffic signal turns red.",
    prevention: "Slow down on amber; never enter the intersection on red.",
  },
  {
    id: "no_license",
    label: "Driving without a valid licence",
    section: "MV Act §181",
    baseFine: 5000,
    imprisonment: "Up to 3 months",
    appliesTo: ["all"],
    description: "Driving without holding an effective driving licence for the vehicle class.",
    prevention: "Always carry your DL (or digital DL via mParivahan/DigiLocker).",
  },
  {
    id: "no_insurance",
    label: "Driving without insurance",
    section: "MV Act §196",
    baseFine: 2000,
    repeatFine: 4000,
    imprisonment: "Up to 3 months",
    appliesTo: ["all"],
    description: "Vehicle not covered by a valid third-party insurance policy.",
    prevention: "Renew third-party insurance every year. Digital copy via DigiLocker is accepted.",
  },
  {
    id: "no_puc",
    label: "No Pollution Under Control (PUC) certificate",
    section: "MV Act §190(2)",
    baseFine: 10000,
    appliesTo: ["all"],
    description: "Vehicle operating without a valid PUC certificate.",
    prevention: "Get PUC renewed at any authorised emission centre — costs ₹60–100.",
  },
  {
    id: "triple_riding",
    label: "Triple riding on two-wheeler",
    section: "MV Act §128 / §194C",
    baseFine: 1000,
    licenseImpact: "DL suspended up to 3 months",
    appliesTo: ["two_wheeler"],
    description: "Carrying more than one pillion passenger on a two-wheeler.",
    prevention: "Only one pillion rider permitted at a time.",
  },
  {
    id: "wrong_side",
    label: "Driving on the wrong side / against direction",
    section: "MV Act §184",
    baseFine: 5000,
    appliesTo: ["all"],
    description: "Driving against the legal flow of traffic on a one-way or divided road.",
    prevention: "Use U-turns or service roads — never enter a one-way against the arrow.",
  },
  {
    id: "racing",
    label: "Racing on public road",
    section: "MV Act §189",
    baseFine: 5000,
    repeatFine: 10000,
    imprisonment: "Up to 3 months (first), 1 year (repeat)",
    appliesTo: ["all"],
    description: "Participating in or organising racing on public roads.",
    prevention: "Track days exist for a reason. Public roads are not race tracks.",
  },
  {
    id: "no_papers",
    label: "Driving without registration / RC",
    section: "MV Act §192",
    baseFine: 5000,
    appliesTo: ["all"],
    description: "Vehicle without a valid registration certificate.",
    prevention: "Carry RC (or DigiLocker digital RC). New vehicles must register within 7 days.",
  },
];

export type ChallanResult = {
  violation: Violation;
  state: string;
  fineINR: number;
  isStateOverride: boolean;
  note?: string;
};

export function computeChallan(violationId: string, state: string): ChallanResult | null {
  const v = VIOLATIONS.find((x) => x.id === violationId);
  if (!v) return null;
  const ov = v.stateOverrides?.[state];
  return {
    violation: v,
    state,
    fineINR: ov?.fine ?? v.baseFine,
    isStateOverride: Boolean(ov?.fine),
    note: ov?.note,
  };
}

export function searchViolations(query: string): Violation[] {
  const q = query.toLowerCase();
  return VIOLATIONS.filter(
    (v) =>
      v.label.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.id.includes(q.replace(/\s+/g, "_")),
  );
}
