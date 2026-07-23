import { notFound } from "next/navigation";

import { isLocale } from "@/lib/i18n";

import styles from "./about.module.css";

export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const th = locale === "th";
  const focus = th
    ? [
        {
          number: "01",
          title: "ข่าวและบริบท",
          text: "เล่าเรื่องเทคโนโลยีให้เห็นทั้งสิ่งที่เกิดขึ้น เหตุผลที่ควรสนใจ และผลกระทบต่อคนใช้งานจริง",
        },
        {
          number: "02",
          title: "ทดลองใช้จริง",
          text: "ลองใช้ผลิตภัณฑ์ อ่านเอกสารต้นทาง และบันทึกทั้งจุดที่ทำได้ดี ข้อจำกัด และปัญหาที่พบ",
        },
        {
          number: "03",
          title: "ห้องทดลองเปิด",
          text: "เผยแพร่เครื่องมือ ต้นแบบ และบทเรียนระหว่างทาง ไม่รอให้ทุกอย่างสมบูรณ์จึงค่อยนำมาเล่า",
        },
      ]
    : [
        {
          number: "01",
          title: "Reporting & context",
          text: "We explain what changed, why it matters, and how technology affects people who use it.",
        },
        {
          number: "02",
          title: "Hands-on testing",
          text: "We test products, read primary documents, and record strengths, limitations, and failures.",
        },
        {
          number: "03",
          title: "Work in public",
          text: "We share tools, prototypes, and lessons from the process—not only polished outcomes.",
        },
      ];

  return (
    <div className={styles.about}>
      <header className={styles.hero}>
        <p className="page-kicker">ABOUT / Z2ZS LAB</p>
        <h1 className="page-title">{th ? "เรื่องยากก็ควรอ่านรู้เรื่อง" : "Complex stories should still read clearly."}</h1>
        <p className="lede">
          {th
            ? "Z2Zs Lab เล่าเรื่องเทคโนโลยีจากกรุงเทพฯ ผ่านการลองใช้ของจริงและการอ่านเอกสารต้นทาง เราแยกให้ชัดว่าอะไรคือข้อเท็จจริง อะไรคือสิ่งที่พบจากการทดสอบ และอะไรคือความเห็นของผู้เขียน"
            : "Z2Zs Lab is an independent space for technology reporting, analysis, and experiments from Bangkok. We clearly separate verified facts, test observations, and opinion."}
        </p>
      </header>

      <section className={styles.section} aria-labelledby="what-we-do">
        <div className={styles.sectionHeading}>
          <p>01 / {th ? "ขอบเขตงาน" : "Our focus"}</p>
          <h2 id="what-we-do">{th ? "เราทำอะไร" : "What we do"}</h2>
        </div>
        <div className={styles.focusGrid}>
          {focus.map((item) => (
            <article className={styles.focusCard} key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="how-we-work">
        <div className={styles.sectionHeading}>
          <p>02 / {th ? "หลักการ" : "Method"}</p>
          <h2 id="how-we-work">{th ? "เราทำงานอย่างไร" : "How we work"}</h2>
        </div>
        <div className={styles.method}>
          <p>
            {th
              ? "เราเริ่มจากคำถาม ทดลองด้วยตัวเอง ตรวจข้อมูลกับแหล่งต้นทาง แล้วจึงเขียนสิ่งที่พบ ทุกบทความควรเปิดทางให้ผู้อ่านย้อนกลับไปตรวจหลักฐานได้"
              : "We begin with a question, test it ourselves, verify the evidence at its source, and then report what we found. Every story should let readers inspect the evidence."}
          </p>
          <p>
            {th
              ? "เมื่อข้อมูลยังไม่ครบ เราจะบอกว่ายังไม่รู้ เมื่อเป็นประสบการณ์เฉพาะครั้ง เราจะไม่เขียนให้ดูเหมือนข้อสรุปสากล และหากพบความผิดพลาด เราจะแก้ไขให้ชัดเจน"
              : "When evidence is incomplete, we say so. A single test is not presented as a universal conclusion, and material errors are corrected transparently."}
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.people}`} aria-labelledby="author">
        <div className={styles.sectionHeading}>
          <p>03 / {th ? "ผู้เขียน" : "People"}</p>
          <h2 id="author">{th ? "คนที่อยู่เบื้องหลัง" : "Behind the work"}</h2>
        </div>
        <div className={styles.profile}>
          <div>
            <p className={styles.name}>Aitthikorn Khammee</p>
            <p className={styles.role}>{th ? "ผู้ก่อตั้งและผู้เขียน" : "Founder & writer"}</p>
          </div>
          <p>
            {th
              ? "สนใจการนำ AI และเทคโนโลยีใหม่ไปใช้กับงานจริง โดยมองทั้งความสามารถ ข้อจำกัด และระบบที่อยู่รอบตัวผลิตภัณฑ์"
              : "Exploring how AI and emerging technology perform in real work, with attention to capability, limitations, and the systems around the product."}
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.follow}`} aria-labelledby="follow">
        <div className={styles.sectionHeading}>
          <p>04 / {th ? "ช่องทางติดตาม" : "Follow"}</p>
          <h2 id="follow">{th ? "ติดตามงานต่อ" : "Keep in touch"}</h2>
        </div>
        <div className={styles.socials}>
          <a href="https://www.facebook.com/atl.ztwoz" target="_blank" rel="noopener noreferrer">
            <span>Facebook</span>
            <strong>Aitthikorn Khammee</strong>
            <b aria-hidden="true">↗</b>
          </a>
          <a href="https://www.instagram.com/z2zs.lab/" target="_blank" rel="noopener noreferrer">
            <span>Instagram</span>
            <strong>@z2zs.lab</strong>
            <b aria-hidden="true">↗</b>
          </a>
        </div>
      </section>
    </div>
  );
}
