import React, { useState } from 'react';
import { Classroom, AppView } from './types';
import { generateClassroom } from './services/classroomService';
import ClassroomGenerator from './components/ClassroomGenerator';
import ClassroomPlayer from './components/ClassroomPlayer';

function App() {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (topic: string) => {
    setView(AppView.GENERATING);
    setError(null);
    try {
      const result = await generateClassroom(topic);
      setClassroom(result);
      setView(AppView.CLASSROOM);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to generate classroom. Please try again.');
      setView(AppView.HOME);
    }
  };

  const handleExit = () => {
    setClassroom(null);
    setView(AppView.HOME);
    setError(null);
  };

  // Classroom view takes over the full page
  if (view === AppView.CLASSROOM && classroom) {
    return <ClassroomPlayer classroom={classroom} onExit={handleExit} />;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-brand-500/30 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-100">OpenMAIC</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                Gemini 2.0 Flash
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/30 text-red-400 px-4 py-3 text-sm text-center">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline hover:text-red-300">Dismiss</button>
        </div>
      )}

      {/* Main */}
      <main className="flex-1">
        <ClassroomGenerator
          onGenerate={handleGenerate}
          isGenerating={view === AppView.GENERATING}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} OpenMAIC — Open Multi-Agent Interactive Classroom.
            Powered by React &amp; Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;