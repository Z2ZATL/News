import { timingSafeEqual } from "node:crypto";

export function safeEqual(value: string, expected: string | undefined): boolean {
  if (!expected) return false;
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
