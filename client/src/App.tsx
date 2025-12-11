import { useState } from 'react';
import { Editor } from './features/editor/Editor';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ComponentDesignView } from './views/ComponentDesignView';
import { Layout, GitGraph } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'sequence' | 'component'>('sequence');

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col">
        <nav className="bg-gray-800 text-white p-4 flex items-center space-x-6">
          <div className="font-bold text-xl mr-4">AI Refiner</div>
          <button
            onClick={() => setCurrentView('sequence')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md ${currentView === 'sequence' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
          >
            <GitGraph size={20} />
            <span>Sequence Diagram</span>
          </button>
          <button
            onClick={() => setCurrentView('component')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md ${currentView === 'component' ? 'bg-gray-900' : 'hover:bg-gray-700'}`}
          >
            <Layout size={20} />
            <span>Component Design</span>
          </button>
        </nav>

        <div className="flex-1 overflow-hidden">
          {currentView === 'sequence' ? <Editor /> : <ComponentDesignView />}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
