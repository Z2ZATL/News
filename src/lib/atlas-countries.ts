import type { LocalizedText } from "@/lib/content-types";

interface AtlasCountry {
  code: string;
  latitude: number;
  longitude: number;
  name: LocalizedText;
}

const countries = {
  CN: {
    code: "CN",
    latitude: 35.86,
    longitude: 104.2,
    name: { th: "ประเทศจีน", en: "China" },
  },
  TH: {
    code: "TH",
    latitude: 15.87,
    longitude: 100.99,
    name: { th: "ประเทศไทย", en: "Thailand" },
  },
  US: {
    code: "US",
    latitude: 39.83,
    longitude: -98.58,
    name: { th: "สหรัฐอเมริกา", en: "United States" },
  },
} as const satisfies Record<string, AtlasCountry>;

export function getAtlasCountry(countryCode: string): AtlasCountry | null {
  return countryCode in countries
    ? countries[countryCode as keyof typeof countries]
    : null;
}
