import React, { useState } from 'react';
import {
  Wrench,
  Car,
  Sparkles,
  Snowflake,
  Users,
  ShieldCheck,
  FileCode,
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
  onOpenExportModal: () => void;
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

  // Format current date in compact format exactly DD/MM/YY (e.g. 20/10/26)
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

  // Human readable role tag
  const getRoleBadgeColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'lavado':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'detailing':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'mecanica':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'cajera':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 dark:bg-[#090D15]/95 backdrop-blur-md border-b border-zinc-800 transition-colors">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        
        {/* Zone 1: Car Front Silhouette Logo + Brand + Date Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Automotive Front Silhouette Logo in Red Container */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-950/50 ring-2 ring-red-600/30 shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
              <circle cx="7.5" cy="14.5" r="1.5" />
              <circle cx="16.5" cy="14.5" r="1.5" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-sm sm:text-lg font-black tracking-tight text-white whitespace-nowrap">
                PORTANET C.A.
              </span>
              <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase px-2 py-0.5 bg-red-600 text-white rounded shadow-sm shadow-red-950/40">
                AJRC SERVICIOS
              </span>
              <span
                className={`text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded border ${getRoleBadgeColor(
                  authUser?.role
                )}`}
              >
                {String(authUser?.role || authUser?.rolId || 'ADMIN').toUpperCase()}
              </span>
            </div>

            {/* Date & Shift Status */}
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-zinc-400 font-medium mt-0.5">
              <Calendar className="w-3 h-3 text-red-500 shrink-0" />
              <span className="text-zinc-200 font-mono font-bold tracking-wide">
                {compactDate}
              </span>
              <span className="text-zinc-600" aria-hidden="true">·</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Clock className="w-2.5 h-2.5" />
                Turno Diurno Activo
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Live Workshop Counters (visible on lg+) */}
        <div className="hidden lg:flex items-center gap-5 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
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
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Alternar modo claro u oscuro"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </button>

          {/* Export to Netlify */}
          <button
            onClick={onOpenExportModal}
            className="hidden sm:flex px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors items-center gap-1.5 whitespace-nowrap"
            title="Exportar archivo HTML autónomo para Netlify"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Exportar Netlify</span>
            <span className="md:hidden">HTML</span>
          </button>

          {/* Current Logged-in Supabase User Badge */}
          <div className="flex items-center gap-1.5 pl-1 sm:border-l border-zinc-800">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-[11px] text-zinc-200">
              {authUser?.avatar || 'US'}
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <div className="font-bold text-white truncate max-w-[110px]" title={authUser?.email || ''}>
                {authUser?.nombre ? authUser.nombre.split(' ')[0] : 'Usuario'}
              </div>
              <div className="text-[10px] text-red-400 truncate max-w-[110px]">
                {authUser?.titulo || 'Portanet C.A.'}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors"
              title="Cerrar Sesión en Supabase"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle Button (Screens < md) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-600/40 text-red-400 hover:text-red-300 flex items-center justify-center transition-colors shrink-0 ml-1"
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            title="Menú de secciones"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-red-400" />
            ) : (
              <Menu className="w-5 h-5 text-red-400" />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Active Section Indicator Bar (when menu closed on small screens) */}
      <div className="md:hidden px-4 py-2 bg-zinc-900/90 border-t border-zinc-800/80 flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 text-xs font-bold text-zinc-200 text-left hover:text-white"
        >
          <div className="w-6 h-6 rounded bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
            <activeTabObj.icon className="w-3.5 h-3.5" />
          </div>
          <span>{activeTabObj.label}</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
        </button>

        {/* Quick mobile counters */}
        <div className="flex items-center gap-2 text-[11px] font-mono">
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
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950/98 backdrop-blur-xl px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-1">
            <span>Módulos Autorizados ({visibleTabs.length})</span>
            <span className="text-red-400 font-mono">Rol: {authUser?.role || 'admin'}</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSelect(tab.id)}
                  className={`w-full p-3 rounded-xl transition-all flex items-center justify-between text-left min-h-[50px] ${
                    isActive
                      ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950/40 ring-1 ring-red-500'
                      : 'bg-zinc-900/70 hover:bg-zinc-800 text-zinc-200 border border-zinc-800/80 active:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
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

          {/* Quick stats and export in mobile drawer */}
          <div className="pt-3 border-t border-zinc-800/80 space-y-2.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block font-medium">Vehículos en Patio:</span>
                <span className="font-mono font-bold text-red-400 text-sm tabular-nums">
                  {queueCount} en cola
                </span>
              </div>
              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block font-medium">Caja Neta Hoy:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                  ${cashBalance.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onOpenExportModal();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
            >
              <FileCode className="w-4 h-4 text-red-400" />
              <span>Exportar Aplicación HTML (Netlify)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
