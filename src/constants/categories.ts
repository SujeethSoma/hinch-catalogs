export const CATEGORY_ORDER = [
  "Acrylic Laminates",
  "Solid Colour Laminates",
  "Decorative Laminates",
  "360 Louvers",
  "Hardware",
  "Liners",
  "Louvers",
  "Mouldings",
  "PVC Laminates",
  "Thermo Laminates",
  "Veneers",
  "Wall Panels",
  "Doors",
  "Edge Banding"
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
