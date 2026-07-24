import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";

import styles from "./project.module.css";

const steps = {
  th: [
    ["01", "เริ่มจากไอเดียที่ยังไม่ชัด", "ผู้ใช้บอกสิ่งที่อยากทำได้ตามธรรมชาติ โดยไม่ต้องเขียน prompt ให้สมบูรณ์ตั้งแต่ครั้งแรก"],
    ["02", "ถามต่อเท่าที่จำเป็น", "ระบบถามทีละข้อและปรับคำถามจากคำตอบก่อนหน้า เพื่อเติมส่วนที่ยังขาดหรือขัดแย้งกัน"],
    ["03", "มองเห็นความชัดเจน", "ประเมิน 8 มิติ ตั้งแต่ปัญหา กลุ่มเป้าหมาย ขอบเขต ความเสี่ยง ไปจนถึงเกณฑ์วัดความสำเร็จ"],
    ["04", "ทบทวนก่อนอนุมัติ", "ผู้ใช้ตรวจ brief แยกข้อเท็จจริง สมมติฐาน และเรื่องที่ยังต้องตัดสินใจ ก่อนสร้าง snapshot ที่แก้ย้อนหลังไม่ได้"],
    ["05", "ส่งต่อเมื่อพร้อม", "brief ที่อนุมัติแล้วจึงเชื่อมต่อไปยัง Notion หรือใช้เป็นบริบทให้ Codex ทำงานต่อ"],
  ],
  en: [
    ["01", "Begin with a rough idea", "Describe what you want naturally—without perfecting the prompt first."],
    ["02", "Ask only what matters", "One adaptive question at a time fills missing context and surfaces contradictions."],
    ["03", "Make clarity visible", "Eight dimensions track the problem, audience, scope, risks, success criteria, and more."],
    ["04", "Review before approval", "People inspect facts, assumptions, and open decisions before creating an immutable snapshot."],
    ["05", "Hand off when ready", "Only an approved brief moves to Notion or becomes working context for Codex."],
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: "Lumixia Brief",
    description:
      locale === "th"
        ? "โปรเจกต์โอเพนซอร์สที่เปลี่ยนไอเดียคลุมเครือให้เป็น brief ที่พร้อมตัดสินใจ ผ่านการสัมภาษณ์แบบปรับตามคำตอบ"
        : "An open-source alignment checkpoint that turns vague ideas into decision-ready project briefs.",
  };
}

