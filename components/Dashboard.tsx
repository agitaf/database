import React, { useState, useCallback, useMemo } from 'react';
import { FileUpload } from './FileUpload';
import { DataTable } from './DataTable';
import { AnalysisPanel } from './AnalysisPanel';
import { Welcome } from './Welcome';
import { ProductGrid } from './ProductGrid';
import { AgentContextModal } from './AgentContextModal';
import type { DataRow, AnalysisResult, ChatMessage, TodoItem, SortConfig, DataContext } from '../types';
import { analyzeDataWithGemini, continueChat } from '../services/geminiService';

declare const Papa: any;
declare const XLSX: any;

export const Dashboard: React.FC = () => {
    const [data, setData] = useState<DataRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isChatting, setIsChatting] = useState<boolean>(false);
    const [todos, setTodos] = useState<TodoItem[]>([]);
    
    // State lifted for Agent Context
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [filter, setFilter] = useState('');
    const [isContextModalOpen, setIsContextModalOpen] = useState(false);
    const [dataContext, setDataContext] = useState<DataContext | null>(null);

    const resetState = () => {
        setData([]);
        setHeaders([]);
        setFileName('');
        setError(null);
        setAnalysis(null);
        setIsAnalyzing(false);
        setViewMode('table');
        setChatHistory([]);
        setIsChatting(false);
        setTodos([]);
        setFilter('');
        setSortConfig(null);
    };

    const handleFile = useCallback((file: File) => {
        resetState();
        setFileName(file.name);
        setError(null);

        const reader = new FileReader();

        reader.onload = (event) => {
            if (!event.target?.result) {
                setError("Failed to read file.");
                return;
            }

            try {
                if (file.name.endsWith('.csv')) {
                    Papa.parse(event.target.result as string, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results: { data: DataRow[], errors: any[], meta: any }) => {
                           if (results.errors.length > 0) {
                                setError(`Error parsing CSV: ${results.errors[0].message}`);
                                return;
                            }
                            if (results.data.length > 0) {
                                setHeaders(Object.keys(results.data[0]));
                                setData(results.data);
                            } else {
                                setError("CSV file is empty or has no data rows.");
                            }
                        }
                    });
                } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    const workbook = XLSX.read(event.target.result, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    if (jsonData.length < 2) {
                        setError("Excel file needs a header row and at least one data row.");
                        return;
                    }
                    
                    const headerRow = jsonData[0] as string[];
                    const dataRows = jsonData.slice(1).map((row: any[]) => {
                        const rowData: DataRow = {};
                        headerRow.forEach((header, index) => {
                            rowData[header] = row[index];
                        });
                        return rowData;
                    });

                    setHeaders(headerRow);
                    setData(dataRows);
                } else {
                    setError("Unsupported file type. Please upload a CSV or Excel file.");
                }
            } catch (err) {
                 setError("An unexpected error occurred while parsing the file.");
                 console.error(err);
            }
        };

        reader.onerror = () => {
             setError("Failed to read the file. Please try again.");
        }

        if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            reader.readAsBinaryString(file);
        }

    }, []);

    const handleAnalyze = async () => {
        if (data.length === 0) {
            setError("No data available to analyze.");
            return;
        }
        setIsAnalyzing(true);
        setAnalysis(null);
        setChatHistory([]);
        setTodos([]);
        setError(null);

        try {
            const result = await analyzeDataWithGemini(data, headers);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || !analysis) return;

        const newUserMessage: ChatMessage = { role: 'user', text: message };
        const updatedHistory = [...chatHistory, newUserMessage];
        
        setChatHistory(updatedHistory);
        setIsChatting(true);
        setError(null);

        try {
            const modelResponse = await continueChat(data, headers, analysis, updatedHistory);
            const newModelMessage: ChatMessage = { role: 'model', text: modelResponse };
            setChatHistory([...updatedHistory, newModelMessage]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during chat.");
            setChatHistory(chatHistory); // Revert history on error
        } finally {
            setIsChatting(false);
        }
    };

    const addTodo = (text: string) => {
        if (!text.trim()) return;
        setTodos([...todos, { id: Date.now().toString(), text, completed: false }]);
    };
    
    const toggleTodo = (id: string) => {
        setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    };

    const removeTodo = (id: string) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const handleSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredData = useMemo(() => {
        if (!filter) return data;
        return data.filter(row =>
          Object.values(row).some(value =>
            String(value).toLowerCase().includes(filter.toLowerCase())
          )
        );
    }, [data, filter]);
    
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
          sortableItems.sort((a, b) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];
            
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;
            
            if (valA < valB) {
              return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (valA > valB) {
              return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
          });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const generateDataContext = () => {
        const context: DataContext = {
          schema: headers,
          viewSettings: {
            filterQuery: filter,
            sortConfig: sortConfig,
            viewMode: viewMode,
          },
          dataSnapshot: sortedData,
          initialAnalysis: analysis,
        };
        setDataContext(context);
        setIsContextModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <AgentContextModal 
                isOpen={isContextModalOpen}
                onClose={() => setIsContextModalOpen(false)}
                context={dataContext}
            />
            <FileUpload onFileSelect={handleFile} onClear={resetState} fileName={fileName} />
            
            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-lg shadow-md" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            
            {data.length > 0 && headers.length > 0 ? (
                <div className="space-y-8">
                    <AnalysisPanel
                        onAnalyze={handleAnalyze}
                        analysisResult={analysis}
                        isLoading={isAnalyzing}
                        hasData={data.length > 0}
                        chatHistory={chatHistory}
                        isChatting={isChatting}
                        onSendMessage={handleSendMessage}
                        todos={todos}
                        onAddTodo={addTodo}
                        onToggleTodo={toggleTodo}
                        onRemoveTodo={removeTodo}
                    />
                    {viewMode === 'table' ? (
                        <DataTable 
                            headers={headers} 
                            data={sortedData} 
                            onViewChange={setViewMode}
                            filter={filter}
                            onFilterChange={setFilter}
                            sortConfig={sortConfig}
                            onSortChange={handleSort}
                            onGenerateContext={generateDataContext}
                        />
                    ) : (
                        <ProductGrid 
                            headers={headers} 
                            data={sortedData} 
                            onViewChange={setViewMode}
                            filter={filter}
                            onFilterChange={setFilter}
                            onGenerateContext={generateDataContext}
                        />
                    )}
                </div>
            ) : (
               !fileName && <Welcome />
            )}
        </div>
    );
};