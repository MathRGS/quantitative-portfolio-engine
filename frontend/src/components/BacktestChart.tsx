'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { PortfolioPoint } from '../lib/finance';
import { useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, Percent, Activity, Landmark } from 'lucide-react';

interface Props {
    historicalData: any[];
    selectedPortfolio: PortfolioPoint | null;
    riskFreeRate: number;
}

export default function BacktestChart({ historicalData, selectedPortfolio, riskFreeRate }: Props) {

    const { chartData, stats } = useMemo(() => {
        if (!historicalData || !selectedPortfolio) return { chartData: [], stats: null };

        // 1. Converter Taxa Anual para Fator Diário (Base 252 dias úteis)
        const annualRateDecimal = riskFreeRate / 100;
        const dailyFactor = Math.pow(1 + annualRateDecimal, 1 / 252);

        let cumulativeBenchmark = 1.0;

        const data = historicalData.map((day) => {
            // Valor do Portfólio
            let portfolioValue = 0;
            Object.entries(selectedPortfolio.weights).forEach(([ticker, weight]) => {
                if (day[ticker]) portfolioValue += day[ticker] * weight;
            });

            // Valor do Benchmark (Acumulado da Taxa Livre de Risco)
            const benchmarkValue = cumulativeBenchmark;
            cumulativeBenchmark *= dailyFactor;

            return {
                date: new Date(day.Date).toLocaleDateString('pt-BR'),
                value: (portfolioValue - 1) * 100,      // Portfólio em %
                benchmark: (benchmarkValue - 1) * 100,  // CDI/Selic em %
                rawPrice: portfolioValue
            };
        });

        // Estatísticas
        let bestDay = -Infinity;
        let worstDay = Infinity;
        let positiveDays = 0;

        for (let i = 1; i < data.length; i++) {
            const dailyReturn = (data[i].rawPrice - data[i - 1].rawPrice) / data[i - 1].rawPrice;
            if (dailyReturn > bestDay) bestDay = dailyReturn;
            if (dailyReturn < worstDay) worstDay = dailyReturn;
            if (dailyReturn > 0) positiveDays++;
        }

        const winRate = (positiveDays / (data.length - 1)) * 100;

        return {
            chartData: data,
            stats: {
                bestDay: bestDay * 100,
                worstDay: worstDay * 100,
                winRate: winRate,
                totalBenchmark: data[data.length - 1].benchmark
            }
        };
    }, [historicalData, selectedPortfolio, riskFreeRate]);

    if (!selectedPortfolio) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 bg-slate-900/30 rounded-xl border border-slate-700/30">
                <Activity className="w-10 h-10 opacity-20" />
                <p className="text-sm">Selecione um portfólio para ver o backtest</p>
            </div>
        );
    }

    const finalReturn = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
    const lineColor = finalReturn >= 0 ? '#10b981' : '#ef4444';

    return (
        <div className="h-full w-full flex flex-col bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-xl overflow-hidden">

            {/* Header */}
            <div className="shrink-0 px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Performance Histórica vs Risk Free</h3>
                </div>
                <div className="flex gap-4 text-sm font-mono font-bold">
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="w-2 h-0.5 bg-slate-400/50 border-t border-dashed border-slate-400"></span>
                        <span>CDI/Selic: {stats?.totalBenchmark.toFixed(2)}%</span>
                    </div>
                    <div className={`${finalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        Portfolio: {finalReturn > 0 ? '+' : ''}{finalReturn.toFixed(2)}%
                    </div>
                </div>
            </div>

            {/* Gráfico */}
            <div className="flex-1 w-full min-h-[200px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={40}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fill: '#64748b', fontSize: 10 }}
                            tickFormatter={(val) => `${val.toFixed(0)}%`}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px', color: '#f1f5f9' }}
                            itemStyle={{ color: '#f1f5f9' }}
                            formatter={(val: any, name: any) => [
                                `${Number(val).toFixed(2)}%`,
                                name === 'value' ? 'Portfólio' : `Risk Free (${riskFreeRate}%)`
                            ]}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" opacity={0.5} />

                        {/* Linha do Benchmark (Tracejada e Cinza/Amarela) */}
                        <Line
                            type="monotone"
                            dataKey="benchmark"
                            stroke="#fbbf24" // Amber-400
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={false}
                            activeDot={{ r: 4, fill: '#fbbf24' }}
                            name="benchmark"
                        />

                        {/* Linha do Portfólio */}
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={lineColor}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: '#fff' }}
                            name="value"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Footer */}
            {stats && (
                <div className="shrink-0 grid grid-cols-3 divide-x divide-slate-700/50 border-t border-slate-700/50 bg-slate-800/20">
                    <div className="p-4 flex flex-col items-center">
                        <span className="text-[10px] uppercase text-slate-500 font-semibold mb-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Melhor Dia
                        </span>
                        <span className="text-emerald-400 font-mono font-bold">+{stats.bestDay.toFixed(2)}%</span>
                    </div>
                    <div className="p-4 flex flex-col items-center">
                        <span className="text-[10px] uppercase text-slate-500 font-semibold mb-1 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" /> Pior Dia
                        </span>
                        <span className="text-red-400 font-mono font-bold">{stats.worstDay.toFixed(2)}%</span>
                    </div>
                    <div className="p-4 flex flex-col items-center">
                        <span className="text-[10px] uppercase text-slate-500 font-semibold mb-1 flex items-center gap-1" title="Retorno acima da Taxa Livre de Risco">
                            <Activity className="w-3 h-3" /> Excesso de Retorno
                        </span>
                        <span className={`${(finalReturn - stats.totalBenchmark) >= 0 ? 'text-blue-400' : 'text-slate-500'} font-mono font-bold`}>
                            {(finalReturn - stats.totalBenchmark) > 0 ? '+' : ''}
                            {(finalReturn - stats.totalBenchmark).toFixed(2)}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}