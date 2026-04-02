import React, { useState } from 'react';
import Editor from './components/Editor';
import FavoritesSection from './components/FavoritesSection';
import LearningPathsSection from './components/LearningPathsSection';
import TrendingSection from './components/TrendingSection';
import { BookmarkIcon, MapIcon, FireIcon } from './components/Icons';
import { AppTab } from './types';

const NAV_ITEMS: { id: AppTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'editor',
    label: 'AI 图像编辑',
    icon: <span className="text-lg">🎨</span>,
  },
  {
    id: 'favorites',
    label: '我的收藏',
    icon: <BookmarkIcon className="w-4 h-4" />,
  },
  {
    id: 'paths',
    label: '学习路线',
    icon: <MapIcon className="w-4 h-4" />,
  },
  {
    id: 'trending',
    label: '热门精选',
    icon: <FireIcon className="w-4 h-4" />,
  },
];

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('editor');

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-brand-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-100">NanoCanvas</span>
            </div>

            {/* Tab navigation */}
            <div className="hidden sm:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-brand-500/20 text-brand-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://ai.google.dev/gemini-api/docs/models/gemini-v2"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-400 hover:text-brand-400 transition-colors hidden sm:block"
              >
                Docs
              </a>
              <div className="h-4 w-[1px] bg-slate-700 hidden sm:block"></div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">Gemini 2.5 Flash</span>
            </div>
          </div>

          {/* Mobile tab nav */}
          <div className="flex sm:hidden items-center gap-1 pb-2 overflow-x-auto">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                  activeTab === item.id
                    ? 'bg-brand-500/20 text-brand-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        {activeTab === 'editor' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="text-center mb-10">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500 mb-4">
                Edit Images with Words
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Upload an image and describe the changes you want. Whether it&apos;s adding objects, changing styles,
                or fixing details, <span className="text-brand-400">Nano Banana</span> handles it instantly.
              </p>
            </div>
            <Editor />
          </div>
        )}

        {activeTab === 'favorites' && <FavoritesSection />}
        {activeTab === 'paths' && <LearningPathsSection />}
        {activeTab === 'trending' && <TrendingSection />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} NanoCanvas. Built with React, Tailwind & Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;