import React, { useState } from 'react';
import { LogIn, Key, Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import { AuthUser } from '../types';
import { VALID_ACCOUNTS } from '../data/initialData';

interface LoginModalProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const match = VALID_ACCOUNTS.find(
      (acc) =>
        acc.user.email.toLowerCase() === email.trim().toLowerCase() &&
        acc.pass === password.trim()
    );

    if (match) {
      onLogin(match.user);
    } else {
      setErrorMsg('Credenciales inválidas. Verifica tu correo y contraseña.');
    }
  };

  const handleQuickLogin = (index: number) => {
    const acc = VALID_ACCOUNTS[index];
    if (acc) {
      onLogin(acc.user);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-100">
        
        {/* Car Front Silhouette Logo & Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-950/60 ring-4 ring-red-600/20">
            {/* Clean automotive front-view silhouette icon */}
            <svg
              className="w-10 h-10 fill-current text-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
              <circle cx="7.5" cy="14.5" r="1.5" />
              <circle cx="16.5" cy="14.5" r="1.5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white uppercase">
                PORTANET C.A.
              </h2>
              <span className="text-[11px] font-black tracking-wider uppercase px-2 py-0.5 bg-red-600 text-white rounded shadow-sm">
                AJRC SERVICIOS
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              Sistema de Control Interno y Operaciones de Taller
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="ejemplo@portanet.com.ve"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-950/40 transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión en el Taller</span>
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div className="pt-3 border-t border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500">
            <span>Acceso Rápido por Rol:</span>
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin(0)}
              className="py-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-left text-zinc-300 hover:text-white transition-colors truncate"
            >
              👑 <span className="font-semibold">Admin Maestro</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin(1)}
              className="py-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-left text-zinc-300 hover:text-white transition-colors truncate"
            >
              🚗 <span className="font-semibold">Sup. Lavado</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin(2)}
              className="py-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-left text-zinc-300 hover:text-white transition-colors truncate"
            >
              ✨ <span className="font-semibold">Sup. Detailing</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin(3)}
              className="py-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-left text-zinc-300 hover:text-white transition-colors truncate"
            >
              🛢️ <span className="font-semibold">Sup. Mecánica</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin(4)}
              className="col-span-2 py-1.5 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-center text-zinc-300 hover:text-white transition-colors"
            >
              💵 <span className="font-semibold">Cajera & Facturación</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
