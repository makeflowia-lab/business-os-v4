// Skill cost-optimizer: precios por modelo + calculo de costo-IA real.
// El modelo se elige por la tarea (el mas barato que cumple). Aqui se mide cuanto costo.

export interface ModelPrice {
  model: string;
  inPerM: number; // USD por 1M tokens de entrada
  outPerM: number; // USD por 1M tokens de salida
  tier: "barato" | "medio" | "premium";
}

// Tabla de routing por costo (cost-optimizer). Tarea de redaccion corta -> tier barato.
export const MODEL_PRICES: Record<string, ModelPrice> = {
  "openai/gpt-4o-mini": { model: "openai/gpt-4o-mini", inPerM: 0.15, outPerM: 0.6, tier: "barato" },
  "openai/gpt-4o": { model: "openai/gpt-4o", inPerM: 2.5, outPerM: 10, tier: "premium" },
  "anthropic/claude-3.5-haiku": {
    model: "anthropic/claude-3.5-haiku",
    inPerM: 0.8,
    outPerM: 4,
    tier: "medio",
  },
};

export interface Usage {
  promptTokens: number;
  completionTokens: number;
}

export function computeCostUsd(model: string, usage: Usage): number {
  const p = MODEL_PRICES[model];
  if (!p) return 0;
  return (usage.promptTokens * p.inPerM + usage.completionTokens * p.outPerM) / 1_000_000;
}
