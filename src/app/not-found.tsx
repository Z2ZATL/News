import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <p className="page-kicker">404 / NOT FOUND</p>
      <h1 className="page-title">ไม่พบหน้าที่คุณกำลังหา</h1>
      <p className="lede">ลิงก์นี้อาจถูกย้าย เปลี่ยนชื่อ หรือไม่มีอยู่แล้ว</p>
      <p className="system-action"><Link href="/th">กลับหน้าแรก ↗</Link></p>
    </main>
  );
}
