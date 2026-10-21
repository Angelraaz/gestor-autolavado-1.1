import React, { useState } from 'react';
import {
  Wrench,
  Package,
  Plus,
  AlertTriangle,
  CheckCircle,
  Search,
  DollarSign,
  Droplet
} from 'lucide-react';
import { MechanicsJob, InventoryItem } from '../types';

interface MecanicaAceiteTabProps {
  jobs: MechanicsJob[];
  inventory: InventoryItem[];
  onAddJob: (
    job: Omit<MechanicsJob, 'id' | 'fecha'>,
    discountInventoryItemId?: string,
    discountQuantity?: number
  ) => void;
  onAdvanceJobStatus: (id: string, nextStatus: MechanicsJob['estado']) => void;
  onChargeJob: (job: MechanicsJob) => void;
  onAdjustStock: (id: string, delta: number) => void;
  onAddInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
}

export const MecanicaAceiteTab: React.FC<MecanicaAceiteTabProps> = ({
  jobs,
  inventory,
  onAddJob,
  onAdvanceJobStatus,
  onChargeJob,
  onAdjustStock,
  onAddInventoryItem
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'servicios' | 'inventario'>('servicios');
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);

  // Search & Filters
  const [invSearch, setInvSearch] = useState('');
  const [invCategory, setInvCategory] = useState('Todas');

  // Job form state
  const [placa, setPlaca] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoServicio, setTipoServicio] = useState<MechanicsJob['tipoServicio']>(
    'Cambio de Aceite & Filtros'
  );
  const [mecanico, setMecanico] = useState('Alexis González');
  const [kilometraje, setKilometraje] = useState(140000);
  const [montoTotal, setMontoTotal] = useState(85);
  const [notas, setNotas] = useState('');
  const [selectedInvItem, setSelectedInvItem] = useState('');
  const [invDiscountQty, setInvDiscountQty] = useState(5);

  // Inventory form state
  const [newInvCodigo, setNewInvCodigo] = useState('');
  const [newInvNombre, setNewInvNombre] = useState('');
  const [newInvCategoria, setNewInvCategoria] = useState<InventoryItem['categoria']>('Aceite de Motor');
  const [newInvViscosidad, setNewInvViscosidad] = useState('');
  const [newInvStockActual, setNewInvStockActual] = useState(24);
  const [newInvStockMinimo, setNewInvStockMinimo] = useState(10);
  const [newInvUnidad, setNewInvUnidad] = useState<InventoryItem['unidad']>('Litros');
  const [newInvPrecio, setNewInvPrecio] = useState(10);
  const [newInvUbicacion, setNewInvUbicacion] = useState('Rampa Principal');

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculo.trim()) return;

    let aceiteUtilizadoDesc: string | undefined;
    if (selectedInvItem) {
      const itm = inventory.find((i) => i.id === selectedInvItem);
      if (itm) aceiteUtilizadoDesc = itm.nombre;
    }

    onAddJob(
      {
        placa: placa.trim() ? placa.toUpperCase().trim() : 'S/P',
        vehiculo: vehiculo.trim(),
        cliente: cliente.trim() || 'Particular',
        telefono: telefono.trim() || 'N/A',
        tipoServicio,
        aceiteUtilizado: aceiteUtilizadoDesc,
        litrosAceite: selectedInvItem ? invDiscountQty : undefined,
        mecanico,
        kilometraje,
        montoTotal,
        estado: 'En rampa',
        notas: notas.trim() || 'Servicio de mantenimiento preventivo.'
      },
      selectedInvItem || undefined,
      selectedInvItem ? invDiscountQty : undefined
    );

    setPlaca('');
    setVehiculo('');
    setCliente('');
    setTelefono('');
    setNotas('');
    setSelectedInvItem('');
    setIsJobModalOpen(false);
  };

  const handleInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvCodigo.trim() || !newInvNombre.trim()) return;

    onAddInventoryItem({
      codigo: newInvCodigo.toUpperCase().trim(),
      nombre: newInvNombre.trim(),
      categoria: newInvCategoria,
      viscosidad: newInvViscosidad.trim(),
      stockActual: Number(newInvStockActual),
      stockMinimo: Number(newInvStockMinimo),
      unidad: newInvUnidad,
      precioUnitario: Number(newInvPrecio),
      ubicacion: newInvUbicacion.trim()
    });

    setNewInvCodigo('');
    setNewInvNombre('');
    setNewInvViscosidad('');
    setIsInventoryModalOpen(false);
  };

  const lowStockItems = inventory.filter((i) => i.stockActual <= i.stockMinimo);

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.nombre.toLowerCase().includes(invSearch.toLowerCase()) ||
      item.codigo.toLowerCase().includes(invSearch.toLowerCase()) ||
      (item.viscosidad && item.viscosidad.toLowerCase().includes(invSearch.toLowerCase()));
    const matchesCat = invCategory === 'Todas' || item.categoria === invCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header and Sub-tab Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🛢️ 3. Cambio de Aceite, Mecánica Ligera & Lubricantes</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Mantenimiento preventivo en rampa con inventario propio de aceites de motor, filtros y descuento automático.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Subtabs switcher */}
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveSubTab('servicios')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'servicios'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Trabajos Activos ({jobs.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('inventario')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'inventario'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Inventario Aceites & Filtros ({inventory.length})</span>
              {lowStockItems.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400 ml-0.5" title="Stock bajo en alerta"></span>
              )}
            </button>
          </div>

          <button
            onClick={() => setIsJobModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Servicio</span>
          </button>
        </div>
      </div>

      {/* Low Stock Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-950/30 border border-red-800/60 rounded-xl p-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <div className="text-xs font-bold text-red-400">
                Alerta de Reabastecimiento Crítico ({lowStockItems.length} lubricantes/repuestos bajo mínimo)
              </div>
              <p className="text-[11px] text-zinc-300">
                {lowStockItems.map((i) => `${i.codigo} (${i.stockActual} ${i.unidad})`).join(' · ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSubTab('inventario')}
            className="px-3 py-1.5 bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white text-xs rounded font-semibold transition-colors shrink-0"
          >
            Ver Stock
          </button>
        </div>
      )}

      {/* TAB CONTENT: SERVICIOS */}
      {activeSubTab === 'servicios' && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-8">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <Wrench className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Rampas de lubricación y mecánica disponibles</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Registra cambios de aceite, servicio de frenos o tren delantero con descuento automático de inventario.
                </p>
              </div>
              <button
                onClick={() => setIsJobModalOpen(true)}
                className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Primer Servicio Mecánico</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {jobs.map((job) => {
                const isFinished = job.estado === 'Finalizado';

                return (
                  <div
                    key={job.id}
                    className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-3.5 flex flex-col justify-between hover:border-zinc-700 transition-colors shadow-sm"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                        <span className="font-mono font-bold text-xs bg-zinc-950 border border-zinc-700 px-2.5 py-0.5 rounded text-white shadow-inner">
                          {job.placa}
                        </span>
                        <span className="font-mono text-emerald-400 font-bold text-sm tabular-nums">
                          ${job.montoTotal}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <div className="text-sm font-bold text-zinc-100">{job.vehiculo}</div>
                        <div className="text-xs text-red-400 font-semibold">{job.tipoServicio}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">Cliente: {job.cliente}</div>
                      </div>

                      {/* Lubricant / Parts Used */}
                      {job.aceiteUtilizado && (
                        <div className="mt-2 text-[11px] text-zinc-300 bg-zinc-950/70 p-2 rounded border border-zinc-800 flex items-center gap-1.5">
                          <Droplet className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">
                            {job.litrosAceite}L · {job.aceiteUtilizado}
                          </span>
                        </div>
                      )}

                      {job.notas && (
                        <p className="mt-2 text-[11px] text-zinc-400 bg-zinc-950/40 p-2 rounded border border-zinc-800/60">
                          {job.notas}
                        </p>
                      )}
                    </div>

                    {/* Footer status and action */}
                    <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Mecánico: {job.mecanico.split(' ')[1] || job.mecanico}</span>
                        <span className="font-mono">{job.kilometraje.toLocaleString()} Km</span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            job.estado === 'Finalizado'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : job.estado === 'Esperando repuestos'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                              : 'bg-blue-950 text-blue-400 border border-blue-800/60'
                          }`}
                        >
                          {job.estado}
                        </span>

                        {isFinished ? (
                          <button
                            onClick={() => onChargeJob(job)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors flex items-center gap-1"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Cobrar (${job.montoTotal})</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onAdvanceJobStatus(job.id, 'Finalizado')}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-semibold transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>Finalizar Trabajo</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: INVENTARIO */}
      {activeSubTab === 'inventario' && (
        <div className="space-y-4">
          {/* Inventory Filters & Add button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar producto, viscosidad o código..."
                  value={invSearch}
                  onChange={(e) => setInvSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                aria-label="Filtrar por categoría"
                value={invCategory}
                onChange={(e) => setInvCategory(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="Todas">Todas las categorías</option>
                <option value="Aceite de Motor">Aceite de Motor</option>
                <option value="Filtro">Filtros</option>
                <option value="Fluido de Transmisión">Fluidos de Caja</option>
                <option value="Frenos">Frenos</option>
                <option value="Refrigerante / Químicos">Refrigerante / Químicos</option>
              </select>
            </div>

            <button
              onClick={() => setIsInventoryModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-zinc-700 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Ítem Lubricante</span>
            </button>
          </div>

          {/* Inventory Table (Desktop) & Adaptive Vertical Cards (Mobile) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Código / SKU</th>
                    <th className="py-3 px-4">Descripción & Viscosidad</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4 text-right">Stock Físico</th>
                    <th className="py-3 px-4 text-right">Mínimo</th>
                    <th className="py-3 px-4 text-right">Precio Ref. ($)</th>
                    <th className="py-3 px-4">Ubicación</th>
                    <th className="py-3 px-4 text-center">Ajuste Rápido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {filteredInventory.map((item) => {
                    const isLow = item.stockActual <= item.stockMinimo;

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-zinc-800/40 transition-colors ${
                          isLow ? 'bg-red-950/15' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-zinc-300">
                          {item.codigo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-zinc-100">{item.nombre}</div>
                          {item.viscosidad && (
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {item.viscosidad}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-zinc-400">{item.categoria}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                          <span className={isLow ? 'text-red-400 font-extrabold' : 'text-emerald-400'}>
                            {item.stockActual} {item.unidad}
                          </span>
                          {isLow && (
                            <span className="block text-[10px] text-red-500 font-bold uppercase tracking-wider">
                              BAJO MÍNIMO
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-zinc-500 tabular-nums">
                          {item.stockMinimo}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-zinc-200 tabular-nums font-semibold">
                          ${item.precioUnitario.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-zinc-400">{item.ubicacion}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded p-0.5">
                            <button
                              onClick={() => onAdjustStock(item.id, -1)}
                              className="px-2 py-0.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded font-bold"
                              title="Descontar 1 unidad"
                            >
                              -
                            </button>
                            <span className="px-1 text-[11px] font-mono text-zinc-500">|</span>
                            <button
                              onClick={() => onAdjustStock(item.id, 1)}
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

            {/* Mobile Adaptive Cards View (< md, touch & thumb friendly, NO horizontal scroll) */}
            <div className="md:hidden p-3 space-y-3">
              {filteredInventory.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No se encontraron productos con ese filtro.
                </div>
              ) : (
                filteredInventory.map((item) => {
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
                      {/* Top Bar: SKU + Category + Price */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 font-mono font-bold text-xs text-white">
                            {item.codigo}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-medium">
                            {item.categoria}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                          ${item.precioUnitario.toFixed(2)}
                        </span>
                      </div>

                      {/* Main Product Info */}
                      <div>
                        <div className="font-bold text-white text-sm leading-snug">
                          {item.nombre}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                          {item.viscosidad && (
                            <span className="px-1.5 py-0.2 bg-zinc-800 text-amber-400 font-mono rounded">
                              {item.viscosidad}
                            </span>
                          )}
                          <span>📍 {item.ubicacion}</span>
                          <span>· Mín: {item.stockMinimo}</span>
                        </div>
                      </div>

                      {/* Stock Status Bar + Quick Adjust Buttons */}
                      <div className="pt-2 border-t border-zinc-800/70 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                            Existencia Actual
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
                        </div>

                        {/* Large Touch Adjustment Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => onAdjustStock(item.id, -1)}
                            className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-lg flex items-center justify-center transition-colors shadow-sm"
                            aria-label={`Restar 1 a ${item.nombre}`}
                            title="Restar 1 unidad"
                          >
                            -
                          </button>
                          <button
                            onClick={() => onAdjustStock(item.id, 1)}
                            className="w-11 h-11 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-lg flex items-center justify-center transition-colors shadow-sm shadow-red-950/40"
                            aria-label={`Sumar 1 a ${item.nombre}`}
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

      {/* MODAL: REGISTRAR SERVICIO MECÁNICA */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-base">Registrar Servicio de Mecánica</h3>
              </div>
              <button
                onClick={() => setIsJobModalOpen(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleJobSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Placa (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. AA912KK (Opcional)"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 uppercase font-mono font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Vehículo (Marca / Modelo)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Toyota 4Runner 4.0L"
                    value={vehiculo}
                    onChange={(e) => setVehiculo(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Tipo de Servicio
                  </label>
                  <select
                    value={tipoServicio}
                    onChange={(e) =>
                      setTipoServicio(e.target.value as MechanicsJob['tipoServicio'])
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Cambio de Aceite & Filtros">Cambio de Aceite & Filtros</option>
                    <option value="Frenos (Pastillas/Discos)">Frenos (Pastillas/Discos)</option>
                    <option value="Tren Delantero & Suspensión">Tren Delantero & Suspensión</option>
                    <option value="Mecánica Ligera General">Mecánica Ligera General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Mecánico Asignado
                  </label>
                  <select
                    value={mecanico}
                    onChange={(e) => setMecanico(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Alexis González">Alexis González</option>
                    <option value="Nelson Briceño">Nelson Briceño</option>
                  </select>
                </div>
              </div>

              {/* AUTOMATIC INVENTORY DISCOUNT SECTION */}
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-red-400 uppercase flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5" />
                    <span>Descuento Automático de Lubricante / Filtro:</span>
                  </span>
                  <span className="text-[10px] text-zinc-500">Resta stock físico</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={selectedInvItem}
                      onChange={(e) => setSelectedInvItem(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 focus:border-red-500 focus:outline-none"
                    >
                      <option value="">-- No descontar lubricante --</option>
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.nombre} ({inv.stockActual} {inv.unidad} disp.)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={invDiscountQty}
                      onChange={(e) => setInvDiscountQty(Number(e.target.value))}
                      placeholder="Litros/Cant"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Kilometraje
                  </label>
                  <input
                    type="number"
                    value={kilometraje}
                    onChange={(e) => setKilometraje(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Monto Total ($ USD)
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={montoTotal}
                    onChange={(e) => setMontoTotal(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-emerald-400 font-mono font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Nombre Cliente
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Gustavo Paolini"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 0414-2234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                  Notas de Inspección / Diagnóstico
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles de filtros cambiados, tren delantero..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(false)}
                  className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow transition-colors"
                >
                  Registrar & Actualizar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO ÍTEM INVENTARIO */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-base">Nuevo Ítem de Lubricante / Repuesto</h3>
              </div>
              <button
                onClick={() => setIsInventoryModalOpen(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleInventorySubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Código / SKU
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. LUB-0W20-SYN"
                    value={newInvCodigo}
                    onChange={(e) => setNewInvCodigo(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 uppercase font-mono font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Categoría
                  </label>
                  <select
                    value={newInvCategoria}
                    onChange={(e) =>
                      setNewInvCategoria(e.target.value as InventoryItem['categoria'])
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Aceite de Motor">Aceite de Motor</option>
                    <option value="Filtro">Filtro</option>
                    <option value="Fluido de Transmisión">Fluido de Transmisión</option>
                    <option value="Frenos">Frenos</option>
                    <option value="Refrigerante / Químicos">Refrigerante / Químicos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Aceite Motor 0W-20 Full Sintético Dexos1"
                  value={newInvNombre}
                  onChange={(e) => setNewInvNombre(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Viscosidad / Tipo
                  </label>
                  <input
                    type="text"
                    placeholder="0W-20 API SP"
                    value={newInvViscosidad}
                    onChange={(e) => setNewInvViscosidad(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Stock Inicial
                  </label>
                  <input
                    type="number"
                    required
                    value={newInvStockActual}
                    onChange={(e) => setNewInvStockActual(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    required
                    value={newInvStockMinimo}
                    onChange={(e) => setNewInvStockMinimo(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-mono focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Unidad Medida
                  </label>
                  <select
                    value={newInvUnidad}
                    onChange={(e) =>
                      setNewInvUnidad(e.target.value as InventoryItem['unidad'])
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Litros">Litros</option>
                    <option value="Galones">Galones</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Pailas">Pailas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Precio Ref ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newInvPrecio}
                    onChange={(e) => setNewInvPrecio(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-emerald-400 font-mono font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Ubicación en Taller
                  </label>
                  <input
                    type="text"
                    value={newInvUbicacion}
                    onChange={(e) => setNewInvUbicacion(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInventoryModalOpen(false)}
                  className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow transition-colors"
                >
                  Guardar en Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
