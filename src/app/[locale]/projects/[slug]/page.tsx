import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/article-body";
import { getProject } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { localizedAlternates } from "@/lib/metadata";

import styles from "./project-detail.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = await getProject(slug, { draft: (await draftMode()).isEnabled });
  if (!project) return {};
  return {
    alternates: localizedAlternates(locale, `/projects/${slug}`),
    description: project.summary[locale],
    title: project.title[locale],
  };
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || slug === "lumixia-brief") notFound();
  const project = await getProject(slug, { draft: (await draftMode()).isEnabled });
  if (!project) notFound();

  return (
    <article className={styles.project}>
      <header>
        <p className="page-kicker">LAB / PROJECT</p>
        <h1 className="page-title">{project.title[locale]}</h1>
        <p className="lede">{project.summary[locale]}</p>
      </header>
      <div className={styles.body}>
        <ArticleBody value={project.body[locale]} />
      </div>
      {project.links.length ? (
        <nav aria-label={locale === "th" ? "ลิงก์ของโปรเจกต์" : "Project links"}>
          {project.links.map((url) => (
            <a href={url} key={url} rel="noopener noreferrer" target="_blank">
              {new URL(url).hostname} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
      ) : null}
    </article>
  );
}
