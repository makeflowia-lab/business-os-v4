// Skill add-emails + compliance: renderiza el HTML del cold email.
// SIEMPRE incluye footer con identidad + link de unsubscribe (CAN-SPAM / LFPDPPP).
import "server-only";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
// Identidad del remitente (compliance: el correo en frio debe identificar quien envia y donde).
const SENDER_IDENTITY =
  process.env.SENDER_IDENTITY ?? "Prospecta · Ciudad de Mexico, MX";

export function renderColdEmail(opts: {
  bodyText: string;
  toEmail: string;
  sendId?: string;
}): string {
  const paragraphs = opts.bodyText
    .split("\n")
    .map((line) => (line.trim() === "" ? "<br/>" : `<p style="margin:0 0 12px">${escapeHtml(line)}</p>`))
    .join("");

  const unsubUrl = `${SITE}/unsubscribe?email=${encodeURIComponent(opts.toEmail)}`;
  // Pixel de apertura (skill outcomes) — registra 'open' al cargar la imagen.
  const pixel = opts.sendId
    ? `<img src="${SITE}/api/track/open?sid=${opts.sendId}" width="1" height="1" alt="" style="display:none"/>`
    : "";

  return `<!doctype html>
<html lang="es-MX"><body style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.5;max-width:560px;margin:0 auto;padding:24px">
${paragraphs}
${pixel}
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
<p style="font-size:12px;color:#6b7280;margin:0 0 6px">${escapeHtml(SENDER_IDENTITY)}</p>
<p style="font-size:12px;color:#6b7280;margin:0">
  Recibiste este correo porque tu contacto fue identificado como posible interesado.
  Si no deseas recibir mas mensajes, <a href="${unsubUrl}" style="color:#6b7280">cancela aqui</a>.
</p>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
