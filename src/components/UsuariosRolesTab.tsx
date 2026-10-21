import React from 'react';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Unlock,
  Key,
  CheckCircle2,
  AlertOctagon,
  Users
} from 'lucide-react';
import { UserRole, RoleId } from '../types';

interface UsuariosRolesTabProps {
  roles: UserRole[];
  activeRoleId: RoleId;
  onSelectRole: (roleId: RoleId) => void;
  onTogglePermission: (roleId: RoleId, permissionKey: keyof UserRole['permisos']) => void;
}

export const UsuariosRolesTab: React.FC<UsuariosRolesTabProps> = ({
  roles,
  activeRoleId,
  onSelectRole,
  onTogglePermission
}) => {
  const activeRole = roles.find((r) => r.id === activeRoleId) || roles[0];

  const permissionLabels: { key: keyof UserRole['permisos']; label: string; desc: string }[] = [
    {
      key: 'autolavado',
      label: 'Control de Autolavado',
      desc: 'Acceso a colas de lavado, iniciar procesos y asignar operadores.'
    },
    {
      key: 'detailing',
      label: 'Módulo Detailing & Pintura',
      desc: 'Gestión de etapas de corrección de barniz y tratamientos cerámicos.'
    },
    {
      key: 'mecanica',
      label: 'Mecánica Ligera & Lubricación',
      desc: 'Registro de órdenes de cambio de aceite, frenos y tren delantero.'
    },
    {
      key: 'autoCool',
      label: 'Zona Auto Cool (A/C)',
      desc: 'Diagnóstico manométrico (PSI), vacío y cargas de gas refrigerante.'
    },
    {
      key: 'editarInventario',
      label: 'Ajuste de Stock e Inventario',
      desc: 'Capacidad de sumar/restar existencias y dar entrada a mercancía.'
    },
    {
      key: 'clientesCaja',
      label: 'Acceso a Caja y Clientes',
      desc: 'Registro de cobros, egresos operativos y directorio de clientes.'
    },
    {
      key: 'verFinanzas',
      label: 'Visualización de Balances Financieros',
      desc: 'Métricas de flujo neto, totales recaudados y comisiones.'
    },
    {
      key: 'gestionUsuarios',
      label: 'Administración de Roles & Permisos',
      desc: 'Control maestro de accesos y credenciales de supervisores.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-800">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>🔒 6. Gestión de Usuarios & Roles (RBAC)</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Panel de control de seguridad para Portanet C.A. Simula y audita los niveles de acceso del Administrador Maestro y supervisores de segmento.
        </p>
      </div>

      {/* Role Switcher Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {roles.map((r) => {
          const isCurrent = r.id === activeRoleId;

          return (
            <button
              key={r.id}
              onClick={() => onSelectRole(r.id)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                isCurrent
                  ? 'bg-red-950/40 border-red-600 ring-1 ring-red-600/50 shadow-lg shadow-red-950/40'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-200">
                  {r.avatar}
                </div>
                {isCurrent && (
                  <span className="text-[10px] font-bold uppercase bg-red-600 text-white px-2 py-0.5 rounded shadow">
                    En Sesión
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-snug">{r.titulo}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">{r.nombre}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active User Card & Description */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-black text-white text-lg shadow-md shadow-red-950">
            {activeRole.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">{activeRole.nombre}</h3>
              <span className="text-[11px] font-mono px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                {activeRole.id}
              </span>
            </div>
            <div className="text-xs text-red-400 font-semibold">{activeRole.titulo}</div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{activeRole.descripcion}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] text-zinc-500 uppercase font-bold block mb-1">
            Privilegios Activos:
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
            {Object.values(activeRole.permisos).filter(Boolean).length} / 8 Módulos Habilitados
          </span>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Matriz Interactiva de Permisos</h3>
            <p className="text-xs text-zinc-400">
              Marca o desmarca casillas para simular la revocación o asignación de privilegios en tiempo real.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Capacidad / Módulo</th>
                {roles.map((r) => (
                  <th
                    key={r.id}
                    className={`py-3 px-3 text-center whitespace-nowrap ${
                      r.id === activeRoleId ? 'text-red-400 font-bold bg-zinc-900/60' : ''
                    }`}
                  >
                    {r.titulo.replace('Supervisor', 'Sup.')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {permissionLabels.map((perm) => (
                <tr key={perm.key} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-zinc-200">{perm.label}</div>
                    <div className="text-[11px] text-zinc-500">{perm.desc}</div>
                  </td>

                  {roles.map((r) => {
                    const isGranted = r.permisos[perm.key];
                    const isMaster = r.id === 'admin_maestro';

                    return (
                      <td
                        key={r.id}
                        className={`py-3 px-3 text-center ${
                          r.id === activeRoleId ? 'bg-zinc-900/40' : ''
                        }`}
                      >
                        <button
                          disabled={isMaster && perm.key === 'gestionUsuarios'}
                          onClick={() => onTogglePermission(r.id, perm.key)}
                          className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition-colors ${
                            isGranted
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/40 hover:bg-emerald-600/40'
                              : 'bg-zinc-800 text-zinc-600 border border-zinc-700 hover:text-zinc-400'
                          }`}
                          title={`Hacer click para alternar permiso`}
                        >
                          {isGranted ? '✓' : '✕'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
