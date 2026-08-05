export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-dvh bg-[#0a0a0f] overflow-hidden pt-[env(safe-area-inset-top)]">
      {/* Aurora orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/12 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="fixed top-[40%] right-[15%] w-[35%] h-[35%] bg-cyan-600/8 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Content */}
      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4">
        {children}
      </div>
    </div>
  )
}
