// Skills ai + cost-optimizer: redacta el cold email personalizado.
// Usa OpenRouter con el modelo MAS BARATO que cumple (cost-optimizer).
// Fallback a plantilla si no hay OPENROUTER_API_KEY (sigue funcionando sin IA).
import "server-only";
import { computeCostUsd } from "./ai-cost";

export interface CopyInput {
  lead: { name?: string | null; company?: string | null };
  oferta: string; // que ofrecemos (ej: "creacion de SaaS a la medida")
  fromName: string;
}

export interface GeneratedCopy {
  subject: string;
  body: string; // texto con saltos de linea; el template lo formatea
  source: "ai" | "template";
  model?: string;
  // cost-optimizer: medicion real de costo-IA de esta generacion.
  tokens?: number;
  costUsd?: number;
}

// cost-optimizer: tarea de redaccion corta -> modelo barato. No usamos un tier caro.
const MODEL = "openai/gpt-4o-mini";

export async function generateColdEmail(input: CopyInput): Promise<GeneratedCopy> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const nombre = input.lead.name?.split(" ")[0] ?? "Hola";
  const empresa = input.lead.company ?? "tu negocio";

  if (!apiKey) {
    // Fallback sin IA: plantilla solida con variables.
    return {
      source: "template",
      subject: `Una idea para ${empresa}`,
      body: [
        `Hola ${nombre},`,
        ``,
        `Vi que ${empresa} podria crecer mas rapido con software a la medida.`,
        `En ${input.fromName} construimos ${input.oferta} en dias, no meses.`,
        ``,
        `Te late una llamada corta de 15 min esta semana?`,
        ``,
        `Saludos,`,
        input.fromName,
      ].join("\n"),
    };
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "Eres un SDR experto en correo en frio B2B en espanol mexicano. Escribe corto, humano, sin relleno. Devuelve JSON {subject, body}. El body en texto plano con saltos de linea, max 90 palabras, un solo CTA (llamada de 15 min).",
          },
          {
            role: "user",
            content: `Lead: ${nombre} de ${empresa}. Ofrecemos: ${input.oferta}. Remitente: ${input.fromName}.`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
      }),
    });
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };
    const raw = data.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as { subject?: string; body?: string };
    if (!parsed.subject || !parsed.body) throw new Error("respuesta incompleta");
    // cost-optimizer: medir el costo-IA real de esta generacion.
    const usage = {
      promptTokens: data.usage?.prompt_tokens ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
    };
    return {
      source: "ai",
      model: MODEL,
      subject: parsed.subject,
      body: parsed.body,
      tokens: data.usage?.total_tokens ?? usage.promptTokens + usage.completionTokens,
      costUsd: computeCostUsd(MODEL, usage),
    };
  } catch {
    // Si la IA falla, no rompemos: caemos al template.
    return generateColdEmail({ ...input, lead: input.lead, oferta: input.oferta });
  }
}
