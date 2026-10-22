/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AutolavadoTab } from './components/AutolavadoTab';
import { DetailingTab } from './components/DetailingTab';
import { MecanicaAceiteTab } from './components/MecanicaAceiteTab';
import { AutoCoolTab } from './components/AutoCoolTab';
import { ClientesCajaTab } from './components/ClientesCajaTab';
import { UsuariosRolesTab } from './components/UsuariosRolesTab';
import { DailyClosureModal } from './components/DailyClosureModal';
import { LoginModal } from './components/LoginModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { StorageService } from './utils/storage';
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
  QueueStatus,
  WashSupplyItem,
  DetailingSupplyItem,
  DailyClosure,
  AuthUser
} from './types';
import { ShieldAlert } from 'lucide-react';
import { supabase, fetchUserRoleFromSupabase, buildAuthUser } from './utils/supabase';

export default function App() {
  // Authentication session
  const [authUser, setAuthUser] = useState<AuthUser | null>(() =>
    StorageService.getAuthSession()
  );

  // Theme (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => StorageService.getTheme());

  // Operational State from LocalStorage (starts clean with no mock vehicle entries)
  const [roles, setRoles] = useState<UserRole[]>(() => StorageService.getRoles());
  const [washJobs, setWashJobs] = useState<WashJob[]>(() => StorageService.getWashJobs());
  const [detailingJobs, setDetailingJobs] = useState<DetailingJob[]>(() =>
    StorageService.getDetailingJobs()
  );
  const [washSupplies, setWashSupplies] = useState<WashSupplyItem[]>(() =>
    StorageService.getWashSupplies()
  );
  const [detailingSupplies, setDetailingSupplies] = useState<DetailingSupplyItem[]>(() =>
    StorageService.getDetailingSupplies()
  );
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    StorageService.getInventory()
  );
  const [mechanicsJobs, setMechanicsJobs] = useState<MechanicsJob[]>(() =>
    StorageService.getMechanicsJobs()
  );
  const [autoCoolJobs, setAutoCoolJobs] = useState<AutoCoolJob[]>(() =>
    StorageService.getAutoCoolJobs()
  );
  const [clients, setClients] = useState<Client[]>(() => StorageService.getClients());
  const [transactions, setTransactions] = useState<CashTransaction[]>(() =>
    StorageService.getTransactions()
  );
  const [commissions, setCommissions] = useState<Commission[]>(() =>
    StorageService.getCommissions()
  );
  const [dailyClosures, setDailyClosures] = useState<DailyClosure[]>(() =>
    StorageService.getDailyClosures()
  );

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('autolavado');

  // Modals state
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply theme to HTML tag
  useEffect(() => {
    StorageService.saveTheme(theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Persist session
  useEffect(() => {
    StorageService.saveAuthSession(authUser);
  }, [authUser]);

  // Synchronize and listen for real-time Supabase Auth state changes
  useEffect(() => {
    let isMounted = true;

    // Check active session on initial load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user && isMounted) {
        const { role } = await fetchUserRoleFromSupabase(session.user.id, session.user.email);
        const user = buildAuthUser(session.user, role);
        setAuthUser(user);
      }
    });

    // Real-time listener for sign in / sign out / token refreshes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user && isMounted) {
        const { role } = await fetchUserRoleFromSupabase(session.user.id, session.user.email);
        const user = buildAuthUser(session.user, role);
        setAuthUser(user);
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) setAuthUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Automatic RBAC alignment: route user immediately to their permitted modules
  useEffect(() => {
    if (authUser) {
      const allowed = authUser.allowedTabs || ['autolavado'];
      if (!allowed.includes(activeTab)) {
        setActiveTab(allowed[0] || 'autolavado');
      }
    }
  }, [authUser, activeTab]);

  // Persist state changes
  useEffect(() => {
    StorageService.saveRoles(roles);
  }, [roles]);

  useEffect(() => {
    StorageService.saveWashJobs(washJobs);
  }, [washJobs]);

  useEffect(() => {
    StorageService.saveDetailingJobs(detailingJobs);
  }, [detailingJobs]);

  useEffect(() => {
    StorageService.saveWashSupplies(washSupplies);
  }, [washSupplies]);

  useEffect(() => {
    StorageService.saveDetailingSupplies(detailingSupplies);
  }, [detailingSupplies]);

  useEffect(() => {
    StorageService.saveInventory(inventory);
  }, [inventory]);

  useEffect(() => {
    StorageService.saveMechanicsJobs(mechanicsJobs);
  }, [mechanicsJobs]);

  useEffect(() => {
    StorageService.saveAutoCoolJobs(autoCoolJobs);
  }, [autoCoolJobs]);

  useEffect(() => {
    StorageService.saveClients(clients);
  }, [clients]);

  useEffect(() => {
    StorageService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    StorageService.saveCommissions(commissions);
  }, [commissions]);

  useEffect(() => {
    StorageService.saveDailyClosures(dailyClosures);
  }, [dailyClosures]);

  // Toast feedback
  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Active role based on authenticated user
  const activeRole = roles.find((r) => r.id === authUser?.rolId) || roles[0];

  // Workshop Live Header Counters
  const queueCount = washJobs.filter((j) => j.estado !== 'Entregado').length;
  const cashBalance = transactions.reduce((acc, t) => {
    return t.tipo === 'Ingreso' ? acc + Number(t.montoUSD) : acc - Number(t.montoUSD);
  }, 0);

  // Check RBAC permission for current tab based on Supabase role
  const hasPermissionForCurrentTab = () => {
    if (!authUser) return false;
    if (authUser.role === 'admin' || authUser.rolId === 'admin_maestro') return true;
    return authUser.allowedTabs ? authUser.allowedTabs.includes(activeTab) : false;
  };

  // --- AUTOLAVADO HANDLERS ---
  const handleAddWashJob = (newJobData: Omit<WashJob, 'id' | 'horaIngreso'>) => {
    const newJob: WashJob = {
      ...newJobData,
      id: `WASH-${Date.now().toString().slice(-4)}`,
      horaIngreso: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setWashJobs((prev) => [newJob, ...prev]);
    addToast(`Vehículo ${newJob.placa} ingresado a la cola de lavado`);
  };

  const handleAdvanceWashStatus = (id: string, nextStatus: QueueStatus) => {
    setWashJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, estado: nextStatus } : j))
    );
    addToast(`Estado de lavado actualizado a: ${nextStatus}`);
  };

  const handleChargeWashJob = (job: WashJob) => {
    const newTx: CashTransaction = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      tipo: 'Ingreso',
      concepto: `${job.tipoLavado} (${job.modelo})`,
      montoUSD: job.precio,
      metodoPago: 'Divisas / USD Efectivo',
      moduloOrigen: 'Autolavado',
      placaVehiculo: job.placa,
      fechaHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responsable: authUser?.nombre || 'Personal'
    };
    setTransactions((prev) => [newTx, ...prev]);

    if (job.operador && job.operador !== 'Sin asignar') {
      const commAmount = Number((job.precio * 0.35).toFixed(2));
      const newCom: Commission = {
        id: `COM-${Date.now().toString().slice(-4)}`,
        trabajador: job.operador,
        cargo: 'Lavador',
        servicioRealizado: `${job.tipoLavado}`,
        placa: job.placa,
        montoServicioUSD: job.precio,
        porcentaje: 35,
        comisionUSD: commAmount,
        estado: 'Pendiente',
        fecha: new Date().toISOString().split('T')[0]
      };
      setCommissions((prev) => [newCom, ...prev]);
    }

    setWashJobs((prev) => prev.filter((j) => j.id !== job.id));
    addToast(`Cobrado en Caja: $${job.precio} - Vehículo ${job.placa} entregado`, 'success');
  };

  const handleCancelWashJob = (id: string) => {
    setWashJobs((prev) => prev.filter((j) => j.id !== id));
    addToast('Ingreso a cola cancelado', 'info');
  };

  const handleAdjustWashSupply = (id: string, delta: number) => {
    setWashSupplies((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStock = Math.max(0, s.stockActual + delta);
          return { ...s, stockActual: nextStock };
        }
        return s;
      })
    );
    addToast('Stock de insumo de lavado actualizado');
  };

  const handleAddWashSupply = (newItem: Omit<WashSupplyItem, 'id'>) => {
    const item: WashSupplyItem = {
      ...newItem,
      id: `WSH-${Date.now().toString().slice(-4)}`
    };
    setWashSupplies((prev) => [...prev, item]);
    addToast(`Insumo ${item.nombre} registrado en autolavado`);
  };

  // --- DETAILING HANDLERS ---
  const handleAddDetailingJob = (newJobData: Omit<DetailingJob, 'id'>) => {
    const newJob: DetailingJob = {
      ...newJobData,
      id: `DET-${Date.now().toString().slice(-4)}`
    };
    setDetailingJobs((prev) => [newJob, ...prev]);
    addToast(`Proyecto Detailing creado para ${newJob.placa}`);
  };

  const handleAdvanceDetailingStage = (id: string) => {
    setDetailingJobs((prev) =>
      prev.map((j) => {
        if (j.id === id) {
          const nextProg = Math.min(100, j.progreso + 25);
          let nextEtapa = j.etapaActual;
          if (nextProg === 50) nextEtapa = 'Corrección / Pulido';
          else if (nextProg === 75) nextEtapa = 'Aplicación Cerámico / Sellado';
          else if (nextProg >= 100) nextEtapa = 'Curado & Inspección Final';

          return {
            ...j,
            progreso: nextProg,
            etapaActual: nextEtapa,
            estado: nextProg >= 100 ? 'Listo para entrega' : 'En proceso'
          };
        }
        return j;
      })
    );
    addToast('Etapa de detailing avanzada');
  };

  const handleChargeDetailingJob = (job: DetailingJob) => {
    const newTx: CashTransaction = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      tipo: 'Ingreso',
      concepto: `${job.servicio} (${job.modelo})`,
      montoUSD: job.precio,
      metodoPago: 'Punto de Venta',
      moduloOrigen: 'Detailing',
      placaVehiculo: job.placa,
      fechaHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responsable: authUser?.nombre || 'Personal'
    };
    setTransactions((prev) => [newTx, ...prev]);

    const commAmount = Number((job.precio * 0.3).toFixed(2));
    const newCom: Commission = {
      id: `COM-${Date.now().toString().slice(-4)}`,
      trabajador: job.tecnico,
      cargo: 'Técnico Detailing',
      servicioRealizado: job.servicio,
      placa: job.placa,
      montoServicioUSD: job.precio,
      porcentaje: 30,
      comisionUSD: commAmount,
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0]
    };
    setCommissions((prev) => [newCom, ...prev]);

    setDetailingJobs((prev) => prev.filter((j) => j.id !== job.id));
    addToast(`Detailing cobrado: $${job.precio} para ${job.placa}`);
  };

  const handleAdjustDetailingSupply = (id: string, delta: number) => {
    setDetailingSupplies((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStock = Math.max(0, s.stockActual + delta);
          return { ...s, stockActual: nextStock };
        }
        return s;
      })
    );
    addToast('Stock de producto detailing actualizado');
  };

  const handleAddDetailingSupply = (newItem: Omit<DetailingSupplyItem, 'id'>) => {
    const item: DetailingSupplyItem = {
      ...newItem,
      id: `DET-SUP-${Date.now().toString().slice(-4)}`
    };
    setDetailingSupplies((prev) => [...prev, item]);
    addToast(`Producto ${item.nombre} registrado en detailing`);
  };

  // --- MECÁNICA & ACEITE HANDLERS ---
  const handleAddMechanicsJob = (
    newJobData: Omit<MechanicsJob, 'id' | 'fecha'>,
    discountInventoryItemId?: string,
    discountQuantity?: number
  ) => {
    const newJob: MechanicsJob = {
      ...newJobData,
      id: `MEC-${Date.now().toString().slice(-4)}`,
      fecha: new Date().toISOString().split('T')[0]
    };

    // Auto discount from inventory
    if (discountInventoryItemId && discountQuantity && discountQuantity > 0) {
      setInventory((prev) =>
        prev.map((item) => {
          if (item.id === discountInventoryItemId) {
            const nextStock = Math.max(0, item.stockActual - discountQuantity);
            return { ...item, stockActual: nextStock };
          }
          return item;
        })
      );
      addToast(
        `Descontados ${discountQuantity} unidades del inventario para la orden de ${newJob.placa}`,
        'info'
      );
    }

    setMechanicsJobs((prev) => [newJob, ...prev]);
    addToast(`Servicio de mecánica registrado para ${newJob.placa}`);
  };

  const handleAdvanceMechanicsJobStatus = (id: string, nextStatus: MechanicsJob['estado']) => {
    setMechanicsJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, estado: nextStatus } : j))
    );
    addToast(`Estado de mecánica: ${nextStatus}`);
  };

  const handleChargeMechanicsJob = (job: MechanicsJob) => {
    const newTx: CashTransaction = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      tipo: 'Ingreso',
      concepto: `${job.tipoServicio} (${job.vehiculo})`,
      montoUSD: job.montoTotal,
      metodoPago: 'Pago Móvil',
      moduloOrigen: 'Mecánica & Aceite',
      placaVehiculo: job.placa,
      fechaHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responsable: authUser?.nombre || 'Personal'
    };
    setTransactions((prev) => [newTx, ...prev]);

    const commAmount = Number((job.montoTotal * 0.25).toFixed(2));
    const newCom: Commission = {
      id: `COM-${Date.now().toString().slice(-4)}`,
      trabajador: job.mecanico,
      cargo: 'Mecánico',
      servicioRealizado: job.tipoServicio,
      placa: job.placa,
      montoServicioUSD: job.montoTotal,
      porcentaje: 25,
      comisionUSD: commAmount,
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0]
    };
    setCommissions((prev) => [newCom, ...prev]);

    setMechanicsJobs((prev) => prev.filter((j) => j.id !== job.id));
    addToast(`Servicio cobrado en caja: $${job.montoTotal}`);
  };

  const handleAdjustInventoryStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const nextStock = Math.max(0, i.stockActual + delta);
          return { ...i, stockActual: nextStock };
        }
        return i;
      })
    );
    addToast('Stock de lubricante actualizado');
  };

  const handleAddInventoryItem = (newItem: Omit<InventoryItem, 'id'>) => {
    const item: InventoryItem = {
      ...newItem,
      id: `INV-${Date.now().toString().slice(-4)}`
    };
    setInventory((prev) => [...prev, item]);
    addToast(`Lubricante/Repuesto ${item.codigo} registrado`);
  };

  // --- AUTO COOL HANDLERS ---
  const handleAddAutoCoolJob = (newJobData: Omit<AutoCoolJob, 'id' | 'fecha'>) => {
    const newJob: AutoCoolJob = {
      ...newJobData,
      id: `COOL-${Date.now().toString().slice(-4)}`,
      fecha: new Date().toISOString().split('T')[0]
    };
    setAutoCoolJobs((prev) => [newJob, ...prev]);
    addToast(`Orden Auto Cool creada para ${newJob.placa}`);
  };

  const handleAdvanceAutoCoolStatus = (id: string, nextStatus: AutoCoolJob['estado']) => {
    setAutoCoolJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, estado: nextStatus } : j))
    );
    addToast(`Estado Auto Cool: ${nextStatus}`);
  };

  const handleChargeAutoCoolJob = (job: AutoCoolJob) => {
    const newTx: CashTransaction = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      tipo: 'Ingreso',
      concepto: `${job.servicio} (${job.vehiculo})`,
      montoUSD: job.precio,
      metodoPago: 'Zelle / Transferencia',
      moduloOrigen: 'Auto Cool',
      placaVehiculo: job.placa,
      fechaHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responsable: authUser?.nombre || 'Personal'
    };
    setTransactions((prev) => [newTx, ...prev]);

    const commAmount = Number((job.precio * 0.3).toFixed(2));
    const newCom: Commission = {
      id: `COM-${Date.now().toString().slice(-4)}`,
      trabajador: job.tecnico,
      cargo: 'Técnico Auto Cool',
      servicioRealizado: job.servicio,
      placa: job.placa,
      montoServicioUSD: job.precio,
      porcentaje: 30,
      comisionUSD: commAmount,
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0]
    };
    setCommissions((prev) => [newCom, ...prev]);

    setAutoCoolJobs((prev) => prev.filter((j) => j.id !== job.id));
    addToast(`Servicio Auto Cool cobrado: $${job.precio}`);
  };

  // --- CAJA & CLIENTES HANDLERS ---
  const handleAddTransaction = (newTxData: Omit<CashTransaction, 'id' | 'fechaHora'>) => {
    const newTx: CashTransaction = {
      ...newTxData,
      id: `TRX-${Date.now().toString().slice(-4)}`,
      fechaHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setTransactions((prev) => [newTx, ...prev]);
    addToast(`Movimiento registrado en caja: $${newTx.montoUSD}`);
  };

  const handleAddClient = (
    newClientData: Omit<Client, 'id' | 'fechaRegistro' | 'totalVisitas'>
  ) => {
    const newClient: Client = {
      ...newClientData,
      id: `CLI-${Date.now().toString().slice(-4)}`,
      fechaRegistro: new Date().toISOString().split('T')[0],
      totalVisitas: 1
    };
    setClients((prev) => [newClient, ...prev]);
    addToast(`Cliente ${newClient.nombre} registrado con éxito`);
  };

  const handlePayCommission = (commissionId: string) => {
    const com = commissions.find((c) => c.id === commissionId);
    if (!com) return;

    setCommissions((prev) =>
      prev.map((c) => (c.id === commissionId ? { ...c, estado: 'Pagado' } : c))
    );

    const newTx: CashTransaction = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      tipo: 'Egreso',
      concepto: `Pago Liquidación Comisión - ${com.trabajador} (${com.cargo})`,
      montoUSD: com.comisionUSD,
      metodoPago: 'Divisas / USD Efectivo',
      moduloOrigen: 'Gasto Operativo',
      placaVehiculo: com.placa,
      referencia: `LIQ-COM-${com.id}`,
      fechaHora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responsable: authUser?.nombre || 'Personal'
    };
    setTransactions((prev) => [newTx, ...prev]);
    addToast(`Comisión de $${com.comisionUSD} pagada a ${com.trabajador}`);
  };

  // --- DAILY CLOSURE HANDLER ---
  const handleConfirmDailyClosure = (closure: DailyClosure) => {
    setDailyClosures((prev) => [closure, ...prev]);
    // Reset active cash transactions for next shift
    setTransactions([]);
    addToast(
      `Cierre de jornada completado ($${closure.balanceNetoUSD.toFixed(2)} congelados)`,
      'success'
    );
  };

  // --- ROLES HANDLERS ---
  const handleTogglePermission = (
    roleId: RoleId,
    permissionKey: keyof UserRole['permisos']
  ) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id === roleId) {
          return {
            ...r,
            permisos: {
              ...r.permisos,
              [permissionKey]: !r.permisos[permissionKey]
            }
          };
        }
        return r;
      })
    );
    addToast('Permiso de rol actualizado');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out from Supabase:', err);
    }
    setAuthUser(null);
    addToast('Sesión cerrada correctamente en Supabase', 'info');
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-red-600 selection:text-white antialiased transition-colors ${
        theme === 'dark' ? 'bg-[#090D15] text-zinc-100' : 'bg-zinc-100 text-zinc-900'
      }`}
    >
      {/* If not logged in, show Login Modal */}
      {!authUser ? (
        <LoginModal
          onLogin={(user) => {
            setAuthUser(user);
            addToast(`Bienvenido a Portanet C.A., ${user.nombre}`, 'success');
          }}
        />
      ) : (
        <>
          {/* Main Top Header */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            authUser={authUser}
            onLogout={handleLogout}
            queueCount={queueCount}
            cashBalance={cashBalance}
            theme={theme}
            onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
            {!hasPermissionForCurrentTab() ? (
              <div className="bg-red-950/20 border border-red-800/80 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto my-12">
                <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Módulo con Acceso Restringido</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Tu usuario (<span className="text-white font-semibold">{authUser.nombre}</span> - {authUser.titulo}) no tiene permisos para este segmento.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'autolavado' && (
                  <AutolavadoTab
                    jobs={washJobs}
                    supplies={washSupplies}
                    onAddJob={handleAddWashJob}
                    onAdvanceStatus={handleAdvanceWashStatus}
                    onChargeJob={handleChargeWashJob}
                    onCancelJob={handleCancelWashJob}
                    onAdjustSupply={handleAdjustWashSupply}
                    onAddSupply={handleAddWashSupply}
                  />
                )}

                {activeTab === 'detailing' && (
                  <DetailingTab
                    jobs={detailingJobs}
                    supplies={detailingSupplies}
                    onAddJob={handleAddDetailingJob}
                    onAdvanceStage={handleAdvanceDetailingStage}
                    onCompleteAndCharge={handleChargeDetailingJob}
                    onAdjustSupply={handleAdjustDetailingSupply}
                    onAddSupply={handleAddDetailingSupply}
                  />
                )}

                {activeTab === 'mecanica' && (
                  <MecanicaAceiteTab
                    jobs={mechanicsJobs}
                    inventory={inventory}
                    onAddJob={handleAddMechanicsJob}
                    onAdvanceJobStatus={handleAdvanceMechanicsJobStatus}
                    onChargeJob={handleChargeMechanicsJob}
                    onAdjustStock={handleAdjustInventoryStock}
                    onAddInventoryItem={handleAddInventoryItem}
                  />
                )}

                {activeTab === 'autocool' && (
                  <AutoCoolTab
                    jobs={autoCoolJobs}
                    onAddJob={handleAddAutoCoolJob}
                    onAdvanceStatus={handleAdvanceAutoCoolStatus}
                    onChargeJob={handleChargeAutoCoolJob}
                  />
                )}

                {activeTab === 'clientes_caja' && (
                  <ClientesCajaTab
                    clients={clients}
                    transactions={transactions}
                    commissions={commissions}
                    dailyClosures={dailyClosures}
                    authUser={authUser}
                    onAddTransaction={handleAddTransaction}
                    onAddClient={handleAddClient}
                    onPayCommission={handlePayCommission}
                    onOpenClosureModal={() => setIsClosureModalOpen(true)}
                  />
                )}

                {activeTab === 'usuarios_roles' && (
                  <UsuariosRolesTab
                    roles={roles}
                    activeRoleId={authUser.rolId}
                    authUser={authUser}
                    onSelectRole={() => {}}
                    onTogglePermission={handleTogglePermission}
                  />
                )}
              </>
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-zinc-800/80 bg-zinc-950 py-3 px-4 sm:px-6 text-center text-xs text-zinc-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-zinc-400">Portanet C.A.</span> · Sistema de Gestión Automotriz Interno
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span>Sistema Operativo en Tiempo Real</span>
              </div>
            </div>
          </footer>

          {/* Daily Closure Modal */}
          <DailyClosureModal
            isOpen={isClosureModalOpen}
            onClose={() => setIsClosureModalOpen(false)}
            transactions={transactions}
            commissions={commissions}
            authUser={authUser}
            onConfirmClosure={handleConfirmDailyClosure}
          />

          {/* Floating Action Notifications */}
          <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </>
      )}
    </div>
  );
}
