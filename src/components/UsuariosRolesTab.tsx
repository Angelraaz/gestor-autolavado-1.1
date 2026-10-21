import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  CheckCircle2,
  AlertOctagon,
  Users,
  Database,
  Search,
  Plus,
  RefreshCw,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import { UserRole, RoleId, AuthUser, SupabaseRole } from '../types';
import { supabase, ROLE_CONFIGS, SUPABASE_URL } from '../utils/supabase';

interface UsuariosRolesTabProps {
  roles: UserRole[];
  activeRoleId: RoleId;
  authUser: AuthUser;
  onSelectRole: (roleId: RoleId) => void;
  onTogglePermission: (roleId: RoleId, permissionKey: keyof UserRole['permisos']) => void;
}

interface SupabaseUserRoleRow {
  id: string;
  email: string;
  role: string;
  created_at?: string;
}

export const UsuariosRolesTab: React.FC<UsuariosRolesTabProps> = ({
  roles,
  activeRoleId,
  authUser,
  onSelectRole,
  onTogglePermission
}) => {
  const [supabaseRows, setSupabaseRows] = useState<SupabaseUserRoleRow[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // New role assignment form
  const [newUserId, setNewUserId] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newSelectedRole, setNewSelectedRole] = useState<SupabaseRole>('lavado');
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const fetchSupabaseRoles = async () => {
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
        setSupabaseRows(data || []);
      }
    } catch (err: any) {
      setQueryError(err?.message || 'Error de conexión');
    } finally {
      setIsLoadingRows(false);
    }
  };

  useEffect(() => {
    fetchSupabaseRoles();
  }, []);

  const handleCreateOrUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;

    setIsSavingRole(true);
    setSaveFeedback(null);

    try {
      const rowToUpsert: any = {
        email: newUserEmail.trim().toLowerCase(),
        role: newSelectedRole
      };

      if (newUserId.trim()) {
        rowToUpsert.id = newUserId.trim();
      }

      const { error } = await supabase.from('user_roles').upsert(rowToUpsert);

      if (error) {
        setSaveFeedback(`Error: ${error.message}`);
      } else {
        setSaveFeedback(`¡Rol '${newSelectedRole}' asignado con éxito a ${newUserEmail.trim()}!`);
        setNewUserId('');
        setNewUserEmail('');
        fetchSupabaseRoles();
      }
    } catch (err: any) {
      setSaveFeedback(`Error: ${err?.message || 'Error al guardar'}`);
    } finally {
      setIsSavingRole(false);
    }
  };

  const sqlSetupCode = `-- 1. Tabla de roles vinculada a Supabase Auth
create table if not exists public.user_roles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null check (role in ('admin', 'lavado', 'detailing', 'mecanica', 'cajera')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar Row Level Security (RLS)
alter table public.user_roles enable row level security;

-- 3. Política: Usuarios autenticados pueden consultar su propio rol
create policy "Allow users to read own role"
  on public.user_roles for select
  using (auth.uid() = id or auth.jwt() ->> 'email' = email);

-- 4. Política: Administradores pueden gestionar todos los roles
create policy "Allow admins full access to user_roles"
  on public.user_roles for all
  using (
    exists (
      select 1 from public.user_roles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 5. Insertar roles iniciales de prueba (ejemplo)
insert into public.user_roles (id, email, role)
values 
  ('00000000-0000-0000-0000-000000000001', 'admin@portanet.com.ve', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'autolavado@portanet.com.ve', 'lavado'),
  ('00000000-0000-0000-0000-000000000003', 'detailing@portanet.com.ve', 'detailing'),
  ('00000000-0000-0000-0000-000000000004', 'mecanica@portanet.com.ve', 'mecanica'),
  ('00000000-0000-0000-0000-000000000005', 'caja@portanet.com.ve', 'cajera')
on conflict (id) do update set role = excluded.role;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSetupCode);
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
      modules: 'Autolavado, Detailing, Mecánica, Auto Cool, Clientes & Caja, Usuarios & Roles (Acceso Total)',
      color: 'border-amber-500/50 bg-amber-950/20 text-amber-300'
    },
    {
      role: 'lavado',
      name: '🚗 Sup. Autolavado',
      modules: 'Únicamente Módulo 1 (Autolavado General & Insumos de Lavado)',
      color: 'border-blue-500/50 bg-blue-950/20 text-blue-300'
    },
    {
      role: 'detailing',
      name: '✨ Sup. Detailing',
      modules: 'Únicamente Módulo 2 (Detailing, Pulitura, Cerámico 9H e Insumos)',
      color: 'border-purple-500/50 bg-purple-950/20 text-purple-300'
    },
    {
      role: 'mecanica',
      name: '🛢️ Sup. Mecánica',
      modules: 'Módulo 3 (Mecánica Ligera & Lubricantes) y Módulo 4 (Zona Auto Cool A/C)',
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
    },
    {
      role: 'cajera',
      name: '💵 Cajera',
      modules: 'Únicamente Módulo 5 (Clientes, Caja Diaria, Cobros, Comisiones & Cierre)',
      color: 'border-rose-500/50 bg-rose-950/20 text-rose-300'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🔒 6. Seguridad & Roles en Supabase (public.user_roles)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Autenticación real conectada a <span className="text-white font-mono">{SUPABASE_URL}</span>.
            Cada usuario accede exclusivamente a su área asignada según su rol verificado.
          </p>
        </div>

        <button
          onClick={fetchSupabaseRoles}
          disabled={isLoadingRows}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-semibold text-zinc-200 flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRows ? 'animate-spin text-red-400' : ''}`} />
          <span>Sincronizar Supabase</span>
        </button>
      </div>

      {/* Active User Supabase Session Info */}
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
              Módulos asignados por Supabase: {authUser.allowedTabs.join(', ')}. Las demás secciones están ocultas del menú.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] text-zinc-500 uppercase font-bold block mb-1">
            Módulos Visibles en Menú:
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
            {authUser.allowedTabs.length} Secciones Habilitadas
          </span>
        </div>
      </div>

      {/* 5 Authorized Roles Definition Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Reglas de Acceso Estricto por Rol en Portanet C.A.</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Definición de qué ve y opera cada usuario tras consultar la tabla <code className="text-red-400 bg-black/40 px-1 py-0.5 rounded">user_roles</code>:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roleMappings.map((m) => (
            <div
              key={m.role}
              className={`p-3.5 rounded-xl border ${m.color} flex flex-col justify-between space-y-2`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{m.name}</span>
                  <span className="text-[10px] font-mono uppercase bg-black/50 px-2 py-0.5 rounded">
                    role = '{m.role}'
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 mt-1.5 leading-snug">{m.modules}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Table: user_roles in Supabase */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Registros en la Tabla `public.user_roles` de Supabase</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Usuarios y roles sincronizados en la base de datos de Portanet C.A.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
            {supabaseRows.length} registros cargados
          </span>
        </div>

        {queryError && (
          <div className="p-4 bg-red-950/40 border-b border-red-800 text-red-300 text-xs">
            <div className="font-bold flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span>Aviso de consulta a Supabase:</span>
            </div>
            <p className="mt-1 font-mono text-[11px]">{queryError}</p>
            <p className="text-[11px] text-zinc-400 mt-1">
              (Si la tabla aún no tiene políticas RLS de lectura anónima/autenticada, revisa el script SQL abajo para conceder SELECT a authenticated users).
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">UUID / ID de Usuario</th>
                <th className="py-3 px-4 text-right">Permiso Efectivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {supabaseRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 px-4 text-center text-zinc-500">
                    {isLoadingRows ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                        Consultando tabla user_roles en Supabase...
                      </span>
                    ) : (
                      <span>No se devolvieron filas desde `user_roles`. Puedes insertar una usando el formulario o el script SQL inferior.</span>
                    )}
                  </td>
                </tr>
              ) : (
                supabaseRows.map((row) => (
                  <tr key={row.id || row.email} className="hover:bg-zinc-800/40">
                    <td className="py-3 px-4 font-mono font-medium text-zinc-200">
                      {row.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-red-950/60 text-red-300 border border-red-800/60">
                        {row.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500 truncate max-w-[200px]" title={row.id}>
                      {row.id}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {ROLE_CONFIGS[row.role as SupabaseRole]?.titulo || 'Acceso Configurado'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Insert Form for Admin */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-red-500" />
            <span>Asignar o Modificar Rol en `user_roles`</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Registra el correo y rol de un miembro del personal para que el sistema aplique sus restricciones al iniciar sesión.
          </p>
        </div>

        {saveFeedback && (
          <div
            className={`p-3 rounded-xl text-xs ${
              saveFeedback.startsWith('Error')
                ? 'bg-red-950/50 border border-red-800 text-red-300'
                : 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'
            }`}
          >
            {saveFeedback}
          </div>
        )}

        <form onSubmit={handleCreateOrUpdateRole} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
              Correo del Usuario
            </label>
            <input
              type="email"
              required
              placeholder="operador@portanet.com.ve"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">
              Rol Asignado
            </label>
            <select
              value={newSelectedRole}
              onChange={(e) => setNewSelectedRole(e.target.value as SupabaseRole)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-red-500 text-xs"
            >
              <option value="admin">👑 admin (Admin Maestro - Acceso Total)</option>
              <option value="lavado">🚗 lavado (Sup. Autolavado)</option>
              <option value="detailing">✨ detailing (Sup. Detailing)</option>
              <option value="mecanica">🛢️ mecanica (Sup. Mecánica & Auto Cool)</option>
              <option value="cajera">💵 cajera (Cajera)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSavingRole}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold text-xs shadow-md shadow-red-950/40 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSavingRole ? 'Guardando en Supabase...' : 'Guardar en user_roles'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SQL Snippet & Setup Helper */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-red-500" />
              <span>Código SQL para Configurar la Tabla en Supabase SQL Editor</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Copia y pega este script en el SQL Editor de tu proyecto en Supabase para asegurar la tabla y sus políticas RLS:
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copiedSql ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copiar SQL</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed max-h-60 no-scrollbar">
          {sqlSetupCode}
        </pre>
      </div>

    </div>
  );
};
