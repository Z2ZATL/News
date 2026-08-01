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
      en: [
        textBlock("The problem", "project-problem-en", { style: "h2" }),
        textBlock(
          "Have you ever explained a task to AI, only to receive something that missed the point? The model may be capable, yet what we intend, what we type, and what it understands can still be three different things.",
          "project-problem-copy-en",
        ),
        textBlock(
          "Lumixia Brief closes that gap before production begins. It asks one useful follow-up at a time, separates facts from assumptions, and makes unresolved decisions visible instead of letting a model silently guess.",
          "project-solution-en",
        ),
        textBlock("How the interview works", "project-process-en", { style: "h2" }),
        textBlock("Begin with a rough idea in natural language—no perfect prompt required.", "project-step-1-en", { listItem: "bullet" }),
        textBlock("Answer only the next question needed to clarify the brief.", "project-step-2-en", { listItem: "bullet" }),
        textBlock("Review the problem, audience, scope, risks, assumptions, and success criteria.", "project-step-3-en", { listItem: "bullet" }),
        textBlock("Approve a versioned snapshot before handing the work to Codex or Notion.", "project-step-4-en", { listItem: "bullet" }),
        textBlock("The operating principle", "project-principle-en", { style: "h2" }),
        textBlock(
          "The model proposes; the system enforces. Confidence measures how complete the interview is—not whether every claim is true—and final approval remains with the person responsible for the work.",
          "project-principle-copy-en",
        ),
      ],
      th: [
        textBlock("ปัญหาที่เราอยากแก้", "project-problem-th", { style: "h2" }),
        textBlock(
          "คุณเคยอธิบายงานให้ AI แล้วได้คำตอบที่ดูดี แต่ไม่ใช่สิ่งที่ต้องการไหม ปัญหาหลายครั้งไม่ได้เกิดจาก AI ไม่เก่ง แต่อยู่ที่สิ่งที่เราคิด สิ่งที่เราพิมพ์ และสิ่งที่ AI เข้าใจยังเป็นคนละเรื่องกัน",
          "project-problem-copy-th",
        ),
        textBlock(
          "Lumixia Brief ช่วยปิดช่องว่างนั้นก่อนเริ่มลงมือ ระบบจะถามต่อทีละเรื่อง แยกข้อเท็จจริงออกจากสมมติฐาน และทำให้ประเด็นที่ยังไม่ได้ตัดสินใจมองเห็นได้ชัด แทนที่จะปล่อยให้ AI คาดเดาเองเงียบ ๆ",
          "project-solution-th",
        ),
        textBlock("บทสนทนาทำงานอย่างไร", "project-process-th", { style: "h2" }),
        textBlock("เริ่มจากเล่าไอเดียตามธรรมชาติ โดยไม่ต้องเขียน prompt ให้สมบูรณ์", "project-step-1-th", { listItem: "bullet" }),
        textBlock("ตอบเฉพาะคำถามถัดไปที่จำเป็นต่อการทำให้โจทย์ชัดขึ้น", "project-step-2-th", { listItem: "bullet" }),
        textBlock("ทบทวนปัญหา กลุ่มเป้าหมาย ขอบเขต ความเสี่ยง สมมติฐาน และเกณฑ์ความสำเร็จ", "project-step-3-th", { listItem: "bullet" }),
        textBlock("อนุมัติ snapshot ที่มีเวอร์ชัน ก่อนส่งต่องานให้ Codex หรือ Notion", "project-step-4-th", { listItem: "bullet" }),
        textBlock("หลักการสำคัญ", "project-principle-th", { style: "h2" }),
        textBlock(
          "โมเดลมีหน้าที่เสนอ ส่วนระบบมีหน้าที่บังคับกติกา คะแนนความมั่นใจบอกความครบถ้วนของบทสัมภาษณ์ ไม่ได้ยืนยันว่าทุกข้อความเป็นความจริง และผู้รับผิดชอบงานยังเป็นผู้อนุมัติขั้นสุดท้ายเสมอ",
          "project-principle-copy-th",
        ),
      ],
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
