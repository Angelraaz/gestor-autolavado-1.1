import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Calendar,
  User,
  ArrowRight,
  DollarSign,
  Package,
  AlertTriangle,
  Eraser,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { exportToExcelSheet } from '../utils/exportInventory';
import { DetailingJob, DetailingStage, DetailingSupplyItem } from '../types';

interface DetailingTabProps {
  jobs: DetailingJob[];
  supplies: DetailingSupplyItem[];
  onAddJob: (job: Omit<DetailingJob, 'id'>) => void;
  onAdvanceStage: (id: string) => void;
  onCompleteAndCharge: (job: DetailingJob) => void;
  onDeleteJob?: (id: string) => void;
  onAdjustSupply: (id: string, delta: number) => void;
  onAddSupply: (item: Omit<DetailingSupplyItem, 'id'>) => void;
}

const STAGES: DetailingStage[] = [
  'Recepción e Inspección',
  'Lavado & Descontaminado (Clay Bar)',
  'Corrección / Polishing',
  'Aplicación Cerámico / Sellado',
  'Curado & Inspección Final'
];

const DEFAULT_DETAILING_MEMORY = [
  'Pulitura 1-Paso (Brillo)',
  'Corrección de Barniz (Polishing)',
  'Tratamiento Cerámico 9H',
  'Detailing Interior Profundo (Vapor)'
];

