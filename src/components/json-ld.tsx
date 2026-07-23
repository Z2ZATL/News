export function JsonLd({
  nonce,
  data,
}: Readonly<{
  nonce?: string | undefined;
  data: Record<string, unknown>;
}>) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
