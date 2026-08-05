import { UpdatePasswordForm } from '@/features/auth/components'

export default function UpdatePasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/12 via-white/5 to-white/8 backdrop-blur-xl backdrop-saturate-150 border border-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.07),0_4px_12px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.12)] p-8">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-white/30 via-white/5 to-transparent" />
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/[0.07] rounded-full blur-2xl" />

        <div className="relative z-10 text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Set new password</h1>
          <p className="mt-2 text-sm text-white/40">Enter your new password below</p>
        </div>

        <div className="relative z-10">
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  )
}
