import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Smartphone,
  Banknote,
  Search,
  Plus,
  Car,
  Briefcase,
  CheckCircle,
  FileText,
  Lock,
  Calendar,
  History,
  Calculator
} from 'lucide-react';
import { CalculatorModal } from './CalculatorModal';
import {
  Client,
  CashTransaction,
  Commission,
  PaymentMethod,
  DailyClosure,
  AuthUser
} from '../types';

interface ClientesCajaTabProps {
  clients: Client[];
  transactions: CashTransaction[];
  commissions: Commission[];
  dailyClosures: DailyClosure[];
  authUser: AuthUser;
  onAddTransaction: (tx: Omit<CashTransaction, 'id' | 'fechaHora'>) => void;
  onAddClient: (client: Omit<Client, 'id' | 'fechaRegistro' | 'totalVisitas'>) => void;
  onPayCommission: (commissionId: string) => void;
  onOpenClosureModal: () => void;
}

export const ClientesCajaTab: React.FC<ClientesCajaTabProps> = ({
  clients,
  transactions,
  commissions,
  dailyClosures,
  authUser,
  onAddTransaction,
  onAddClient,
  onPayCommission,
  onOpenClosureModal
}) => {
  const [activeSection, setActiveSection] = useState<'caja' | 'clientes' | 'comisiones' | 'cierres'>('caja');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Client search
  const [clientSearch, setClientSearch] = useState('');

  // New Client Form State
  const [nombre, setNombre] = useState('');
  const [cedulaRif, setCedulaRif] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [vehiculoPlaca, setVehiculoPlaca] = useState('');
  const [vehiculoMarca, setVehiculoMarca] = useState('');
  const [vehiculoModelo, setVehiculoModelo] = useState('');
  const [vehiculoAño, setVehiculoAño] = useState('2020');
  const [vehiculoColor, setVehiculoColor] = useState('');

  // New Transaction Form State
  const [txTipo, setTxTipo] = useState<'Ingreso' | 'Egreso'>('Ingreso');
  const [txConcepto, setTxConcepto] = useState('');
  const [txMonto, setTxMonto] = useState<number>(20);
  const [txMetodo, setTxMetodo] = useState<PaymentMethod>('Divisas / USD Efectivo');
  const [txModulo, setTxModulo] = useState<CashTransaction['moduloOrigen']>('Caja General');
  const [txPlaca, setTxPlaca] = useState('');
  const [txReferencia, setTxReferencia] = useState('');

  const totalIngresos = transactions
    .filter((t) => t.tipo === 'Ingreso')
    .reduce((acc, t) => acc + Number(t.montoUSD), 0);

  const totalEgresos = transactions
    .filter((t) => t.tipo === 'Egreso')
    .reduce((acc, t) => acc + Number(t.montoUSD), 0);

  const balanceNeto = totalIngresos - totalEgresos;

  // Breakdown by payment method
  const methodTotals: Record<PaymentMethod, number> = {
    'Divisas / USD Efectivo': 0,
    'Bolívares Efectivo': 0,
    'Punto de Venta': 0,
    'Pago Móvil': 0,
    'Zelle / Transferencia': 0
  };

  transactions.forEach((t) => {
    if (t.tipo === 'Ingreso') {
      methodTotals[t.metodoPago] = (methodTotals[t.metodoPago] || 0) + Number(t.montoUSD);
    }
  });

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !cedulaRif.trim()) return;

    onAddClient({
      nombre: nombre.trim(),
      cedulaRif: cedulaRif.trim(),
      telefono: telefono.trim() || 'N/A',
      correo: correo.trim() || 'N/A',
      vehiculos: vehiculoPlaca.trim()
        ? [
            {
              placa: vehiculoPlaca.toUpperCase().trim(),
              marca: vehiculoMarca.trim() || 'General',
              modelo: vehiculoModelo.trim() || 'Vehículo',
              año: vehiculoAño.trim() || '2020',
              color: vehiculoColor.trim() || 'No especificado'
            }
          ]
        : []
    });

    setNombre('');
    setCedulaRif('');
    setTelefono('');
    setCorreo('');
    setVehiculoPlaca('');
    setVehiculoMarca('');
    setVehiculoModelo('');
    setVehiculoColor('');
    setIsClientModalOpen(false);
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txConcepto.trim() || txMonto <= 0) return;

    onAddTransaction({
      tipo: txTipo,
      concepto: txConcepto.trim(),
      montoUSD: Number(txMonto),
      metodoPago: txMetodo,
      moduloOrigen: txModulo,
      placaVehiculo: txPlaca.toUpperCase().trim() || undefined,
      referencia: txReferencia.trim() || undefined,
      responsable: authUser.nombre
    });

    setTxConcepto('');
    setTxMonto(20);
    setTxPlaca('');
    setTxReferencia('');
    setIsTxModalOpen(false);
  };

  const filteredClients = clients.filter((c) => {
    const q = clientSearch.toLowerCase();
    const matchesName = c.nombre.toLowerCase().includes(q);
    const matchesCedula = c.cedulaRif.toLowerCase().includes(q);
    const matchesPlate = c.vehiculos.some((v) => v.placa.toLowerCase().includes(q));
    return matchesName || matchesCedula || matchesPlate;
  });

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>👥 5. Clientes, Caja Diaria & Cierre de Jornada</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Arqueo multimoneda en tiempo real, liquidación de comisiones y reporte de cierre de jornada.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subtabs Navigation */}
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveSection('caja')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'caja'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Caja Diaria</span>
            </button>
            <button
              onClick={() => setActiveSection('clientes')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'clientes'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clientes ({clients.length})</span>
            </button>
            <button
              onClick={() => setActiveSection('comisiones')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'comisiones'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Comisiones ({commissions.length})</span>
            </button>
            <button
              onClick={() => setActiveSection('cierres')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeSection === 'cierres'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Cierres ({dailyClosures.length})</span>
            </button>
          </div>

          {/* Prominent Calculator Button */}
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="px-3.5 py-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 rounded-lg border border-zinc-700 shadow-sm transition-colors flex items-center gap-1.5"
            title="Abrir calculadora de caja"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Calculadora</span>
          </button>

          {/* Prominent Daily Closure Button */}
          <button
            onClick={onOpenClosureModal}
            className="px-4 py-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-red-400 hover:text-red-300 rounded-lg border border-red-900/60 shadow-sm transition-colors flex items-center gap-1.5"
            title="Realizar arqueo y cierre del día"
          >
            <Lock className="w-3.5 h-3.5 text-red-500" />
            <span>Cierre de Jornada / Cierre de Día</span>
          </button>

          {activeSection === 'caja' && (
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Movimiento</span>
            </button>
          )}

          {activeSection === 'clientes' && (
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Cliente</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION: CAJA DIARIA */}
      {activeSection === 'caja' && (
        <div className="space-y-6">
          {/* 3 Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                <span>Total Ingresos Hoy</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                ${totalIngresos.toFixed(2)}
              </div>
              <p className="text-[11px] text-zinc-500">Cobros registrados de la jornada actual</p>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                <span>Total Egresos / Gastos</span>
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-red-400 tabular-nums">
                ${totalEgresos.toFixed(2)}
              </div>
              <p className="text-[11px] text-zinc-500">Compras operativas e insumos de taller</p>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
                <span>Balance Neto en Caja</span>
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                ${balanceNeto.toFixed(2)}
              </div>
              <p className="text-[11px] text-zinc-500">Flujo neto disponible para arqueo</p>
            </div>
          </div>

          {/* Breakdown by Payment Method */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Arqueo en Vivo por Métodos de Pago
              </h3>
              <button
                onClick={onOpenClosureModal}
                className="text-[11px] text-red-400 hover:text-red-300 font-bold underline"
              >
                Ver Arqueo Completo →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                  <span>USD Efectivo</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-1 tabular-nums">
                  ${(methodTotals['Divisas / USD Efectivo'] || 0).toFixed(2)}
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                  <Banknote className="w-3.5 h-3.5 text-blue-400" />
                  <span>Bs. Efectivo</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-1 tabular-nums">
                  ${(methodTotals['Bolívares Efectivo'] || 0).toFixed(2)}
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                  <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                  <span>Punto de Venta</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-1 tabular-nums">
                  ${(methodTotals['Punto de Venta'] || 0).toFixed(2)}
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pago Móvil</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-1 tabular-nums">
                  ${(methodTotals['Pago Móvil'] || 0).toFixed(2)}
                </div>
              </div>

              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Zelle / Transf.</span>
                </div>
                <div className="text-base font-bold font-mono text-white mt-1 tabular-nums">
                  ${(methodTotals['Zelle / Transferencia'] || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Ledger Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <span>Libro Diario de Caja</span>
              </h3>
              <span className="text-xs text-zinc-400 font-mono">
                {transactions.length} movimientos
              </span>
            </div>

            {transactions.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-xs space-y-2">
                <DollarSign className="w-8 h-8 mx-auto text-zinc-600" />
                <p className="font-medium text-zinc-400">No hay movimientos registrados en la jornada de hoy.</p>
                <p className="text-zinc-600">Al cobrar lavados, proyectos de detailing o servicios mecánicos, aparecerán aquí automáticamente.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
                      <tr>
                        <th className="py-3 px-4">Hora</th>
                        <th className="py-3 px-4">Tipo</th>
                        <th className="py-3 px-4">Concepto / Vehículo</th>
                        <th className="py-3 px-4">Módulo Origen</th>
                        <th className="py-3 px-4">Método de Pago</th>
                        <th className="py-3 px-4">Referencia</th>
                        <th className="py-3 px-4 text-right">Monto ($ USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/70">
                      {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-zinc-400 whitespace-nowrap">
                            {t.fechaHora}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                t.tipo === 'Ingreso'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                  : 'bg-red-950 text-red-400 border border-red-800/60'
                              }`}
                            >
                              {t.tipo}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-zinc-200">{t.concepto}</div>
                            {t.placaVehiculo && (
                              <span className="text-[11px] font-mono text-zinc-400">
                                Placa: {t.placaVehiculo}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-zinc-400">{t.moduloOrigen}</td>
                          <td className="py-3 px-4 text-zinc-300">{t.metodoPago}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                            {t.referencia || '--'}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-bold tabular-nums text-sm ${
                              t.tipo === 'Ingreso' ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {t.tipo === 'Ingreso' ? '+' : '-'}${Number(t.montoUSD).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Adaptive Cards View (< md, touch & thumb friendly) */}
                <div className="md:hidden p-3 space-y-2.5">
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className="bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              t.tipo === 'Ingreso'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                : 'bg-red-950 text-red-400 border border-red-800/60'
                            }`}
                          >
                            {t.tipo}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-medium">
                            {t.moduloOrigen}
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold text-sm tabular-nums ${
                            t.tipo === 'Ingreso' ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {t.tipo === 'Ingreso' ? '+' : '-'}${Number(t.montoUSD).toFixed(2)}
                        </span>
                      </div>

                      <div>
                        <div className="font-bold text-zinc-100 text-xs">{t.concepto}</div>
                        {t.placaVehiculo && (
                          <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                            Vehículo: <span className="text-zinc-200 font-bold">{t.placaVehiculo}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-zinc-800/70 flex items-center justify-between text-[11px] text-zinc-400">
                        <span>💳 {t.metodoPago}</span>
                        <span className="font-mono text-zinc-500">{t.fechaHora}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SECTION: CLIENTES */}
      {activeSection === 'clientes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente, cédula o placa de vehículo..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {clients.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-8">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <Users className="w-7 h-7 text-zinc-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Directorio de Clientes Vacío</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Comienza a registrar clientes y sus flotas de vehículos para mantener el historial de visitas.
                </p>
              </div>
              <button
                onClick={() => setIsClientModalOpen(true)}
                className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Primer Cliente</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((c) => (
                <div
                  key={c.id}
                  className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-3 hover:border-zinc-700 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between pb-2 border-b border-zinc-800">
                    <div>
                      <h3 className="font-bold text-white text-sm">{c.nombre}</h3>
                      <span className="font-mono text-xs text-zinc-400">{c.cedulaRif}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                      {c.totalVisitas} visitas
                    </span>
                  </div>

                  <div className="text-xs text-zinc-400 space-y-1">
                    <div>
                      <span className="text-zinc-500">Teléfono:</span>{' '}
                      <span className="text-zinc-200">{c.telefono}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Correo:</span>{' '}
                      <span className="text-zinc-200">{c.correo}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                      Vehículos Registrados:
                    </span>
                    <div className="space-y-1.5">
                      {c.vehiculos.map((v) => (
                        <div
                          key={v.placa}
                          className="flex items-center justify-between bg-zinc-950 p-2 rounded border border-zinc-800 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-100 text-[11px]">
                              {v.placa}
                            </span>
                            <span className="text-zinc-200 text-xs">{v.modelo}</span>
                          </div>
                          <span className="text-[11px] text-zinc-400">{v.año}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION: COMISIONES */}
      {activeSection === 'comisiones' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  💼 Liquidación de Comisiones de Personal
                </h3>
                <p className="text-xs text-zinc-400">
                  Comisiones por porcentaje de lavado, pulitura, mecánica y aire acondicionado.
                </p>
              </div>
            </div>

            {commissions.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-xs">
                <Briefcase className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                <span>No hay comisiones generadas en la jornada.</span>
              </div>
            ) : (
              <>
                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
                      <tr>
                        <th className="py-3 px-4">Trabajador</th>
                        <th className="py-3 px-4">Cargo</th>
                        <th className="py-3 px-4">Servicio Realizado</th>
                        <th className="py-3 px-4 text-right">Monto Servicio</th>
                        <th className="py-3 px-4 text-right">% Comisión</th>
                        <th className="py-3 px-4 text-right">Comisión a Pagar</th>
                        <th className="py-3 px-4 text-center">Estado</th>
                        <th className="py-3 px-4 text-center">Liquidación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/70">
                      {commissions.map((com) => {
                        const isPaid = com.estado === 'Pagado';

                        return (
                          <tr key={com.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-zinc-100">{com.trabajador}</td>
                            <td className="py-3 px-4 text-zinc-400">{com.cargo}</td>
                            <td className="py-3 px-4 text-zinc-300">
                              {com.servicioRealizado}{' '}
                              <span className="font-mono text-zinc-500">({com.placa})</span>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-zinc-300 tabular-nums">
                              ${com.montoServicioUSD.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-zinc-400 tabular-nums">
                              {com.porcentaje}%
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                              ${com.comisionUSD.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  isPaid
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                    : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                                }`}
                              >
                                {com.estado}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {!isPaid ? (
                                <button
                                  onClick={() => onPayCommission(com.id)}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold text-[11px] transition-colors shadow-sm"
                                >
                                  Pagar en Efectivo
                                </button>
                              ) : (
                                <span className="text-zinc-500 text-[11px]">Liquidado ✓</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Adaptive Cards View (< md, touch & thumb friendly) */}
                <div className="md:hidden p-3 space-y-3">
                  {commissions.map((com) => {
                    const isPaid = com.estado === 'Pagado';

                    return (
                      <div
                        key={com.id}
                        className="bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-3.5 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="font-bold text-white text-sm">{com.trabajador}</div>
                            <div className="text-[10px] text-red-400 font-semibold">{com.cargo}</div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isPaid
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                            }`}
                          >
                            {com.estado}
                          </span>
                        </div>

                        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/70 text-xs space-y-1">
                          <div className="text-zinc-300 font-medium">
                            {com.servicioRealizado}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <span>Vehículo: <strong className="text-zinc-200 font-mono">{com.placa}</strong></span>
                            <span>Cobro: ${com.montoServicioUSD.toFixed(2)} ({com.porcentaje}%)</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                              Monto Comisión
                            </span>
                            <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                              ${com.comisionUSD.toFixed(2)}
                            </span>
                          </div>

                          {!isPaid ? (
                            <button
                              onClick={() => onPayCommission(com.id)}
                              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm shadow-red-950/40"
                            >
                              Pagar en Efectivo
                            </button>
                          ) : (
                            <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                              ✓ Liquidado
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* SECTION: HISTORIAL DE CIERRES DIARIOS */}
      {activeSection === 'cierres' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  🔒 Historial de Cierres de Jornada Congelados
                </h3>
                <p className="text-xs text-zinc-400">
                  Registro histórico de arqueos diarios realizados por el Administrador Maestro o la Cajera.
                </p>
              </div>
            </div>

            {dailyClosures.length === 0 ? (
              <div className="p-12 text-center text-zinc-500 text-xs">
                <Lock className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                <p className="text-zinc-400 font-medium">Aún no se han ejecutado cierres de jornada congelados.</p>
                <p className="text-zinc-600">Al finalizar la jornada laboral, pulsa "Cierre de Jornada / Cierre de Día" para congelar el día.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
                      <tr>
                        <th className="py-3 px-4">Fecha & Hora</th>
                        <th className="py-3 px-4">ID Cierre</th>
                        <th className="py-3 px-4">Responsable</th>
                        <th className="py-3 px-4 text-right">Ingresos</th>
                        <th className="py-3 px-4 text-right">Egresos</th>
                        <th className="py-3 px-4 text-right">Balance Neto</th>
                        <th className="py-3 px-4">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/70">
                      {dailyClosures.map((cl) => (
                        <tr key={cl.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono text-zinc-300">
                            {cl.fecha} · {cl.hora}
                          </td>
                          <td className="py-3 px-4 font-mono text-zinc-400">{cl.id}</td>
                          <td className="py-3 px-4 font-semibold text-zinc-200">{cl.responsable}</td>
                          <td className="py-3 px-4 text-right font-mono text-emerald-400 tabular-nums">
                            +${cl.totalIngresosUSD.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-red-400 tabular-nums">
                            -${cl.totalEgresosUSD.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                            ${cl.balanceNetoUSD.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-zinc-400 truncate max-w-xs">{cl.observaciones}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Adaptive Cards View (< md, touch & thumb friendly) */}
                <div className="md:hidden p-3 space-y-3">
                  {dailyClosures.map((cl) => (
                    <div
                      key={cl.id}
                      className="bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-3.5 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-300">
                          {cl.fecha} · {cl.hora}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                          {cl.id}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800 text-center">
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase block">Ingresos</span>
                          <span className="text-xs font-bold font-mono text-emerald-400">
                            +${cl.totalIngresosUSD.toFixed(0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase block">Egresos</span>
                          <span className="text-xs font-bold font-mono text-red-400">
                            -${cl.totalEgresosUSD.toFixed(0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-zinc-400 uppercase block">Neto</span>
                          <span className="text-xs font-bold font-mono text-white">
                            ${cl.balanceNetoUSD.toFixed(0)}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                        <span>👤 {cl.responsable}</span>
                        <span className="truncate max-w-[170px] text-zinc-500 italic">
                          "{cl.observaciones}"
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: MOVIMIENTO DE CAJA */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Registrar Movimiento de Caja</h3>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Tipo de Movimiento
                  </label>
                  <select
                    value={txTipo}
                    onChange={(e) => setTxTipo(e.target.value as 'Ingreso' | 'Egreso')}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Ingreso">🟢 Ingreso / Cobro</option>
                    <option value="Egreso">🔴 Egreso / Gasto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Módulo de Origen
                  </label>
                  <select
                    value={txModulo}
                    onChange={(e) =>
                      setTxModulo(e.target.value as CashTransaction['moduloOrigen'])
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Autolavado">Autolavado</option>
                    <option value="Detailing">Detailing</option>
                    <option value="Mecánica & Aceite">Mecánica & Aceite</option>
                    <option value="Auto Cool">Auto Cool</option>
                    <option value="Caja General">Caja General</option>
                    <option value="Gasto Operativo">Gasto Operativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                  Concepto / Detalle
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cobro Lavado / Compra Bombillo"
                  value={txConcepto}
                  onChange={(e) => setTxConcepto(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Monto ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={txMonto}
                    onChange={(e) => setTxMonto(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-emerald-400 font-mono font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={txMetodo}
                    onChange={(e) => setTxMetodo(e.target.value as PaymentMethod)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Divisas / USD Efectivo">Divisas / USD Efectivo</option>
                    <option value="Bolívares Efectivo">Bolívares Efectivo</option>
                    <option value="Punto de Venta">Punto de Venta</option>
                    <option value="Pago Móvil">Pago Móvil</option>
                    <option value="Zelle / Transferencia">Zelle / Transferencia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Placa (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. AC923EE"
                    value={txPlaca}
                    onChange={(e) => setTxPlaca(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 uppercase font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Comprobante / Referencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. PM-88192 o Lote-441"
                    value={txReferencia}
                    onChange={(e) => setTxReferencia(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow transition-colors"
                >
                  Registrar en Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR CLIENTE */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Registrar Nuevo Cliente & Vehículo</h3>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleClientSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Nombre o Razón Social
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Cédula / RIF
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. V-18.441.902"
                    value={cedulaRif}
                    onChange={(e) => setCedulaRif(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 0414-1234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@email.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold text-red-400 uppercase">
                  Vehículo Inicial del Cliente:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-0.5">Placa</label>
                    <input
                      type="text"
                      placeholder="Ej. AB123CD"
                      value={vehiculoPlaca}
                      onChange={(e) => setVehiculoPlaca(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 uppercase font-mono font-bold text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-0.5">Modelo</label>
                    <input
                      type="text"
                      placeholder="Toyota Corolla"
                      value={vehiculoModelo}
                      onChange={(e) => setVehiculoModelo(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-0.5">Año</label>
                    <input
                      type="text"
                      placeholder="2018"
                      value={vehiculoAño}
                      onChange={(e) => setVehiculoAño(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white focus:border-red-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow transition-colors"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CALCULADORA EMERGENTE DE CAJA */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApplyValue={(val) => {
          setTxMonto(val);
        }}
      />
    </div>
  );
};
