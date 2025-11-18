import React, { useState, useMemo } from 'react';
import type { DataRow, SortConfig } from '../types';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { Squares2X2Icon } from './icons/Squares2X2Icon';
import { TableIcon } from './icons/TableIcon';

interface DataTableProps {
  headers: string[];
  data: DataRow[];
  onViewChange: (mode: 'table' | 'grid') => void;
}

const ITEMS_PER_PAGE = 15;

export const DataTable: React.FC<DataTableProps> = ({ headers, data, onViewChange }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filter, setFilter] = useState('');

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

  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage]);
  
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };
  
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
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-56 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            <div className="flex items-center self-end sm:self-center p-1 bg-gray-100 dark:bg-slate-900/50 rounded-lg">
                <button
                    onClick={() => onViewChange('table')}
                    className="p-1.5 rounded-md text-white bg-blue-600 shadow"
                    aria-label="Table view"
                    title="Table view"
                >
                    <TableIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onViewChange('grid')}
                    className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600/50 transition"
                    aria-label="Grid view"
                    title="Grid view"
                >
                    <Squares2X2Icon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-700">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="px-6 py-3 whitespace-nowrap">
                  <div
                    className="flex items-center cursor-pointer select-none group"
                    onClick={() => requestSort(header)}
                  >
                    <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{header}</span>
                    {sortConfig?.key === header ? (
                      <span className="ml-1 text-blue-600 dark:text-blue-400">
                        {sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-3 h-3"/> : <ArrowDownIcon className="w-3 h-3"/>}
                      </span>
                    ) : <span className="ml-1 text-gray-300 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors"><ArrowDownIcon className="w-3 h-3"/></span> }
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                {headers.map((header) => (
                  <td key={`${rowIndex}-${header}`} className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">
                    {row[header]?.toString() ?? <span className="text-gray-400 dark:text-gray-500">N/A</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {paginatedData.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-gray-400">No matching data found.</div>}
       {totalPages > 1 && (
         <div className="flex flex-col sm:flex-row justify-between items-center pt-4">
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