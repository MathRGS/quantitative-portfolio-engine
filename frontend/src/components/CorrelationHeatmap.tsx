'use client';

interface Props {
  data: Record<string, Record<string, number>>;
}

export default function CorrelationHeatmap({ data }: Props) {
  const tickers = Object.keys(data);
  
  // Função para definir a cor baseada na correlação (-1 a 1)
  const getColor = (value: number) => {
    // Escala de Azul (Positivo) a Vermelho (Negativo/Neutro)
    // 1.0 = Azul Forte (#2563eb)
    // 0.0 = Cinza (#94a3b8)
    // -1.0 = Vermelho (#dc2626)
    
    if (value === 1) return 'bg-blue-600 text-white';
    if (value > 0.7) return 'bg-blue-500 text-white';
    if (value > 0.4) return 'bg-blue-400 text-white';
    if (value > 0) return 'bg-blue-200 text-slate-800';
    if (value === 0) return 'bg-slate-100 text-slate-400';
    return 'bg-red-200 text-red-900';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[300px]">
        {/* Header Row */}
        <div className="flex">
          <div className="w-16 h-10"></div> 
          {tickers.map(ticker => (
            <div key={ticker} className="w-20 h-10 flex items-center justify-center text-[10px] font-bold text-slate-400 rotate-0">
              {ticker.split('.')[0]}
            </div>
          ))}
        </div>

        {/* Matrix Rows */}
        {tickers.map(rowTicker => (
          <div key={rowTicker} className="flex items-center mb-1">
            {/* Row Label */}
            <div className="w-16 h-10 flex items-center justify-end pr-3 text-[10px] font-bold text-slate-400">
              {rowTicker.split('.')[0]}
            </div>
            
            {/* Cells */}
            {tickers.map(colTicker => {
              const value = data[rowTicker][colTicker];
              return (
                <div 
                  key={`${rowTicker}-${colTicker}`}
                  className={`w-20 h-10 mx-0.5 rounded flex items-center justify-center text-xs font-mono transition-all hover:scale-105 cursor-default ${getColor(value)}`}
                  title={`${rowTicker} x ${colTicker}: ${value.toFixed(4)}`}
                >
                  {value.toFixed(2)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}