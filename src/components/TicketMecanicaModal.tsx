import React from 'react';
import { Printer, X, Wrench, CheckCircle, ShieldCheck, Phone, User, Calendar, Car } from 'lucide-react';
import { MechanicsJob } from '../types';

interface TicketMecanicaModalProps {
  job: MechanicsJob | null;
  onClose: () => void;
}

export const TicketMecanicaModal: React.FC<TicketMecanicaModalProps> = ({ job, onClose }) => {
  if (!job) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto text-zinc-100">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Comprobante de Servicio Mecánico</h3>
              <p className="text-[11px] text-zinc-400">Listo para entrega e impresión al cliente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div id="printable-ticket" className="bg-white text-zinc-900 p-5 sm:p-6 rounded-xl space-y-4 font-sans shadow-inner print:p-0 print:shadow-none">
          
          {/* Header Branding */}
          <div className="text-center pb-3 border-b-2 border-dashed border-zinc-300 space-y-1">
            <h1 className="text-lg font-black tracking-tight uppercase">
              SGAI · AJRC SERVICIOS
            </h1>
            <p className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
              Sistema de Gestión Automotriz Interno
            </p>
            <p className="text-[10px] text-zinc-500">
              Taller Mecánico · Cambio de Aceite · Lubricentro Especializado
            </p>
            <div className="inline-block bg-zinc-900 text-white text-[11px] font-mono font-bold px-3 py-0.5 rounded-full mt-1">
              TICKET: #{job.id}
            </div>
          </div>

          {/* Date & Placa Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-100 p-2.5 rounded-lg border border-zinc-200">
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Fecha / Hora:</span>
              <span className="font-mono font-semibold text-zinc-900">{job.fecha || currentDate} · {currentTime}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Placa del Vehículo:</span>
              <span className="font-mono font-black text-red-600 text-sm tracking-wider">{job.placa}</span>
            </div>
          </div>

          {/* Vehicle & Client Details */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-600 font-medium">Vehículo:</span>
              <span className="font-bold text-zinc-900 text-right">{job.vehiculo}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-600 font-medium">Cliente:</span>
              <span className="font-bold text-zinc-900">{job.cliente || 'Particular'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-600 font-medium">Teléfono:</span>
              <span className="font-mono text-zinc-900">{job.telefono || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-600 font-medium">Kilometraje Actual:</span>
              <span className="font-mono font-bold text-zinc-900">{job.kilometraje?.toLocaleString() || 0} Km</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-600 font-medium">Mecánico Responsable:</span>
              <span className="font-semibold text-zinc-900">{job.mecanico}</span>
            </div>
          </div>

          {/* Service & Oil Consumed */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 space-y-1.5 text-xs">
            <div className="font-bold text-zinc-900 uppercase text-[11px] tracking-wide flex items-center gap-1.5">
              <span>Trabajo Realizado:</span>
            </div>
            <div className="font-semibold text-red-600 text-xs">
              {job.tipoServicio}
            </div>

            {job.aceiteUtilizado && (
              <div className="text-[11px] text-zinc-700 pt-1 border-t border-zinc-200 flex justify-between">
                <span>Lubricante aplicado:</span>
                <span className="font-mono font-bold text-zinc-900">
                  {job.aceiteUtilizado} {job.litrosAceite ? `(${job.litrosAceite} L)` : ''}
                </span>
              </div>
            )}

            {job.filtroUtilizado && (
              <div className="text-[11px] text-zinc-700 flex justify-between">
                <span>Filtro instalado:</span>
                <span className="font-mono font-bold text-zinc-900">{job.filtroUtilizado}</span>
              </div>
            )}

            {job.notas && (
              <div className="text-[11px] text-zinc-600 italic pt-1 border-t border-zinc-200">
                Observaciones: {job.notas}
              </div>
            )}
          </div>

          {/* Total Amount */}
          <div className="flex items-center justify-between p-3 bg-zinc-900 text-white rounded-lg">
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Total del Servicio:</span>
              <span className="text-[11px] text-emerald-400 font-medium">Mano de Obra + Insumos</span>
            </div>
            <div className="text-xl font-mono font-black text-emerald-400">
              ${job.montoTotal?.toFixed(2)} USD
            </div>
          </div>

          {/* Guarantee & Signatures */}
          <div className="pt-2 text-[10px] text-zinc-500 text-center space-y-3">
            <p className="leading-snug">
              ✓ Garantía de servicio mecánico y lubricación especializada.<br />
              Próximo cambio recomendado a los 5.000 Km adicionales.
            </p>
            <div className="pt-6 grid grid-cols-2 gap-4">
              <div className="border-t border-zinc-400 pt-1 text-center">
                <span className="font-medium text-zinc-700 block">Firma Mecánico</span>
                <span className="text-[9px] text-zinc-400">{job.mecanico}</span>
              </div>
              <div className="border-t border-zinc-400 pt-1 text-center">
                <span className="font-medium text-zinc-700 block">Firma Cliente</span>
                <span className="text-[9px] text-zinc-400">Conforme con el trabajo</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Buttons */}
        <div className="flex gap-2 pt-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket para Cliente</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
