import React, { useState } from 'react';
import {
  LogIn,
  Key,
  Mail,
  AlertCircle,
  Loader2,
  Database,
  CheckCircle2
} from 'lucide-react';
import { AuthUser, SupabaseRole } from '../types';
import { supabase, fetchUserRoleFromSupabase, buildAuthUser } from '../utils/supabase';

interface LoginModalProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [roleMissingWarning, setRoleMissingWarning] = useState<{
    userId: string;
    email: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setRoleMissingWarning(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Por favor introduce tu correo y contraseña registrados en el servidor.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Authenticate with the server
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setErrorMsg('Credenciales inválidas. Verifica tu correo y contraseña en el servidor.');
        } else if (authError.message.includes('Email not confirmed')) {
          setErrorMsg('El correo aún no ha sido confirmado en el servidor.');
        } else {
          setErrorMsg(authError.message || 'Error al iniciar sesión en el servidor.');
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setErrorMsg('No se pudo obtener la sesión desde el servidor.');
        setIsLoading(false);
        return;
      }

      const supaUser = authData.user;

      // 2. Query user_roles table for this user's verified role
      const { role, rawRole, error: roleError } = await fetchUserRoleFromSupabase(
        supaUser.id,
        supaUser.email
      );

      if (!rawRole) {
        // The user authenticated, but no row exists yet in user_roles
        setRoleMissingWarning({
          userId: supaUser.id,
          email: supaUser.email || cleanEmail
        });
        setErrorMsg(
          `Usuario autenticado en el servidor, pero aún no tiene un rol asignado en la tabla de roles.`
        );
        setIsLoading(false);
        return;
      }

      // 3. User authenticated and role confirmed
      const authUser = buildAuthUser(supaUser, role);
      onLogin(authUser);
    } catch (err: any) {
      console.error('Error during server auth operation:', err);
      setErrorMsg(err?.message || 'Error inesperado al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to assign initial role if user exists in auth but missing in user_roles
  const handleAssignRoleSelf = async (roleToAssign: SupabaseRole) => {
    if (!roleMissingWarning) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('user_roles').upsert({
        id: roleMissingWarning.userId,
        email: roleMissingWarning.email,
        role: roleToAssign
      });

      if (error) {
        setErrorMsg(`Error al asignar rol en el servidor: ${error.message}`);
      } else {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          const authUser = buildAuthUser(sessionData.session.user, roleToAssign);
          onLogin(authUser);
        }
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error al registrar rol');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 text-zinc-100 my-auto">
        
        {/* Car Front Silhouette Logo & Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-950/60 ring-4 ring-red-600/20">
            <svg
              className="w-9 h-9 fill-current text-white"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z" />
              <circle cx="7.5" cy="14.5" r="1.5" />
              <circle cx="16.5" cy="14.5" r="1.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">
              SGAI
            </h2>
            <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mt-0.5">
              Sistema de Gestión Automotriz Interno
            </p>
            <p className="text-[11px] text-zinc-500 font-medium mt-1">
              Control de Acceso por Roles (RBAC) · Servidor Central
            </p>
          </div>
        </div>

        {/* Live Server Connection Status */}
        <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-zinc-300">Conexión con el Servidor Activa</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400/90 font-bold">
            EN LÍNEA
          </span>
        </div>

        {/* Info Message */}
        {infoMsg && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Role Missing Warning & Helper */}
        {roleMissingWarning && (
          <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-amber-200 text-xs space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Falta registro de rol en el servidor</span>
            </div>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              El usuario existe en las credenciales del servidor pero aún no tiene rol asignado. Puedes configurar el rol inicial:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(['admin', 'lavado', 'mecanica', 'cajera'] as SupabaseRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleAssignRoleSelf(r)}
                  className="px-2 py-1 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 rounded text-[11px] font-semibold text-white transition-colors"
                >
                  Asignar como {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Correo Electrónico (Servidor)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                disabled={isLoading}
                placeholder="usuario@servidor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 text-xs disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={isLoading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 text-xs disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-950/40 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando credenciales en el servidor...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Ingresar al Sistema (SGAI)</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-zinc-500 text-center pt-2 border-t border-zinc-800">
          Los nuevos usuarios y accesos son dados de alta exclusivamente por el administrador en el servidor.
        </p>

      </div>
    </div>
  );
};
