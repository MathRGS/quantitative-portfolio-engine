'use client';

import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PortfolioPoint } from '../lib/finance';
import { TrendingUp, Target, AlertTriangle, Crosshair, PieChart, Star } from 'lucide-react';

interface Props {
  data: PortfolioPoint[];
  onSelect?: (point: PortfolioPoint) => void;
  selectedPoint?: PortfolioPoint | null;
}

// --- CARD DE INFORMAÇÃO ---
const InfoCard = ({ data, isMobile, isBestSharpe }: { data: PortfolioPoint, isMobile?: boolean, isBestSharpe?: boolean }) => {
  const getSharpeRating = (sharpe: number) => {
    if (sharpe > 1.5) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-700/50' };
    if (sharpe > 1.0) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-950/50', border: 'border-blue-700/50' };
    if (sharpe > 0.5) return { label: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-950/50', border: 'border-yellow-700/50' };
    return { label: 'Poor', color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-700/50' };
  };

  const rating = getSharpeRating(data.sharpe);

  // Estilos condicionais para mobile vs desktop
  const containerClass = isMobile 
    ? "w-full bg-slate-800/40 border-t border-slate-700/50 backdrop-blur-sm" 
    : "w-[280px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-xl overflow-hidden";

  return (
    <div className={`${containerClass} pointer-events-auto transition-all`}>
      {/* Header */}
      <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isBestSharpe ? <Star className="w-4 h-4 text-emerald-400 fill-emerald-400/20" /> : <Target className="w-4 h-4 text-blue-400" />}
          <span className="text-sm font-bold text-slate-200 tracking-wide">
            {isBestSharpe ? 'Melhor Performance' : 'Carteira Selecionada'}
          </span>
        </div>
        <div className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${rating.bg} ${rating.color} ${rating.border} border`}>
          {rating.label}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-2 text-center">
            <span className="text-[9px] uppercase text-emerald-300/70 font-semibold block mb-1">Retorno</span>
            <p className="text-sm font-bold text-emerald-400 tabular-nums">{(data.return * 100).toFixed(1)}%</p>
          </div>

          <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-2 text-center">
            <span className="text-[9px] uppercase text-red-300/70 font-semibold block mb-1">Risco</span>
            <p className="text-sm font-bold text-red-400 tabular-nums">{(data.volatility * 100).toFixed(1)}%</p>
          </div>

          <div className="bg-blue-950/30 border border-blue-800/30 rounded-lg p-2 text-center">
            <span className="text-[9px] uppercase text-blue-300/70 font-semibold block mb-1">Sharpe</span>
            <p className="text-sm font-bold text-blue-400 tabular-nums">{data.sharpe.toFixed(2)}</p>
          </div>
        </div>

        {/* Asset Allocation */}
        <div className="pt-2 border-t border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-3 h-3 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300">Alocação Recomendada</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(data.weights)
              .sort(([, a], [, b]) => b - a)
              .filter(([, weight]) => weight > 0.01)
              .slice(0, 4) 
              .map(([ticker, weight]) => (
                <div key={ticker} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                      <span className="text-slate-400 font-mono">{ticker.split('.')[0]}</span>
                  </div>
                  <span className="text-slate-200 font-bold tabular-nums">{(weight * 100).toFixed(0)}%</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- TOOLTIP FLUTUANTE (APENAS DESKTOP) ---
const CustomTooltip = ({ active, payload, coordinate, viewBox }: any) => {
  if (active && payload && payload.length) {
    const data: PortfolioPoint = payload[0].payload;
    const isRightSide = coordinate?.x > (viewBox?.width || 0) / 2;
    
    return (
      <div 
        className="absolute z-[9999] pointer-events-none transition-all duration-200"
        style={{
            transform: isRightSide ? 'translateX(calc(-100% - 15px))' : 'translateX(15px)',
            top: 0 
        }}
      >
        <InfoCard data={data} isMobile={false} />
      </div>
    );
  }
  return null;
};

// --- PONTOS E ESTILOS ---
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const normalizedSharpe = Math.min(Math.max(payload.sharpe / 3, 0), 1);
  const color = normalizedSharpe < 0.5 
    ? `rgb(255, ${Math.floor(50 + (normalizedSharpe * 2) * 205)}, 50)`
    : `rgb(${Math.floor(255 - ((normalizedSharpe - 0.5) * 2) * 205)}, 255, ${Math.floor(50 + ((normalizedSharpe - 0.5) * 2) * 50)})`;

  return (
    <circle cx={cx} cy={cy} r={4} fill={color} fillOpacity={0.8} stroke={color} strokeWidth={0} className="cursor-pointer" />
  );
};

const SelectedPointShape = (props: any) => {
  const { cx, cy } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} stroke="#fff" strokeWidth={2} fill="none" className="animate-pulse" />
      <circle cx={cx} cy={cy} r={14} stroke="#3b82f6" strokeWidth={1} fill="none" opacity={0.5} />
      <line x1={cx - 1000} y1={cy} x2={cx + 1000} y2={cy} stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" opacity={0.3} />
      <line x1={cx} y1={cy - 1000} x2={cx} y2={cy + 1000} stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" opacity={0.3} />
    </g>
  );
};

export default function FrontierChart({ data, onSelect, selectedPoint }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!data || data.length === 0) return null;

  // Encontra o melhor sharpe
  const bestSharpe = data.reduce((prev, current) => current.sharpe > prev.sharpe ? current : prev);
  
  const avgReturn = data.reduce((sum, p) => sum + p.return, 0) / data.length;
  const avgVol = data.reduce((sum, p) => sum + p.volatility, 0) / data.length;

  const displayPoint = selectedPoint || bestSharpe;
  const isShowingBest = !selectedPoint || (selectedPoint === bestSharpe);

  return (
    <div className="w-full h-full flex flex-col">
      
      {/* 1. TOPO: Métricas Gerais */}
      <div className="shrink-0 mb-2 flex flex-wrap justify-between items-center gap-2 text-xs text-slate-400 bg-slate-800/20 p-2 rounded-lg border border-slate-700/20">
         <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Avg Ret: <strong className="text-slate-200">{(avgReturn * 100).toFixed(0)}%</strong></span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Avg Risk: <strong className="text-slate-200">{(avgVol * 100).toFixed(0)}%</strong></span>
         </div>
         <div className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/50">
            <Crosshair className="w-3 h-3" /> <span>Best: {bestSharpe.sharpe.toFixed(2)}</span>
         </div>
      </div>

      {/* 2. MEIO: Gráfico */}
      <div className="flex-1 min-h-[250px] relative w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }} onMouseDown={() => {}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} />
            <XAxis type="number" dataKey="volatility" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} dy={5} domain={['auto', 'auto']} />
            <YAxis type="number" dataKey="return" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} dx={-5} domain={['auto', 'auto']} />
            
            {!isMobile && (
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#fff', strokeWidth: 1, opacity: 0.5 }} wrapperStyle={{ zIndex: 50 }} isAnimationActive={true} />
            )}

            <Scatter name="Portfolios" data={data} shape={<CustomDot />} isAnimationActive={false} onClick={(p: any) => onSelect && onSelect(p.payload)} />
            
            {selectedPoint && <Scatter data={[selectedPoint]} shape={<SelectedPointShape />} isAnimationActive={false} zIndex={100} />}
            
            <Scatter data={[bestSharpe]} fill="#10b981" shape="star" zIndex={50} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {isMobile && (
        <div className="shrink-0 mt-2 min-h-[140px] flex flex-col justify-end animate-in fade-in duration-500">
           <InfoCard data={displayPoint} isMobile={true} isBestSharpe={isShowingBest} />
        </div>
      )}

      {!isMobile && (
        <div className="shrink-0 text-right text-[10px] text-slate-500 font-mono px-2 mt-1">
          Eixo X: Volatilidade • Eixo Y: Retorno
        </div>
      )}
    </div>
  );
}