export default async function LumixiaBrief({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const th = locale === "th";

  return (
    <div className={styles.project}>
      <header className={styles.hero}>
        <div className={styles.heroMeta}>
          <span>PROJECT / 001</span>
          <span>OPEN SOURCE</span>
          <span>BUILD WEEK</span>
        </div>
        <p className={styles.product}>LUMIXIA BRIEF</p>
        <h1>{th ? "ทำให้คิดตรงกัน ก่อนให้ AI ลงมือ" : "Align first. Then let AI act."}</h1>
        <p className={styles.intro}>
          {th
            ? "Lumixia Brief ไม่รีบสร้างงานจากคำสั่งที่ยังคลุมเครือ แต่ถามต่อจนทุกคนมองเห็นตรงกันว่าอะไรคือข้อเท็จจริง อะไรคือสมมติฐาน และเรื่องใดยังต้องให้มนุษย์ตัดสินใจ"
            : "Lumixia Brief does not rush to generate work from a vague prompt. It asks until everyone can see what is known, what is assumed, and what still needs a human decision."}
        </p>
        <div className={styles.actions}>
          <a href="https://brief.z2zs.space" target="_blank" rel="noopener noreferrer">
            {th ? "เปิดตัวทดลอง" : "Open live demo"} <span aria-hidden="true">↗</span>
          </a>
          <a href="https://github.com/Z2ZATL/lumixia-brief" target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <section className={styles.statement}>
        <p className={styles.sectionNo}>01 / {th ? "ปัญหา" : "Problem"}</p>
        <div>
          <h2>{th ? "คำสั่งที่ดูชัด อาจยังมีช่องว่าง" : "A confident prompt can still hide critical gaps."}</h2>
          <p>
            {th
              ? "AI สามารถสร้างงานที่ดูดีจากข้อมูลเพียงเล็กน้อยได้เร็วมาก แต่ความเร็วนี้อาจพาทีมไปผิดทาง หากเป้าหมาย ขอบเขต หรือเกณฑ์ความสำเร็จยังไม่ตรงกัน Lumixia Brief จึงทำหน้าที่เป็นจุดตรวจความเข้าใจก่อนเริ่มงาน"
              : "AI can produce convincing output from very little context. That speed becomes expensive when the goal, scope, or success criteria are still unsettled. Lumixia Brief acts as an alignment checkpoint before execution."}
          </p>
        </div>
      </section>

      <section className={styles.flow}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionNo}>02 / {th ? "เส้นทางการใช้งาน" : "Product path"}</p>
          <h2>{th ? "จากความคิดคร่าว ๆ สู่ brief ที่ตรวจสอบได้" : "From rough thought to reviewable brief."}</h2>
        </div>
        <ol>
          {steps[locale].map(([number, title, text]) => (
            <li key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.architecture}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionNo}>03 / {th ? "สถาปัตยกรรม" : "Architecture"}</p>
          <h2>
            {th
              ? "เส้นทางข้อมูลตั้งแต่ผู้ใช้ไปจนถึงบริการเบื้องหลัง"
              : "How data moves from people to the services behind the brief."}
          </h2>
        </div>
        <figure className={styles.architectureFigure}>
          <div className={styles.architectureFlow}>
            <div className={styles.architectureColumn}>
              <p className={styles.architectureLabel}>{th ? "จุดเริ่มต้น" : "Entry points"}</p>
              <div className={styles.architectureNode}>Founder / PM / Agency</div>
              <div className={styles.architectureNode}>Codex desktop / CLI</div>
            </div>
            <span className={styles.architectureArrow} aria-hidden="true">→</span>
            <div className={styles.architectureColumn}>
              <p className={styles.architectureLabel}>{th ? "ยืนยันตัวตน" : "Identity"}</p>
              <div className={`${styles.architectureNode} ${styles.architectureNodeAccent}`}>
                Supabase Auth
                <small>Google OAuth + TOTP</small>
              </div>
            </div>
            <span className={styles.architectureArrow} aria-hidden="true">→</span>
            <div className={styles.architectureColumn}>
              <p className={styles.architectureLabel}>{th ? "ส่วนติดต่อ" : "Interface"}</p>
              <div className={`${styles.architectureNode} ${styles.architectureNodeAccent}`}>
                Vite React
                <small>Vercel CDN</small>
              </div>
              <div className={styles.architectureLoop}>
                Loopback demo bridge
                <small>Codex CLI + ChatGPT plan</small>
              </div>
            </div>
            <span className={styles.architectureArrow} aria-hidden="true">→</span>
            <div className={styles.architectureColumn}>
              <p className={styles.architectureLabel}>{th ? "ชั้นบริการ" : "Service layer"}</p>
              <div className={`${styles.architectureNode} ${styles.architectureNodeAccent}`}>
                Express /api
                <small>Vercel function</small>
              </div>
            </div>
            <span className={styles.architectureArrow} aria-hidden="true">→</span>
            <div className={`${styles.architectureColumn} ${styles.architectureOutputs}`}>
              <p className={styles.architectureLabel}>{th ? "บริการปลายทาง" : "Connected services"}</p>
              <div className={styles.architectureNode}>
                OpenAI Responses API
                <small>GPT-5.6 · store:false</small>
              </div>
              <div className={styles.architectureNode}>
                Supabase Postgres
                <small>JWT + owner/AAL2 RLS</small>
              </div>
              <div className={styles.architectureNode}>
                Notion OAuth
                <small>AES-256-GCM tokens</small>
              </div>
              <div className={styles.architectureNode}>
                Sanitized logs + Sentry
                <small>No content or PII</small>
              </div>
            </div>
          </div>
          <figcaption>
            {th
              ? "แผนผังอ้างอิงจากสถาปัตยกรรมที่เผยแพร่ใน repository ของ Lumixia Brief"
              : "Flow adapted from the architecture published in the Lumixia Brief repository."}{" "}
            <a
              href="https://github.com/Z2ZATL/lumixia-brief#architecture"
              target="_blank"
              rel="noopener noreferrer"
            >
              {th ? "ดูต้นฉบับบน GitHub" : "View the source on GitHub"}{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </figcaption>
        </figure>
      </section>

      <section className={styles.difference}>
        <p className={styles.sectionNo}>04 / {th ? "แนวคิดหลัก" : "Core idea"}</p>
        <div className={styles.differenceGrid}>
          <div>
            <span>01</span>
            <h3>{th ? "โมเดลเสนอ ระบบเป็นผู้บังคับกติกา" : "The model proposes. The system enforces."}</h3>
            <p>
              {th
                ? "AI ช่วยสกัดข้อมูลและเสนอคำถาม แต่คะแนนความชัดเจน ลำดับคำถาม และเงื่อนไขหยุดคำนวณจากกติกาที่ตรวจสอบได้"
                : "AI extracts context and proposes questions, while clarity, question priority, and stop rules remain deterministic."}
            </p>
          </div>
          <div>
            <span>02</span>
            <h3>{th ? "ความมั่นใจไม่ใช่ความจริง" : "Confidence is not truth."}</h3>
            <p>
              {th
                ? "คะแนนบอกความครบถ้วนของข้อมูลสำหรับเริ่มงาน ไม่ได้อ้างว่าเนื้อหานั้นถูกต้องหรือโมเดลไม่มีทางผิด"
                : "The score measures interview completeness—not factual accuracy or model certainty."}
            </p>
          </div>
          <div>
            <span>03</span>
            <h3>{th ? "มนุษย์เป็นผู้อนุมัติขั้นสุดท้าย" : "Approval stays human."}</h3>
            <p>
              {th
                ? "การอนุมัติสร้าง snapshot แบบมีเวอร์ชัน การแก้หลังอนุมัติต้องเปิดฉบับใหม่ และการส่งไป Notion เกิดขึ้นเมื่อผู้ใช้ยืนยันแล้วเท่านั้น"
                : "Approval creates a versioned snapshot. Later edits become a new draft, and Notion sync follows explicit human approval."}
            </p>
          </div>
        </div>
      </section>

      <section className={styles.technology}>
        <div>
          <p className={styles.sectionNo}>05 / {th ? "เทคโนโลยี" : "Technology"}</p>
          <h2>React · Express · OpenAI Responses API · Supabase · Notion · Codex</h2>
        </div>
        <div className={styles.status}>
          <p>{th ? "สถานะ" : "Status"}</p>
          <strong>{th ? "ต้นแบบโอเพนซอร์ส" : "Open-source prototype"}</strong>
          <span>
            {th
              ? "สร้างสำหรับ OpenAI Build Week ในหมวด Work & Productivity ตัวทดลองสาธารณะเปิดให้ดูได้ แต่ความสามารถบางส่วนต้องใช้บัญชีและการตั้งค่าของผู้พัฒนา"
              : "Built for OpenAI Build Week in Work & Productivity. The public demo is available, while some integrations require owner configuration and credentials."}
          </span>
        </div>
      </section>

      <footer className={styles.next}>
        <p>LUMIXIA / 001</p>
        <h2>{th ? "ลองดูโปรเจกต์จริง" : "See the project in action."}</h2>
        <div>
          <a href="https://brief.z2zs.space" target="_blank" rel="noopener noreferrer">
            brief.z2zs.space ↗
          </a>
          <Link href={`/${locale}/projects`}>{th ? "กลับไปห้องทดลอง" : "Back to the lab"}</Link>
        </div>
      </footer>
    </div>
  );
}
