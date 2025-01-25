export interface BenchTags {
  ID: number;
  TagName: string | null;
  Botanical: string | null;
  Department: string | null;
  Classification: string | null;
  NoWarranty: boolean | null;
  DeerResistance: string | null;
  Nativity: string | null;
  CarNative: boolean | null;
  MeltingSun: boolean | null;
  FullSun: boolean | null;
  PartSun: boolean | null;
  Shade: boolean | null;
  GrowthRate: string | null;
  AvgSize: string | null;
  MaxSize: string | null;
  MatureSize: string | null;
  ZoneMax: number | null;
  ZoneMin: number | null;
  Winterizing: string | null;
  Notes: string | null;
  ShowTopNotes: boolean | null;
  TopNotes: string | null;
  Image: Buffer | null;
  Price: number | null;
  Size: string | null;
  PotSize: number | null;
  PotSizeUnit: string | null;
  PotDepth: string | null;
  PotShape: string | null;
  PotType: string | null;
  PotCustomText: string | null;
  FlatPricing: boolean | null;
  FlatCount: number | null;
  FlatPrice: number | null;
  Print: boolean | null;
}

export interface CheckTable {
  ID: number;
  Needs Info: boolean | null;
  New: boolean | null;
}

export interface GrowthRateOptions {
  ID: number;
  Description: string | null;
  GrowthRateRange: string | null;
}

export interface WinterizingOptions {
  Type: string;
}