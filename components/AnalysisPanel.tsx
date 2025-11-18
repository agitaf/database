import React, { useState, useRef, useEffect } from 'react';
import type { AnalysisResult, ChatMessage, TodoItem } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { PresentationChartBarIcon } from './icons/PresentationChartBarIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { TableIcon } from './icons/TableIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';


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

const AnalysisContent: React.FC<{ content: AnalysisResult, onAddTodo: (text: string) => void }> = ({ content, onAddTodo }) => {
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
                    <ul className="pl-9 space-y-2 text-gray-600 dark:text-gray-300">
                        {content.actionableRecommendations.map((rec, i) => (
                            <li key={i} className="flex justify-between items-center group">
                                <span>{rec}</span>
                                <button 
                                    onClick={() => onAddTodo(rec)} 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    title="Add to to-do list"
                                >
                                    <PlusCircleIcon className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const ChatInterface: React.FC<{ 
    history: ChatMessage[]; 
    isChatting: boolean; 
    onSendMessage: (message: string) => void; 
}> = ({ history, isChatting, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [history, isChatting]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                Chat with your Data
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg w-full">
                <div className="h-64 overflow-y-auto space-y-4 pr-2">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isChatting && (
                         <div className="flex justify-start">
                             <div className="max-w-md p-3 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                </div>
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="mt-3 flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a follow-up question..."
                        disabled={isChatting}
                        className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:bg-gray-100 dark:disabled:bg-slate-600"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isChatting || !input.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        aria-label="Send message"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const TodoList: React.FC<{ 
    todos: TodoItem[],
    onAddTodo: (text: string) => void,
    onToggleTodo: (id: string) => void,
    onRemoveTodo: (id: string) => void,
}> = ({ todos, onAddTodo, onToggleTodo, onRemoveTodo }) => {
    const [input, setInput] = useState('');

    const handleAdd = () => {
        onAddTodo(input);
        setInput('');
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleAdd();
    };

    return (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                <ClipboardDocumentListIcon className="h-6 w-6 mr-3 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                Action Items
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg w-full">
                <div className="flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a new action item..."
                        className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!input.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        aria-label="Add to-do"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="mt-3 space-y-2">
                    {todos.length === 0 ? (
                        <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-2">No action items yet.</p>
                    ) : (
                        todos.map(todo => (
                            <div key={todo.id} className="flex items-center justify-between bg-white dark:bg-slate-700 p-2 rounded-md group">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={todo.completed} 
                                        onChange={() => onToggleTodo(todo.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className={`text-sm text-gray-800 dark:text-gray-200 ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                                        {todo.text}
                                    </span>
                                </label>
                                <button onClick={() => onRemoveTodo(todo.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

interface AnalysisPanelProps {
  onAnalyze: () => void;
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
  hasData: boolean;
  chatHistory: ChatMessage[];
  isChatting: boolean;
  onSendMessage: (message: string) => void;
  todos: TodoItem[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onRemoveTodo: (id: string) => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ 
    onAnalyze, 
    analysisResult, 
    isLoading, 
    hasData,
    chatHistory,
    isChatting,
    onSendMessage,
    todos,
    onAddTodo,
    onToggleTodo,
    onRemoveTodo
}) => {
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
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="min-h-[10rem] flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
             <div>
               <p className="font-medium text-lg">AI is analyzing your data...</p>
               <p className="text-sm">Uncovering insights, this may take a moment.</p>
             </div>
          </div>
        ) : analysisResult ? (
          <div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg w-full">
              <AnalysisContent content={analysisResult} onAddTodo={onAddTodo} />
            </div>
             <TodoList 
                todos={todos}
                onAddTodo={onAddTodo}
                onToggleTodo={onToggleTodo}
                onRemoveTodo={onRemoveTodo}
             />
            <ChatInterface 
              history={chatHistory} 
              isChatting={isChatting} 
              onSendMessage={onSendMessage} 
            />
          </div>
        ) : (
          <div className="min-h-[10rem] flex items-center justify-center text-center text-gray-500 dark:text-gray-400 py-4">
            <div>
              <p className="font-medium">Ready for Insights?</p>
              <p>Click "Analyze with Gemini" to get an AI-powered summary of your data.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};