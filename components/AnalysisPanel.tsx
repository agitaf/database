import React from 'react';
import type { AnalysisResult } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { PresentationChartBarIcon } from './icons/PresentationChartBarIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TableIcon } from './icons/TableIcon';

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 0);
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'];

  if (maxValue === 0) {
      return <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">Not enough data to display chart.</div>;
  }
  
  return (
    <div className="space-y-2 mt-3">
      {data.map((item, index) => {
        const barWidthPercentage = (item.value / maxValue) * 100;
        const isLabelInside = barWidthPercentage > 25; // Heuristic to decide if label fits inside

        return (
          <div key={item.label} className="flex items-center text-sm group">
            <div className="w-1/3 sm:w-1/4 text-gray-600 dark:text-gray-400 truncate pr-2 text-right">{item.label}</div>
            <div className="w-2/3 sm:w-3/4 flex items-center">
              <div
                className={`h-6 rounded-md flex items-center transition-all duration-500 ease-out ${colors[index % colors.length]}`}
                style={{ width: `${barWidthPercentage}%` }}
              >
                {isLabelInside && <span className="pl-2 text-white font-semibold text-xs">{item.value.toLocaleString()}</span>}
              </div>
              {!isLabelInside && <span className="pl-2 text-gray-700 dark:text-gray-200 font-semibold text-xs">{item.value.toLocaleString()}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Visualization: React.FC<{ viz: NonNullable<AnalysisResult['suggestedVisualizations']>[0] }> = ({ viz }) => {
  if (viz.type === 'bar' && viz.data && viz.data.length > 0) {
    return <BarChart data={viz.data} />;
  }
  if (viz.type === 'pie' && viz.data && viz.data.length > 0) {
      return (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              <p className="font-semibold">Pie Chart Data:</p>
              <ul className="list-disc list-inside ml-2">
                  {viz.data.map(d => <li key={d.label}>{d.label}: {d.value.toLocaleString()}</li>)}
              </ul>
          </div>
      );
  }
  return <p className="text-center text-sm text-gray-500 dark:text-gray-400 my-4">Unsupported chart type: '{viz.type}'.</p>;
};

const AnalysisContent: React.FC<{ content: AnalysisResult }> = ({ content }) => {
    return (
        <div className="space-y-6">
            {content.dataOverview && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                        <TableIcon className="h-6 w-6 mr-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                        <span>Data Overview</span>
                    </h3>
                    <div className="pl-9 space-y-2 text-gray-600 dark:text-gray-300">
                      <p>{content.dataOverview.description}</p>
                      {content.dataOverview.qualityIssues && content.dataOverview.qualityIssues.length > 0 && (
                          <div>
                              <p className="font-semibold mt-2">Data Quality Issues:</p>
                              <ul className="list-disc list-inside ml-2">
                                  {content.dataOverview.qualityIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                              </ul>
                          </div>
                      )}
                    </div>
                </div>
            )}
            
            {content.keyInsights && content.keyInsights.length > 0 && (
                 <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                        <ChartBarIcon className="h-6 w-6 mr-3 text-green-500 dark:text-green-400 flex-shrink-0" />
                        <span>Key Insights & Trends</span>
                    </h3>
                    <div className="pl-9 space-y-3">
                        {content.keyInsights.map((item, i) => (
                            <div key={i}>
                                <p className="font-semibold text-gray-700 dark:text-gray-200">{item.insight}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.supportingData}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {content.suggestedVisualizations && content.suggestedVisualizations.length > 0 && (
                 <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                        <PresentationChartBarIcon className="h-6 w-6 mr-3 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />
                        <span>Visualizations</span>
                    </h3>
                    <div className="pl-9 space-y-4">
                        {content.suggestedVisualizations.map((viz, i) => (
                           <div key={i}>
                               <p className="font-semibold text-gray-700 dark:text-gray-200">{viz.title}</p>
                               <Visualization viz={viz} />
                           </div>
                        ))}
                    </div>
                </div>
            )}

            {content.potentialAnomalies && content.potentialAnomalies.length > 0 && (
                 <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                        <ExclamationTriangleIcon className="h-6 w-6 mr-3 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                        <span>Potential Anomalies</span>
                    </h3>
                    <div className="pl-9 space-y-3">
                        {content.potentialAnomalies.map((item, i) => (
                            <div key={i}>
                                <p className="font-semibold text-gray-700 dark:text-gray-200">{item.anomaly}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.details}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {content.actionableRecommendations && content.actionableRecommendations.length > 0 && (
                 <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                        <LightBulbIcon className="h-6 w-6 mr-3 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                        <span>Actionable Recommendations</span>
                    </h3>
                    <ul className="pl-9 space-y-1 list-disc list-inside text-gray-600 dark:text-gray-300">
                        {content.actionableRecommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};


interface AnalysisPanelProps {
  onAnalyze: () => void;
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
  hasData: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ onAnalyze, analysisResult, isLoading, hasData }) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 transition-colors duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 sm:mb-0">AI Data Analysis</h2>
        <button
          onClick={onAnalyze}
          disabled={isLoading || !hasData}
          className="flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-500 dark:disabled:to-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Analyze with Gemini
            </>
          )}
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 min-h-[10rem] flex items-center justify-center">
        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
             <p className="font-medium text-lg">AI is analyzing your data...</p>
             <p className="text-sm">Uncovering insights, this may take a moment.</p>
          </div>
        ) : analysisResult ? (
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg w-full">
            <AnalysisContent content={analysisResult} />
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            <p className="font-medium">Ready for Insights?</p>
            <p>Click "Analyze with Gemini" to get an AI-powered summary of your data.</p>
          </div>
        )}
      </div>
    </div>
  );
};
