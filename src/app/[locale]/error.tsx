"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page-shell">
      <p className="page-kicker">ERROR / RETRY</p>
      <div className="locale-copy-th" lang="th">
        <h1 className="page-title">หน้านี้เปิดไม่สำเร็จ</h1>
        <p className="lede">เกิดข้อขัดข้องชั่วคราว ลองโหลดเนื้อหาอีกครั้งได้เลย</p>
        <button className="system-action" type="button" onClick={reset}>ลองอีกครั้ง</button>
      </div>
      <div className="locale-copy-en" lang="en">
        <h1 className="page-title">This page did not open</h1>
        <p className="lede">Something went wrong for a moment. Try loading the content again.</p>
        <button className="system-action" type="button" onClick={reset}>Try again</button>
      </div>
    </div>
  );
}
