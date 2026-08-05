import { EmailSignInForm } from "./EmailSignInForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0f12]">
      <div className="bg-black rounded-2xl shadow-xl p-10 flex flex-col items-center w-full max-w-md border border-white/5">
        <div className="mb-8 flex flex-col items-center">
          <div className="bg-brand-primary/10 rounded-2xl border border-brand-primary/20 mb-6 p-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#10B981" strokeWidth="2"/><path d="M9 12L11 14L15 10" stroke="#10B981" strokeWidth="2"/></svg>
          </div>
          <h2 className="text-2xl font-black uppercase text-white mb-2 italic">Legal Shield</h2>
          <p className="text-xs text-gray-500 font-black uppercase tracking-widest opacity-60">Acceso Seguro</p>
        </div>
        <EmailSignInForm />
        <p className="text-xs text-gray-500 text-center mt-6">
          Te enviaremos un enlace seguro a tu email para iniciar sesión
        </p>
      </div>
    </div>
  );
}
