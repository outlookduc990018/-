import React, { useState, useEffect } from 'react';
import { Classroom, Scene } from '../types';
import AgentAvatar from './AgentAvatar';
import SlideScene from './SlideScene';
import QuizScene from './QuizScene';
import DiscussionScene from './DiscussionScene';

interface ClassroomPlayerProps {
  classroom: Classroom;
  onExit: () => void;
}

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

const SCENE_TYPE_LABELS: Record<Scene['type'], string> = {
  slide: '🎓 Slide',
  quiz: '🧪 Quiz',
  discussion: '💬 Discussion',
};

const ClassroomPlayer: React.FC<ClassroomPlayerProps> = ({ classroom, onExit }) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [speakingAgentId, setSpeakingAgentId] = useState<string | null>(null);

  const scene = classroom.scenes[sceneIndex];
  const totalScenes = classroom.scenes.length;

  // Cycle through the speakers in the current scene's messages
  useEffect(() => {
    if (!scene.messages || scene.messages.length === 0) {
      setSpeakingAgentId(null);
      return;
    }

    let msgIdx = 0;
    setSpeakingAgentId(scene.messages[0]?.agentId ?? null);

    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % scene.messages.length;
      setSpeakingAgentId(scene.messages[msgIdx]?.agentId ?? null);
    }, 3000);

    return () => clearInterval(interval);
  }, [scene]);

  const goPrev = () => {
    if (sceneIndex > 0) setSceneIndex(i => i - 1);
  };
  const goNext = () => {
    if (sceneIndex < totalScenes - 1) setSceneIndex(i => i + 1);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onExit}
              className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
              title="Exit classroom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div className="w-px h-5 bg-slate-700 flex-shrink-0" />
            <span className="text-white font-semibold truncate">{classroom.topic}</span>
          </div>

          {/* Scene progress */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {classroom.scenes.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setSceneIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === sceneIndex ? 'bg-brand-400 w-5' : 'bg-slate-600 hover:bg-slate-400'
                }`}
                title={s.title}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex gap-6">

        {/* Left: agent panel */}
        <aside className="hidden lg:flex flex-col gap-6 w-28 flex-shrink-0 pt-2">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold text-center">Agents</p>
          {classroom.agents.map(agent => (
            <AgentAvatar
              key={agent.id}
              agent={agent}
              isSpeaking={speakingAgentId === agent.id}
              size="md"
            />
          ))}
        </aside>

        {/* Center: scene */}
        <main className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Scene type badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              {SCENE_TYPE_LABELS[scene.type]}
            </span>
            <span className="text-xs text-slate-500">
              {sceneIndex + 1} / {totalScenes}
            </span>
          </div>

          {/* Scene content */}
          <div className="flex-1">
            {scene.type === 'slide' && (
              <SlideScene scene={scene} agents={classroom.agents} />
            )}
            {scene.type === 'quiz' && (
              <QuizScene scene={scene} agents={classroom.agents} />
            )}
            {scene.type === 'discussion' && (
              <DiscussionScene scene={scene} agents={classroom.agents} />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={goPrev}
              disabled={sceneIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeftIcon /> Previous
            </button>

            <span className="text-slate-500 text-sm font-medium">{scene.title}</span>

            <button
              onClick={goNext}
              disabled={sceneIndex === totalScenes - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRightIcon />
            </button>
          </div>
        </main>

        {/* Right: discussion sidebar (messages for current scene) */}
        <aside className="hidden xl:flex flex-col w-64 flex-shrink-0 bg-slate-900/50 rounded-2xl border border-slate-800 p-4 gap-3 overflow-y-auto max-h-[calc(100vh-8rem)]">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Conversation</p>
          {scene.messages.map((msg, idx) => {
            const agent = classroom.agents.find(a => a.id === msg.agentId);
            if (!agent) return null;
            const isSpeaking = speakingAgentId === msg.agentId && idx === scene.messages.findIndex(m => m.agentId === speakingAgentId);
            return (
              <div key={idx} className={`flex items-start gap-2 transition-opacity ${isSpeaking ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`w-6 h-6 flex-shrink-0 ${agent.color} rounded-full flex items-center justify-center text-xs shadow`}>
                  <span role="img" aria-label={agent.name}>{agent.avatar}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-0.5">{agent.name}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );
          })}
        </aside>
      </div>
    </div>
  );
};

export default ClassroomPlayer;
