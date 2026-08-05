// shared/lib/analytics.ts
// Helper de tracking para el skill `outcomes`. Copiar a shared/lib/ en el proyecto.
// Mide el FUNNEL real (signup, activado, pago, churn), no vanidad.

import { createClient } from "@/shared/lib/supabase/client";

/** Eventos canonicos del funnel. Extiende segun la app. */
export type EventName =
  | "signup"
  | "activated" // llego al primer valor (ver skill onboarding)
  | "paid"
  | "churned"
  | (string & {}); // permite eventos custom sin perder el autocompletado

export interface TrackProps {
  /** Variante A/B activa, si aplica (ver getVariant). */
  variant?: string;
  /** Props adicionales. NUNCA incluir PII (emails, nombres). Solo IDs y flags. */
  [key: string]: unknown;
}

/**
 * Registra un evento del funnel en la tabla `events` (RLS activa).
 * No lanza: el tracking nunca debe romper el flujo del usuario.
 */
export async function track(name: EventName, props: TrackProps = {}): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return; // solo trackeamos usuarios autenticados

    await supabase.from("events").insert({
      user_id: user.id,
      name,
      props,
    });
  } catch {
    // Silencioso por diseño: una falla de analytics no afecta al usuario.
  }
}

/**
 * Asignacion estable de variante A/B por user_id (sin libreria externa).
 * Mismo usuario → siempre la misma variante. Registrar variant en cada track().
 */
export function getVariant(userId: string, experiment: string, variants: string[] = ["A", "B"]): string {
  let hash = 0;
  const key = `${experiment}:${userId}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % variants.length;
  return variants[index];
}
