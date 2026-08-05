// shared/components/BiometricConsent.tsx
// Gate de consentimiento REFORZADO para datos biometricos (skill `compliance`).
// CRITICO para apps tipo captura-facial. Opt-in EXPLICITO y SEPARADO, nunca preseleccionado.
// Bloquea la captura hasta que el usuario consiente de forma informada.

"use client";

import { useState } from "react";

interface BiometricConsentProps {
  /** Se llama solo cuando el usuario consiente explicitamente. */
  onConsent: () => void;
  /** Que se captura, donde se guarda, cuanto tiempo. Texto informado por la app. */
  finalidad?: string;
  retencion?: string;
}

export function BiometricConsent({
  onConsent,
  finalidad = "identificarte para dar acceso",
  retencion = "mientras tu cuenta este activa",
}: BiometricConsentProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="max-w-md mx-auto p-6 rounded-xl border space-y-4">
      <h2 className="text-lg font-semibold">Consentimiento para datos biometricos</h2>
      <p className="text-sm text-neutral-600">
        Para continuar necesitamos capturar tu rostro (dato personal sensible). Lo usaremos
        para <strong>{finalidad}</strong>. Se guarda de forma segura y se conserva{" "}
        <strong>{retencion}</strong>. Puedes solicitar su eliminacion en cualquier momento.{" "}
        <a href="/privacidad" className="underline">
          Aviso de privacidad
        </a>
        .
      </p>

      {/* Opt-in explicito: jamas preseleccionado. */}
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1"
        />
        <span>
          Doy mi consentimiento expreso para el tratamiento de mis datos biometricos con la
          finalidad descrita.
        </span>
      </label>

      <button
        disabled={!checked}
        onClick={onConsent}
        className="w-full py-2.5 rounded-lg bg-neutral-900 text-white font-medium disabled:opacity-40"
      >
        Acepto y continuar
      </button>
    </div>
  );
}
