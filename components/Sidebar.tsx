import React from 'react';
import type { View } from '../App';
import { HomeIcon } from './icons/HomeIcon';
import { ArchiveBoxIcon } from './icons/ArchiveBoxIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { UsersIcon } from './icons/UsersIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="w-6 h-6" /> },
    { id: 'inventory', label: 'Inventory', icon: <ArchiveBoxIcon className="w-6 h-6" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingCartIcon className="w-6 h-6" /> },
    { id: 'customers', label: 'Customers', icon: <UsersIcon className="w-6 h-6" /> },
    { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon className="w-6 h-6" /> },
] as const;


export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
    
    const handleNavClick = (view: View) => {
        setActiveView(view);
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };
    
    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black/60 z-20 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>
            
            <aside className={`fixed top-0 left-0 w-64 h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700 z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between h-[73px] px-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-lg font-bold text-gray-800 dark:text-white">Navigation</h1>
                     <button 
                        onClick={() => setIsOpen(false)} 
                        className="lg:hidden text-gray-500 dark:text-gray-400 p-1 -mr-2"
                        aria-label="Close sidebar"
                     >
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <li key={item.id}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick(item.id);
                                    }}
                                    className={`flex items-center space-x-3 p-3 rounded-lg font-medium transition-colors duration-200 ${
                                        activeView === item.id 
                                            ? 'bg-blue-600 text-white shadow-md' 
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};