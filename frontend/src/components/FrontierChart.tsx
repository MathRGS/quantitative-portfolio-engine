'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PortfolioPoint } from '../lib/finance';
import { TrendingUp, Target, AlertTriangle, Crosshair } from 'lucide-react';

interface Props {
  data: PortfolioPoint[];
  onSelect?: (point: PortfolioPoint) => void;
  selectedPoint?: PortfolioPoint | null;
}

const CustomTooltip = ({ active, payload, coordinate }: any) => {
  if (active && payload && payload.length) {
    const data: PortfolioPoint = payload[0].payload;
    
    // Lógica para o tooltip não sair da tela
    const isRightSide = coordinate?.x > 200; 
    
    const getSharpeRating = (sharpe: number) => {
      if (sharpe > 1.5) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-950/50', border: 'border-emerald-700/50' };
      if (sharpe > 1.0) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-950/50', border: 'border-blue-700/50' };
      if (sharpe > 0.5) return { label: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-950/50', border: 'border-yellow-700/50' };
      return { label: 'Poor', color: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-700/50' };
    };

    const rating = getSharpeRating(data.sharpe);

    return (
      <div 
        className="fixed bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-xl overflow-hidden min-w-[260px] max-w-[300px] pointer-events-none z-[9999]"
        style={{
          // Lógica de posicionamento inteligente para mobile
          left: isRightSide ? 'auto' : `${coordinate.x + 20}px`,
          right: isRightSide ? `${window.innerWidth - coordinate.x + 20}px` : 'auto',
          top: coordinate?.y ? `${coordinate.y - 100}px` : '50%',
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-bold text-slate-200 tracking-wide">Metrics</span>
          </div>
          <div className={`px-2 py-1 rounded-md text-xs font-semibold ${rating.bg} ${rating.color} ${rating.border} border`}>
            {rating.label}
          </div>
        </div>

        {/* Metrics */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-300/70 font-medium">Return</span>
              </div>
              <p className="text-lg font-bold text-emerald-400 tabular-nums">
                {(data.return * 100).toFixed(2)}%
              </p>
            </div>

            <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-300/70 font-medium">Risk</span>
              </div>
              <p className="text-lg font-bold text-red-400 tabular-nums">
                {(data.volatility * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-800/30 rounded-lg p-3 flex justify-between items-center">
            <div>
              <span className="text-xs text-blue-300/70 font-medium block">Sharpe Ratio</span>
              <span className="text-xs text-blue-300/50">risk-adjusted return</span>
            </div>
            <p className="text-2xl font-bold text-blue-400 tabular-nums">{data.sharpe.toFixed(3)}</p>
          </div>

          {/* Top 3 Assets Allocation */}
          <div className="pt-3 border-t border-slate-700/50">
            <div className="space-y-1.5">
              {Object.entries(data.weights)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([ticker, weight]) => (
                  <div key={ticker} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">{ticker}</span>
                    <span className="text-slate-200 font-bold">{(weight * 100).toFixed(1)}%</span>
                  </div>
                ))}
                {Object.keys(data.weights).length > 3 && (
                  <p className="text-[10px] text-center text-slate-500 mt-1 italic">+ others</p>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const normalizedSharpe = Math.min(Math.max(payload.sharpe / 3, 0), 1);
  
  let r, g, b;
  if (normalizedSharpe < 0.5) {
    r = 255;
    g = Math.floor(50 + (normalizedSharpe * 2) * 205);
    b = 50;
  } else {
    r = Math.floor(255 - ((normalizedSharpe - 0.5) * 2) * 205);
    g = 255;
    b = Math.floor(50 + ((normalizedSharpe - 0.5) * 2) * 50);
  }

  const color = `rgb(${r}, ${g}, ${b})`;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill={color}
      fillOpacity={0.8}
      stroke={color}
      strokeWidth={0}
      className="transition-all duration-300 hover:r-7 hover:stroke-white hover:stroke-2 hover:z-50"
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
    />
  );
};

const SelectedPointShape = (props: any) => {
  const { cx, cy } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} stroke="#fff" strokeWidth={2} fill="none" className="animate-pulse" />
      <circle cx={cx} cy={cy} r={14} stroke="#3b82f6" strokeWidth={1} fill="none" opacity={0.5} />
      <line x1={cx - 20} y1={cy} x2={cx + 20} y2={cy} stroke="#3b82f6" strokeWidth={1} opacity={0.5} />
      <line x1={cx} y1={cy - 20} x2={cx} y2={cy + 20} stroke="#3b82f6" strokeWidth={1} opacity={0.5} />
    </g>
  );
};

export default function FrontierChart({ data, onSelect, selectedPoint }: Props) {
  if (!data || data.length === 0) return null;

  const bestSharpe = data.reduce((prev, current) => 
    current.sharpe > prev.sharpe ? current : prev
  );

  const avgReturn = data.reduce((sum, p) => sum + p.return, 0) / data.length;
  const avgVol = data.reduce((sum, p) => sum + p.volatility, 0) / data.length;

  return (
    <div className="w-full h-full flex flex-col relative group">
      
      {/* Stats Bar */}
      <div className="mb-2 shrink-0 flex flex-wrap justify-between items-center gap-4 text-sm text-slate-400 bg-slate-800/20 p-3 rounded-lg border border-slate-700/20">
         <div className="flex gap-4 md:gap-6">
            <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 
                <span className="whitespace-nowrap">Avg Return: <span className="text-slate-200 font-mono font-bold">{(avgReturn * 100).toFixed(1)}%</span></span>
            </span>
            <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> 
                <span className="whitespace-nowrap">Avg Risk: <span className="text-slate-200 font-mono font-bold">{(avgVol * 100).toFixed(1)}%</span></span>
            </span>
         </div>
         <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-950/30 px-3 py-1 rounded-md border border-emerald-900/50 whitespace-nowrap">
            <Crosshair className="w-4 h-4" />
            <span>Optimal Sharpe: {bestSharpe.sharpe.toFixed(2)}</span>
         </div>
      </div>

      <div className="flex-1 w-full min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} />
            
            <XAxis 
              type="number" 
              dataKey="volatility" 
              name="Risk" 
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              tick={{ fill: '#94a3b8', fontSize: 13 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={false}
              dy={10}
              domain={['auto', 'auto']}
            />
            
            <YAxis 
              type="number" 
              dataKey="return" 
              name="Return" 
              tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
              tick={{ fill: '#94a3b8', fontSize: 13 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={false}
              dx={-10}
              domain={['auto', 'auto']}
            />
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#fff', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
              animationDuration={150}
              offset={20}
            />

            <ReferenceLine y={avgReturn} stroke="#3b82f6" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine x={avgVol} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} />

            <Scatter 
              name="Portfolios" 
              data={data} 
              shape={<CustomDot />}
              isAnimationActive={false}
              onClick={(p: any) => onSelect && onSelect(p.payload)}
              cursor="pointer"
            />

            {selectedPoint && (
              <Scatter 
                data={[selectedPoint]} 
                shape={<SelectedPointShape />}
                legendType="none"
                isAnimationActive={false}
                zIndex={100}
              />
            )}

            <Scatter
              data={[bestSharpe]}
              fill="#10b981"
              shape="star"
              legendType="none"
              zIndex={50}
            />

          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="shrink-0 mt-2 text-right text-[10px] md:text-xs font-semibold text-slate-500 font-mono px-2">
        Eixo X: Volatilidade (Risco) • Eixo Y: Retorno Esperado
      </div>
    </div>
  );
}