export function Reveal({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string | undefined;
}>) {
  return <div className={className}>{children}</div>;
}
