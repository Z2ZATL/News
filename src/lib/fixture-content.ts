import type { PortableTextBlock } from "@portabletext/react";

import { facebookArticles } from "@/content/facebook-articles";
import { launchArticle } from "@/content/launch-article";
import type {
  Article,
  ArticleBody,
  LegacyArticle,
  LegacyArticleSection,
  Project,
  SiteSettings,
} from "@/lib/content-types";

function span(text: string, key: string): PortableTextBlock["children"][number] {
  return { _key: key, _type: "span", marks: [], text };
}

function textBlock(
  text: string,
  key: string,
  options: Readonly<{ listItem?: "bullet"; style?: "h2" | "normal" }> = {},
): PortableTextBlock {
  return {
    _key: key,
    _type: "block",
    children: [span(text, `${key}-span`)],
    markDefs: [],
    style: options.style ?? "normal",
    ...(options.listItem ? { level: 1, listItem: options.listItem } : {}),
  };
}

function convertSection(section: LegacyArticleSection, sectionIndex: number): ArticleBody {
  const prefix = `section-${String(sectionIndex)}`;
  return [
    ...(section.heading
      ? [textBlock(section.heading, `${prefix}-heading`, { style: "h2" })]
      : []),
    ...section.paragraphs.map((paragraph, index) =>
      textBlock(paragraph, `${prefix}-paragraph-${String(index)}`),
    ),
    ...(section.image
      ? [
          {
            _key: `${prefix}-image`,
            _type: "articleImage" as const,
            ...section.image,
          },
        ]
      : []),
    ...(section.bullets ?? []).map((bullet, index) =>
      textBlock(bullet, `${prefix}-bullet-${String(index)}`, { listItem: "bullet" }),
    ),
  ];
}

export function convertLegacyArticle(article: LegacyArticle): Article {
  return {
    ...article,
    body: {
      th: article.body.th.flatMap(convertSection),
      en: article.body.en.flatMap(convertSection),
    },
  };
}

export const fixtureArticles = [launchArticle, ...facebookArticles].map(convertLegacyArticle);

export const fixtureProjects: Project[] = [
  {
    body: {
      en: [textBlock("Turn a vague idea into a brief that people and AI can agree on before the work begins.", "project-summary-en")],
      th: [textBlock("เปลี่ยนไอเดียที่ยังคลุมเครือให้เป็น brief ที่ทีมและ AI เข้าใจตรงกัน ก่อนเริ่มลงมือทำ", "project-summary-th")],
    },
    links: ["https://brief.z2zs.space", "https://github.com/Z2ZATL/lumixia-brief"],
    promoted: true,
    slug: "lumixia-brief",
    summary: {
      th: "เปลี่ยนไอเดียที่ยังคลุมเครือให้เป็น brief ที่ทีมและ AI เข้าใจตรงกัน ก่อนเริ่มลงมือทำ",
      en: "Turn a vague idea into a brief that people and AI can agree on before the work begins.",
    },
    title: { en: "Lumixia Brief", th: "Lumixia Brief" },
  },
];

export const fixtureSettings: SiteSettings = {
  footer: {
    th: "เล่าเรื่องเทคโนโลยีให้เข้าใจง่าย โดยไม่ละทิ้งรายละเอียดที่สำคัญ",
    en: "Technology reporting that stays clear without losing the details that matter.",
  },
  siteTitle: { en: "Z2Zs Lab", th: "Z2Zs Lab" },
  socialLinks: ["https://www.facebook.com/atl.ztwoz", "https://www.instagram.com/z2zs.lab/"],
};
