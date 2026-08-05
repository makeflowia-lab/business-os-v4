// Deployment modes (mirror of Prisma enum for client-side use)
export type DeploymentMode = "CLOUD" | "VPS" | "LOCAL";

export interface AppConfig {
  mode: DeploymentMode;
  appName: string;
  isMultiTenant: boolean;
  canRegister: boolean;
  requiresLicense: boolean;
  allowManualBackups: boolean;
  deploymentUrl: string;
}

const envMode = (process.env.NEXT_PUBLIC_DEPLOYMENT_MODE as DeploymentMode) || "CLOUD";

export const config: AppConfig = {
  mode: envMode,
  appName: "SaaS Factory Modular",
  isMultiTenant: envMode === "CLOUD",
  canRegister: envMode === "CLOUD",
  requiresLicense: envMode === "LOCAL",
  allowManualBackups: envMode !== "CLOUD",
  deploymentUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

export const isCloud = () => config.mode === "CLOUD";
export const isVPS = () => config.mode === "VPS";
export const isLocal = () => config.mode === "LOCAL";
