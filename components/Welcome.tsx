import React from 'react';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { TableIcon } from './icons/TableIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';

export const Welcome: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 text-center transition-colors duration-500">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">Welcome to the ERP System</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Unlock insights from your business data. Simply upload a CSV or Excel file to get started.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-slate-50/70 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 mb-4">
                        <TableIcon className="h-6 w-6"/>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">View & Sort</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                        Instantly view your uploaded data in a clean, sortable, and searchable table.
                    </p>
                </div>
                 <div className="bg-slate-50/70 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 hover:scale-105 transition-all duration-300">
                     <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 mb-4">
                       <ChartBarIcon className="h-6 w-6"/>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analyze Trends</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                        Let Gemini analyze your data to uncover hidden trends, patterns, and key metrics.
                    </p>
                </div>
                 <div className="bg-slate-50/70 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 mb-4">
                        <LightBulbIcon className="h-6 w-6"/>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Get Insights</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                        Receive actionable recommendations to help you make smarter business decisions.
                    </p>
                </div>
            </div>
        </div>
    );
}