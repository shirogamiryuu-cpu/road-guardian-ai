export type RoadAuthority = {
  type: "NH" | "SH" | "MDR" | "ODR" | "VR" | "URBAN";
  name: string;
  authority: string;
  email: string;
  phone: string;
  description: string;
};

export const AUTHORITIES: Record<string, RoadAuthority> = {
  NH: {
    type: "NH",
    name: "National Highway",
    authority: "National Highways Authority of India (NHAI)",
    email: "complaints@nhai.gov.in",
    phone: "1033",
    description: "Maintained centrally by NHAI / MoRTH. Use highway helpline 1033.",
  },
  SH: {
    type: "SH",
    name: "State Highway",
    authority: "State PWD / State Highways Department",
    email: "complaints-pwd@state.gov.in",
    phone: "1073",
    description: "Maintained by the state Public Works Department.",
  },
  MDR: {
    type: "MDR",
    name: "Major District Road",
    authority: "District Collector / Zila Parishad PWD",
    email: "collector@district.gov.in",
    phone: "1073",
    description: "District-level road. Route via DC office or Zila Panchayat.",
  },
  ODR: {
    type: "ODR",
    name: "Other District Road",
    authority: "Block Development Office / Panchayat Raj",
    email: "bdo@district.gov.in",
    phone: "1073",
    description: "Rural connectivity road, often under PMGSY.",
  },
  VR: {
    type: "VR",
    name: "Village Road",
    authority: "Gram Panchayat / PMGSY cell",
    email: "pmgsy@state.gov.in",
    phone: "1073",
    description: "PMGSY rural road. Report via Meri Sadak app or Gram Panchayat.",
  },
  URBAN: {
    type: "URBAN",
    name: "Urban / Municipal Road",
    authority: "Municipal Corporation / Urban Local Body",
    email: "grievance@municipality.gov.in",
    phone: "1916",
    description: "City roads under the local Municipal Corporation.",
  },
};

export function authorityForOsmTags(highway?: string): RoadAuthority {
  switch (highway) {
    case "motorway":
    case "trunk":
      return AUTHORITIES.NH;
    case "primary":
      return AUTHORITIES.SH;
    case "secondary":
      return AUTHORITIES.MDR;
    case "tertiary":
      return AUTHORITIES.ODR;
    case "residential":
    case "unclassified":
      return AUTHORITIES.URBAN;
    case "track":
    case "living_street":
      return AUTHORITIES.VR;
    default:
      return AUTHORITIES.URBAN;
  }
}
