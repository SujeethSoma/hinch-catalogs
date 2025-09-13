export const CATEGORY_ORDER = [
  "All",
  "Acrylic Laminates",
  "Solid Colour Laminates",
  "360 Louvers",
  "Decorative Laminates",
  "Doors",
  "Edge Banding",
  "Hardware",
  "Liners",
  "Louvers",
  "Mouldings",
  "PVC Laminates",
  "Thermo Laminates",
  "Veneers",
  "Wall Panels"
] as const;

export const HIDDEN_TOP_CATEGORIES = new Set([
  "Decorative Fabric sheet",
  "Decorative Laminates fiber",
  "Decorative Laminates fibre"
]);

export const DEFAULT_CATEGORIES = [
  "Acrylic Laminates",
  "Solid Colour Laminates"
] as const;

export type CategoryType = typeof CATEGORY_ORDER[number];
