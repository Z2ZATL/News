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
    title: locale === "th" ? "ความเป็นส่วนตัว" : "Privacy",
    description:
      locale === "th"
        ? "คำอธิบายการเก็บ ใช้ และคุ้มครองข้อมูลส่วนบุคคลของเว็บไซต์ Z2Zs Lab"
        : "How the Z2Zs Lab website collects, uses, and protects personal data.",
    alternates: localizedAlternates(locale, "/privacy"),
  };
}

export default async function Privacy({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="page-shell">
      <p className="page-kicker">LEGAL / PRIVACY</p>
      <h1 className="page-title">{locale === "th" ? "ความเป็นส่วนตัว" : "Privacy"}</h1>
      <p className="lede">
        {locale === "th"
          ? "เว็บไซต์รุ่นนี้ไม่มีระบบสมาชิก ช่องแสดงความคิดเห็น หรือตัวติดตามเพื่อโฆษณา เราเก็บเฉพาะบันทึกทางเทคนิคที่จำเป็นต่อการดูแลความปลอดภัยและแก้ปัญหาเว็บไซต์ ไม่ขายข้อมูลส่วนบุคคล และไม่เก็บไว้นานเกินความจำเป็น"
          : "This first release has no accounts, comments, or advertising trackers. We retain only technical logs required for security and availability, limit retention, and do not sell personal data."}
      </p>
    </div>
  );
}
