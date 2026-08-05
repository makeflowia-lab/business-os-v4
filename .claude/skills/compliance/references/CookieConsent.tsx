// shared/components/CookieConsent.tsx
// Banner de consentimiento de cookies para el skill `compliance`.
// Regla de oro: NO cargar analitica de marketing antes del consentimiento.

"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cookie-consent";
type Consent = "accepted" | "rejected";

export function getCookieConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "accepted" || value === "rejected" ? value : null;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getCookieConsent() === null) setVisible(true);
  }, []);

  function decide(consent: Consent) {
    window.localStorage.setItem(STORAGE_KEY, consent);
    setVisible(false);
    // Si acepta, aqui se inicializa la analitica opcional (ver skill outcomes).
    // window.dispatchEvent(new CustomEvent("cookie-consent", { detail: consent }));
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      className="fixed bottom-0 inset-x-0 z-50 bg-neutral-900 text-white p-4 md:flex md:items-center md:justify-between gap-4"
    >
      <p className="text-sm">
        Usamos cookies necesarias para el funcionamiento y, con tu consentimiento, cookies de
        analitica para mejorar el producto.{" "}
        <a href="/privacidad" className="underline">
          Aviso de privacidad
        </a>
        .
      </p>
      <div className="mt-3 md:mt-0 flex gap-2 shrink-0">
        <button
          onClick={() => decide("rejected")}
          className="px-4 py-2 text-sm rounded border border-white/30"
        >
          Rechazar
        </button>
        <button
          onClick={() => decide("accepted")}
          className="px-4 py-2 text-sm rounded bg-white text-neutral-900 font-medium"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
