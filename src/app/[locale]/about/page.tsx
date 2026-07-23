import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <div className="page-shell">
      <p className="page-kicker">ABOUT / Z2ZS LABS</p>
      <h1 className="page-title">{locale === "th" ? "เรื่องยากก็ควรอ่านรู้เรื่อง" : "Complex stories should still read clearly."}</h1>
      <p className="lede">
        {locale === "th"
          ? "Z2Zs Labs เล่าเรื่องเทคโนโลยีจากกรุงเทพฯ เราลองใช้ของจริง อ่านเอกสารต้นทาง และบอกให้ชัดว่าส่วนไหนคือข้อเท็จจริง ส่วนไหนคือสิ่งที่พบจากการทดสอบ และส่วนไหนคือความเห็นของผู้เขียน"
          : "Z2Zs Labs is an independent space for technology reporting, analysis, and experiments from Bangkok. We separate verified facts, test observations, and opinion so readers can inspect the evidence."}
      </p>
    </div>
  );
}
