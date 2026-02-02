'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PortfolioPoint } from '../lib/finance';
import { ShieldAlert, TrendingDown, Activity } from 'lucide-react';

interface Props {
  historicalData: any[];
  selectedPortfolio: PortfolioPoint | null;
}

export default function RiskAnalysis({ historicalData, selectedPortfolio }: Props) {
  
  // Cálculo das métricas de risco
  const riskMetrics = useMemo(() => {
    if (!historicalData || !selectedPortfolio) return null;

    // 1. Reconstruir a série histórica da carteira
    const dailyValues = historicalData.map(day => {
      let val = 0;
      Object.entries(selectedPortfolio.weights).forEach(([ticker, weight]) => {
        if (day[ticker]) val += day[ticker] * weight;
      });
      return val;
    });

    // 2. Calcular Retornos Diários e Drawdown
    const returns: number[] = [];
    const drawdowns: { date: string, value: number }[] = [];
    
    let peak = dailyValues[0];
    let maxDrawdown = 0;

    for (let i = 1; i < dailyValues.length; i++) {
      // Retorno Diário
      const r = (dailyValues[i] - dailyValues[i-1]) / dailyValues[i-1];
      returns.push(r);

      // Drawdown
      if (dailyValues[i] > peak) peak = dailyValues[i];
      const dd = (dailyValues[i] - peak) / peak;
      if (dd < maxDrawdown) maxDrawdown = dd;
      
      drawdowns.push({
        date: new Date(historicalData[i].Date).toLocaleDateString('pt-BR').slice(0, 5), // dd/mm
        value: dd * 100 // Porcentagem
      });
    }

    // 3. Calcular VaR (Value at Risk) Histórico (95%)
    // Ordena os retornos do pior para o melhor e pega o percentil 5%
    returns.sort((a, b) => a - b);
    const index95 = Math.floor(returns.length * 0.05);
    const var95 = returns[index95];

    return {
      maxDrawdown: maxDrawdown,
      var95: var95,
      drawdownChart: drawdowns
    };
  }, [historicalData, selectedPortfolio]);

  if (!selectedPortfolio || !riskMetrics) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-700/50 p-6">
        <ShieldAlert className="w-8 h-8 opacity-20 mb-2" />
        <p className="text-xs">Selecione um portfólio para análise de risco</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/30 flex items-center gap-2">
        <Activity className="w-4 h-4 text-rose-400" />
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Gestão de Risco & Stress</h3>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-6">
        
        {/* KPIs de Risco */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1 text-rose-300/70">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase">VaR Diário (95%)</span>
            </div>
            <p className="text-xl font-bold text-rose-400 tabular-nums">
              {(riskMetrics.var95 * 100).toFixed(2)}%
            </p>
            <p className="text-[10px] text-rose-500/60 mt-1 leading-tight">
              Pior perda diária esperada em 95% dos casos.
            </p>
          </div>

          <div className="bg-orange-950/20 border border-orange-900/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1 text-orange-300/70">
              <TrendingDown className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase">Max Drawdown</span>
            </div>
            <p className="text-xl font-bold text-orange-400 tabular-nums">
              {(riskMetrics.maxDrawdown * 100).toFixed(2)}%
            </p>
            <p className="text-[10px] text-orange-500/60 mt-1 leading-tight">
              Maior queda do topo ao fundo no período.
            </p>
          </div>
        </div>

        {/* Gráfico de Drawdown */}
        <div className="flex-1 min-h-[100px] relative">
            <p className="absolute top-0 left-0 text-[10px] text-slate-500 font-mono z-10">Underwater Plot (Quedas)</p>
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={riskMetrics.drawdownChart}>
              <defs>
                <linearGradient id="colorDd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ef4444', fontSize: '10px' }}
                itemStyle={{ color: '#fca5a5' }}
                formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Queda']}
                labelStyle={{ display: 'none' }}
              />
              <Area 
                type="step" 
                dataKey="value" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorDd)" 
                strokeWidth={1.5}
              />
              {/* Linha Zero */}
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}