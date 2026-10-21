import React, { useState } from 'react';
import {
  DollarSign,
  Printer,
  Lock,
  X,
  Banknote,
  CreditCard,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { CashTransaction, Commission, PaymentMethod, DailyClosure, AuthUser } from '../types';

interface DailyClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: CashTransaction[];
  commissions: Commission[];
  authUser: AuthUser;
  onConfirmClosure: (closure: DailyClosure) => void;
}

export const DailyClosureModal: React.FC<DailyClosureModalProps> = ({
  isOpen,
  onClose,
  transactions,
  commissions,
  authUser,
  onConfirmClosure
}) => {
  const [observaciones, setObservaciones] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

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

  const comisionesPagadas = commissions
    .filter((c) => c.estado === 'Pagado')
    .reduce((acc, c) => acc + Number(c.comisionUSD), 0);

  const comisionesPendientes = commissions
    .filter((c) => c.estado === 'Pendiente')
    .reduce((acc, c) => acc + Number(c.comisionUSD), 0);

  const currentDateStr = new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'full'
  }).format(new Date());

  const currentTimeStr = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleFreezeAndClose = () => {
    const closure: DailyClosure = {
      id: `CIERRE-${Date.now().toString().slice(-6)}`,
      fecha: new Date().toISOString().split('T')[0],
      hora: currentTimeStr,
      totalIngresosUSD: totalIngresos,
      totalEgresosUSD: totalEgresos,
      balanceNetoUSD: balanceNeto,
      desgloseMetodos: methodTotals,
      totalServiciosAtendidos: transactions.filter((t) => t.tipo === 'Ingreso').length,
      totalComisionesPagadasUSD: comisionesPagadas,
      responsable: authUser.nombre,
      observaciones: observaciones.trim() || 'Arqueo de jornada ordinario conforme.'
    };

    onConfirmClosure(closure);
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 border border-red-600/40 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">
                Cierre de Jornada / Arqueo Diario
              </h3>
              <p className="text-xs text-zinc-400">
                Portanet C.A. · {currentDateStr} · {currentTimeStr}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-lg font-bold p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt / Voucher Box */}
        <div id="printArea" className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4 text-xs font-mono">
          
          <div className="text-center pb-3 border-b border-zinc-800 space-y-1 font-sans">
            <h4 className="font-black text-sm uppercase text-white tracking-wider">PORTANET C.A.</h4>
            <p className="text-[11px] text-zinc-400">COMPROBANTE DE CIERRE Y ARQUEO DE CAJA</p>
            <div className="text-[10px] text-zinc-500 font-mono">
              Responsable: {authUser.nombre} ({authUser.titulo})
            </div>
          </div>

          {/* Key Totals */}
          <div className="grid grid-cols-3 gap-3 text-center py-2 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-sans block">Total Ingresos</span>
              <span className="text-base font-bold text-emerald-400 tabular-nums">
                ${totalIngresos.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-sans block">Total Egresos</span>
              <span className="text-base font-bold text-red-400 tabular-nums">
                ${totalEgresos.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-sans block">Balance Neto</span>
              <span className="text-base font-bold text-white tabular-nums">
                ${balanceNeto.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Breakdown by Payment Method */}
          <div className="space-y-2 pt-1 font-sans">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
              Desglose Físico por Métodos de Pago:
            </span>
            <div className="divide-y divide-zinc-800/70 text-xs">
              <div className="py-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-300">
                  <Banknote className="w-3.5 h-3.5 text-emerald-400" />
                  <span>💵 Divisas / USD Efectivo en Gaveta</span>
                </span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  ${methodTotals['Divisas / USD Efectivo'].toFixed(2)}
                </span>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-300">
                  <Banknote className="w-3.5 h-3.5 text-blue-400" />
                  <span>🇻🇪 Bolívares Efectivo</span>
                </span>
                <span className="font-mono font-bold text-blue-400 tabular-nums">
                  ${methodTotals['Bolívares Efectivo'].toFixed(2)}
                </span>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-300">
                  <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                  <span>💳 Lote Punto de Venta (Tarjetas)</span>
                </span>
                <span className="font-mono font-bold text-purple-400 tabular-nums">
                  ${methodTotals['Punto de Venta'].toFixed(2)}
                </span>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-300">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>📲 Pago Móvil Acreditado</span>
                </span>
                <span className="font-mono font-bold text-amber-400 tabular-nums">
                  ${methodTotals['Pago Móvil'].toFixed(2)}
                </span>
              </div>

              <div className="py-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-300">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  <span>⚡ Zelle / Transferencias Directas</span>
                </span>
                <span className="font-mono font-bold text-cyan-400 tabular-nums">
                  ${methodTotals['Zelle / Transferencia'].toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Commissions status */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs font-sans">
            <span className="text-zinc-400">Comisiones de Operadores:</span>
            <div className="space-x-3 font-mono">
              <span className="text-emerald-400">Pagadas: ${comisionesPagadas.toFixed(2)}</span>
              <span className="text-amber-400">Pendientes: ${comisionesPendientes.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Observations input */}
        <div className="space-y-1.5 text-xs">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Observaciones o Novedades de la Jornada
          </label>
          <textarea
            rows={2}
            placeholder="Ej. Cuadre exacto con punto de venta. Quedan 2 lavados pendientes para mañana..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500"
          ></textarea>
        </div>

        {/* Confirmation dialogue for Resetting/Freezing day */}
        {showConfirmReset ? (
          <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-red-300 font-bold">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>¿Confirmar Cierre y Resetear Caja para Mañana?</span>
            </div>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              Esta acción guardará permanentemente el arqueo actual de <strong>${balanceNeto.toFixed(2)}</strong> en el historial de cierres y dejará el balance de la caja listo en <strong>$0.00</strong> para la siguiente jornada.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFreezeAndClose}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-bold shadow"
              >
                Sí, Congelar y Cerrar Caja
              </button>
            </div>
          </div>
        ) : (
          /* Main Action Buttons */
          <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
            >
              <Printer className="w-4 h-4 text-zinc-400" />
              <span>Imprimir Reporte de Cierre</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium transition-colors"
              >
                Cerrar Ventana
              </button>
              <button
                onClick={() => setShowConfirmReset(true)}
                className="px-5 py-2.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>Congelar Día & Abrir Nuevo Turno</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
