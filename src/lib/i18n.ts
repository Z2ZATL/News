export const locales = ["th", "en"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export const ui = {
  th: {
    stories: "เรื่องล่าสุด",
    projects: "ห้องทดลอง",
    about: "รู้จักเรา",
    search: "ค้นหา",
    latest: "บทวิเคราะห์ล่าสุด",
    read: "อ่านฉบับเต็ม",
    sources: "เอกสารอ้างอิง",
    published: "เผยแพร่",
    updated: "อัปเดต",
    by: "โพสต์โดย",
    minutes: "นาที",
    atlasLabel: "เรื่องเด่นจาก Z2Zs Lab",
  },
  en: {
    stories: "Stories",
    projects: "Projects",
    about: "About",
    search: "Search",
    latest: "Latest analysis",
    read: "Read story",
    sources: "Sources",
    published: "Published",
    updated: "Updated",
    by: "Posted by",
    minutes: "min read",
    atlasLabel: "Z2Zs Lab content atlas",
  },
} as const;
