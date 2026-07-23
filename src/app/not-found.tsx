import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <p className="page-kicker">404 / LOST SIGNAL</p>
      <h1 className="page-title">ไม่พบหน้าที่ค้นหา</h1>
      <p className="lede">The signal moved, or the address was never part of this atlas.</p>
      <p style={{ marginTop: "2rem", color: "var(--cyan)" }}><Link href="/th">กลับหน้าแรก ↗</Link></p>
    </main>
  );
}
