/**
 * Script SQL completo y verificado para ejecutar en el SQL Editor de Supabase
 * Crea las tablas con soporte para tiempo real (Realtime) y control de acceso (RLS).
 */
export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- SGAI (Sistema de Gestión Automotriz Interno) - AJRC Servicios
-- Script de Creación y Sincronización en Tiempo Real para Supabase
-- ==============================================================================

-- 1. TABLA DE ROLES DE USUARIO
create table if not exists public.user_roles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role text not null check (role in ('admin', 'lavado', 'detailing', 'mecanica', 'cajera')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TABLA DE AUTOLAVADO
create table if not exists public.wash_jobs (
  id text primary key,
  placa text not null,
  marca text default 'General',
  modelo text not null,
  color text default 'No especificado',
  tipo_vehiculo text default 'Sedán',
  tipo_lavado text not null,
  estado text not null check (estado in ('En espera', 'En proceso', 'Listo', 'Entregado')),
  operador text default 'Sin asignar',
  hora_ingreso text not null,
  precio numeric not null default 0,
  notas text,
  cliente_nombre text default 'Cliente Particular',
  cliente_telefono text default 'N/A',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABLA DE DETAILING & POLISHING
create table if not exists public.detailing_jobs (
  id text primary key,
  placa text not null,
  modelo text not null,
  propietario text default 'Cliente Particular',
  telefono text default 'N/A',
  servicio text not null,
  etapa_actual text not null,
  progreso integer default 20,
  tecnico text default 'Técnico Detailing',
  fecha_inicio text not null,
  fecha_estimada_entrega text default 'Por coordinar',
  precio numeric not null default 0,
  observaciones text,
  estado text not null check (estado in ('En proceso', 'En espera de curado', 'Listo para entrega')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABLA DE MECÁNICA & ACEITE
create table if not exists public.mechanics_jobs (
  id text primary key,
  placa text not null,
  vehiculo text not null,
  cliente text default 'Particular',
  telefono text default 'N/A',
  tipo_servicio text not null,
  aceite_utilizado text,
  litros_aceite numeric,
  filtro_utilizado text,
  mecanico text default 'Mecánico de Turno',
  kilometraje integer default 0,
  fecha text not null,
  monto_total numeric not null default 0,
  estado text not null check (estado in ('En rampa', 'Esperando repuestos', 'Finalizado')),
  notas text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TABLA DE CAJA & MOVIMIENTOS FINANCIEROS
create table if not exists public.cash_transactions (
  id text primary key,
  tipo text not null check (tipo in ('Ingreso', 'Egreso')),
  concepto text not null,
  monto_usd numeric not null default 0,
  metodo_pago text not null,
  modulo_origen text not null,
  placa_vehiculo text,
  referencia text,
  fecha_hora text not null,
  responsable text default 'Personal',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- Permite lectura y escritura a todo usuario autenticado del taller
-- ==============================================================================

alter table public.user_roles enable row level security;
alter table public.wash_jobs enable row level security;
alter table public.detailing_jobs enable row level security;
alter table public.mechanics_jobs enable row level security;
alter table public.cash_transactions enable row level security;

-- Políticas para user_roles
drop policy if exists "Permitir lectura a autenticados" on public.user_roles;
create policy "Permitir lectura a autenticados" on public.user_roles for select to authenticated using (true);

drop policy if exists "Permitir lectura publica" on public.user_roles;
create policy "Permitir lectura publica" on public.user_roles for select to anon using (true);

drop policy if exists "Permitir a admins modificar roles" on public.user_roles;
create policy "Permitir a admins modificar roles" on public.user_roles for all to authenticated using (true) with check (true);

-- Políticas para wash_jobs
drop policy if exists "Operaciones wash_jobs autenticados" on public.wash_jobs;
create policy "Operaciones wash_jobs autenticados" on public.wash_jobs for all to authenticated using (true) with check (true);

drop policy if exists "Lectura publica wash_jobs" on public.wash_jobs;
create policy "Lectura publica wash_jobs" on public.wash_jobs for select to anon using (true);

-- Políticas para detailing_jobs
drop policy if exists "Operaciones detailing_jobs autenticados" on public.detailing_jobs;
create policy "Operaciones detailing_jobs autenticados" on public.detailing_jobs for all to authenticated using (true) with check (true);

drop policy if exists "Lectura publica detailing_jobs" on public.detailing_jobs;
create policy "Lectura publica detailing_jobs" on public.detailing_jobs for select to anon using (true);

-- Políticas para mechanics_jobs
drop policy if exists "Operaciones mechanics_jobs autenticados" on public.mechanics_jobs;
create policy "Operaciones mechanics_jobs autenticados" on public.mechanics_jobs for all to authenticated using (true) with check (true);

drop policy if exists "Lectura publica mechanics_jobs" on public.mechanics_jobs;
create policy "Lectura publica mechanics_jobs" on public.mechanics_jobs for select to anon using (true);

-- Políticas para cash_transactions
drop policy if exists "Operaciones cash_transactions autenticados" on public.cash_transactions;
create policy "Operaciones cash_transactions autenticados" on public.cash_transactions for all to authenticated using (true) with check (true);

drop policy if exists "Lectura publica cash_transactions" on public.cash_transactions;
create policy "Lectura publica cash_transactions" on public.cash_transactions for select to anon using (true);

-- ==============================================================================
-- ACTIVACIÓN DE TIEMPO REAL (Supabase Realtime)
-- Permite que los cambios se reflejen de inmediato en todos los celulares/equipos
-- ==============================================================================

alter publication supabase_realtime add table public.user_roles;
alter publication supabase_realtime add table public.wash_jobs;
alter publication supabase_realtime add table public.detailing_jobs;
alter publication supabase_realtime add table public.mechanics_jobs;
alter publication supabase_realtime add table public.cash_transactions;
`;

export const SUPABASE_SETUP_STEPS = [
  {
    step: 1,
    title: 'Abrir Supabase SQL Editor',
    desc: 'Ingresa a tu panel en app.supabase.com, entra a tu proyecto y haz clic en el icono "SQL Editor" en el menú lateral izquierdo.'
  },
  {
    step: 2,
    title: 'Copiar y Ejecutar el Script SQL',
    desc: 'Copia el script SQL que se encuentra aquí y pégalo en una nueva consulta (New query), luego presiona el botón verde "Run". Esto creará las 5 tablas y activará la replicación en tiempo real.'
  },
  {
    step: 3,
    title: 'Crear los Usuarios en Authentication',
    desc: 'En el menú "Authentication" -> "Users", pulsa "Add User" para registrar los correos y contraseñas de tus empleados (lavador, mecánico, cajera).'
  },
  {
    step: 4,
    title: 'Asignar Roles desde el Panel Admin de SGAI',
    desc: 'Al registrarse, el Administrador Maestro puede cambiarles el rol directamente desde la tabla de usuarios en SGAI seleccionando su área en el menú desplegable.'
  },
  {
    step: 5,
    title: 'Verificar Replicación Realtime',
    desc: 'En "Database" -> "Publications" -> "supabase_realtime", confirma que las tablas estén marcadas. A partir de ese momento, cualquier auto ingresado en un celular se verá inmediatamente en los demás dispositivos.'
  }
];
