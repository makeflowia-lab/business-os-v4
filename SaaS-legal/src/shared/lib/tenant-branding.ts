// Client-safe tenant branding utilities (no database imports)

export interface TenantBranding {
  name: string;
  logo: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
  };
  email?: string;
}

export const defaultBranding: TenantBranding = {
  name: 'Legal Shield Agency',
  logo: '/logo.png',
  colors: {
    primary: '#0a84ff',
    accent: '#ffd700',
    background: '#121212',
  },
  email: 'makeflowia@gmail.com'
};

export function getTenantBranding(tenantId?: string): TenantBranding {
  // Synchronous fallback for client components
  return defaultBranding;
}
