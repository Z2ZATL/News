"use client";

import { motion } from "framer-motion";

export function Reveal({
  children,
  delay = 0,
  className,
}: Readonly<{
  children: React.ReactNode;
  delay?: number;
  className?: string | undefined;
}>) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
