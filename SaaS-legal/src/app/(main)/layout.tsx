import { Sidebar } from '@/shared/components/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#050505] selection:bg-brand-primary selection:text-black">
      <Sidebar />
      <div className="flex-1 lg:ml-[240px] flex flex-col">
        {children}
      </div>
    </div>
  )
}
