import React, { useEffect, useState } from 'react';
import { useComponentStore } from '../store/componentStore';
import { Plus, Package, Box, Database } from 'lucide-react';

export const ComponentDesignView: React.FC = () => {
    const { packages, classes, daos, loadAll, addPackage, addClass, addDAO, isLoading } = useComponentStore();
    const [activeTab, setActiveTab] = useState<'packages' | 'classes' | 'daos'>('packages');

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleAdd = async () => {
        const name = prompt(`Enter ${activeTab} name:`);
        if (!name) return;

        if (activeTab === 'packages') {
            await addPackage(name);
        } else if (activeTab === 'classes') {
            await addClass(name);
        } else if (activeTab === 'daos') {
            await addDAO(name);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 font-bold text-lg">Component Design</div>
                <nav className="flex-1 p-2 space-y-1">
                    <button
                        onClick={() => setActiveTab('packages')}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'packages' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <Package className="mr-3 h-5 w-5" />
                        Packages
                    </button>
                    <button
                        onClick={() => setActiveTab('classes')}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'classes' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <Box className="mr-3 h-5 w-5" />
                        Classes
                    </button>
                    <button
                        onClick={() => setActiveTab('daos')}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'daos' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                        <Database className="mr-3 h-5 w-5" />
                        DAOs
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-gray-800 capitalize">{activeTab}</h1>
                    <button
                        onClick={handleAdd}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add {activeTab.slice(0, -1)}
                    </button>
                </header>

                <main className="flex-1 overflow-auto p-6">
                    {isLoading ? (
                        <div className="text-center text-gray-500">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {activeTab === 'packages' && packages.map(pkg => (
                                <div key={pkg.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-4">
                                    <h3 className="text-lg font-medium text-gray-900">{pkg.name}</h3>
                                    <p className="mt-1 text-sm text-gray-500">{pkg.description || 'No description'}</p>
                                </div>
                            ))}
                            {activeTab === 'classes' && classes.map(cls => (
                                <div key={cls.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-4">
                                    <h3 className="text-lg font-medium text-gray-900">{cls.name}</h3>
                                    <p className="mt-1 text-sm text-gray-500">{cls.stereotype ? `<<${cls.stereotype}>>` : ''}</p>
                                    <p className="mt-1 text-sm text-gray-500">{cls.description || 'No description'}</p>
                                </div>
                            ))}
                            {activeTab === 'daos' && daos.map(dao => (
                                <div key={dao.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-4">
                                    <h3 className="text-lg font-medium text-gray-900">{dao.name}</h3>
                                    <p className="mt-1 text-sm text-gray-500">{dao.description || 'No description'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
