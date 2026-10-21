import React, { useState } from 'react';
import {
  Car,
  Plus,
  Clock,
  CheckCircle2,
  DollarSign,
  Search,
  ArrowRight,
  Package,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { WashJob, VehicleType, WashType, QueueStatus, WashSupplyItem } from '../types';

interface AutolavadoTabProps {
  jobs: WashJob[];
  supplies: WashSupplyItem[];
  onAddJob: (job: Omit<WashJob, 'id' | 'horaIngreso'>) => void;
  onAdvanceStatus: (id: string, nextStatus: QueueStatus) => void;
  onChargeJob: (job: WashJob) => void;
  onCancelJob: (id: string) => void;
  onAdjustSupply: (id: string, delta: number) => void;
  onAddSupply: (item: Omit<WashSupplyItem, 'id'>) => void;
}

export const AutolavadoTab: React.FC<AutolavadoTabProps> = ({
  jobs,
  supplies,
  onAddJob,
  onAdvanceStatus,
  onChargeJob,
  onCancelJob,
  onAdjustSupply,
  onAddSupply
}) => {
  const [subTab, setSubTab] = useState<'cola' | 'insumos'>('cola');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');

  // Modal form states
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [color, setColor] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState<VehicleType>('Camioneta / SUV');
  const [tipoLavado, setTipoLavado] = useState<WashType>('Lavado Integral VIP (+ Cera Líquida)');
  const [operador, setOperador] = useState('Sin asignar');
  const [precio, setPrecio] = useState(25);
  const [notas, setNotas] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');

  // Supply modal states
  const [supCodigo, setSupCodigo] = useState('');
  const [supNombre, setSupNombre] = useState('');
  const [supTipo, setSupTipo] = useState<WashSupplyItem['tipoInsumo']>('Champú con Cera');
  const [supStockActual, setSupStockActual] = useState(20);
  const [supStockMinimo, setSupStockMinimo] = useState(8);
  const [supUnidad, setSupUnidad] = useState<WashSupplyItem['unidad']>('Litros');
  const [supPrecioRef, setSupPrecioRef] = useState(5);

  const handlePackageChange = (pkg: WashType, vType: VehicleType) => {
    setTipoLavado(pkg);
    let base = 12;
    if (vType === 'Camioneta / SUV') base = 16;
    if (vType === 'Pick-Up / Rústico') base = 18;
    if (vType === 'Moto') base = 7;

    if (pkg === 'Lavado Especial Chasis & Motor') base += 8;
    if (pkg === 'Lavado Integral VIP (+ Cera Líquida)') base += 12;

    setPrecio(base);
  };

  const handleVehicleTypeChange = (vType: VehicleType) => {
    setTipoVehiculo(vType);
    handlePackageChange(tipoLavado, vType);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelo.trim()) return;

    onAddJob({
      placa: placa.trim() ? placa.toUpperCase().trim() : 'S/P',
      marca: marca.trim() || 'General',
      modelo: modelo.trim(),
      color: color.trim() || 'No especificado',
      tipoVehiculo,
      tipoLavado,
      estado: 'En espera',
      operador,
      precio,
      notas: notas.trim(),
      clienteNombre: clienteNombre.trim() || 'Cliente Particular',
      clienteTelefono: clienteTelefono.trim() || 'N/A'
    });

    setPlaca('');
    setMarca('');
    setModelo('');
    setColor('');
    setNotas('');
    setClienteNombre('');
    setClienteTelefono('');
    setIsModalOpen(false);
  };

  const handleSupplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supCodigo.trim() || !supNombre.trim()) return;

    onAddSupply({
      codigo: supCodigo.toUpperCase().trim(),
      nombre: supNombre.trim(),
      tipoInsumo: supTipo,
      stockActual: Number(supStockActual),
      stockMinimo: Number(supStockMinimo),
      unidad: supUnidad,
      precioRef: Number(supPrecioRef)
    });

    setSupCodigo('');
    setSupNombre('');
    setIsSupplyModalOpen(false);
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.placa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.clienteNombre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = typeFilter === 'todos' || j.tipoVehiculo === typeFilter;
    return matchesSearch && matchesFilter;
  });

  const enEspera = filteredJobs.filter((j) => j.estado === 'En espera');
  const enProceso = filteredJobs.filter((j) => j.estado === 'En proceso');
  const listos = filteredJobs.filter((j) => j.estado === 'Listo');

  const lowStockSupplies = supplies.filter((s) => s.stockActual <= s.stockMinimo);

  return (
    <div className="space-y-6">
      {/* Control Header & Sub-tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🚗 1. Autolavado General</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Bahías de lavado, colas en tiempo real e inventario de insumos de autolavado (champú, siliconas y ceras).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Subtab Toggle */}
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => setSubTab('cola')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                subTab === 'cola'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Cola de Bahías ({jobs.length})</span>
            </button>
            <button
              onClick={() => setSubTab('insumos')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                subTab === 'insumos'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Insumos Lavado ({supplies.length})</span>
              {lowStockSupplies.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400 ml-0.5" title="Insumos bajo mínimo"></span>
              )}
            </button>
          </div>

          {subTab === 'cola' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ingresar Vehículo</span>
            </button>
          ) : (
            <button
              onClick={() => setIsSupplyModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-zinc-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Insumo</span>
            </button>
          )}
        </div>
      </div>

      {/* SUBTAB 1: COLA DE BAHÍAS */}
      {subTab === 'cola' && (
        <div className="space-y-6">
          {/* Filters & Counters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar placa o modelo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                aria-label="Filtrar por tipo de carrocería"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="todos">Todas las carrocerías</option>
                <option value="Sedán">Sedán</option>
                <option value="Camioneta / SUV">Camioneta / SUV</option>
                <option value="Pick-Up / Rústico">Pick-Up / Rústico</option>
                <option value="Moto">Moto</option>
              </select>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-zinc-400">Total en Patio: <strong className="font-mono text-white">{jobs.length}</strong></span>
              <span className="text-zinc-600">·</span>
              <span className="text-amber-400">Espera: <strong className="font-mono">{enEspera.length}</strong></span>
              <span className="text-zinc-600">·</span>
              <span className="text-blue-400">Lavando: <strong className="font-mono">{enProceso.length}</strong></span>
              <span className="text-zinc-600">·</span>
              <span className="text-emerald-400">Listos: <strong className="font-mono">{listos.length}</strong></span>
            </div>
          </div>

          {/* Kanban 3-Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* COLUMN 1: EN ESPERA */}
            <div className="bg-zinc-900/40 border border-zinc-800/90 rounded-xl p-4 flex flex-col min-h-[460px]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    1. En Espera
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 tabular-nums">
                  {enEspera.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {enEspera.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-4">
                    <Car className="w-6 h-6 mb-2 text-zinc-600" />
                    <span>Sin vehículos en espera</span>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-2 text-red-400 hover:text-red-300 font-semibold underline text-[11px]"
                    >
                      + Ingresar vehículo
                    </button>
                  </div>
                ) : (
                  enEspera.map((job) => (
                    <div
                      key={job.id}
                      className="bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 rounded-lg p-3.5 space-y-2.5 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-xs font-mono font-bold tracking-widest text-zinc-100 shadow-inner">
                          {job.placa}
                        </div>
                        <span className="font-mono text-emerald-400 font-bold text-xs tabular-nums">
                          ${job.precio}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-zinc-100">{job.modelo}</div>
                        <div className="text-[11px] text-zinc-400">{job.tipoLavado}</div>
                      </div>

                      {job.notas && (
                        <div className="text-[11px] text-zinc-500 bg-zinc-900/60 p-1.5 rounded border border-zinc-800/60">
                          📝 {job.notas}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          {job.horaIngreso}
                        </span>
                        <span className="truncate max-w-[130px]">👤 {job.operador}</span>
                      </div>

                      <div className="pt-1 flex gap-2">
                        <button
                          onClick={() => onAdvanceStatus(job.id, 'En proceso')}
                          className="flex-1 py-1.5 bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                        >
                          <span>A Lavado</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onCancelJob(job.id)}
                          className="px-2 py-1.5 text-zinc-500 hover:text-red-400 text-xs rounded hover:bg-zinc-900 transition-colors"
                          title="Cancelar"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 2: EN PROCESO */}
            <div className="bg-zinc-900/40 border border-zinc-800/90 rounded-xl p-4 flex flex-col min-h-[460px]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    2. En Proceso (Lavado / Chasis)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-blue-400 tabular-nums">
                  {enProceso.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {enProceso.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-4">
                    <Sparkles className="w-6 h-6 mb-2 text-zinc-600" />
                    <span>Bahías de lavado libres</span>
                  </div>
                ) : (
                  enProceso.map((job) => (
                    <div
                      key={job.id}
                      className="bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 rounded-lg p-3.5 space-y-2.5 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-xs font-mono font-bold tracking-widest text-zinc-100 shadow-inner">
                          {job.placa}
                        </div>
                        <span className="font-mono text-emerald-400 font-bold text-xs tabular-nums">
                          ${job.precio}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-zinc-100">{job.modelo}</div>
                        <div className="text-[11px] text-blue-400 font-medium">{job.tipoLavado}</div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                        <span className="text-amber-400 font-medium">Lavador: {job.operador}</span>
                        <span className="text-zinc-500">{job.horaIngreso}</span>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => onAdvanceStatus(job.id, 'Listo')}
                          className="w-full py-1.5 bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Marcar Lavado Listo</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 3: LISTOS */}
            <div className="bg-zinc-900/40 border border-zinc-800/90 rounded-xl p-4 flex flex-col min-h-[460px]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    3. Listos para Cobro & Entrega
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 tabular-nums">
                  {listos.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {listos.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-zinc-500 text-xs text-center p-4">
                    <CheckCircle2 className="w-6 h-6 mb-2 text-zinc-600" />
                    <span>Ningún vehículo por entregar</span>
                  </div>
                ) : (
                  listos.map((job) => (
                    <div
                      key={job.id}
                      className="bg-zinc-950 border border-emerald-950/40 hover:border-emerald-800/80 rounded-lg p-3.5 space-y-2.5 transition-all shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-xs font-mono font-bold tracking-widest text-zinc-100 shadow-inner">
                          {job.placa}
                        </div>
                        <span className="font-mono text-emerald-400 font-bold text-sm tabular-nums">
                          ${job.precio}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-zinc-100">{job.modelo}</div>
                        <div className="text-[11px] text-zinc-400">Cliente: {job.clienteNombre}</div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                        <span className="text-emerald-400 font-semibold">✓ Limpieza Lista</span>
                        <span className="text-zinc-500">Lavador: {job.operador}</span>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => onChargeJob(job)}
                          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Cobrar en Caja & Entregar (${job.precio})</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MINI-INVENTARIO DE INSUMOS DE AUTOLAVADO */}
      {subTab === 'insumos' && (
        <div className="space-y-4">
          {lowStockSupplies.length > 0 && (
            <div className="bg-red-950/30 border border-red-800/60 rounded-xl p-3.5 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <div className="text-xs text-red-300">
                <strong className="text-red-400">Insumos de Lavado en Nivel Crítico:</strong>{' '}
                {lowStockSupplies.map((s) => `${s.nombre} (${s.stockActual} ${s.unidad})`).join(' · ')}
              </div>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">🧴 Insumos & Químicos de Autolavado</h3>
                <p className="text-xs text-zinc-400">Control de existencia de champú espumante, silicona para rines, ceras y ambientadores.</p>
              </div>
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Insumo</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4 text-right">Stock Actual</th>
                    <th className="py-3 px-4 text-right">Mínimo</th>
                    <th className="py-3 px-4 text-right">Precio Ref ($)</th>
                    <th className="py-3 px-4 text-center">Ajuste de Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {supplies.map((item) => {
                    const isLow = item.stockActual <= item.stockMinimo;

                    return (
                      <tr key={item.id} className={`hover:bg-zinc-800/40 transition-colors ${isLow ? 'bg-red-950/15' : ''}`}>
                        <td className="py-3 px-4 font-mono font-bold text-zinc-300">{item.codigo}</td>
                        <td className="py-3 px-4 font-semibold text-zinc-100">{item.nombre}</td>
                        <td className="py-3 px-4 text-zinc-400">{item.tipoInsumo}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                          <span className={isLow ? 'text-red-400 font-extrabold' : 'text-emerald-400'}>
                            {item.stockActual} {item.unidad}
                          </span>
                          {isLow && <span className="block text-[10px] text-red-500 font-bold uppercase">Reponer</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-zinc-500 tabular-nums">{item.stockMinimo}</td>
                        <td className="py-3 px-4 text-right font-mono text-zinc-200 tabular-nums">${item.precioRef.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded p-0.5">
                            <button
                              onClick={() => onAdjustSupply(item.id, -1)}
                              className="px-2 py-0.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded font-bold"
                              title="Descontar 1 unidad"
                            >
                              -
                            </button>
                            <span className="px-1 text-[11px] font-mono text-zinc-500">|</span>
                            <button
                              onClick={() => onAdjustSupply(item.id, 1)}
                              className="px-2 py-0.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded font-bold"
                              title="Sumar 1 unidad"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Adaptive Cards View (< md, touch-friendly, NO horizontal scroll) */}
            <div className="md:hidden p-3 space-y-3">
              {supplies.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  Sin insumos registrados en autolavado.
                </div>
              ) : (
                supplies.map((item) => {
                  const isLow = item.stockActual <= item.stockMinimo;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border space-y-3 transition-colors ${
                        isLow
                          ? 'bg-red-950/20 border-red-800/80'
                          : 'bg-zinc-950/80 border-zinc-800/90'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 font-mono font-bold text-xs text-white">
                            {item.codigo}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-medium">
                            {item.tipoInsumo}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-zinc-200 text-sm tabular-nums">
                          ${item.precioRef.toFixed(2)}
                        </span>
                      </div>

                      <div className="font-bold text-white text-sm leading-snug">
                        {item.nombre}
                      </div>

                      <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                            Stock Disponible
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-base font-black font-mono tabular-nums ${
                                isLow ? 'text-red-400' : 'text-emerald-400'
                              }`}
                            >
                              {item.stockActual} {item.unidad}
                            </span>
                            {isLow && (
                              <span className="text-[9px] font-extrabold uppercase bg-red-600 text-white px-1.5 py-0.5 rounded animate-pulse">
                                Reponer
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            Mínimo sugerido: {item.stockMinimo}
                          </span>
                        </div>

                        {/* Thumb Touch Adjustment Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onAdjustSupply(item.id, -1)}
                            className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-lg flex items-center justify-center transition-colors shadow-sm"
                            aria-label={`Descontar 1 unidad de ${item.nombre}`}
                            title="Descontar 1 unidad"
                          >
                            -
                          </button>
                          <button
                            onClick={() => onAdjustSupply(item.id, 1)}
                            className="w-11 h-11 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-lg flex items-center justify-center transition-colors shadow-sm shadow-red-950/40"
                            aria-label={`Sumar 1 unidad a ${item.nombre}`}
                            title="Sumar 1 unidad"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INGRESAR VEHÍCULO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-base">Ingreso a Cola de Autolavado</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Placa (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. AC923EE (Opcional)"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 uppercase font-mono font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Tipo de Vehículo
                  </label>
                  <select
                    value={tipoVehiculo}
                    onChange={(e) => handleVehicleTypeChange(e.target.value as VehicleType)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Sedán">Sedán</option>
                    <option value="Camioneta / SUV">Camioneta / SUV</option>
                    <option value="Pick-Up / Rústico">Pick-Up / Rústico</option>
                    <option value="Moto">Moto</option>
                    <option value="Camión Ligero">Camión Ligero</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Marca y Modelo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Toyota Fortuner 4.0L"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Blanco Perlado"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                  Paquete de Lavado
                </label>
                <select
                  value={tipoLavado}
                  onChange={(e) => handlePackageChange(e.target.value as WashType, tipoVehiculo)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                >
                  <option value="Lavado Sencillo (Carrocería + Aspirado)">
                    Lavado Sencillo (Carrocería + Aspirado)
                  </option>
                  <option value="Lavado Especial Chasis & Motor">
                    Lavado Especial Chasis & Motor
                  </option>
                  <option value="Lavado Integral VIP (+ Cera Líquida)">
                    Lavado Integral VIP (+ Cera Líquida)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Operador / Lavador
                  </label>
                  <select
                    value={operador}
                    onChange={(e) => setOperador(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Sin asignar">Sin asignar (a la cola)</option>
                    <option value="Pedro Martínez">Pedro Martínez</option>
                    <option value="Jesús Blanco">Jesús Blanco</option>
                    <option value="Wilmer Colmenares">Wilmer Colmenares</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Precio ($ USD)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={precio}
                    onChange={(e) => setPrecio(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-emerald-400 font-mono font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Propietario (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Carlos Mendoza"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 0414-1234567"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow transition-colors"
                >
                  Ingresar a Cola
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO INSUMO AUTOLAVADO */}
      {isSupplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Nuevo Insumo de Autolavado</h3>
              <button onClick={() => setIsSupplyModalOpen(false)} className="text-zinc-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleSupplySubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 font-bold mb-1">Código / SKU</label>
                  <input
                    type="text"
                    required
                    placeholder="INS-CHAMP-01"
                    value={supCodigo}
                    onChange={(e) => setSupCodigo(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 font-bold mb-1">Tipo de Insumo</label>
                  <select
                    value={supTipo}
                    onChange={(e) => setSupTipo(e.target.value as WashSupplyItem['tipoInsumo'])}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200"
                  >
                    <option value="Champú con Cera">Champú con Cera</option>
                    <option value="Silicona de Cauchos">Silicona de Cauchos</option>
                    <option value="Cera Líquida">Cera Líquida</option>
                    <option value="Ambientador / Fragancia">Ambientador / Fragancia</option>
                    <option value="Desengrasante Motor/Chasis">Desengrasante Motor/Chasis</option>
                    <option value="Paño Microfibra">Paño Microfibra</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 font-bold mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Champú PH Neutro Cereza"
                  value={supNombre}
                  onChange={(e) => setSupNombre(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 font-bold mb-1">Stock</label>
                  <input
                    type="number"
                    value={supStockActual}
                    onChange={(e) => setSupStockActual(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 font-bold mb-1">Mínimo</label>
                  <input
                    type="number"
                    value={supStockMinimo}
                    onChange={(e) => setSupStockMinimo(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 font-bold mb-1">Unidad</label>
                  <select
                    value={supUnidad}
                    onChange={(e) => setSupUnidad(e.target.value as WashSupplyItem['unidad'])}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-2"
                  >
                    <option value="Litros">Litros</option>
                    <option value="Galones">Galones</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Pailas">Pailas</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplyModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
                >
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
