import React, { useState, useMemo } from 'react';
import type { DataRow } from '../types';
import { Squares2X2Icon } from './icons/Squares2X2Icon';
import { TableIcon } from './icons/TableIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { CodeBracketSquareIcon } from './icons/CodeBracketSquareIcon';

interface ProductGridProps {
  headers: string[];
  data: DataRow[];
  onViewChange: (mode: 'table' | 'grid') => void;
  onGenerateContext: () => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

const ITEMS_PER_PAGE = 12;

const findKey = (headers: string[], keywords: string[]): string | undefined => 
  headers.find(header => keywords.some(kw => header.toLowerCase().replace(/_/g, ' ').includes(kw)));

const ProductCard: React.FC<{ row: DataRow; headers: string[] }> = ({ row, headers }) => {
  const imageKey = findKey(headers, ['image', 'img', 'picture', 'url']);
  const nameKey = findKey(headers, ['name', 'title', 'product']);
  const priceKey = findKey(headers, ['price', 'cost', 'amount']);
  const categoryKey = findKey(headers, ['category', 'type']);
  const stockKey = findKey(headers, ['stock', 'inventory', 'quantity']);

  const imageUrl = imageKey ? row[imageKey] : null;
  const name = nameKey ? row[nameKey] : 'Unnamed Product';
  const price = priceKey ? row[priceKey] : null;
  const category = categoryKey ? row[categoryKey] : null;
  const stock = stockKey ? row[stockKey] : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200/80 dark:border-gray-700/50 overflow-hidden group transform hover:-translate-y-1 transition-all duration-300">
      <div className="w-full h-48 bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden">
        {imageUrl && typeof imageUrl === 'string' && (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) ? (
          <img src={String(imageUrl)} alt={String(name)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <PhotoIcon className="w-16 h-16 text-gray-300 dark:text-gray-500" />
        )}
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
            {category && <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase mb-1">{String(category)}</p>}
            <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate" title={String(name)}>{String(name)}</h3>
        </div>
        <div className="flex items-center justify-between mt-3">
          {price !== null && !isNaN(parseFloat(String(price))) && <p className="text-lg font-semibold text-green-600 dark:text-green-400">${parseFloat(String(price)).toFixed(2)}</p>}
          {stock !== null && !isNaN(Number(stock)) && 
            <p className={`text-xs font-medium px-2 py-0.5 rounded-full ${Number(stock) > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : Number(stock) > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                {Number(stock) > 0 ? `${stock} in stock` : 'Out of stock'}
            </p>
          }
        </div>
      </div>
    </div>
  );
};


export const ProductGrid: React.FC<ProductGridProps> = ({ headers, data, onViewChange, onGenerateContext, filter, onFilterChange }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, data.length]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage]);
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 transition-colors duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">Data Preview</h2>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
             <button
                onClick={onGenerateContext}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                title="Generate AI Agent Context"
            >
                <CodeBracketSquareIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Agent Context</span>
            </button>
            <div className="flex items-center self-end sm:self-center p-1 bg-gray-100 dark:bg-slate-900/50 rounded-lg">
                <button
                    onClick={() => onViewChange('table')}
                    className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600/50 transition"
                    aria-label="Table view"
                    title="Table view"
                >
                    <TableIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onViewChange('grid')}
                    className="p-1.5 rounded-md text-white bg-blue-600 shadow"
                    aria-label="Grid view"
                    title="Grid view"
                >
                    <Squares2X2Icon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>

      {paginatedData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedData.map((row, index) => (
            <ProductCard key={index} row={row} headers={headers} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">No matching products found.</div>
      )}

       {totalPages > 1 && (
         <div className="flex flex-col sm:flex-row justify-between items-center pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-700 dark:text-gray-300 mb-2 sm:mb-0">
                Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
            </span>
            <div className="inline-flex mt-2 sm:mt-0 shadow-sm rounded-md">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-l-md hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-700 border-t border-b border-r border-gray-300 dark:border-slate-600 rounded-r-md hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed focus:z-10 focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Next
              </button>
            </div>
         </div>
       )}
    </div>
  );
};