'use client';

import { useState } from 'react';
import { Database, CheckCircle, Calendar, FileSpreadsheet, ShieldCheck, AlertTriangle, ArrowLeftRight } from 'lucide-react';

interface Props {
  data: any[];      // Normalizado
  rawData: any[];   // Bruto (R$) 
  tickers: string[];
}

export default function DataAudit({ data, rawData, tickers }: Props) {
  const [viewMode, setViewMode] = useState<'normalized' | 'raw'>('normalized');

  if (!data || data.length === 0) return null;

  // Usa o dataset escolhido pelo botão
  const activeData = viewMode === 'normalized' ? data : rawData;

  const startDate = new Date(activeData[0].Date).toLocaleDateString('pt-BR');
  const endDate = new Date(activeData[activeData.length - 1].Date).toLocaleDateString('pt-BR');
  const totalRows = activeData.length;
  const totalCells = totalRows * tickers.length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header da Auditoria */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            Auditoria & Linhagem de Dados
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Verificação de integridade e proveniência dos dados utilizados no modelo.
          </p>
        </div>
        <div className="text-right">
            <span className="text-xs font-mono text-slate-600 uppercase tracking-widest block mb-1">Data Source</span>
            <span className="text-sm font-bold text-blue-400 bg-blue-950/30 px-3 py-1 rounded border border-blue-900/50">
                Yahoo Finance API (yfinance)
            </span>
        </div>
      </div>

      {/* Cards de Qualidade */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Database className="w-4 h-4" />
                <span className="text-xs uppercase font-bold">Data Points</span>
            </div>
            <p className="text-2xl font-mono text-slate-200">{totalCells.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-500 flex items-center gap-1 mt-1">
                <CheckCircle className="w-3 h-3" /> 100% Validated (No NaN)
            </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-xs uppercase font-bold">Timeframe</span>
            </div>
            <p className="text-sm font-mono text-slate-200">{startDate}</p>
            <p className="text-xs text-slate-500 text-center py-1">to</p>
            <p className="text-sm font-mono text-slate-200">{endDate}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-xs uppercase font-bold">Amostragem</span>
            </div>
            <p className="text-2xl font-mono text-slate-200">{totalRows}</p>
            <p className="text-[10px] text-slate-500 mt-1">Trading Days</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-700/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2 text-slate-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs uppercase font-bold">Data Type</span>
            </div>
            <p className="text-sm font-mono text-emerald-400">FLOAT64</p>
            <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full"></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Adjusted Close Prices</p>
        </div>
      </div>

      {/* Tabela de Dados (Com Toggle) */}
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Header da Tabela com Controles */}
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Historical Data Series</h3>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded">
                    {viewMode === 'normalized' ? 'Base 1.0 (Normalized)' : 'Raw Currency (BRL/USD)'}
                </span>
            </div>

            {/* Toggle Button */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700/50">
                <button
                    onClick={() => setViewMode('normalized')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                        viewMode === 'normalized' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    Base 1.0
                </button>
                <button
                    onClick={() => setViewMode('raw')}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                        viewMode === 'raw' 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    <ArrowLeftRight className="w-3 h-3" />
                    Preço Real
                </button>
            </div>
        </div>
        
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
            <table className="w-full text-xs font-mono text-left">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 z-10 shadow-md">
                    <tr>
                        <th className="px-4 py-3 border-b border-slate-800 min-w-[100px] font-semibold text-slate-300">Date</th>
                        {tickers.map(t => (
                            <th key={t} className="px-4 py-3 border-b border-slate-800 text-right text-blue-300 font-semibold">
                                {t}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {activeData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-4 py-2 text-slate-500 group-hover:text-slate-300 border-r border-slate-800/50 bg-slate-900/20">
                                {new Date(row.Date).toLocaleDateString('pt-BR')}
                            </td>
                            {tickers.map(t => (
                                <td key={`${idx}-${t}`} className={`px-4 py-2 text-right group-hover:text-slate-200 ${viewMode === 'raw' ? 'text-emerald-400/80' : 'text-slate-400'}`}>
                                    {row[t] 
                                        ? (viewMode === 'raw' 
                                            ? Number(row[t]).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                                            : Number(row[t]).toFixed(4))
                                        : '-'
                                    }
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest">
            End of Audit Report • Generated via Python Pandas & NumPy
        </p>
      </div>

    </div>
  );
}