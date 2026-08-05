export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0f12]">
      <div className="bg-black rounded-2xl shadow-xl p-10 flex flex-col items-center w-full max-w-md border border-white/5">
        <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black uppercase text-white mb-4 text-center">
          ¡Revisa tu email!
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Te enviamos un enlace mágico para iniciar sesión.
        </p>
        <div className="bg-white/5 rounded-xl p-4 w-full">
          <p className="text-sm text-gray-300 text-center">
            Haz click en el enlace que recibiste en tu correo para entrar automáticamente a Legal Shield.
          </p>
        </div>
        <p className="text-xs text-gray-500 text-center mt-6">
          ¿No lo ves? Revisa tu carpeta de spam
        </p>
      </div>
    </div>
  );
}
