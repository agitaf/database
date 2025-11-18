import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataTable } from './components/DataTable';
import { AnalysisPanel } from './components/AnalysisPanel';
import { Header } from './components/Header';
import { Welcome } from './components/Welcome';
import { ProductGrid } from './components/ProductGrid';
import type { DataRow, AnalysisResult } from './types';
import { analyzeDataWithGemini } from './services/geminiService';

declare const Papa: any;
declare const XLSX: any;

const App: React.FC = () => {
    const [data, setData] = useState<DataRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const resetState = () => {
        setData([]);
        setHeaders([]);
        setFileName('');
        setError(null);
        setAnalysis(null);
        setIsAnalyzing(false);
        setViewMode('table');
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-slate-900 dark:to-gray-800 text-gray-800 dark:text-gray-200 transition-colors duration-500">
            <Header theme={theme} toggleTheme={toggleTheme} />
            <main className="p-4 sm:p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
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
                            />
                            {viewMode === 'table' ? (
                                <DataTable headers={headers} data={data} onViewChange={setViewMode} />
                            ) : (
                                <ProductGrid headers={headers} data={data} onViewChange={setViewMode} />
                            )}
                        </div>
                    ) : (
                       !fileName && <Welcome />
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;