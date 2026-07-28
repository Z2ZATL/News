import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <p className="page-kicker">404 / NOT FOUND</p>
      <div className="locale-copy-th" lang="th">
        <h1 className="page-title">ไม่พบหน้าที่คุณกำลังหา</h1>
        <p className="lede">ลิงก์นี้อาจถูกย้าย เปลี่ยนชื่อ หรือไม่มีอยู่แล้ว</p>
        <p className="system-action"><Link href="/th">กลับหน้าแรก ↗</Link></p>
      </div>
      <div className="locale-copy-en" lang="en">
        <h1 className="page-title">We could not find that page</h1>
        <p className="lede">The link may have moved, changed, or no longer exists.</p>
        <p className="system-action"><Link href="/en">Back to the home page ↗</Link></p>
      </div>
    </main>
  );
}
