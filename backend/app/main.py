from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware # <--- IMPORTANTE
from pydantic import BaseModel
from typing import List
import yfinance as yf
import pandas as pd
import numpy as np

app = FastAPI(title="Efficient Frontier API")

# --- CONFIGURAÇÃO DO CORS ---
origins = [
    "http://localhost:3000",    
    "http://127.0.0.1:3000",
    "https://quant.matheusrocha.cloud",  
    "https://matheusrocha.cloud",        
    "https://www.matheusrocha.cloud",
    "http://quant.matheusrocha.cloud"   
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      
    allow_credentials=True,
    allow_methods=["*"],        
    allow_headers=["*"],
)
# -----------------------------------------------------

class PortfolioRequest(BaseModel):
    tickers: List[str]
    period: str = "1y"

@app.get("/")
def health_check():
    return {"status": "ok", "message": "API de Risco Operacional 🚀"}

@app.post("/optimize")
def get_market_data(request: PortfolioRequest):
    try:
        print(f"📥 Baixando dados para: {request.tickers}")
        data = yf.download(
            request.tickers, 
            period=request.period, 
            progress=False,
            auto_adjust=False
        )

        # Seleção da coluna correta
        if 'Adj Close' in data.columns:
            prices = data['Adj Close']
        elif 'Close' in data.columns:
            prices = data['Close']
        else:
            raise HTTPException(status_code=500, detail="Yahoo Finance não retornou colunas de preço.")

        # Limpeza de dados
        prices = prices.ffill().dropna()

        if prices.empty:
            raise HTTPException(status_code=400, detail="Nenhum dado encontrado após limpeza.")

        # Cálculos Estatísticos (Markowitz)
        log_returns = np.log(prices / prices.shift(1)).dropna()
        mean_returns = log_returns.mean() * 252
        cov_matrix = log_returns.cov() * 252
        corr_matrix = log_returns.corr()

        # --- Cálculo para o Gráfico de Backtest ---
        # Normaliza os preços para começarem em 1.0 (Base 100%)
        # Isso permite comparar a evolução de ativos de preços diferentes (ex: PETR4 a R$30 vs VALE3 a R$60)
        normalized_prices = prices / prices.iloc[0]

        return {
            "tickers": request.tickers,
            "mean_returns": mean_returns.to_dict(),
            "cov_matrix": cov_matrix.to_dict(),
            "corr_matrix": corr_matrix.to_dict(),
            "last_prices": prices.iloc[-1].to_dict(),
            "normalized_prices": normalized_prices.reset_index().to_dict(orient='records'),
            "raw_prices": prices.reset_index().to_dict(orient='records')
        }

    except Exception as e:
        print(f"Erro: {e}")
        raise HTTPException(status_code=500, detail=str(e))