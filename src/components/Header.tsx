import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Car,
  Sparkles,
  Snowflake,
  Users,
  User,
  ShieldCheck,
  DollarSign,
  Sun,
  Moon,
  LogOut,
  Calendar,
  Clock,
  Menu,
  X,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { AuthUser } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  authUser: AuthUser;
  onLogout: () => void;
  onOpenExportModal?: () => void;
  queueCount: number;
  cashBalance: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  authUser,
  onLogout,
  onOpenExportModal,
  queueCount,
  cashBalance,
  theme,
  onToggleTheme
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [militaryTime, setMilitaryTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('es-VE', { hour12: false });
  });

  // Real-time military clock ticker (24-hour HH:mm:ss format)
  useEffect(() => {
    const timer = setInterval(() => {
      setMilitaryTime(new Date().toLocaleTimeString('es-VE', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format current date in compact format DD/MM/YY (e.g. 21/10/26)
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const compactDate = `${day}/${month}/${year}`;

  const allTabs = [
    {
      id: 'autolavado',
      label: '1. Autolavado General',
      shortLabel: 'Autolavado',
      icon: Car,
      desc: 'Bahías de lavado, colas e insumos'
    },
    {
      id: 'detailing',
      label: '2. Detailing & Pintura',
      shortLabel: 'Detailing',
      icon: Sparkles,
      desc: 'Corrección, cerámico 9H y pastas'
    },
    {
      id: 'mecanica',
      label: '3. Aceite & Mecánica',
      shortLabel: 'Mecánica & Aceite',
      icon: Wrench,
      desc: 'Lubricación, filtros e inventario'
    },
    {
      id: 'autocool',
      label: '4. Zona Auto Cool',
      shortLabel: 'Auto Cool',
      icon: Snowflake,
      desc: 'A/C, presiones y refrigeración'
    },
    {
      id: 'clientes_caja',
      label: '5. Clientes & Caja',
      shortLabel: 'Clientes & Caja',
      icon: Users,
      desc: 'Libro diario, clientes y cierre'
    },
    {
      id: 'usuarios_roles',
      label: '6. Usuarios & Roles',
      shortLabel: 'Usuarios & Roles',
      icon: ShieldCheck,
      desc: 'Permisos del sistema y accesos'
    }
  ];

  // Role-Based Access Control (RBAC): filter tabs based on authenticated Supabase role
  const userRole = authUser?.role || 'admin';
  const allowedTabsList = authUser?.allowedTabs || ['autolavado', 'detailing', 'mecanica', 'autocool', 'clientes_caja', 'usuarios_roles'];
  const visibleTabs = allTabs.filter((tab) => {
    if (userRole === 'admin' || authUser?.rolId === 'admin_maestro') {
      return true;
    }
    return allowedTabsList.includes(tab.id);
  });

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const activeTabObj = visibleTabs.find((t) => t.id === activeTab) || visibleTabs[0] || allTabs[0];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 dark:bg-[#090D15]/95 backdrop-blur-md border-b border-zinc-800 transition-colors">
      {/* Top Bar - Ultra-compact and responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        
        {/* Zone 1: Car Silhouette Logo + Brand + Small AJRC underneath + Military Time */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          {/* Automotive Front Silhouette Logo in Red Container */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-950/50 ring-2 ring-red-600/30 shrink-0">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
              <circle cx="7.5" cy="14.5" r="1.5" />
              <circle cx="16.5" cy="14.5" r="1.5" />
            </svg>
          </div>

          <div className="flex flex-col justify-center min-w-0">
            {/* Portanet title */}
            <span className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white leading-tight truncate">
              PORTANET C.A.
            </span>
            
            {/* Small AJRC SERVICIOS underneath PORTANET */}
            <span className="text-[9px] sm:text-[10px] font-bold text-red-400 tracking-wider uppercase leading-none mt-0.5">
              AJRC SERVICIOS
            </span>

            {/* Date & Military Time */}
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[11px] text-zinc-400 font-medium mt-0.5">
              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 shrink-0" />
              <span className="text-zinc-300 font-mono font-bold tracking-wide">
                {compactDate}
              </span>
              <span className="text-zinc-600" aria-hidden="true">·</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono font-semibold">
                <Clock className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                {militaryTime}
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Live Workshop Counters (visible on lg+) */}
        <div className="hidden lg:flex items-center gap-4 px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <Car className="w-3.5 h-3.5 text-red-500" />
            <span className="text-zinc-400">Patio / Lavado:</span>
            <span className="font-mono font-bold text-red-400 tabular-nums">{queueCount}</span>
          </div>
          <span className="text-zinc-700" aria-hidden="true">|</span>
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-zinc-400">Caja Neta:</span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">
              ${cashBalance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Zone 3: Actions + Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Alternar modo claro u oscuro"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
            )}
          </button>

          {/* Current Logged-in Supabase User (Cleaned - No AU text) */}
          <div className="flex items-center gap-1.5 pl-1 sm:border-l border-zinc-800">
            <div
              className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shadow-sm"
              title={authUser?.email || authUser?.nombre}
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <div className="font-bold text-white truncate max-w-[110px]" title={authUser?.email || ''}>
                {authUser?.nombre ? authUser.nombre.split(' ')[0] : 'Usuario'}
              </div>
              <div className="text-[10px] text-zinc-400 truncate max-w-[110px]">
                {authUser?.titulo || 'Portanet C.A.'}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-1 sm:p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors"
              title="Cerrar Sesión en Supabase"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle Button (Screens < md) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-lg bg-red-600/10 hover:bg-red-600/20 border border-red-600/40 text-red-400 hover:text-red-300 flex items-center justify-center transition-colors shrink-0"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            title="Menú de secciones"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4 text-red-400" />
            ) : (
              <Menu className="w-4 h-4 text-red-400" />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Active Section Indicator Bar (when menu closed on small screens) */}
      <div className="md:hidden px-3 py-1.5 bg-zinc-900/90 border-t border-zinc-800/80 flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 text-left hover:text-white"
        >
          <div className="w-5 h-5 rounded bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
            <activeTabObj.icon className="w-3 h-3" />
          </div>
          <span className="truncate max-w-[160px]">{activeTabObj.label}</span>
          <ChevronRight className="w-3 h-3 text-zinc-500" />
        </button>

        {/* Quick mobile counters */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="text-zinc-400">Patio:</span>
          <span className="text-red-400 font-bold">{queueCount}</span>
          <span className="text-zinc-700">|</span>
          <span className="text-emerald-400 font-bold">${cashBalance.toFixed(0)}</span>
        </div>
      </div>

      {/* Desktop Horizontal Navigation - RBAC Filtered (Hidden on Mobile < md) */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex items-center space-x-1 overflow-x-auto py-2 text-xs font-medium no-scrollbar border-t border-zinc-800/80">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Slide-Down / Dropdown Menu - RBAC Filtered (Vertical list on screens < md) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950/98 backdrop-blur-xl px-3 py-3 space-y-2.5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-1">
            <span>Módulos Autorizados ({visibleTabs.length})</span>
            <span className="text-zinc-400 font-mono">{authUser?.titulo || 'Portanet C.A.'}</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSelect(tab.id)}
                  className={`w-full p-2.5 rounded-xl transition-all flex items-center justify-between text-left min-h-[46px] ${
                    isActive
                      ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/40 ring-1 ring-red-500'
                      : 'bg-zinc-900/70 hover:bg-zinc-800 text-zinc-200 border border-zinc-800/80 active:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-zinc-800 text-red-400 border border-zinc-700/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">{tab.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isActive ? 'text-red-100' : 'text-zinc-400'
                        }`}
                      >
                        {tab.desc}
                      </div>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded text-white font-mono">
                      ACTIVA
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick stats in mobile drawer */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block font-medium">Vehículos en Patio:</span>
                <span className="font-mono font-bold text-red-400 text-sm tabular-nums">
                  {queueCount} en cola
                </span>
              </div>
              <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block font-medium">Caja Neta Hoy:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                  ${cashBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
