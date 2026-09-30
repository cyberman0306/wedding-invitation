export const SHOWCASE_DESIGNS = [
  "afterglow",
  "photo-diary",
  "blue-hour",
] as const
export type ShowcaseDesign = (typeof SHOWCASE_DESIGNS)[number]
