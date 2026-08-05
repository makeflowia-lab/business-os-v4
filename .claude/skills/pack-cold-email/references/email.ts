// Skill add-emails: motor de correo via Resend. Modo dry-run si no hay RESEND_API_KEY
// (permite construir/deployar y probar el pipeline sin enviar de verdad).
import "server-only";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}

export interface SendEmailResult {
  status: "sent" | "dryrun" | "failed";
  providerId?: string;
  error?: string;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendEmail({
  to,
  subject,
  html,
  fromName = "Equipo SaaS",
}: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;

  // Sin key -> dry-run: no envia, pero confirma que el pipeline funciona.
  if (!apiKey) {
    return { status: "dryrun" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${FROM_EMAIL}>`,
        to,
        subject,
        html,
      }),
    });
    const data = (await res.json()) as { id?: string; message?: string };
    if (!res.ok) return { status: "failed", error: data.message ?? `HTTP ${res.status}` };
    return { status: "sent", providerId: data.id };
  } catch (e) {
    return { status: "failed", error: e instanceof Error ? e.message : "error" };
  }
}
