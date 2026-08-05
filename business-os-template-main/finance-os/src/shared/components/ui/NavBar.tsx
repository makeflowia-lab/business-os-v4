'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  Calculator,
  ChevronDown,
  CalendarClock,
  CalendarDays,
  FileText,
  LogOut,
  User,
  Bot,
  Menu,
  Settings,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { signout } from '@/actions/auth'
import { useAgentSidebar } from '@/shared/context/AgentSidebarContext'

const financeSubItems = [
  { href: '/wizard', label: 'Calculadora ROI', icon: Calculator },
  { href: '/finances/recurring', label: 'Mensuales', icon: CalendarClock },
  { href: '/finances/annual', label: 'Anuales', icon: CalendarDays },
  { href: '/finances/reports', label: 'Reportes', icon: FileText },
  { href: 'divider', label: '', icon: null },
  { href: '/admin', label: 'Admin Panel', icon: Settings },
]

export function NavBar() {
  const pathname = usePathname()
  const [financeOpen, setFinanceOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, profile, loading } = useAuth()
  const { setIsOpen: openAgentSidebar } = useAgentSidebar()

  const isDashboardActive = pathname === '/'
  const isFinanceActive = pathname.startsWith('/finances') || pathname === '/wizard'
  const isCFOActive = pathname === '/agent'

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-neu-bg shadow-neu-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo o Menu Button (en agent page) */}
          {isCFOActive ? (
            <button
              onClick={() => openAgentSidebar(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neu-bg shadow-neu text-gray-600 hover:text-blue-600 hover:shadow-neu-sm transition-all"
              aria-label="Abrir historial"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline font-medium text-sm">Historial</span>
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo2.png"
                alt="Finanzas OS"
                width={32}
                height={32}
                className="w-8 h-8"
                priority
              />
              <span className="hidden sm:inline font-bold text-gray-800">Finanzas OS</span>
            </Link>
          )}

          {/* Nav Items - Order: CFO, Dashboard, Finanzas */}
          <div className="flex items-center gap-2">
            {/* CFO Agent Link */}
            <Link
              href="/agent"
              className={`
                flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                transition-all duration-200 lg:px-4
                ${
                  isCFOActive
                    ? 'bg-neu-bg shadow-neu-inset text-blue-600'
                    : 'bg-neu-bg shadow-neu text-gray-600 hover:text-blue-600 hover:shadow-neu-sm'
                }
              `}
            >
              <Bot className="w-5 h-5 lg:w-4 lg:h-4" />
              <span className="hidden lg:inline">CFO</span>
            </Link>

            {/* Dashboard Link */}
            <Link
              href="/"
              className={`
                flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                transition-all duration-200 lg:px-4
                ${
                  isDashboardActive
                    ? 'bg-neu-bg shadow-neu-inset text-blue-600'
                    : 'bg-neu-bg shadow-neu text-gray-600 hover:text-blue-600 hover:shadow-neu-sm'
                }
              `}
            >
              <LayoutDashboard className="w-5 h-5 lg:w-4 lg:h-4" />
              <span className="hidden lg:inline">Dashboard</span>
            </Link>

            {/* Finance dropdown - works on both mobile and desktop */}
            <div className="relative">
              <button
                onClick={() => setFinanceOpen(!financeOpen)}
                onBlur={() => setTimeout(() => setFinanceOpen(false), 150)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200 lg:px-4
                  ${
                    isFinanceActive
                      ? 'bg-neu-bg shadow-neu-inset text-blue-600'
                      : 'bg-neu-bg shadow-neu text-gray-600 hover:text-blue-600 hover:shadow-neu-sm'
                  }
                `}
              >
                <Wallet className="w-5 h-5 lg:w-4 lg:h-4" />
                <span className="hidden lg:inline">Finanzas</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${financeOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {financeOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-neu-bg shadow-neu rounded-xl p-2 z-50">
                  {financeSubItems.map((item, idx) => {
                    // Divider
                    if (item.href === 'divider') {
                      return <hr key={idx} className="my-2 border-gray-200" />
                    }

                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                          transition-all duration-200
                          ${
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                          }
                        `}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* User Menu - desktop only */}
            {!loading && user && (
              <div className="hidden lg:block relative ml-2">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-neu-bg shadow-neu text-gray-600 hover:text-blue-600 hover:shadow-neu-sm transition-all duration-200"
                >
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-neu-bg shadow-neu rounded-xl p-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-2">
                      <p className="text-xs text-gray-500">Conectado como</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{user.email}</p>
                    </div>
                    <form action={signout}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesion
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
