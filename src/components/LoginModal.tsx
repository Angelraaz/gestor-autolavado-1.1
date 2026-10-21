import React, { useState } from 'react';
import {
  LogIn,
  Key,
  Mail,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Database,
  UserPlus,
  HelpCircle,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { AuthUser, SupabaseRole } from '../types';
import { supabase, fetchUserRoleFromSupabase, buildAuthUser, ROLE_CONFIGS } from '../utils/supabase';

interface LoginModalProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [selectedInitialRole, setSelectedInitialRole] = useState<SupabaseRole>('lavado');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [roleMissingWarning, setRoleMissingWarning] = useState<{
    userId: string;
    email: string;
  } | null>(null);

  // Helper to prefill email (does NOT bypass password - user must enter real Supabase password)
  const handlePrefillEmail = (targetEmail: string) => {
    setEmail(targetEmail);
    setErrorMsg('');
    setInfoMsg(`Correo completado: ${targetEmail}. Ingresa la contraseña asignada en Supabase.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setRoleMissingWarning(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('Por favor introduce tu correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        // 1. Supabase Real Authentication
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });

        if (authError) {
          if (authError.message.includes('Invalid login credentials')) {
            setErrorMsg('Credenciales inválidas. Verifica tu correo y contraseña en Supabase.');
          } else if (authError.message.includes('Email not confirmed')) {
            setErrorMsg('El correo aún no ha sido confirmado en Supabase.');
          } else {
            setErrorMsg(authError.message || 'Error al iniciar sesión en Supabase.');
          }
          setIsLoading(false);
          return;
        }

        if (!authData.user) {
          setErrorMsg('No se pudo obtener la sesión del usuario.');
          setIsLoading(false);
          return;
        }

        const supaUser = authData.user;

        // 2. Query user_roles table for this user's role
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
            `El usuario inició sesión en Supabase, pero aún no tiene un rol registrado en la tabla "user_roles".`
          );
          setIsLoading(false);
          return;
        }

        // 3. User authenticated and role confirmed
        const authUser = buildAuthUser(supaUser, role);
        onLogin(authUser);
      } else {
        // Register Mode (create new account in Supabase)
        const { data: regData, error: regError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              nombre: nombre.trim() || undefined
            }
          }
        });

        if (regError) {
          setErrorMsg(regError.message || 'Error al crear la cuenta en Supabase.');
          setIsLoading(false);
          return;
        }

        if (regData.user) {
          // Attempt to insert role into user_roles table if permissions allow
          try {
            await supabase.from('user_roles').insert({
              id: regData.user.id,
              email: cleanEmail,
              role: selectedInitialRole
            });
          } catch (insertErr) {
            console.warn('Note: user_roles insert may require admin RLS:', insertErr);
          }

          setInfoMsg(
            'Cuenta creada con éxito en Supabase. Si la confirmación de correo está activa, revisa tu bandeja o inicia sesión directamente.'
          );
          setMode('login');
        }
      }
    } catch (err: any) {
      console.error('Error during Supabase auth operation:', err);
      setErrorMsg(err?.message || 'Error inesperado al conectar con Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick helper to insert role into user_roles if current user is stuck
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
        setErrorMsg(`Error al asignar rol en Supabase: ${error.message}`);
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
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white uppercase">
                PORTANET C.A.
              </h2>
              <span className="text-[11px] font-black tracking-wider uppercase px-2 py-0.5 bg-red-600 text-white rounded shadow-sm">
                AJRC SERVICIOS
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              Control de Acceso por Roles (RBAC) con Supabase Auth
            </p>
          </div>
        </div>

        {/* Live Supabase Connection Badge */}
        <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-zinc-300">Supabase Auth Activo</span>
          </div>
          <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[170px]" title="yucbtdfoiglhfequefio.supabase.co">
            yucbtdfoiglh...co
          </span>
        </div>

        {/* Login / Register Tab Switcher */}
        <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-colors ${
              mode === 'login'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
              setInfoMsg('');
            }}
            className={`flex-1 py-1.5 font-bold rounded-lg transition-colors ${
              mode === 'register'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Crear Usuario
          </button>
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
              <span>Falta registro en tabla `user_roles`</span>
            </div>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              El usuario existe en <code className="bg-black/40 px-1 py-0.5 rounded">auth.users</code> pero no en <code className="bg-black/40 px-1 py-0.5 rounded">public.user_roles</code>. Puedes asignar el rol de prueba inicial ahora:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(['admin', 'lavado', 'detailing', 'mecanica', 'cajera'] as SupabaseRole[]).map((r) => (
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Nombre y Apellido
              </label>
              <input
                type="text"
                placeholder="Ej. Ing. Carlos Mendoza"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 text-xs"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Correo Electrónico (Supabase Auth)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                disabled={isLoading}
                placeholder="tu-correo@portanet.com.ve"
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

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                Rol en Taller (para `user_roles`)
              </label>
              <select
                value={selectedInitialRole}
                onChange={(e) => setSelectedInitialRole(e.target.value as SupabaseRole)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-500 text-xs"
              >
                <option value="admin">👑 Admin Maestro (Acceso Total)</option>
                <option value="lavado">🚗 Sup. Autolavado (Bahías de lavado)</option>
                <option value="detailing">✨ Sup. Detailing (Estética y cerámico)</option>
                <option value="mecanica">🛢️ Sup. Mecánica & Auto Cool (A/C y lubricación)</option>
                <option value="cajera">💵 Cajera (Caja y cobros)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-950/40 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando credenciales en Supabase...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Ingresar y Verificar Rol en Supabase</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Registrar Usuario en Supabase</span>
              </>
            )}
          </button>
        </form>

        {/* Protected Helper: Real Auth Email Hints (Eliminates mock 1-click bypass, requires real password) */}
        <div className="pt-3 border-t border-zinc-800 space-y-2.5 text-[11px]">
          <div className="flex items-center justify-between text-zinc-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              <span>Correos registrados en el taller:</span>
            </span>
            <span className="text-[10px] text-zinc-500">Requiere clave real</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handlePrefillEmail('admin@portanet.com.ve')}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-left text-zinc-300 transition-colors truncate"
              title="admin@portanet.com.ve (Rol: admin)"
            >
              👑 <span className="font-semibold">admin@portanet</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrefillEmail('autolavado@portanet.com.ve')}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-left text-zinc-300 transition-colors truncate"
              title="autolavado@portanet.com.ve (Rol: lavado)"
            >
              🚗 <span className="font-semibold">autolavado@...</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrefillEmail('detailing@portanet.com.ve')}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-left text-zinc-300 transition-colors truncate"
              title="detailing@portanet.com.ve (Rol: detailing)"
            >
              ✨ <span className="font-semibold">detailing@...</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrefillEmail('mecanica@portanet.com.ve')}
              className="p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-left text-zinc-300 transition-colors truncate"
              title="mecanica@portanet.com.ve (Rol: mecanica)"
            >
              🛢️ <span className="font-semibold">mecanica@...</span>
            </button>
            <button
              type="button"
              onClick={() => handlePrefillEmail('caja@portanet.com.ve')}
              className="col-span-2 p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-center text-zinc-300 transition-colors truncate"
              title="caja@portanet.com.ve (Rol: cajera)"
            >
              💵 <span className="font-semibold">caja@portanet.com.ve (Rol: cajera)</span>
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 text-center">
            Haz click para colocar el correo en el formulario e introduce la contraseña correspondiente.
          </p>
        </div>

      </div>
    </div>
  );
};
