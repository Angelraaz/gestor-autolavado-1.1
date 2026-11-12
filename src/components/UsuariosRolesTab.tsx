import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Users,
  Database,
  RefreshCw,
  Copy,
  Check,
  Server,
  UserCheck
} from 'lucide-react';
import { UserRole, RoleId, AuthUser, SupabaseRole } from '../types';
import { supabase, ROLE_CONFIGS, updateUserRoleInSupabase } from '../utils/supabase';
import { SUPABASE_SQL_SCRIPT, SUPABASE_SETUP_STEPS } from '../utils/supabaseSql';

interface UsuariosRolesTabProps {
  roles: UserRole[];
  activeRoleId: RoleId;
  authUser: AuthUser;
  onSelectRole: (roleId: RoleId) => void;
  onTogglePermission: (roleId: RoleId, permissionKey: keyof UserRole['permisos']) => void;
}

interface UserRoleRow {
  id: string;
  email: string;
  role: string;
  created_at?: string;
}

export const UsuariosRolesTab: React.FC<UsuariosRolesTabProps> = ({
  authUser
}) => {
  const [serverRows, setServerRows] = useState<UserRoleRow[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  const fetchServerRoles = async () => {
    setIsLoadingRows(true);
    setQueryError(null);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('email', { ascending: true });

      if (error) {
        setQueryError(error.message);
      } else {
        setServerRows(data || []);
      }
    } catch (err: any) {
      setQueryError(err?.message || 'Error de conexión con el servidor');
    } finally {
      setIsLoadingRows(false);
    }
  };

  useEffect(() => {
    fetchServerRoles();
  }, []);

  const handleRoleChangeByAdmin = async (userId: string, userEmail: string, newRole: SupabaseRole) => {
    setUpdatingUserId(userId);
    setUpdateFeedback(null);

    const result = await updateUserRoleInSupabase(userId, newRole);

    if (result.success) {
      setUpdateFeedback(`✓ Rol actualizado a '${newRole}' para ${userEmail}`);
      setServerRows((prev) =>
        prev.map((r) => (r.id === userId ? { ...r, role: newRole } : r))
      );
      setTimeout(() => setUpdateFeedback(null), 3500);
    } else {
      setUpdateFeedback(`Error: ${result.error || 'No se pudo actualizar el rol en el servidor'}`);
    }

    setUpdatingUserId(null);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const roleMappings: {
    role: SupabaseRole;
    name: string;
    modules: string;
    color: string;
  }[] = [
    {
      role: 'admin',
      name: '👑 Admin Maestro',
      modules: 'Autolavado, Detailing & Polishing, Mecánica, Clientes & Caja, Seguridad (Acceso Total)',
      color: 'border-amber-500/50 bg-amber-950/20 text-amber-300'
    },
    {
      role: 'lavado',
      name: '🚗 Supervisor Lavado & Polishing',
      modules: 'Maneja ambas bahías operativas: Módulo 1 (Autolavado) y Módulo 2 (Detailing & Polishing)',
      color: 'border-blue-500/50 bg-blue-950/20 text-blue-300'
    },
    {
      role: 'mecanica',
      name: '🛢️ Supervisor Mecánica & Aceite',
      modules: 'Únicamente Módulo 3 (Mecánica Ligera, Lubricantes, Inventario y Tickets de Clientes)',
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
    },
    {
      role: 'cajera',
      name: '💵 Cajera',
      modules: 'Únicamente Módulo 4 (Clientes, Caja Diaria, Cobros, Comisiones & Cierre)',
      color: 'border-rose-500/50 bg-rose-950/20 text-rose-300'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🔒 Control de Acceso y Roles en el Servidor</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Seguridad basada en roles (RBAC). El Administrador Maestro puede cambiar los roles del personal directamente desde esta tabla.
          </p>
        </div>

        <button
          onClick={fetchServerRoles}
          disabled={isLoadingRows}
          className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-semibold text-zinc-200 flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRows ? 'animate-spin text-red-400' : ''}`} />
          <span>Sincronizar Servidor</span>
        </button>
      </div>

      {/* Active User Session Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-red-950">
            {authUser.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-base">{authUser.nombre}</h3>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-red-950/60 border border-red-700 text-red-300 rounded font-bold uppercase">
                Rol: {authUser.role}
              </span>
              <span className="text-xs text-zinc-400 font-mono">({authUser.email})</span>
            </div>
            <div className="text-xs text-red-400 font-semibold mt-0.5">{authUser.titulo}</div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Módulos autorizados por el servidor: <span className="text-zinc-200 font-medium">{authUser.allowedTabs.join(', ')}</span>.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] text-zinc-500 uppercase font-bold block mb-1">
            Secciones Habilitadas:
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
            {authUser.allowedTabs.length} Bahías y Módulos
          </span>
        </div>
      </div>

      {/* Status feedback */}
      {updateFeedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200 ${
            updateFeedback.startsWith('Error')
              ? 'bg-red-950/50 border border-red-800 text-red-300'
              : 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{updateFeedback}</span>
        </div>
      )}

      {/* Authorized Roles Definition Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-red-500" />
            <span>Reglas de Acceso Estricto por Rol en SGAI</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cada usuario visualiza y opera únicamente las bahías asignadas a su cargo:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {roleMappings.map((m) => (
            <div
              key={m.role}
              className={`p-3.5 rounded-xl border ${m.color} flex flex-col justify-between space-y-2`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{m.name}</span>
                </div>
                <p className="text-[11px] text-zinc-300 mt-1.5 leading-snug">{m.modules}</p>
              </div>
              <span className="text-[10px] font-mono uppercase bg-black/50 px-2 py-0.5 rounded self-start">
                role = '{m.role}'
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Table: user_roles in Server with In-Line Admin Role Changer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Personal Registrado en la Base de Datos del Servidor</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Cambia el rol de cualquier empleado desde el menú desplegable para asignarle o cambiarle de bahía.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
            {serverRows.length} usuarios registrados
          </span>
        </div>

        {queryError && (
          <div className="p-4 bg-red-950/40 border-b border-red-800 text-red-300 text-xs">
            <div className="font-bold flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span>Aviso de consulta al servidor:</span>
            </div>
            <p className="mt-1 font-mono text-[11px]">{queryError}</p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Ejecuta el script SQL abajo para crear la tabla de roles y habilitar la sincronización en tiempo real.
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Rol Asignado (Modificar)</th>
                <th className="py-3 px-4">UUID en Servidor</th>
                <th className="py-3 px-4 text-right">Permiso Efectivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {serverRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 px-4 text-center text-zinc-500">
                    {isLoadingRows ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                        Consultando usuarios en el servidor...
                      </span>
                    ) : (
                      <span>No se encontraron registros en el servidor. Ejecuta el script SQL inferior para crearlos.</span>
                    )}
                  </td>
                </tr>
              ) : (
                serverRows.map((row) => (
                  <tr key={row.id || row.email} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-zinc-200">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{row.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {/* Admin Role Selector Dropdown */}
                      <select
                        aria-label={`Cambiar rol para ${row.email}`}
                        value={row.role}
                        disabled={updatingUserId === row.id}
                        onChange={(e) =>
                          handleRoleChangeByAdmin(
                            row.id,
                            row.email,
                            e.target.value as SupabaseRole
                          )
                        }
                        className="bg-zinc-950 border border-zinc-700 hover:border-red-500 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:border-red-500 cursor-pointer disabled:opacity-50"
                      >
                        <option value="admin">👑 Admin Maestro (Acceso Total)</option>
                        <option value="lavado">🚗 Sup. Lavado & Polishing (Ambas Bahías)</option>
                        <option value="mecanica">🛢️ Sup. Mecánica & Aceite</option>
                        <option value="cajera">💵 Cajera (Caja & Cobros)</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 truncate max-w-[200px]" title={row.id}>
                      {row.id}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[11px] text-zinc-300 font-semibold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                        {ROLE_CONFIGS[row.role as SupabaseRole]?.titulo || 'Acceso Asignado'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Step-by-Step Checklist for Supabase Realtime Setup */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Guía Paso a Paso: ¿Qué hace falta para que funcione todo en el Servidor?</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Sigue estos 5 sencillos pasos para activar la sincronización multi-dispositivo en tiempo real:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SUPABASE_SETUP_STEPS.map((s) => (
            <div key={s.step} className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 font-bold text-xs flex items-center justify-center shrink-0 border border-red-600/40">
                  {s.step}
                </span>
                <h4 className="text-xs font-bold text-zinc-200">{s.title}</h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed pl-8">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* SQL Snippet & Setup Helper */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-red-500" />
              <span>Script SQL para el Servidor (Copiar con 1 Clic)</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Copia este script completo y pégalo en el <strong>SQL Editor</strong> de tu panel en Supabase:
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-red-950/40"
          >
            {copiedSql ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>¡Copiado con Éxito!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Script SQL</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed max-h-72 no-scrollbar">
          {SUPABASE_SQL_SCRIPT}
        </pre>
      </div>

    </div>
  );
};
