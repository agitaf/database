import React, { useState, useEffect } from 'react';
import type { DataContext } from '../types';
import { XCircleIcon } from './icons/XCircleIcon';
import { CpuChipIcon } from './icons/CpuChipIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface AgentContextModalProps {
    isOpen: boolean;
    onClose: () => void;
    context: DataContext | null;
}

export const AgentContextModal: React.FC<AgentContextModalProps> = ({ isOpen, onClose, context }) => {
    const [copyText, setCopyText] = useState('Copy');
    const [jsonString, setJsonString] = useState('');

    useEffect(() => {
        if (context) {
            try {
                setJsonString(JSON.stringify(context, null, 2));
            } catch (error) {
                console.error("Failed to stringify context:", error);
                setJsonString("Error: Could not display context data.");
            }
        }
    }, [context]);

    useEffect(() => {
        if (!isOpen) {
            // Reset copy button text after the closing animation
            const timer = setTimeout(() => setCopyText('Copy'), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleCopy = () => {
        if (jsonString) {
            navigator.clipboard.writeText(jsonString).then(() => {
                setCopyText('Copied!');
                const timer = setTimeout(() => setCopyText('Copy'), 2000);
                return () => clearTimeout(timer);
            }, (err) => {
                console.error('Could not copy text: ', err);
                setCopyText('Failed');
            });
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <CpuChipIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            AI Agent Data Context
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Close modal">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 flex-grow">
                    <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                        <code>{jsonString}</code>
                    </pre>
                </div>
                <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <button 
                        onClick={handleCopy}
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <ClipboardIcon className="w-5 h-5 mr-2" />
                        {copyText}
                    </button>
                </div>
            </div>
            <style jsx>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};