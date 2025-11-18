import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PlaceholderPage } from './components/PlaceholderPage';
import { ArchiveBoxIcon } from './components/icons/ArchiveBoxIcon';
import { ShoppingCartIcon } from './components/icons/ShoppingCartIcon';
import { UsersIcon } from './components/icons/UsersIcon';
import { Cog6ToothIcon } from './components/icons/Cog6ToothIcon';

export type View = 'dashboard' | 'inventory' | 'orders' | 'customers' | 'settings';

const App: React.FC = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const renderActiveView = () => {
        switch(activeView) {
            case 'dashboard':
                return <Dashboard />;
            case 'inventory':
                return <PlaceholderPage title="Inventory Management" icon={<ArchiveBoxIcon className="w-12 h-12" />} />;
            case 'orders':
                return <PlaceholderPage title="Order Tracking" icon={<ShoppingCartIcon className="w-12 h-12" />} />;
            case 'customers':
                return <PlaceholderPage title="Customer Relations" icon={<UsersIcon className="w-12 h-12" />} />;
            case 'settings':
                return <PlaceholderPage title="Application Settings" icon={<Cog6ToothIcon className="w-12 h-12" />} />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200">
            <Sidebar 
                activeView={activeView} 
                setActiveView={setActiveView} 
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <div className="lg:pl-64 transition-all duration-300 ease-in-out">
                <Header 
                    theme={theme} 
                    toggleTheme={toggleTheme} 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <main className="p-4 sm:p-6 md:p-8">
                    {renderActiveView()}
                </main>
            </div>
        </div>
    );
};

export default App;