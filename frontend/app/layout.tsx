import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

// --- CONFIGURAÇÃO DE METADADOS ---
export const metadata: Metadata = {
  title: {
    template: '%s | Matheus Rocha',
    default: 'Quantitative Portfolio Engine | Matheus Rocha', 
  },
  description: 'Advanced Markowitz Efficient Frontier optimization tool. Developed by Matheus Rocha, Economist & Fullstack Developer.',
  icons: {
    icon: '/favicon.ico', 
  },
  authors: [{ name: 'Matheus Rocha', url: 'https://matheusrocha.cloud' }],
  keywords: ['Quantitative Finance', 'Markowitz', 'Python', 'Next.js', 'Portfolio Optimization', 'VaR'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="bg-[#050911] antialiased">{children}</body>
    </html>
  );
}