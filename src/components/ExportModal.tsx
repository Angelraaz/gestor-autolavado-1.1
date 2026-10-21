import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  ExternalLink,
  Database,
  Cloud,
  X
} from 'lucide-react';
import { generateStandaloneHtml } from '../utils/generateStandaloneHtml';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const htmlContent = generateStandaloneHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portanet-gestion-automotriz.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const htmlContent = generateStandaloneHtml();
    navigator.clipboard.writeText(htmlContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Exportar Archivo Autónomo (Netlify & Supabase Ready)
              </h3>
              <p className="text-xs text-zinc-400">
                Código completo en un único archivo HTML con Tailwind CSS CDN y JavaScript embebido.
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

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Descargar "portanet-gestion-automotriz.html"</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Código Copiado al Portapapeles!' : 'Copiar Todo el Código HTML'}</span>
          </button>
        </div>

        {/* Step-by-step instructions */}
        <div className="space-y-4 pt-1 text-xs">
          {/* Netlify Guide */}
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span>Paso 1: Despliegue Inmediato en Netlify (Gratis y sin servidor)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 leading-relaxed pl-1">
              <li>Descarga el archivo HTML haciendo clic en el botón superior.</li>
              <li>
                Crea una carpeta en tu computadora, pon el archivo dentro y renómbralo como{' '}
                <code className="text-red-400 bg-zinc-900 px-1 py-0.5 rounded font-mono">
                  index.html
                </code>
                .
              </li>
              <li>
                Ve a{' '}
                <span className="text-zinc-200 underline font-mono">app.netlify.com/drop</span> y
                arrastra esa carpeta. En 10 segundos tendrás tu aplicación web online con dominio
                HTTPS público.
              </li>
            </ol>
          </div>

          {/* Supabase Guide */}
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Paso 2: Conexión con Supabase (Persistencia Cloud Multiusuario)</span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              El archivo ya cuenta con persistencia temporal mediante <code className="text-zinc-300 font-mono">localStorage</code>. Para conectarlo a Supabase, solo debes agregar en el encabezado:
            </p>
            <pre className="p-2.5 bg-zinc-900 border border-zinc-800 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto">
{`<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const supabase = window.supabase.createClient('TU_SUPABASE_URL', 'TU_SUPABASE_ANON_KEY');
  // Reemplazar saveData() por supabase.from('wash_jobs').upsert(...)
</script>`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
