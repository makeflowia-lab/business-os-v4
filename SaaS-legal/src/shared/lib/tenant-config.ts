// Server-only tenant configuration (requires database)
import { db } from './db';
import { tenants } from '@/features/legal-shield/db/schema';
import { eq } from 'drizzle-orm';

// Re-export client-safe utilities
export { defaultBranding, getTenantBranding, type TenantBranding } from './tenant-branding';

export async function getTenantBrandingFromDB(tenantId: number) {
  const { defaultBranding } = await import('./tenant-branding');
  try {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (tenant && tenant.branding) {
      return tenant.branding as unknown as typeof defaultBranding;
    }
  } catch (error) {
    console.error('Error fetching tenant branding:', error);
  }
  return defaultBranding;
}
