'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { Search, AlertCircle, Loader2, Activity, BarChart3, Sparkles, Target, Printer, Percent, MousePointerClick, LayoutDashboard, Database, Github, Linkedin, Mail } from 'lucide-react';
import { generatePortfolios, PortfolioPoint } from '../src/lib/finance';
import FrontierChart from '../src/components/FrontierChart';
import CorrelationHeatmap from '../src/components/CorrelationHeatmap';
import AllocationChart from '../src/components/AllocationChart';
import BacktestChart from '../src/components/BacktestChart';
import RiskAnalysis from '../src/components/RiskAnalysis';
import DataAudit from '../src/components/DataAudit';

export default function Home() {
  const tickersRef = useRef<HTMLInputElement>(null);
  const riskFreeRef = useRef<HTMLInputElement>(null);

  // NAVEGAÇÃO DE ABAS
  const [activeTab, setActiveTab] = useState<'dashboard' | 'audit'>('dashboard');

  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState<any>(null);
  const [simulations, setSimulations] = useState<PortfolioPoint[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioPoint | null>(null);
  const [error, setError] = useState('');
  const [currentRiskFree, setCurrentRiskFree] = useState<number>(10.75);

  const handleOptimize = async () => {
    setLoading(true);
    setError('');
    setApiData(null);
    setSimulations([]);
    setSelectedPortfolio(null);
    setActiveTab('dashboard');

    const rawValue = tickersRef.current?.value || '';
    const tickerArray = rawValue.split(',').map(t => t.trim().toUpperCase());

    const rfString = riskFreeRef.current?.value || '10.75';
    const rfValue = parseFloat(rfString.replace(',', '.'));

    if (tickerArray.length === 0 || (tickerArray.length === 1 && tickerArray[0] === '')) {
      setError('Por favor, insira pelo menos um ativo.');
      setLoading(false);
      return;
    }

    if (isNaN(rfValue)) {
      setError('Por favor, insira uma Taxa Livre de Risco válida.');
      setLoading(false);
      return;
    }

    setCurrentRiskFree(rfValue);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://quant.matheusrocha.cloud/api';
      const response = await axios.post(`${apiUrl}/optimize`, {
        tickers: tickerArray,
        period: "1y"
      });

      const data = response.data;
      setApiData(data);

      const simPoints = generatePortfolios(data.mean_returns, data.cov_matrix, 2000, rfValue);
      setSimulations(simPoints);

      if (simPoints.length > 0) {
        const bestSharpe = simPoints.reduce((prev, current) => (prev.sharpe > current.sharpe) ? prev : current);
        setSelectedPortfolio(bestSharpe);
      }

    } catch (err) {
      setError('Falha ao processar otimização. Verifique os tickers e tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#172554] text-slate-50 font-sans relative overflow-hidden selection:bg-blue-500/30 print:overflow-visible">

      <div className="print-header-container bg-white hidden print:flex flex-row justify-between items-center w-full p-6 border-b-4 border-blue-600 mb-8">

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Relatório de Otimização</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">Markowitz Framework</span>
            <span className="text-slate-500 text-sm">•</span>
            <span className="text-slate-600 text-sm font-medium">Análise de Risco & Retorno</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-slate-900 font-bold text-lg">Matheus Rocha</p>
          <p className="text-slate-500 text-sm font-mono uppercase tracking-wider">Quantitative Portfolio Engine</p>
          <p className="text-slate-400 text-xs mt-1">Gerado em: {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString().slice(0, 5)}</p>
        </div>
      </div>

      {/* Background Effects */}
      <div className="no-print absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0 pointer-events-none"></div>
      <div className="no-print absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 print:p-0 print:max-w-none">

        {/* Header Tela */}
        <div className="no-print mb-8 relative pl-6 lg:pl-8 border-l-8 border-blue-500/50 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white">
                Otimização de Portfólio
              </h1>
              <div className="px-3 py-1 lg:px-4 lg:py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs lg:text-sm font-mono font-semibold tracking-wider whitespace-nowrap">
                v1.0 STABLE
              </div>
            </div>
            <p className="text-slate-400 text-lg lg:text-xl font-light tracking-wide flex flex-wrap items-center gap-2 lg:gap-3">
              Modern Portfolio Theory <span className="text-slate-600 hidden md:inline">•</span> Markowitz Framework <span className="text-slate-600 hidden md:inline">•</span> VaR Analysis
            </p>
          </div>

          {/* NAVEGAÇÃO DE ABAS (Só aparece se tiver dados) */}
          {apiData && (
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all ${activeTab === 'audit' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Database className="w-4 h-4" />
                Data Audit
              </button>
            </div>
          )}
        </div>

        {/* Input Panel (Sempre visível para re-otimizar) */}
        <div className="no-print mb-12">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
            <div className="px-8 py-4 bg-slate-800/40 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">Parâmetros de Entrada</span>
              </div>

              {/* STATUS BADGE */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-500 font-mono tracking-widest">SYSTEM READY</span>
              </div>

            </div>

            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="relative flex-grow group w-full md:w-auto">
                  <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">
                    Universo de Ativos
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <Search className="h-6 w-6 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      ref={tickersRef}
                      defaultValue="PETR4.SA, VALE3.SA, IVVB11.SA, WEGE3.SA, BBAS3.SA"
                      className="block w-full pl-14 pr-6 py-5 bg-slate-950/50 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono text-lg"
                      placeholder="Ex: PETR4.SA, VALE3.SA..."
                    />
                  </div>
                </div>

                <div className="relative w-full md:w-48 group">
                  <label className="block text-sm font-medium text-slate-400 mb-2 ml-1 flex items-center gap-1">
                    Risk Free (Anual)
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 border border-slate-700">CDI/SELIC</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Percent className="h-5 w-5 text-emerald-500/70" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      ref={riskFreeRef}
                      defaultValue="10.75"
                      className="block w-full pl-12 pr-4 py-5 bg-slate-950/50 border border-slate-700 rounded-2xl text-emerald-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-lg font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={handleOptimize}
                    disabled={loading}
                    className="flex-1 md:flex-none relative overflow-hidden group px-8 py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 text-lg flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                    <span>{loading ? '...' : 'Otimizar'}</span>
                  </button>

                  {apiData && (
                    <button
                      onClick={handlePrint}
                      className="px-6 py-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-slate-300 transition-all flex items-center justify-center gap-2 group"
                      title="Gerar Relatório PDF"
                    >
                      <Printer className="w-6 h-6 group-hover:text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-10 p-5 bg-red-950/30 border border-red-900/50 rounded-2xl flex items-center gap-3 text-red-200 animate-in slide-in-from-top-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="text-lg">{error}</span>
          </div>
        )}

        {/* --- CONTEÚDO CONDICIONAL --- */}
        {apiData && activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 items-stretch">

            {/* COLUNA ESQUERDA */}
            <div className="lg:col-span-4 flex flex-col gap-8 h-full">

              <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 overflow-hidden shrink-0 print:break-inside-avoid">
                <div className="px-6 py-4 border-b border-slate-700/50 flex items-center gap-3 bg-slate-800/30">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Matriz de Correlação</h3>
                </div>
                <div className="p-6 flex justify-center">
                  <CorrelationHeatmap data={apiData.corr_matrix} />
                </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 overflow-hidden h-[420px] shrink-0 print:break-inside-avoid">
                <div className="px-6 py-4 border-b border-slate-700/50 flex items-center gap-3 bg-slate-800/30">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Composição</h3>
                </div>
                <div className="p-6 h-full pb-12">
                  <AllocationChart portfolio={selectedPortfolio} />
                </div>
              </div>

              <div className="h-[380px] shrink-0 print:break-inside-avoid">
                <RiskAnalysis
                  historicalData={apiData.normalized_prices}
                  selectedPortfolio={selectedPortfolio}
                />
              </div>
            </div>

            {/* COLUNA DIREITA */}
            <div className="lg:col-span-8 flex flex-col gap-8 h-full">

              <div className="no-print shrink-0 flex items-center gap-3 bg-blue-900/20 border border-blue-500/30 p-4 rounded-2xl animate-pulse">
                <MousePointerClick className="w-6 h-6 text-blue-400" />
                <span className="text-blue-200 font-semibold text-sm md:text-base">
                  Clique em qualquer ponto do gráfico abaixo para atualizar a simulação e o backtest.
                </span>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl min-h-[400px] lg:h-[600px] flex flex-col shrink-0 print:break-inside-avoid">
                <div className="px-6 lg:px-8 py-4 lg:py-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Markowitz Efficient Frontier</h3>
                  </div>
                </div>
                <div className="p-4 lg:p-6 flex-1 w-full h-full">
                  <FrontierChart
                    data={simulations}
                    onSelect={setSelectedPortfolio}
                    selectedPoint={selectedPortfolio}
                  />
                </div>
              </div>

              <div className="flex-1 w-full min-h-[300px] lg:h-[420px] print:break-inside-avoid">
                <BacktestChart
                  historicalData={apiData.normalized_prices}
                  selectedPortfolio={selectedPortfolio}
                  riskFreeRate={currentRiskFree}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- ABA DE AUDITORIA --- */}
        {apiData && activeTab === 'audit' && (
          <DataAudit
            data={apiData.normalized_prices}
            rawData={apiData.raw_prices}
            tickers={Object.keys(apiData.mean_returns)}
          />
        )}

        <footer className="no-print mt-32 border-t border-slate-800 bg-[#050911] pt-20 pb-12">
          <div className="max-w-[1900px] mx-auto px-8">

            <div className="grid grid-cols-1 lg:grid-cols-12 md:grid-cols-12 gap-10 lg:gap-24 mb-16">

              {/* COLUNA 1: IDENTIDADE (Ocupa 5 colunas) */}
              <div className="md:col-span-5 space-y-6">
                <div>
                  <h4 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">Matheus Rocha</h4>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/30 border border-blue-900/50 text-blue-400 text-xs font-mono font-semibold uppercase tracking-wider">
                    Quantitative Developer
                  </div>
                </div>
                <p className="text-base text-slate-400 leading-relaxed max-w-md">
                  Economista e Desenvolvedor Fullstack especializado em soluções de alta performance para o mercado financeiro.
                  Transformando dados complexos em inteligência acionável.
                </p>

                {/* Social Links Grandes */}
                <div className="flex items-center gap-4 pt-4">
                  <a
                    href="https://github.com/MathRGS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all group"
                  >
                    <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm">GitHub</span>
                  </a>
                  <a
                    href="https://linkedin.com/in/matheus-rocha-4a616320a/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all group"
                  >
                    <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm">LinkedIn</span>
                  </a>
                </div>
              </div>

              {/* COLUNA 2: TECH STACK (Ocupa 3 colunas) */}
              <div className="md:col-span-3">
                <h5 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-6">Built With</h5>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Next.js 14 (App Router)
                  </li>
                  <li className="flex items-center gap-2 hover:text-emerald-400 transition-colors">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Python FastAPI
                  </li>
                  <li className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Tailwind CSS
                  </li>
                  <li className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Recharts & Lucide
                  </li>
                </ul>
              </div>

              {/* COLUNA 3: CONTATO (Ocupa 4 colunas) */}
              <div className="md:col-span-4">
                <h5 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-6">Contact</h5>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <p className="text-sm text-slate-400">
                    Interessado em implementar modelos quantitativos na sua empresa? Vamos conversar.
                  </p>
                  <a
                    href="mailto:seu@email.com"
                    className="inline-flex items-center gap-2 text-white font-semibold border-b border-blue-500 pb-0.5 hover:text-blue-400 hover:border-blue-400 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    matheunho29@gmail.com
                  </a>
                </div>
              </div>

            </div>

            {/* BARRA INFERIOR: DISCLAIMER E COPYRIGHT */}
            <div className="border-t border-slate-800/60 pt-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="max-w-2xl">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <span className="font-bold text-slate-400">Disclaimer:</span> Esta aplicação utiliza a Teoria Moderna do Portfólio (Markowitz) para fins estritamente educacionais. Retornos passados não garantem rentabilidade futura. Os dados são fornecidos "como estão" via Yahoo Finance.
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-mono text-slate-600">
                  © {new Date().getFullYear()} Quantitative Engine
                </p>
              </div>
            </div>

          </div>
        </footer>
      </div>
    </div>
  );
}