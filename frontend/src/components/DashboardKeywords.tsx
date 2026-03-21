import React from 'react';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faRobot, faListOl, faChartBar } from "@fortawesome/free-solid-svg-icons";
import { MetricsPayload } from "@/types";

interface Props {
  data: MetricsPayload;
  setView: (v: 'dashboard' | 'requesters' | 'keywords') => void;
}

export function DashboardKeywords({ data, setView }: Props) {
  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-8 space-y-6">
      <header className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FontAwesomeIcon icon={faChartBar} className="text-blue-600" />
            Ranking de Chamados por Palavra-chave
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Top 10 termos mais recorrentes com Análise Inteligente de Gargalos
          </p>
        </div>
        <Button 
          variant="outline" 
          className="rounded-none border-gray-300 dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700" 
          onClick={() => setView('dashboard')}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Voltar
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RANKING TABLE - LEFT SIDE */}
        <div className="lg:col-span-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm rounded-none">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-none">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faListOl} className="text-blue-600" />
              Volume de Casos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Palavra-chave</th>
                  <th scope="col" className="px-6 py-3 text-center">Tickets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.keywordRanking?.map((item, index) => (
                  <tr key={index} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white flex items-center">
                      <span className="inline-flex items-center justify-center w-5 h-5 mr-3 text-xs font-bold text-white bg-blue-600 rounded-none">
                        {index + 1}
                      </span>
                      {item.keyword}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white">
                      {item.count}
                    </td>
                  </tr>
                ))}
                {(!data.keywordRanking || data.keywordRanking.length === 0) && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                      Nenhuma palavra-chave rastreada encontrada neste período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI ANALYSIS - RIGHT SIDE */}
        <div className="lg:col-span-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm rounded-none flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-none">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faRobot} className="text-purple-600" />
              Análise Visual do Cenário (Gemini AI)
            </h2>
          </div>
          <div className="p-6 flex-1 text-gray-700 dark:text-gray-300 leading-relaxed font-sans text-base">
            {data.keywordAnalysis ? (
              <div className="space-y-4">
                {data.keywordAnalysis.split('\n').filter(line => line.trim()).map((paragraph, i) => {
                  const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                  return (
                    <p key={i}>
                      {parts.map((pt, j) => 
                        pt.startsWith('**') && pt.endsWith('**') 
                        ? <strong key={j} className="font-bold text-gray-900 dark:text-white">{pt.slice(2, -2)}</strong> 
                        : <span key={j}>{pt.replace(/^\* /g, '• ')}</span>
                      )}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="italic text-gray-500">
                A análise inteligente não está disponível para este conjunto de dados no momento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