export const DetailingTab: React.FC<DetailingTabProps> = ({
  jobs,
  supplies,
  onAddJob,
  onAdvanceStage,
  onCompleteAndCharge,
  onDeleteJob,
  onAdjustSupply,
  onAddSupply
}) => {
  const [subTab, setSubTab] = useState<'proyectos' | 'insumos'>('proyectos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<DetailingJob | null>(null);

  // Detailing services memory
  const [serviceMemory, setServiceMemory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sgai_detailing_services_memory');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_DETAILING_MEMORY;
  });

  // Form states
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [propietario, setPropietario] = useState('');
  const [telefono, setTelefono] = useState('');
  const [servicio, setServicio] = useState('Corrección de Barniz (Polishing)');
  const [tecnico, setTecnico] = useState('');
  const [precio, setPrecio] = useState(150);
  const [fechaEstimadaEntrega, setFechaEstimadaEntrega] = useState('Mañana (Tarde)');
  const [observaciones, setObservaciones] = useState('');

  // Supply form states
  const [supCodigo, setSupCodigo] = useState('');
  const [supNombre, setSupNombre] = useState('');
  const [supTipo, setSupTipo] = useState<DetailingSupplyItem['tipoProducto']>(
    'Sellador Cerámico 9H'
  );
  const [supStockActual, setSupStockActual] = useState(5);
  const [supStockMinimo, setSupStockMinimo] = useState(2);
  const [supUnidad, setSupUnidad] = useState<DetailingSupplyItem['unidad']>('Kits Cerámicos');
  const [supPrecioRef, setSupPrecioRef] = useState(65);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelo.trim() || !servicio.trim()) return;

    const trimmedService = servicio.trim();

    // Save to memory if new
    if (trimmedService && !serviceMemory.includes(trimmedService)) {
      const updatedMem = [trimmedService, ...serviceMemory.slice(0, 9)];
      setServiceMemory(updatedMem);
      try {
        localStorage.setItem('sgai_detailing_services_memory', JSON.stringify(updatedMem));
      } catch {}
    }

    onAddJob({
      placa: placa.trim() ? placa.toUpperCase().trim() : 'S/P',
      modelo: modelo.trim(),
      propietario: propietario.trim() || 'Cliente Particular',
      telefono: telefono.trim() || 'N/A',
      servicio: trimmedService,
      etapaActual: 'Recepción e Inspección',
      progreso: 20,
      tecnico: tecnico.trim() || 'Técnico Especialista',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaEstimadaEntrega,
      precio,
      observaciones: observaciones.trim() || 'Inspección de barniz realizada.',
      estado: 'En proceso'
    });

    setPlaca('');
    setModelo('');
    setPropietario('');
    setTelefono('');
    setTecnico('');
    setObservaciones('');
    setIsModalOpen(false);
  };

  const handleExportSuppliesExcel = () => {
    const headers = ['Código', 'Producto / Insumo', 'Categoría', 'Stock Actual', 'Unidad', 'Stock Mínimo', 'Precio Ref ($)'];
    const rows = supplies.map((s) => [
      s.codigo,
      s.nombre,
      s.tipoProducto,
      s.stockActual,
      s.unidad,
      s.stockMinimo,
      s.precioRef
    ]);
    exportToExcelSheet('inventario-productos-detailing', 'Productos & Químicos de Detailing y Polishing', headers, rows);
  };

  const handleSupplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supCodigo.trim() || !supNombre.trim()) return;

    onAddSupply({
      codigo: supCodigo.toUpperCase().trim(),
      nombre: supNombre.trim(),
      tipoProducto: supTipo,
      stockActual: Number(supStockActual),
      stockMinimo: Number(supStockMinimo),
      unidad: supUnidad,
      precioRef: Number(supPrecioRef)
    });

    setSupCodigo('');
    setSupNombre('');
    setIsSupplyModalOpen(false);
  };

  const lowStockSupplies = supplies.filter((s) => s.stockActual <= s.stockMinimo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>✨ 2. Zona Detailing & Polishing</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Corrección microscópica de barniz, polishing, tratamientos cerámicos 9H e inventario especializado de pastas, pads y microfibras.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Subtabs switcher */}
          <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => setSubTab('proyectos')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                subTab === 'proyectos'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Proyectos ({jobs.length})</span>
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
              <span>Productos Detailing ({supplies.length})</span>
              {lowStockSupplies.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400 ml-0.5" title="Bajo mínimo"></span>
              )}
            </button>
          </div>

          {subTab === 'proyectos' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proyecto</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportSuppliesExcel}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                title="Descargar inventario para Excel o Google Sheets (.csv)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Imprimir / Exportar Excel</span>
              </button>
              <button
                onClick={() => setIsSupplyModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-zinc-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Producto</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUBTAB 1: PROYECTOS DETAILING */}
      {subTab === 'proyectos' && (
        <div>
          {jobs.length === 0 ? (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-8">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                <Sparkles className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Sin proyectos de detailing activos</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Registra vehículos para corrección de pintura, abrillantado o aplicación de selladores cerámicos 9H.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Primer Proyecto Detailing</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {jobs.map((job) => {
                const currentStageIndex = STAGES.indexOf(job.etapaActual);
                const isFinished = job.progreso >= 100 || job.estado === 'Listo para entrega';

                return (
                  <div
                    key={job.id}
                    className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors shadow-sm"
                  >
                    <div>
                      {/* Header card info */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-zinc-950 border border-zinc-700 px-2 py-0.5 rounded text-white shadow-inner">
                              {job.placa}
                            </span>
                            <span className="text-[11px] text-zinc-400 truncate max-w-[140px]">
                              {job.propietario}
                            </span>
                          </div>
                          <h3 className="font-bold text-zinc-100 text-sm mt-1.5">{job.modelo}</h3>
                          <div className="text-xs font-bold text-red-400 mt-0.5">{job.servicio}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-emerald-400 font-bold text-base tabular-nums">
                            ${job.precio}
                          </span>
                          <span className="block text-[10px] text-zinc-500 uppercase">Cotización</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="py-2 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400 font-medium">{job.etapaActual}</span>
                          <span className="font-mono font-bold text-white tabular-nums">
                            {job.progreso}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isFinished ? 'bg-emerald-500' : 'bg-red-600'
                            }`}
                            style={{ width: `${job.progreso}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stages Stepper */}
                      <div className="space-y-1.5 py-1">
                        {STAGES.map((stg, idx) => {
                          const isCompleted = idx < currentStageIndex || isFinished;
                          const isCurrent = idx === currentStageIndex && !isFinished;

                          return (
                            <div
                              key={stg}
                              className={`flex items-center gap-2 text-[11px] px-2 py-1 rounded transition-colors ${
                                isCurrent
                                  ? 'bg-zinc-800/90 text-white font-semibold'
                                  : isCompleted
                                  ? 'text-emerald-400/90 line-through'
                                  : 'text-zinc-500'
                              }`}
                            >
                              <span className="w-4 text-center font-mono text-[10px]">{idx + 1}.</span>
                              <span className="truncate">{stg}</span>
                              {isCompleted && <span className="ml-auto text-[10px]">✓</span>}
                              {isCurrent && (
                                <span className="ml-auto text-[9px] bg-red-600/30 text-red-400 px-1.5 py-0.2 rounded font-mono">
                                  ACTUAL
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Observations */}
                      {job.observaciones && (
                        <div className="text-[11px] text-zinc-400 bg-zinc-950/70 p-2.5 rounded border border-zinc-800/80 mt-2">
                          <span className="text-zinc-500 block uppercase text-[10px] font-bold mb-0.5">
                            Diagnóstico de Barniz:
                          </span>
                          {job.observaciones}
                        </div>
                      )}
                    </div>

                    {/* Footer info & CTA */}
                    <div className="pt-3 border-t border-zinc-800 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-zinc-500" />
                          {job.tecnico.split(' ')[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          Entrega: {job.fechaEstimadaEntrega}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {isFinished ? (
                          <button
                            onClick={() => onCompleteAndCharge(job)}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Cobrar en Caja (${job.precio})</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onAdvanceStage(job.id)}
                            className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-zinc-700"
                          >
                            <span>Avanzar Etapa</span>
                            <ArrowRight className="w-3 h-3 text-red-400" />
                          </button>
                        )}

                        {onDeleteJob && (
                          <button
                            onClick={() => setJobToDelete(job)}
                            className="px-2.5 py-2 bg-red-950/20 hover:bg-red-950/50 border border-red-900/60 text-red-400 hover:text-red-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Corrector: Borrar por error de registro"
                          >
                            <Eraser className="w-3.5 h-3.5 text-red-400" />
                            <span className="hidden sm:inline">Corrector</span>
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

      {/* SUBTAB 2: PRODUCTOS & CERÁMICOS DETAILING */}
      {subTab === 'insumos' && (
        <div className="space-y-4">
          {lowStockSupplies.length > 0 && (
            <div className="bg-red-950/30 border border-red-800/60 rounded-xl p-3.5 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <div className="text-xs text-red-300">
                <strong className="text-red-400">Productos de Detailing Bajo Mínimo:</strong>{' '}
                {lowStockSupplies.map((s) => `${s.nombre} (${s.stockActual} ${s.unidad})`).join(' · ')}
              </div>
            </div>
          )}

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">✨ Productos Especializados de Detailing</h3>
                <p className="text-xs text-zinc-400">Pastas de corte, kits cerámicos 9H, pads de lana/espuma y microfibras de alta densidad.</p>
              </div>
              <button
                onClick={handleExportSuppliesExcel}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1.5 shadow transition-colors self-start sm:self-auto shrink-0"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar Formato Sheet / Excel</span>
              </button>
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-400 uppercase bg-zinc-950 border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Producto</th>
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
                        <td className="py-3 px-4 text-zinc-400">{item.tipoProducto}</td>
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
                  Sin productos registrados en detailing.
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
                            {item.tipoProducto}
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

      {/* MODAL: NUEVO PROYECTO DETAILING */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-base">Nuevo Proyecto de Detailing</h3>
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
                    placeholder="Ej. AD991MK (Opcional)"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 uppercase font-mono font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Marca y Modelo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Jeep Grand Cherokee 5.7L"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase">
                    Servicio de Detailing / Polishing
                  </label>
                  <span className="text-[10px] text-zinc-500">Personalizado</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Escribe el servicio (ej. Pulitura 1-Paso, Corrección de Barniz, Cerámico 9H...)"
                  value={servicio}
                  onChange={(e) => setServicio(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-semibold focus:border-red-500 focus:outline-none"
                />

                {/* Memory chips */}
                {serviceMemory.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-medium">Memoria de servicios frecuentes (toca para elegir):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {serviceMemory.map((mem) => (
                        <button
                          key={mem}
                          type="button"
                          onClick={() => setServicio(mem)}
                          className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-colors ${
                            servicio === mem
                              ? 'bg-red-600/30 text-red-300 border-red-500/60 font-bold'
                              : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          + {mem}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Especialista a Cargo (Manual)
                  </label>
                  <input
                    type="text"
                    placeholder="Escribe el nombre del técnico..."
                    value={tecnico}
                    onChange={(e) => setTecnico(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none placeholder:text-zinc-600 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Presupuesto Acordado ($ USD)
                  </label>
                  <input
                    type="number"
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
                    Nombre del Propietario
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Roberto Fontana"
                    value={propietario}
                    onChange={(e) => setPropietario(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Estimado de Entrega
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 2 días / Viernes 4:00 PM"
                    value={fechaEstimadaEntrega}
                    onChange={(e) => setFechaEstimadaEntrega(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                  Notas de Inspección Inicial (Rayones previos, marcas)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detallar micro-rayas en capó, marcas de agua en techo o zonas repintadas..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                ></textarea>
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
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO PRODUCTO DETAILING */}
      {isSupplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Nuevo Producto de Detailing</h3>
              <button onClick={() => setIsSupplyModalOpen(false)} className="text-zinc-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleSupplySubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 font-bold mb-1">Código / SKU</label>
                  <input
                    type="text"
                    required
                    placeholder="DET-PAST-01"
                    value={supCodigo}
                    onChange={(e) => setSupCodigo(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 font-bold mb-1">Tipo de Producto</label>
                  <select
                    value={supTipo}
                    onChange={(e) => setSupTipo(e.target.value as DetailingSupplyItem['tipoProducto'])}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200"
                  >
                    <option value="Compuesto de Corte Pesado">Compuesto de Corte Pesado</option>
                    <option value="Pulimento Medio">Pulimento Medio</option>
                    <option value="Sellador Cerámico 9H">Sellador Cerámico 9H</option>
                    <option value="Pads / Discos de Pulido">Pads / Discos de Pulido</option>
                    <option value="Clay Bar">Clay Bar</option>
                    <option value="Microfibra Densidad Alta">Microfibra Densidad Alta</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-zinc-400 font-bold mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Menzerna 400 Heavy Cut"
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
                    onChange={(e) => setSupUnidad(e.target.value as DetailingSupplyItem['unidad'])}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-2"
                  >
                    <option value="Envases (500ml)">Envases (500ml)</option>
                    <option value="Kits Cerámicos">Kits Cerámicos</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Barras">Barras</option>
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
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Corrector: Delete Job Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-800/80 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-600/40 flex items-center justify-center shrink-0">
                <Eraser className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Corrector de Registro</h3>
                <p className="text-[11px] text-zinc-400">¿Anular servicio de detailing?</p>
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Modelo:</span>
                <span className="font-bold text-white">{jobToDelete.modelo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Placa:</span>
                <span className="font-mono font-bold text-red-400">{jobToDelete.placa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Servicio:</span>
                <span className="text-zinc-300 truncate max-w-[170px]">{jobToDelete.servicio}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 leading-snug">
              Este proyecto se anulará y eliminará de la bahía de detailing sin generar cobro en caja ni comisión.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteJob && jobToDelete) {
                    onDeleteJob(jobToDelete.id);
                  }
                  setJobToDelete(null);
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Sí, Borrar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
