'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PortfolioPoint } from '../lib/finance';
import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface Props {
  portfolio: PortfolioPoint | null;
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', 
  '#84cc16', '#14b8a6', '#a855f7', '#fb923c',
];

// Custom Legend Compacta
const CustomLegend = ({ data }: { data: any[] }) => {
  return (
    <div className="w-full px-4 pb-2">
      <div className="max-h-[100px] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 pr-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {data.map((entry, index) => (
            <div 
              key={`legend-${index}`} 
              className="flex items-center gap-2 group cursor-default"
            >
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm shadow-black/50"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1 min-w-0 flex justify-between items-baseline">
                <p className="text-[11px] font-mono text-slate-400 truncate max-w-[60px]" title={entry.name}>
                    {entry.name.split('.')[0]}
                </p>
                <p className="text-[11px] font-bold text-slate-200 tabular-nums">
                    {(entry.value * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-lg p-3 min-w-[140px] z-50">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="text-sm font-semibold text-slate-200 font-mono">{data.name}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-xs text-slate-400">Alocação:</span>
          <span className="text-sm font-bold text-blue-400 tabular-nums">
            {(data.value * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function AllocationChart({ portfolio }: Props) {
    if (!portfolio) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 p-8 bg-slate-900/20">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-800/50 border-t-blue-500/50 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PieChartIcon className="w-6 h-6 text-slate-700" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Aguardando Seleção</p>
                </div>
            </div>
        );
    }

    const data = Object.entries(portfolio.weights)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0.01) // Filtra < 1%
        .sort((a, b) => b.value - a.value);

    // Ajuste dinâmico do Sharpe Style
    const getSharpeClass = (sharpe: number) => {
      if (sharpe > 1.5) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      if (sharpe > 1.0) return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
      return { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    };

    const sharpeStyle = getSharpeClass(portfolio.sharpe);

    

    return (
        <div className="h-full w-full flex flex-col justify-between overflow-hidden">
            {/* Header Fixo */}
            <div className="shrink-0 px-4 py-3 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Alocação</h4>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1.5 ${sharpeStyle.bg} ${sharpeStyle.border}`}>
                 <TrendingUp className={`w-3 h-3 ${sharpeStyle.text}`} />
                 <span className="text-slate-400">Sharpe:</span>
                 <span className={`font-bold ${sharpeStyle.text}`}>{portfolio.sharpe.toFixed(2)}</span>
              </div>
            </div>

            {/* Área do Gráfico (Flexível) */}
            <div className="flex-1 min-h-[140px] relative w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          innerRadius="55%" 
                          outerRadius="80%" 
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none" 
                      >
                          {data.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                                className="hover:opacity-80 cursor-pointer outline-none transition-all duration-300"
                              />
                          ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                  </PieChart>
              </ResponsiveContainer>
              
              {/* Texto Central */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Ativos</span>
                  <span className="text-2xl font-bold text-slate-200">{data.length}</span>
                </div>
              </div>
            </div>

            {/* Legenda */}
            <div className="shrink-0">
               <CustomLegend data={data} />
            </div>

            {/* Footer Stats Fixo */}
            <div className="shrink-0 px-4 py-2 border-t border-slate-700/50 bg-slate-800/20">
              <div className="flex justify-between items-center text-[10px]">
                <div className="flex flex-col">
                  <span className="text-slate-500 uppercase tracking-wider">Retorno Esp.</span>
                  <span className="font-bold text-emerald-400 text-sm tabular-nums">
                    {(portfolio.return * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-700/50 mx-2"></div>
                <div className="flex flex-col items-end">
                  <span className="text-slate-500 uppercase tracking-wider">Risco (Vol)</span>
                  <span className="font-bold text-red-400 text-sm tabular-nums">
                    {(portfolio.volatility * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
        </div>
    );
}