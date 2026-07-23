"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page-shell">
      <p className="page-kicker">SYSTEM / INTERRUPTION</p>
      <h1 className="page-title">สัญญาณขาดหายชั่วคราว</h1>
      <button type="button" onClick={reset}>ลองอีกครั้ง</button>
    </div>
  );
}
