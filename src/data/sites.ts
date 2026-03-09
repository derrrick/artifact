import data from "./inspiration_websites.json";

export interface Site {
  name: string;
  url: string;
  description: string;
  tags: string[];
  iframeBlocked?: boolean;
}

export interface Bucket {
  id: string;
  name: string;
  description: string;
  filters: string[];
  sources: Site[];
}

const bucketData = data as { metadata: Record<string, unknown>; buckets: Bucket[] };

export const buckets = bucketData.buckets;

export const allSites: (Site & { bucketId: string; bucketName: string })[] =
  buckets.flatMap((b) =>
    b.sources.map((s) => ({ ...s, bucketId: b.id, bucketName: b.name }))
  );

export const bucketLabels: Record<string, string> = {
  typography_first: "Typography",
  atmospheric_cinematic: "Atmospheric",
  luxury_fashion_ecommerce: "Luxury",
  art_culture_institutions: "Art & Culture",
  independent_publishing: "Publishing",
  creative_studios: "Studios",
  design_architecture: "Architecture",
  photography_visual_art: "Photography",
  music_culture: "Music",
  tech_product: "Tech",
};

export const bucketColors: Record<string, string> = {
  typography_first: "#E9F055",
  atmospheric_cinematic: "#FA4D31",
  luxury_fashion_ecommerce: "#D8EFFE",
  art_culture_institutions: "#ADB8A0",
  independent_publishing: "#E9F055",
  creative_studios: "#FA4D31",
  design_architecture: "#D8EFFE",
  photography_visual_art: "#ADB8A0",
  music_culture: "#E9F055",
  tech_product: "#FA4D31",
};

export function getFilteredSites(bucketId: string | null) {
  if (!bucketId) return allSites;
  return allSites.filter((s) => s.bucketId === bucketId);
}

export function getRandomSite(bucketId: string | null) {
  const pool = getFilteredSites(bucketId);
  return pool[Math.floor(Math.random() * pool.length)];
}
