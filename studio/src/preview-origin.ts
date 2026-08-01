export function isAllowedPreviewBrokerOrigin(
  configuredOrigin: string,
  currentOrigin: string,
): boolean {
  try {
    const configured = new URL(configuredOrigin);
    const current = new URL(currentOrigin);
    return (
      configured.protocol === "https:" &&
      current.protocol === "https:" &&
      configured.origin === current.origin
    );
  } catch {
    return false;
  }
}
