import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "th" ? "ข้อกำหนด" : "Terms",
    description:
      locale === "th"
        ? "ข้อกำหนดการใช้งานเนื้อหา แหล่งอ้างอิง และบริการบนเว็บไซต์ Z2Zs Lab"
        : "Terms for using Z2Zs Lab content, sources, and website services.",
    alternates: localizedAlternates(locale, "/terms"),
  };
}

export default async function Terms({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="page-shell">
      <p className="page-kicker">LEGAL / TERMS</p>
      <h1 className="page-title">{locale === "th" ? "ข้อกำหนด" : "Terms"}</h1>
      <p className="lede">
        {locale === "th"
          ? "เนื้อหาบนเว็บไซต์จัดทำเพื่อให้ข้อมูลและแสดงความคิดเห็นโดยสุจริต ไม่ถือเป็นคำแนะนำด้านกฎหมาย การเงิน หรือการแพทย์ ชื่อผลิตภัณฑ์ เครื่องหมายการค้า และภาพจากบริการภายนอกยังเป็นสิทธิ์ของเจ้าของแต่ละราย"
          : "Content is provided for information and good-faith commentary, not legal, financial, or medical advice. Third-party marks and interface images remain the property of their respective owners."}
      </p>
    </div>
  );
}
