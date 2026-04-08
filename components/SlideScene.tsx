import React from 'react';
import { Scene, Agent } from '../types';

interface SlideSceneProps {
  scene: Scene;
  agents: Agent[];
}

const SlideScene: React.FC<SlideSceneProps> = ({ scene, agents }) => {
  const teacher = agents.find(a => a.role === 'teacher');
  const content = scene.slideContent!;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Slide Card */}
      <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8 shadow-2xl flex flex-col gap-6">
        {/* Slide header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-brand-500 to-purple-500" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">{content.title}</h2>
        </div>

        {/* Bullet points */}
        <ul className="flex flex-col gap-4 flex-1">
          {content.points.map((point, idx) => (
            <li key={idx} className="flex items-start gap-3 group">
              <span className="mt-1.5 w-5 h-5 flex-shrink-0 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold">
                {idx + 1}
              </span>
              <span className="text-slate-200 text-base sm:text-lg leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Teacher note */}
      {content.teacherNote && teacher && (
        <div className="flex items-start gap-3 bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <div className={`w-9 h-9 flex-shrink-0 ${teacher.color} rounded-full flex items-center justify-center text-lg shadow`}>
            <span role="img" aria-label={teacher.name}>{teacher.avatar}</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">{teacher.name} says</p>
            <p className="text-slate-300 text-sm leading-relaxed italic">"{content.teacherNote}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlideScene;
