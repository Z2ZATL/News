import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale, ui } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/metadata";
import { getProjects } from "@/lib/content";

import styles from "./projects.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: ui[locale].projects,
    description:
      locale === "th"
        ? "เครื่องมือ ต้นแบบ และงานทดลองของ Z2Zs Lab พร้อมแนวคิด วิธีทำ และสิ่งที่เรียนรู้จากการลงมือจริง"
        : "Tools, prototypes, and experiments from Z2Zs Lab, including the thinking and lessons behind the work.",
    alternates: localizedAlternates(locale, "/projects"),
  };
}

export default async function Projects({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const th = locale === "th";
  const projects = await getProjects();
  const featured = projects.find((project) => project.promoted) ?? projects[0];
  if (!featured) notFound();

  return (
    <div className={styles.projects}>
      <header className={styles.hero}>
        <p className="page-kicker">LAB / WORK IN PUBLIC</p>
        <h1 className="page-title">{ui[locale].projects}</h1>
        <p className="lede">
          {th
            ? "พื้นที่รวมเครื่องมือ ต้นแบบ และงานทดลองของ Z2Zs Lab เราเปิดให้ดูตั้งแต่แนวคิด วิธีทำ ไปจนถึงบทเรียนจากสิ่งที่ยังไม่สำเร็จ ไม่ใช่เพียงผลงานฉบับสมบูรณ์ตอนท้าย"
            : "Tools, prototypes, and experiments from Z2Zs Lab—shared from the first idea through the lessons that did not make the polished final cut."}
        </p>
      </header>

      <section className={styles.index} aria-labelledby="featured-project">
        <div className={styles.indexLabel}>
          <span>01</span>
          <p>{th ? "โปรเจกต์เด่น" : "Featured project"}</p>
        </div>
        <article className={styles.projectCard}>
          <Link
            className={styles.projectLink}
            href={`/${locale}/projects/${featured.slug}` as Route}
          >
            <div className={styles.projectCopy}>
              <div className={styles.meta}>
                <span>OPEN SOURCE</span>
                <span>BUILD WEEK</span>
                <span>WORK &amp; PRODUCTIVITY</span>
              </div>
              <p className={styles.brand}>LUMIXIA / 001</p>
              <h2 id="featured-project">{featured.title[locale]}</h2>
              <p className={styles.summary}>{featured.summary[locale]}</p>
              <span className={styles.readMore}>
                {th ? "ดูเบื้องหลังโปรเจกต์" : "Explore the project"} <b aria-hidden="true">↗</b>
              </span>
            </div>

            <div className={styles.briefVisual} aria-hidden="true">
              <div className={styles.visualTop}>
                <span>LUMIXIA BRIEF</span>
                <span>ALIGNMENT CHECKPOINT</span>
              </div>
              <div className={styles.score}>
                <strong>87</strong>
                <span>% clarity</span>
              </div>
              <div className={styles.dimensions}>
                {["Problem", "Audience", "Outcome", "Scope", "Constraints", "Timeline", "Risks", "Success"].map(
                  (dimension, index) => (
                    <div key={dimension}>
                      <span>{dimension}</span>
                      <i style={{ "--score": `${String(58 + index * 5)}%` } as React.CSSProperties} />
                    </div>
                  ),
                )}
              </div>
              <div className={styles.visualFooter}>
                <span>8 DIMENSIONS</span>
                <span>HUMAN APPROVAL REQUIRED</span>
              </div>
            </div>
          </Link>
        </article>
        {projects.length > 1 ? (
          <div className={styles.projectList}>
            {projects.filter((project) => project.slug !== featured.slug).map((project) => (
              <Link href={`/${locale}/projects/${project.slug}` as Route} key={project.slug}>
                <span>LAB</span>
                <h2>{project.title[locale]}</h2>
                <p>{project.summary[locale]}</p>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
