import { PortableText } from "@portabletext/react";
import type {
  PortableTextBlockComponent,
  PortableTextComponents,
  PortableTextMarkComponent,
  PortableTextTypeComponent,
} from "@portabletext/react";
import Image from "next/image";

import type { ArticleBody, ArticleImageBlock } from "@/lib/content-types";

import styles from "@/app/[locale]/stories/[slug]/article.module.css";

function safeHref(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2_048) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "mailto:" ? value : null;
  } catch {
    return null;
  }
}

const LinkMark: PortableTextMarkComponent<{ _type: "link"; href?: unknown }> = ({
  children,
  value,
}) => {
  const href = safeHref(value?.href);
  if (!href) return <>{children}</>;
  const external = href.startsWith("https://");
  return (
    <a
      href={href}
      {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
    >
      {children}
    </a>
  );
};

function headingId(key: string | undefined): string | undefined {
  return key ? `section-${key}` : undefined;
}

const HeadingTwo: PortableTextBlockComponent = ({ children, value }) => (
  <h2 id={headingId(value._key)}>{children}</h2>
);

const HeadingThree: PortableTextBlockComponent = ({ children, value }) => (
  <h3 id={headingId(value._key)}>{children}</h3>
);

const ArticleImage: PortableTextTypeComponent<ArticleImageBlock> = ({ value }) => (
  <figure className={styles.sectionFigure}>
    <a href={value.src} target="_blank" rel="noopener noreferrer">
      <Image
        src={value.src}
        alt={value.alt}
        width={value.width}
        height={value.height}
        sizes="(max-width: 900px) calc(100vw - 40px), 780px"
      />
    </a>
    {value.caption ? <figcaption>{value.caption}</figcaption> : null}
  </figure>
);

const components: PortableTextComponents = {
  block: {
    h2: HeadingTwo,
    h3: HeadingThree,
  },
  marks: {
    link: LinkMark,
  },
  types: {
    articleImage: ArticleImage,
  },
  unknownMark: ({ children }) => <>{children}</>,
  unknownType: () => null,
};

export function ArticleBody({ value }: Readonly<{ value: ArticleBody }>) {
  return <PortableText value={value} components={components} />;
}
