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
  RoleId,
  WashSupplyItem,
  DetailingSupplyItem,
  DailyClosure,
  AuthUser
} from '../types';
import {
  INITIAL_ROLES,
  INITIAL_WASH_JOBS,
  INITIAL_DETAILING_JOBS,
  INITIAL_INVENTORY,
  INITIAL_MECHANICS_JOBS,
  INITIAL_AUTOCOOL_JOBS,
  INITIAL_CLIENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_COMMISSIONS,
  INITIAL_WASH_SUPPLIES,
  INITIAL_DETAILING_SUPPLIES
} from '../data/initialData';

const STORAGE_KEYS = {
  ROLES: 'portanet_roles_v2',
  AUTH_SESSION: 'portanet_auth_session_v2',
  WASH: 'portanet_wash_jobs_v2_clean',
  DETAILING: 'portanet_detailing_jobs_v2_clean',
  INVENTORY: 'portanet_inventory_v3_clean',
  WASH_SUPPLIES: 'portanet_wash_supplies_v3_clean',
  DETAILING_SUPPLIES: 'portanet_detailing_supplies_v3_clean',
  MECHANICS: 'portanet_mechanics_jobs_v2_clean',
  AUTOCOOL: 'portanet_autocool_jobs_v2_clean',
  CLIENTS: 'portanet_clients_v2_clean',
  TRANSACTIONS: 'portanet_transactions_v2_clean',
  COMMISSIONS: 'portanet_commissions_v2_clean',
  DAILY_CLOSURES: 'portanet_daily_closures_v2',
  THEME: 'portanet_theme_v2'
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving localStorage key "${key}":`, err);
  }
}

export const StorageService = {
  getRoles: (): UserRole[] => safeGet(STORAGE_KEYS.ROLES, INITIAL_ROLES),
  saveRoles: (roles: UserRole[]) => safeSet(STORAGE_KEYS.ROLES, roles),

  getAuthSession: (): AuthUser | null => {
    const session = safeGet<AuthUser | null>(STORAGE_KEYS.AUTH_SESSION, null);
    if (!session) return null;
    if (!session.role) {
      const roleMap: Record<string, 'admin' | 'lavado' | 'detailing' | 'mecanica' | 'cajera'> = {
        admin_maestro: 'admin',
        sup_autolavado: 'lavado',
        sup_detailing: 'detailing',
        sup_mecanica: 'mecanica',
        cajero: 'cajera'
      };
      session.role = (session.rolId && roleMap[session.rolId]) || 'admin';
    }
    if (!session.allowedTabs || session.allowedTabs.length === 0) {
      session.allowedTabs = ['autolavado', 'detailing', 'mecanica', 'autocool', 'clientes_caja', 'usuarios_roles'];
    }
    return session;
  },
  saveAuthSession: (user: AuthUser | null) => safeSet(STORAGE_KEYS.AUTH_SESSION, user),

  getWashJobs: (): WashJob[] => safeGet(STORAGE_KEYS.WASH, INITIAL_WASH_JOBS),
  saveWashJobs: (jobs: WashJob[]) => safeSet(STORAGE_KEYS.WASH, jobs),

  getDetailingJobs: (): DetailingJob[] => safeGet(STORAGE_KEYS.DETAILING, INITIAL_DETAILING_JOBS),
  saveDetailingJobs: (jobs: DetailingJob[]) => safeSet(STORAGE_KEYS.DETAILING, jobs),

  getWashSupplies: (): WashSupplyItem[] => safeGet(STORAGE_KEYS.WASH_SUPPLIES, INITIAL_WASH_SUPPLIES),
  saveWashSupplies: (items: WashSupplyItem[]) => safeSet(STORAGE_KEYS.WASH_SUPPLIES, items),

  getDetailingSupplies: (): DetailingSupplyItem[] => safeGet(STORAGE_KEYS.DETAILING_SUPPLIES, INITIAL_DETAILING_SUPPLIES),
  saveDetailingSupplies: (items: DetailingSupplyItem[]) => safeSet(STORAGE_KEYS.DETAILING_SUPPLIES, items),

  getInventory: (): InventoryItem[] => safeGet(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY),
  saveInventory: (items: InventoryItem[]) => safeSet(STORAGE_KEYS.INVENTORY, items),

  getMechanicsJobs: (): MechanicsJob[] => safeGet(STORAGE_KEYS.MECHANICS, INITIAL_MECHANICS_JOBS),
  saveMechanicsJobs: (jobs: MechanicsJob[]) => safeSet(STORAGE_KEYS.MECHANICS, jobs),

  getAutoCoolJobs: (): AutoCoolJob[] => safeGet(STORAGE_KEYS.AUTOCOOL, INITIAL_AUTOCOOL_JOBS),
  saveAutoCoolJobs: (jobs: AutoCoolJob[]) => safeSet(STORAGE_KEYS.AUTOCOOL, jobs),

  getClients: (): Client[] => safeGet(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS),
  saveClients: (clients: Client[]) => safeSet(STORAGE_KEYS.CLIENTS, clients),

  getTransactions: (): CashTransaction[] => safeGet(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS),
  saveTransactions: (txs: CashTransaction[]) => safeSet(STORAGE_KEYS.TRANSACTIONS, txs),

  getCommissions: (): Commission[] => safeGet(STORAGE_KEYS.COMMISSIONS, INITIAL_COMMISSIONS),
  saveCommissions: (comms: Commission[]) => safeSet(STORAGE_KEYS.COMMISSIONS, comms),

  getDailyClosures: (): DailyClosure[] => safeGet(STORAGE_KEYS.DAILY_CLOSURES, []),
  saveDailyClosures: (closures: DailyClosure[]) => safeSet(STORAGE_KEYS.DAILY_CLOSURES, closures),

  getTheme: (): 'dark' | 'light' => safeGet(STORAGE_KEYS.THEME, 'dark'),
  saveTheme: (theme: 'dark' | 'light') => safeSet(STORAGE_KEYS.THEME, theme),

  resetDailyCash: () => {
    safeSet(STORAGE_KEYS.TRANSACTIONS, []);
  }
};
