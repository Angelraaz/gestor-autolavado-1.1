import { createClient } from '@supabase/supabase-js';
import { SupabaseRole, RoleId, AuthUser } from '../types';

// Supabase project credentials for Portanet C.A.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://yucbtdfoiglhfequefio.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_uoD2AfTfKvtH9MNtQl_Zfw_ejnES9r9';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Mapping of Supabase role string ('admin' | 'lavado' | 'detailing' | 'mecanica' | 'cajera')
 * to front-end permissions, allowed tabs and display metadata.
 */
export interface RoleMetadata {
  role: SupabaseRole;
  rolId: RoleId;
  titulo: string;
  nombreDefault: string;
  avatar: string;
  descripcion: string;
  allowedTabs: string[];
  defaultTab: string;
}

export const ROLE_CONFIGS: Record<SupabaseRole, RoleMetadata> = {
  admin: {
    role: 'admin',
    rolId: 'admin_maestro',
    titulo: 'Administrador Maestro',
    nombreDefault: 'Administrador Portanet',
    avatar: 'AD',
    descripcion: 'Acceso total irrestricto: Autolavado, Detailing, Mecánica, Auto Cool, Clientes, Caja y Gestión de Roles.',
    allowedTabs: ['autolavado', 'detailing', 'mecanica', 'autocool', 'clientes_caja', 'usuarios_roles'],
    defaultTab: 'autolavado'
  },
  lavado: {
    role: 'lavado',
    rolId: 'sup_autolavado',
    titulo: 'Supervisor Autolavado',
    nombreDefault: 'Supervisor Patio de Lavado',
    avatar: 'LV',
    descripcion: 'Patio de lavado, registro y avance de vehículos en bahías e insumos de lavado.',
    allowedTabs: ['autolavado'],
    defaultTab: 'autolavado'
  },
  detailing: {
    role: 'detailing',
    rolId: 'sup_detailing',
    titulo: 'Supervisor Detailing',
    nombreDefault: 'Supervisor Estética Automotriz',
    avatar: 'DT',
    descripcion: 'Bahías de pulitura, corrección de barniz, tratamientos cerámicos 9H y suministros de estética.',
    allowedTabs: ['detailing'],
    defaultTab: 'detailing'
  },
  mecanica: {
    role: 'mecanica',
    rolId: 'sup_mecanica',
    titulo: 'Supervisor Mecánica & Auto Cool',
    nombreDefault: 'Supervisor Mecánica',
    avatar: 'MC',
    descripcion: 'Mecánica rápida, lubricación, tren delantero, inventario de lubricantes y diagnóstico de A/C (Auto Cool).',
    allowedTabs: ['mecanica', 'autocool'],
    defaultTab: 'mecanica'
  },
  cajera: {
    role: 'cajera',
    rolId: 'cajero',
    titulo: 'Cajera & Facturación',
    nombreDefault: 'Cajero de Turno',
    avatar: 'CJ',
    descripcion: 'Caja diaria, cobro de servicios, comisiones de operarios, cierre diario y directorio de clientes.',
    allowedTabs: ['clientes_caja'],
    defaultTab: 'clientes_caja'
  }
};

/**
 * Normalizes any role string into a valid SupabaseRole
 */
export function normalizeRole(rawRole?: string | null): SupabaseRole {
  if (!rawRole) return 'lavado';
  const clean = rawRole.toLowerCase().trim();
  if (clean === 'admin' || clean === 'admin_maestro' || clean === 'administrador') return 'admin';
  if (clean === 'lavado' || clean === 'sup_autolavado' || clean === 'autolavado') return 'lavado';
  if (clean === 'detailing' || clean === 'sup_detailing') return 'detailing';
  if (clean === 'mecanica' || clean === 'mecanico' || clean === 'sup_mecanica' || clean === 'autocool') return 'mecanica';
  if (clean === 'cajera' || clean === 'cajero' || clean === 'caja') return 'cajera';
  return 'lavado';
}

/**
 * Queries the Supabase 'user_roles' table by user ID (or email fallback)
 */
export async function fetchUserRoleFromSupabase(
  userId: string,
  email?: string | null
): Promise<{ role: SupabaseRole; rawRole: string | null; error?: string }> {
  try {
    // 1. First attempt: Query by id (UUID foreign key to auth.users)
    const { data: byIdData, error: byIdError } = await supabase
      .from('user_roles')
      .select('id, email, role')
      .eq('id', userId)
      .maybeSingle();

    if (byIdData && byIdData.role) {
      return {
        role: normalizeRole(byIdData.role),
        rawRole: byIdData.role
      };
    }

    // 2. Second attempt: Query by email if id was not matched yet
    if (email) {
      const { data: byEmailData, error: byEmailError } = await supabase
        .from('user_roles')
        .select('id, email, role')
        .ilike('email', email.trim())
        .maybeSingle();

      if (byEmailData && byEmailData.role) {
        return {
          role: normalizeRole(byEmailData.role),
          rawRole: byEmailData.role
        };
      }
    }

    const failureReason = byIdError?.message || 'No se encontró un registro para este usuario en user_roles.';
    return {
      role: 'cajera', // default safe fallback
      rawRole: null,
      error: failureReason
    };
  } catch (err: any) {
    console.error('Error fetching role from user_roles:', err);
    return {
      role: 'cajera',
      rawRole: null,
      error: err?.message || 'Error de red o conexión a Supabase'
    };
  }
}

/**
 * Builds an AuthUser object from Supabase auth user + role record
 */
export function buildAuthUser(
  supabaseUser: { id: string; email?: string | null; user_metadata?: any },
  assignedRole: SupabaseRole
): AuthUser {
  const config = ROLE_CONFIGS[assignedRole] || ROLE_CONFIGS.lavado;
  const email = supabaseUser.email || '';
  const metaName = supabaseUser.user_metadata?.nombre || supabaseUser.user_metadata?.full_name;
  const nombre = metaName || (email ? email.split('@')[0] : config.nombreDefault);

  // Generate 2-letter avatar from email or name
  let avatar = config.avatar;
  if (nombre) {
    const parts = nombre.trim().split(/\s+/);
    if (parts.length >= 2) {
      avatar = `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    } else if (parts[0]) {
      avatar = parts[0].slice(0, 2).toUpperCase();
    }
  }

  return {
    id: supabaseUser.id,
    email: email,
    nombre: nombre,
    rolId: config.rolId,
    role: assignedRole,
    titulo: config.titulo,
    avatar: avatar,
    allowedTabs: config.allowedTabs
  };
}
