import styles from "./reading-progress.module.css";

export function ReadingProgress() {
  return (
    <div className={styles.track} aria-hidden="true">
      <span />
    </div>
  );
}
