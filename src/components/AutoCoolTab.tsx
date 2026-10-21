import React, { useState } from 'react';
import {
  Snowflake,
  Plus,
  Gauge,
  Thermometer,
  DollarSign,
  User
} from 'lucide-react';
import { AutoCoolJob } from '../types';

interface AutoCoolTabProps {
  jobs: AutoCoolJob[];
  onAddJob: (job: Omit<AutoCoolJob, 'id' | 'fecha'>) => void;
  onAdvanceStatus: (id: string, nextStatus: AutoCoolJob['estado']) => void;
  onChargeJob: (job: AutoCoolJob) => void;
}

export const AutoCoolTab: React.FC<AutoCoolTabProps> = ({
  jobs,
  onAddJob,
  onAdvanceStatus,
  onChargeJob
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [placa, setPlaca] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [servicio, setServicio] = useState<AutoCoolJob['servicio']>('Carga de Gas + Vacío');
  const [tipoGas, setTipoGas] = useState<AutoCoolJob['tipoGas']>('R134a (Estándar)');
  const [presionBajaPsi, setPresionBajaPsi] = useState(30);
  const [presionAltaPsi, setPresionAltaPsi] = useState(210);
  const [tempRejillaCelsius, setTempRejillaCelsius] = useState(7.0);
  const [gasGramos, setGasGramos] = useState(550);
  const [tecnico, setTecnico] = useState('Marcos Villegas');
  const [precio, setPrecio] = useState(65);
  const [diagnostico, setDiagnostico] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculo.trim()) return;

    onAddJob({
      placa: placa.trim() ? placa.toUpperCase().trim() : 'S/P',
      vehiculo: vehiculo.trim(),
      cliente: cliente.trim() || 'Particular',
      telefono: telefono.trim() || 'N/A',
      tipoGas,
      presionBajaPsi,
      presionAltaPsi,
      tempRejillaCelsius,
      gasGramos,
      servicio,
      tecnico,
      estado: 'Diagnóstico',
      precio,
      diagnostico:
        diagnostico.trim() ||
        'Inspección y medición manométrica de presiones de climatización.'
    });

    setPlaca('');
    setVehiculo('');
    setCliente('');
    setTelefono('');
    setDiagnostico('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>❄️ 4. Zona Auto Cool</span>
            <span className="text-xs font-normal text-zinc-400">· Climatización & Refrigeración</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Diagnóstico manométrico (PSI baja y alta), detección de fugas por vacío y medición térmica de rejilla (°C).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden Auto Cool</span>
        </button>
      </div>

      {/* Grid of A/C Jobs */}
      {jobs.length === 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
            <Snowflake className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Bahía Auto Cool disponible</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Registra pruebas de vacío con nitrógeno, recargas de gas R134a/R1234yf o reparaciones de compresor.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Primera Orden Auto Cool</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => {
            const isReady = job.estado === 'Operativo y Listo';

            return (
              <div
                key={job.id}
                className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors shadow-sm"
              >
                <div>
                  {/* Header info */}
                  <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-zinc-950 border border-zinc-700 px-2 py-0.5 rounded text-white shadow-inner">
                          {job.placa}
                        </span>
                        <span className="text-[11px] text-zinc-400">{job.tipoGas}</span>
                      </div>
                      <h3 className="font-bold text-zinc-100 text-sm mt-1.5">{job.vehiculo}</h3>
                      <div className="text-xs font-bold text-cyan-400 mt-0.5">{job.servicio}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-emerald-400 font-bold text-base tabular-nums">
                        ${job.precio}
                      </span>
                    </div>
                  </div>

                  {/* Instrument Manometer Readouts */}
                  <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800 mt-3 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-zinc-500 mb-0.5">
                        <Gauge className="w-3 h-3 text-blue-400" />
                        <span>Baja (L)</span>
                      </div>
                      <div className="font-mono font-bold text-sm text-blue-400 tabular-nums">
                        {job.presionBajaPsi} <span className="text-[10px]">PSI</span>
                      </div>
                    </div>

                    <div className="border-x border-zinc-800">
                      <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-zinc-500 mb-0.5">
                        <Gauge className="w-3 h-3 text-red-400" />
                        <span>Alta (H)</span>
                      </div>
                      <div className="font-mono font-bold text-sm text-red-400 tabular-nums">
                        {job.presionAltaPsi} <span className="text-[10px]">PSI</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-zinc-500 mb-0.5">
                        <Thermometer className="w-3 h-3 text-emerald-400" />
                        <span>Rejilla</span>
                      </div>
                      <div className="font-mono font-bold text-sm text-emerald-400 tabular-nums">
                        {job.tempRejillaCelsius > 0 ? `${job.tempRejillaCelsius}°C` : '--'}
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Description */}
                  {job.diagnostico && (
                    <div className="text-[11px] text-zinc-300 bg-zinc-950/50 p-2.5 rounded border border-zinc-800/80 mt-3">
                      <span className="text-zinc-500 uppercase text-[10px] font-bold block mb-0.5">
                        Reporte Técnico:
                      </span>
                      {job.diagnostico}
                    </div>
                  )}
                </div>

                {/* Footer info & CTA */}
                <div className="pt-3 border-t border-zinc-800 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-zinc-500" />
                      {job.tecnico}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isReady
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {job.estado}
                    </span>
                  </div>

                  {isReady ? (
                    <button
                      onClick={() => onChargeJob(job)}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Cobrar en Caja (${job.precio})</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onAdvanceStatus(job.id, 'En prueba de vacío')}
                        className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] font-medium transition-colors"
                      >
                        Vacío
                      </button>
                      <button
                        onClick={() => onAdvanceStatus(job.id, 'Cargando gas')}
                        className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] font-medium transition-colors"
                      >
                        Carga Gas
                      </button>
                      <button
                        onClick={() => onAdvanceStatus(job.id, 'Operativo y Listo')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors"
                      >
                        Listo ✓
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: NUEVA ORDEN AUTO COOL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-base">Nueva Orden de Auto Cool (A/C)</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Placa (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. AE823KL (Opcional)"
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
                    placeholder="Ej. Hyundai Tucson 2.0L"
                    value={vehiculo}
                    onChange={(e) => setVehiculo(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Tipo de Servicio A/C
                  </label>
                  <select
                    value={servicio}
                    onChange={(e) =>
                      setServicio(e.target.value as AutoCoolJob['servicio'])
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Carga de Gas + Vacío">Carga de Gas + Vacío</option>
                    <option value="Detección de Fugas (Nitrógeno)">
                      Detección de Fugas (Nitrógeno / Vacío)
                    </option>
                    <option value="Cambio de Compresor / Filtro">
                      Cambio de Compresor / Válvula / Filtro
                    </option>
                    <option value="Mantenimiento de Radiador & Fugas">
                      Mantenimiento de Radiador & Cambio Refrigerante
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Tipo de Gas / Fluido
                  </label>
                  <select
                    value={tipoGas}
                    onChange={(e) =>
                      setTipoGas(e.target.value as AutoCoolJob['tipoGas'])
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="R134a (Estándar)">R134a (Estándar Automotriz)</option>
                    <option value="R1234yf (Ecológico)">R1234yf (Ecológico Nueva Generación)</option>
                    <option value="Refrigerante 50/50">Refrigerante 50/50 Orgánico</option>
                  </select>
                </div>
              </div>

              {/* Gauge inputs */}
              <div className="grid grid-cols-3 gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div>
                  <label className="block text-[10px] font-bold text-blue-400 uppercase mb-1">
                    Presión Baja (PSI)
                  </label>
                  <input
                    type="number"
                    value={presionBajaPsi}
                    onChange={(e) => setPresionBajaPsi(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-blue-400 font-mono font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-red-400 uppercase mb-1">
                    Presión Alta (PSI)
                  </label>
                  <input
                    type="number"
                    value={presionAltaPsi}
                    onChange={(e) => setPresionAltaPsi(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-red-400 font-mono font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-400 uppercase mb-1">
                    Temp. Rejilla (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={tempRejillaCelsius}
                    onChange={(e) => setTempRejillaCelsius(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-emerald-400 font-mono font-bold focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Técnico A/C
                  </label>
                  <select
                    value={tecnico}
                    onChange={(e) => setTecnico(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-red-500 focus:outline-none"
                  >
                    <option value="Marcos Villegas">Marcos Villegas</option>
                    <option value="Oswaldo Peña">Oswaldo Peña</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                    Precio ($ USD)
                  </label>
                  <input
                    type="number"
                    step="1"
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
                    Cliente
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Valeria Romero"
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
                    placeholder="Ej. 0414-9988112"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">
                  Diagnóstico y Notas Técnicas
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles de retención de vacío, fugas en evaporador, estado de compresor..."
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
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
                  Crear Orden A/C
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
