import "server-only";

export function isProductionDeployment(): boolean {
  return process.env.DEPLOY_ENV === "production";
}
