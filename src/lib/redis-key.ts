type DeploymentEnvironment = Readonly<Record<string, string | undefined>>;

function deploymentLabel(environment: DeploymentEnvironment): string {
  const value =
    environment.DEPLOY_ENV ??
    environment.CONTEXT ??
    environment.VERCEL_ENV ??
    "development";

  if (value === "production") return "production";
  if (value === "preview" || value === "deploy-preview") return "preview";
  if (value === "branch-deploy") return "branch";
  return "development";
}

export function redisKey(
  key: string,
  environment: DeploymentEnvironment = process.env,
): string {
  return `z2zs:${deploymentLabel(environment)}:${key}`;
}
