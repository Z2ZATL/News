import "server-only";

export function isProductionDeployment(): boolean {
  return (
    process.env.DEPLOY_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.CONTEXT === "production"
  );
}
