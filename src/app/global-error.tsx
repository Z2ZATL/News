"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="th">
      <body>
        <main className="page-shell">
          <p className="page-kicker">ERROR / RETRY</p>
          <h1 className="page-title">เว็บไซต์เปิดไม่สำเร็จ</h1>
          <p className="lede">เกิดข้อขัดข้องชั่วคราว ลองเปิดเว็บไซต์อีกครั้งได้เลย</p>
          <button className="system-action" type="button" onClick={reset}>ลองอีกครั้ง</button>
        </main>
      </body>
    </html>
  );
}
