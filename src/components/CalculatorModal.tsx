import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, X, Copy, Check, Delete } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyValue?: (value: number) => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyValue
}) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleDigit = useCallback((digit: string) => {
    setDisplay((prev) => {
      if (isNewNumber || prev === '0') {
        setIsNewNumber(false);
        return digit;
      }
      if (prev.length >= 14) return prev;
      return prev + digit;
    });
  }, [isNewNumber]);

  const handleDecimal = useCallback(() => {
    setDisplay((prev) => {
      if (isNewNumber) {
        setIsNewNumber(false);
        return '0.';
      }
      if (!prev.includes('.')) {
        return prev + '.';
      }
      return prev;
    });
  }, [isNewNumber]);

  const handleOperator = useCallback((op: string) => {
    setEquation(`${display} ${op} `);
    setIsNewNumber(true);
  }, [display]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setEquation('');
    setIsNewNumber(true);
  }, []);

  const handleBackspace = useCallback(() => {
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, []);

  const handleToggleSign = useCallback(() => {
    setDisplay((prev) => {
      if (prev === '0' || prev === 'Error') return prev;
      return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
    });
  }, []);

  const handlePercentage = useCallback(() => {
    setDisplay((prev) => {
      const num = parseFloat(prev);
      if (isNaN(num)) return '0';
      return String(num / 100);
    });
  }, []);

  const handleEquals = useCallback(() => {
    if (!equation) return;
    try {
      const fullExpr = equation + display;
      // Sanitize tokens
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9+\-*/.]/g, '');

      // Evaluate safely
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      
      if (!isFinite(result) || isNaN(result)) {
        setDisplay('Error');
      } else {
        // Round to max 6 decimals to prevent float precision drift
        const rounded = Number(Math.round(Number(result + 'e6')) + 'e-6');
        setDisplay(String(rounded));
      }
      setEquation(fullExpr + ' =');
      setIsNewNumber(true);
    } catch {
      setDisplay('Error');
    }
  }, [equation, display]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+' || e.key === '-') {
        handleOperator(e.key);
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleDecimal, handleOperator, handleEquals, handleBackspace, onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700/90 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 text-zinc-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-600/40 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Calculadora de Caja</h3>
              <p className="text-[10px] text-zinc-400">Portanet C.A. · Arqueo & Operaciones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-colors"
            aria-label="Cerrar calculadora"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-1">
          <div className="text-right text-[11px] font-mono text-zinc-500 h-4 truncate">
            {equation}
          </div>
          <div className="text-right text-3xl font-mono font-bold text-white tracking-tight tabular-nums overflow-x-auto no-scrollbar">
            {display}
          </div>
        </div>

        {/* Copy & Quick Tools */}
        <div className="flex items-center justify-between text-xs px-1">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copiar Resultado</span>
              </>
            )}
          </button>

          {onApplyValue && (
            <button
              onClick={() => {
                const val = parseFloat(display);
                if (!isNaN(val)) onApplyValue(val);
                onClose();
              }}
              className="text-[11px] text-red-400 hover:text-red-300 font-semibold"
            >
              Usar en formulario →
            </button>
          )}
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-2 text-sm font-semibold select-none">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="h-12 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-red-400 font-bold active:scale-95 transition-all flex items-center justify-center"
          >
            AC
          </button>
          <button
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 active:scale-95 transition-all flex items-center justify-center"
            title="Borrar dígito"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={handlePercentage}
            className="h-12 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 active:scale-95 transition-all flex items-center justify-center"
          >
            %
          </button>
          <button
            onClick={() => handleOperator('÷')}
            className="h-12 rounded-xl bg-zinc-800 text-amber-400 hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center text-base"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit('7')}
            className="h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 transition-all flex items-center justify-center border border-zinc-800/80"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 transition-all flex items-center justify-center border border-zinc-800/80"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 transition-all flex items-center justify-center border border-zinc-800/80"
          >
            9
          </button>
          <button
            onClick={() => handleOperator('×')}
            className="h-12 rounded-xl bg-zinc-800 text-amber-400 hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center text-base"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit('4')}
            className="h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 transition-all flex items-center justify-center border border-zinc-800/80"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 transition-all flex items-center justify-center border border-zinc-800/80"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 transition-all flex items-center justify-center border border-zinc-800/80"
          >
            6
          </button>
          <button
            onClick={() => handleOperator('-')}
            className="h-12 rounded-xl bg-zinc-800 text-amber-400 hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center text-lg font-mono"
          >
            -
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit('1')}
            className="h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 transition-all flex items-center justify-center border border-zinc-800/80"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 transition-all flex items-center justify-center border border-zinc-800/80"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 transition-all flex items-center justify-center border border-zinc-800/80"
          >
            3
          </button>
          <button
            onClick={() => handleOperator('+')}
            className="h-12 rounded-xl bg-zinc-800 text-amber-400 hover:bg-zinc-700 active:scale-95 transition-all flex items-center justify-center text-lg font-mono"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={handleToggleSign}
            className="h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 active:scale-95 transition-all flex items-center justify-center border border-zinc-800/80 text-xs"
          >
            +/-
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 transition-all flex items-center justify-center border border-zinc-800/80"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 transition-all flex items-center justify-center border border-zinc-800/80"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-lg active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-red-950/40"
          >
            =
          </button>
        </div>

      </div>
    </div>
  );
};
