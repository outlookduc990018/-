import React, { useState } from 'react';

interface ClassroomGeneratorProps {
  onGenerate: (topic: string) => void;
  isGenerating: boolean;
}

const EXAMPLE_TOPICS = [
  "Quantum Entanglement",
  "The French Revolution",
  "How Neural Networks Learn",
  "Photosynthesis",
  "Game Theory Basics",
  "Black Holes",
];

const ClassroomGenerator: React.FC<ClassroomGeneratorProps> = ({ onGenerate, isGenerating }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isGenerating) {
      onGenerate(topic.trim());
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-12 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-brand-500/10 text-brand-400 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border border-brand-500/20 mb-6">
          🎓 Multi-Agent Interactive Classroom
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 mb-5 leading-tight">
          Learn Anything,<br />Taught by AI
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
          Describe a topic and OpenMAIC generates an immersive classroom — with AI teachers,
          AI classmates, slides, quizzes, and live discussion.
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 shadow-2xl shadow-black/30 backdrop-blur">
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="What do you want to learn today?"
            className="flex-1 bg-transparent text-white placeholder-slate-500 px-4 py-3 outline-none text-base"
            disabled={isGenerating}
            autoFocus
          />
          <button
            type="submit"
            disabled={!topic.trim() || isGenerating}
            className={`
              flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-base transition-all
              ${!topic.trim() || isGenerating
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-lg shadow-brand-600/25 active:scale-95'}
            `}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <span>🚀</span> Generate
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example topics */}
      <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-xl">
        <span className="text-xs text-slate-500 w-full text-center mb-1">Try an example:</span>
        {EXAMPLE_TOPICS.map(t => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            disabled={isGenerating}
            className="text-xs bg-slate-800/70 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-full border border-slate-700/50 transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Feature pills */}
      <div className="mt-16 flex flex-wrap justify-center gap-3 max-w-2xl">
        {[
          { icon: '🤖', label: 'AI Teacher & Classmates' },
          { icon: '📊', label: 'Auto-generated Slides' },
          { icon: '🧪', label: 'Interactive Quizzes' },
          { icon: '💬', label: 'Live Agent Discussion' },
          { icon: '⚡', label: 'Powered by Gemini' },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-2 bg-slate-800/40 border border-slate-700/30 px-4 py-2 rounded-full text-sm text-slate-400">
            <span>{f.icon}</span> {f.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassroomGenerator;
