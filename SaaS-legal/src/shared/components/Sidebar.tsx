'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  ChevronRight,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Legal Shield', icon: ShieldCheck, href: '/legal-shield' },
  { label: 'Configuración', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user ? { name: session.user.name || '', email: session.user.email || '' } : null;

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      {/* Mobile Trigger */}
      <button 
        onClick={() => setIsOpen(true)}
        title="Abrir menú"
        aria-label="Abrir menú"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-bg-card border border-border-subtle rounded-lg text-brand-primary"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        className={`fixed top-0 left-0 z-50 h-full bg-bg-card border-r border-border-subtle flex flex-col transition-all duration-300 ${
          isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full lg:translate-x-0 lg:w-[240px]'
        }`}
      >
        {/* Logo Section */}
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center border border-brand-primary/30">
              <ShieldCheck className="text-brand-primary" size={24} />
            </div>
            <div>
              <h1 className="text-white font-black leading-tight tracking-tight uppercase">SaaS Legal</h1>
              <p className="text-[10px] text-brand-accent font-bold uppercase tracking-widest">Factory V3</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            title="Cerrar menú"
            aria-label="Cerrar menú"
            className="lg:hidden absolute top-6 right-6 text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.label} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={isActive ? 'text-brand-primary' : 'group-hover:text-brand-primary transition-colors'} />
                  <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="animate-pulse" />}
              </Link>
            )
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold">
              {user?.name?.charAt(0) || <UserIcon size={14} />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-gray-300 truncate tracking-tight uppercase">
                {user?.name || 'Iniciando sesión...'}
              </p>
              <p className="text-[9px] text-gray-600 truncate font-bold">
                {user?.email || 'Pendiente'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-gray-600 hover:text-red-500 transition-colors group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
