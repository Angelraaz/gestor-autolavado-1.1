import {
  WashJob,
  DetailingJob,
  InventoryItem,
  MechanicsJob,
  AutoCoolJob,
  Client,
  CashTransaction,
  Commission,
  UserRole,
  WashSupplyItem,
  DetailingSupplyItem,
  AuthUser
} from '../types';

export const INITIAL_ROLES: UserRole[] = [
  {
    id: 'admin_maestro',
    nombre: 'Ing. Carlos Mendoza',
    titulo: 'Administrador Maestro',
    descripcion: 'Control total de finanzas, cierres de jornada, inventarios, auditoría y roles.',
    avatar: 'CM',
    permisos: {
      autolavado: true,
      detailing: true,
      mecanica: true,
      autoCool: true,
      clientesCaja: true,
      verFinanzas: true,
      editarInventario: true,
      gestionUsuarios: true
    }
  },
  {
    id: 'sup_autolavado',
    nombre: 'Jhonny Rivas',
    titulo: 'Supervisor Autolavado',
    descripcion: 'Patio de lavado, cola de vehículos, operadores e insumos de autolavado.',
    avatar: 'JR',
    permisos: {
      autolavado: true,
      detailing: false,
      mecanica: false,
      autoCool: false,
      clientesCaja: false,
      verFinanzas: false,
      editarInventario: true,
      gestionUsuarios: false
    }
  },
  {
    id: 'sup_detailing',
    nombre: 'Marcos Villegas',
    titulo: 'Supervisor Detailing',
    descripcion: 'Corrección de barniz, tratamientos cerámicos e insumos especializados de estética.',
    avatar: 'MV',
    permisos: {
      autolavado: false,
      detailing: true,
      mecanica: false,
      autoCool: true,
      clientesCaja: false,
      verFinanzas: false,
      editarInventario: true,
      gestionUsuarios: false
    }
  },
  {
    id: 'sup_mecanica',
    nombre: 'Alexis González',
    titulo: 'Supervisor Mecánica y Aceite',
    descripcion: 'Rampas de lubricación, frenos, tren delantero y consumo de lubricantes.',
    avatar: 'AG',
    permisos: {
      autolavado: false,
      detailing: false,
      mecanica: true,
      autoCool: false,
      clientesCaja: false,
      verFinanzas: false,
      editarInventario: true,
      gestionUsuarios: false
    }
  },
  {
    id: 'cajero',
    nombre: 'Daniela Salazar',
    titulo: 'Cajera & Facturación',
    descripcion: 'Cobros a clientes en multimoneda, arqueos y cierre diario de jornada.',
    avatar: 'DS',
    permisos: {
      autolavado: true,
      detailing: true,
      mecanica: true,
      autoCool: true,
      clientesCaja: true,
      verFinanzas: true,
      editarInventario: false,
      gestionUsuarios: false
    }
  }
];

export const VALID_ACCOUNTS: { user: AuthUser; pass: string }[] = [
  {
    user: {
      id: 'usr_admin',
      email: 'admin@portanet.com.ve',
      nombre: 'Ing. Carlos Mendoza',
      rolId: 'admin_maestro',
      titulo: 'Administrador Maestro',
      avatar: 'CM'
    },
    pass: 'admin123'
  },
  {
    user: {
      id: 'usr_lavado',
      email: 'autolavado@portanet.com.ve',
      nombre: 'Jhonny Rivas',
      rolId: 'sup_autolavado',
      titulo: 'Supervisor Autolavado',
      avatar: 'JR'
    },
    pass: 'lavado123'
  },
  {
    user: {
      id: 'usr_detailing',
      email: 'detailing@portanet.com.ve',
      nombre: 'Marcos Villegas',
      rolId: 'sup_detailing',
      titulo: 'Supervisor Detailing',
      avatar: 'MV'
    },
    pass: 'detail123'
  },
  {
    user: {
      id: 'usr_mecanica',
      email: 'mecanica@portanet.com.ve',
      nombre: 'Alexis González',
      rolId: 'sup_mecanica',
      titulo: 'Supervisor Mecánica y Aceite',
      avatar: 'AG'
    },
    pass: 'mecanica123'
  },
  {
    user: {
      id: 'usr_caja',
      email: 'caja@portanet.com.ve',
      nombre: 'Daniela Salazar',
      rolId: 'cajero',
      titulo: 'Cajera & Facturación',
      avatar: 'DS'
    },
    pass: 'caja123'
  }
];

// 1. INVENTARIO PROPIO DE AUTOLAVADO (Inicia 100% en blanco)
export const INITIAL_WASH_SUPPLIES: WashSupplyItem[] = [];

// 2. INVENTARIO PROPIO DE DETAILING (Inicia 100% en blanco)
export const INITIAL_DETAILING_SUPPLIES: DetailingSupplyItem[] = [];

// 3. INVENTARIO PROPIO DE MECÁNICA Y ACEITE (Inicia 100% en blanco)
export const INITIAL_INVENTORY: InventoryItem[] = [];

// CLEAN START: All operational service tables and lists start completely EMPTY for real workshop operation
export const INITIAL_WASH_JOBS: WashJob[] = [];
export const INITIAL_DETAILING_JOBS: DetailingJob[] = [];
export const INITIAL_MECHANICS_JOBS: MechanicsJob[] = [];
export const INITIAL_AUTOCOOL_JOBS: AutoCoolJob[] = [];
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_TRANSACTIONS: CashTransaction[] = [];
export const INITIAL_COMMISSIONS: Commission[] = [];
