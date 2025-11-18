import React from 'react';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon';

interface PlaceholderPageProps {
    title: string;
    icon: React.ReactNode;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, icon }) => {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-slate-800/50 p-8 rounded-xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 text-center flex flex-col items-center justify-center min-h-[60vh] transition-colors duration-500">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 mb-6">
                    {icon}
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">{title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    This feature is currently under construction. Check back soon for exciting updates!
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <WrenchScrewdriverIcon className="w-5 h-5 mr-2" />
                    <span>Development in Progress</span>
                </div>
            </div>
        </div>
    );
};