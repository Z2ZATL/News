import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/metadata";
import { getProject } from "@/lib/content";

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
        ? "เมื่อ AI เข้าใจงานไม่ตรงกับเรา Lumixia Brief จะถามต่อ แยกข้อเท็จจริงจากสมมติฐาน และเปลี่ยนไอเดียคลุมเครือให้เป็น brief ที่พร้อมตัดสินใจ"
        : "When AI misunderstands the task, Lumixia Brief asks follow-up questions, separates facts from assumptions, and turns vague ideas into decision-ready briefs.",
    alternates: localizedAlternates(locale, "/projects/lumixia-brief"),
  };
}

export default async function LumixiaBrief({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (!(await getProject("lumixia-brief", { draft: (await draftMode()).isEnabled }))) notFound();
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
        <h1>
          {th
            ? "เคยไหม อธิบายงานให้ AI แล้วได้สิ่งที่ไม่ตรงใจ"
            : "Ever explained a task to AI and received the wrong thing?"}
        </h1>
        <p className={styles.intro}>
          {th
            ? "หลายครั้งปัญหาไม่ได้เกิดจาก AI ไม่เก่ง แต่เกิดจากสิ่งที่เราคิด สิ่งที่เราพิมพ์ และสิ่งที่ AI เข้าใจเป็นคนละเรื่องกัน Lumixia Brief จึงช่วยถามต่อ แยกข้อเท็จจริงออกจากสมมติฐาน และทำให้โจทย์ชัดก่อนส่งให้ AI ลงมือ"
            : "The model may be capable, yet what we intend, what we type, and what it understands can still be three different things. Lumixia Brief asks follow-up questions, separates facts from assumptions, and clarifies the brief before AI starts work."}
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
          <h2>{th ? "AI ไม่ได้อ่านใจเรา และคำสั่งหนึ่งย่อมมีช่องว่าง" : "AI cannot read our minds. Every prompt leaves gaps."}</h2>
          <p>
            {th
              ? "เราอาจบอกว่าอยากได้เว็บไซต์ที่ดูทันสมัย แต่ยังไม่ได้อธิบายว่าใครจะใช้ ผู้ใช้ต้องทำอะไร ข้อมูลใดสำคัญ หรือความสำเร็จวัดจากอะไร AI จึงมักเติมช่องว่างเหล่านั้นด้วยการคาดเดา และสร้างงานที่ดูดีแต่ไม่ตอบโจทย์ Lumixia Brief ทำหน้าที่เป็นจุดตรวจความเข้าใจ ชวนคุยทีละคำถามจนเป้าหมาย ขอบเขต ความเสี่ยง และเกณฑ์ความสำเร็จชัดพอให้ทั้งคนและ AI ทำงานไปในทิศทางเดียวกัน"
              : "We might ask for a modern website without explaining who will use it, what they need to accomplish, which information matters, or how success will be measured. AI fills those gaps with guesses and can produce polished work that solves the wrong problem. Lumixia Brief is an alignment checkpoint: it asks one focused question at a time until the goal, scope, risks, and success criteria are clear enough for people and AI to move in the same direction."}
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
              ? "ทุกเส้นทางผ่านการยืนยันตัวตน แต่ไม่ได้ถูกบังคับให้ผ่านหน้าเว็บ"
              : "Every path is authenticated, but not every request must pass through the web interface."}
          </h2>
        </div>
        <div className={styles.architectureIntro}>
          <p>
            {th
              ? "ผู้ใช้ทั่วไปเริ่มจากหน้าเว็บ ส่วน Codex desktop หรือ CLI สามารถเข้ามาในฐานะโมเดลที่เจ้าของระบบควบคุมเอง ทั้งสองเส้นทางต้องผ่าน Supabase Auth ก่อนเสมอ"
              : "People normally begin in the web interface, while Codex desktop or CLI can enter as an owner-operated model. Both routes pass through Supabase Auth first."}
          </p>
          <p>
            {th
              ? "หลังยืนยันตัวตน ระบบสามารถเปิดหน้า Vite React หรือเรียก Express API โดยตรง หน้าเว็บเชื่อมกับ Loopback demo bridge แบบไปและกลับ เพื่อใช้ Codex CLI ผ่านสิทธิ์ ChatGPT และยังส่งคำขอไปยัง API function ได้ตามปกติ"
              : "After authentication, the system can open the Vite React interface or call the Express API directly. The web app has a two-way loop with the local demo bridge for Codex CLI through a ChatGPT plan, and it can also call the API function normally."}
          </p>
          <p>
            {th
              ? "Express API เป็นจุดกระจายงานไปยัง OpenAI Responses API, ฐานข้อมูล Supabase, Notion Public OAuth และระบบบันทึกเหตุการณ์ที่ตัดเนื้อหาและข้อมูลส่วนบุคคลออก"
              : "The Express API fans work out to the OpenAI Responses API, Supabase Postgres, Notion Public OAuth, and sanitized observability that excludes content and personal data."}
          </p>
        </div>
        <figure className={styles.architectureFigure}>
          <div className={styles.architectureCanvas}>
            <svg
              className={styles.architectureDiagram}
              viewBox="0 0 1600 560"
              role="img"
              aria-labelledby="lumixia-architecture-title lumixia-architecture-desc"
            >
              <title id="lumixia-architecture-title">
                {th ? "แผนผังสถาปัตยกรรม Lumixia Brief" : "Lumixia Brief architecture"}
              </title>
              <desc id="lumixia-architecture-desc">
                {th
                  ? "Founder, PM, Agency และ Codex desktop หรือ CLI เชื่อมเข้าสู่ Supabase Auth จากนั้นไปยังหน้าเว็บหรือ API โดยหน้าเว็บมีวงย้อนกลับกับ Loopback demo bridge และ API เชื่อมต่อบริการภายนอกสี่ส่วน"
                  : "Founder, PM, Agency, and Codex desktop or CLI connect to Supabase Auth, then to the web app or API. The web app loops through the local demo bridge, while the API connects to four downstream services."}
              </desc>
              <defs>
                <marker
                  id="lumixia-arrow"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" className={styles.architectureMarker} />
                </marker>
              </defs>

              <g className={styles.architectureEdges} aria-hidden="true">
                <path d="M240 140 C285 140 295 245 340 255" />
                <path d="M240 380 C285 380 295 305 340 285" />
                <path d="M580 250 C625 250 645 150 690 150" />
                <path d="M580 290 C760 290 875 270 1050 270" />
                <path d="M930 150 C985 150 1000 245 1050 250" />
                <path d="M790 200 L790 360" />
                <path d="M840 360 L840 200" className={styles.architectureLoopEdge} />
                <path d="M1290 250 C1330 250 1340 70 1380 70" />
                <path d="M1290 265 C1330 265 1340 210 1380 210" />
                <path d="M1290 280 C1330 280 1340 350 1380 350" />
                <path d="M1290 295 C1330 295 1340 490 1380 490" />
              </g>

              <g className={styles.architectureNodeSvg} transform="translate(20 100)">
                <rect width="220" height="80" rx="10" />
                <text x="110" y="48" textAnchor="middle">Founder / PM / Agency</text>
              </g>
              <g className={styles.architectureNodeSvg} transform="translate(20 330)">
                <rect width="220" height="100" rx="10" />
                <text x="110" y="42" textAnchor="middle">Codex desktop / CLI</text>
                <text className={styles.architectureSubtext} x="110" y="69" textAnchor="middle">
                  owner-operated model
                </text>
              </g>
              <g className={[styles.architectureNodeSvg, styles.architectureNodePrimary].join(" ")} transform="translate(340 220)">
                <rect width="240" height="100" rx="10" />
                <text x="120" y="42" textAnchor="middle">Supabase Auth</text>
                <text className={styles.architectureSubtext} x="120" y="69" textAnchor="middle">
                  Google OAuth + TOTP
                </text>
              </g>
              <g className={[styles.architectureNodeSvg, styles.architectureNodePrimary].join(" ")} transform="translate(690 100)">
                <rect width="240" height="100" rx="10" />
                <text x="120" y="42" textAnchor="middle">Vite React</text>
                <text className={styles.architectureSubtext} x="120" y="69" textAnchor="middle">
                  on Vercel CDN
                </text>
              </g>
              <g className={[styles.architectureNodeSvg, styles.architectureNodeLoop].join(" ")} transform="translate(690 360)">
                <rect width="240" height="100" rx="10" />
                <text x="120" y="42" textAnchor="middle">Loopback demo bridge</text>
                <text className={styles.architectureSubtext} x="120" y="69" textAnchor="middle">
                  Codex CLI + ChatGPT plan
                </text>
              </g>
              <g className={[styles.architectureNodeSvg, styles.architectureNodePrimary].join(" ")} transform="translate(1050 220)">
                <rect width="240" height="100" rx="10" />
                <text x="120" y="42" textAnchor="middle">Express /api function</text>
                <text className={styles.architectureSubtext} x="120" y="69" textAnchor="middle">
                  Vercel function
                </text>
              </g>
              <g className={styles.architectureNodeSvg} transform="translate(1380 20)">
                <rect width="200" height="100" rx="10" />
                <text x="100" y="38" textAnchor="middle">OpenAI Responses API</text>
                <text className={styles.architectureSubtext} x="100" y="67" textAnchor="middle">
                  GPT-5.6 · store:false
                </text>
              </g>
              <g className={styles.architectureNodeSvg} transform="translate(1380 160)">
                <rect width="200" height="100" rx="10" />
                <text x="100" y="38" textAnchor="middle">Supabase Postgres</text>
                <text className={styles.architectureSubtext} x="100" y="67" textAnchor="middle">
                  Native JWT + owner/AAL2 RLS
                </text>
              </g>
              <g className={styles.architectureNodeSvg} transform="translate(1380 300)">
                <rect width="200" height="100" rx="10" />
                <text x="100" y="38" textAnchor="middle">Notion Public OAuth</text>
                <text className={styles.architectureSubtext} x="100" y="67" textAnchor="middle">
                  AES-256-GCM tokens
                </text>
              </g>
              <g className={styles.architectureNodeSvg} transform="translate(1380 440)">
                <rect width="200" height="100" rx="10" />
                <text x="100" y="38" textAnchor="middle">Sanitized logs + Sentry</text>
                <text className={styles.architectureSubtext} x="100" y="67" textAnchor="middle">
                  no content or PII
                </text>
              </g>
            </svg>
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
