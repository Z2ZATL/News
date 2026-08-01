import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/article-body";
import { getProject } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/metadata";

import styles from "./project.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const project = await getProject("lumixia-brief", {
    draft: (await draftMode()).isEnabled,
  });
  if (!project) return {};
  return {
    alternates: localizedAlternates(locale, "/projects/lumixia-brief"),
    description: project.summary[locale],
    title: project.title[locale],
  };
}

export default async function LumixiaBrief({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const project = await getProject("lumixia-brief", {
    draft: (await draftMode()).isEnabled,
  });
  if (!project) notFound();
  const th = locale === "th";
  const repositoryUrl = project.links.find((url) => new URL(url).hostname === "github.com");

  return (
    <div className={styles.project}>
      <header className={styles.hero}>
        <div className={styles.heroMeta}>
          <span>PROJECT / 001</span>
          <span>WORK IN PUBLIC</span>
        </div>
        <p className={styles.product}>Z2ZS LAB / PROJECT</p>
        <h1>{project.title[locale]}</h1>
        <p className={styles.intro}>{project.summary[locale]}</p>
        {project.links.length ? (
          <nav className={styles.actions} aria-label={th ? "ลิงก์ของโปรเจกต์" : "Project links"}>
            {project.links.map((url) => (
              <a href={url} key={url} rel="noopener noreferrer" target="_blank">
                {new URL(url).hostname} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        ) : null}
      </header>

      <section className={styles.statement}>
        <p className={styles.sectionNo}>01 / {th ? "รายละเอียด" : "Project brief"}</p>
        <div>
          <h2>{th ? "เนื้อหาที่เผยแพร่จากห้องทดลอง" : "Published from the Lab workspace"}</h2>
          <div className={styles.projectBody}>
            <ArticleBody value={project.body[locale]} />
          </div>
        </div>
      </section>

      <section className={styles.architecture}>
        <div className={styles.sectionHeading}>
          <p className={styles.sectionNo}>02 / ARCHITECTURE</p>
          <h2>{th ? "ระบบเชื่อมต่อกันอย่างไร" : "How the system connects"}</h2>
        </div>
        <figure className={styles.architectureFigure}>
          <div className={styles.architectureCanvas}>
            <svg
              aria-labelledby="lumixia-architecture-title lumixia-architecture-desc"
              className={styles.architectureDiagram}
              role="img"
              viewBox="0 0 1600 560"
            >
              <title id="lumixia-architecture-title">
                {th ? "แผนผังสถาปัตยกรรม Lumixia Brief" : "Lumixia Brief architecture"}
              </title>
              <desc id="lumixia-architecture-desc">
                {th
                  ? "ผู้ใช้และ Codex เชื่อมผ่าน Supabase Auth ไปยังเว็บและ API ซึ่งติดต่อบริการจัดเก็บข้อมูล โมเดล และระบบสังเกตการณ์"
                  : "People and Codex authenticate through Supabase before the web app and API connect to storage, model, and observability services."}
              </desc>
              <defs>
                <marker
                  id="lumixia-arrow"
                  markerHeight="7"
                  markerWidth="7"
                  orient="auto-start-reverse"
                  refX="9"
                  refY="5"
                  viewBox="0 0 10 10"
                >
                  <path className={styles.architectureMarker} d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
              </defs>
              <g aria-hidden="true" className={styles.architectureEdges}>
                <path d="M240 140 C285 140 295 245 340 255" />
                <path d="M240 380 C285 380 295 305 340 285" />
                <path d="M580 250 C625 250 645 150 690 150" />
                <path d="M580 290 C760 290 875 270 1050 270" />
                <path d="M930 150 C985 150 1000 245 1050 250" />
                <path d="M790 200 L790 360" />
                <path className={styles.architectureLoopEdge} d="M840 360 L840 200" />
                <path d="M1290 250 C1330 250 1340 70 1380 70" />
                <path d="M1290 265 C1330 265 1340 210 1380 210" />
                <path d="M1290 280 C1330 280 1340 350 1380 350" />
                <path d="M1290 295 C1330 295 1340 490 1380 490" />
              </g>
              <ArchitectureNode label="Founder / PM / Agency" x={20} y={100} />
              <ArchitectureNode label="Codex desktop / CLI" sublabel="owner-operated model" x={20} y={330} />
              <ArchitectureNode label="Supabase Auth" primary sublabel="Google OAuth + TOTP" x={340} y={220} />
              <ArchitectureNode label="Vite React" primary sublabel="on Vercel CDN" x={690} y={100} />
              <ArchitectureNode label="Loopback demo bridge" loop sublabel="Codex CLI + ChatGPT plan" x={690} y={360} />
              <ArchitectureNode label="Express /api function" primary sublabel="Vercel function" x={1050} y={220} />
              <ArchitectureNode label="OpenAI Responses API" sublabel="GPT-5.6 · store:false" x={1380} y={20} />
              <ArchitectureNode label="Supabase Postgres" sublabel="Native JWT + owner/AAL2 RLS" x={1380} y={160} />
              <ArchitectureNode label="Notion Public OAuth" sublabel="AES-256-GCM tokens" x={1380} y={300} />
              <ArchitectureNode label="Sanitized logs + Sentry" sublabel="no content or PII" x={1380} y={440} />
            </svg>
          </div>
          {repositoryUrl ? (
            <figcaption>
              {th ? "ดูรายละเอียดสถาปัตยกรรมจากต้นทางได้ที่ " : "Inspect the source architecture on "}
              <a href={`${repositoryUrl}#architecture`} rel="noopener noreferrer" target="_blank">
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </figcaption>
          ) : null}
        </figure>
      </section>

      <section className={styles.next}>
        <p>03 / NEXT</p>
        <h2>{th ? "สำรวจงานชิ้นอื่นในห้องทดลอง" : "Explore more work from the Lab"}</h2>
        <div>
          <Link href={`/${locale}/projects`}>{th ? "กลับไปห้องทดลอง" : "Back to the Lab"}</Link>
        </div>
      </section>
    </div>
  );
}

function ArchitectureNode({
  label,
  loop = false,
  primary = false,
  sublabel,
  x,
  y,
}: Readonly<{
  label: string;
  loop?: boolean;
  primary?: boolean;
  sublabel?: string;
  x: number;
  y: number;
}>) {
  const classes = [
    styles.architectureNodeSvg,
    primary ? styles.architectureNodePrimary : "",
    loop ? styles.architectureNodeLoop : "",
  ].filter(Boolean).join(" ");
  const width = x === 1380 ? 200 : x === 20 ? 220 : 240;
  const height = sublabel ? 100 : 80;
  return (
    <g className={classes} transform={`translate(${String(x)} ${String(y)})`}>
      <rect height={height} rx="10" width={width} />
      <text textAnchor="middle" x={width / 2} y={sublabel ? 42 : 48}>{label}</text>
      {sublabel ? (
        <text className={styles.architectureSubtext} textAnchor="middle" x={width / 2} y={69}>
          {sublabel}
        </text>
      ) : null}
    </g>
  );
}
