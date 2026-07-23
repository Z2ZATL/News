import { notFound } from "next/navigation";

import { isLocale, ui } from "@/lib/i18n";

export default async function Projects({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="page-shell">
      <p className="page-kicker">LAB / WORK IN PUBLIC</p>
      <h1 className="page-title">{ui[locale].projects}</h1>
      <p className="lede">
        {locale === "th"
          ? "ที่นี่จะรวมเครื่องมือ ต้นแบบ และงานทดลองของ Z2Zs Labs เราจะทยอยเปิดให้ดูทั้งแนวคิด วิธีทำ และสิ่งที่ลองแล้วไม่เวิร์ก ไม่ใช่เฉพาะผลงานฉบับสวยงามตอนท้าย"
          : "A future index of experiments, tools, and projects from Z2Zs Labs."}
      </p>
    </div>
  );
}
