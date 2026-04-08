import React, { useState } from 'react';
import { Scene, Agent } from '../types';

interface QuizSceneProps {
  scene: Scene;
  agents: Agent[];
}

const QuizScene: React.FC<QuizSceneProps> = ({ scene, agents }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const quiz = scene.quiz!;
  const teacher = agents.find(a => a.role === 'teacher');

  const isCorrect = selected === quiz.correctIndex;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Quiz Card */}
      <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-700">
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Knowledge Check</h2>
        </div>

        {/* Question */}
        <p className="text-slate-100 text-lg sm:text-xl font-medium leading-relaxed">{quiz.question}</p>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {quiz.options.map((option, idx) => {
            let style =
              'border border-slate-600 bg-slate-800/60 text-slate-200 hover:bg-slate-700/60 hover:border-slate-500';

            if (selected !== null) {
              if (idx === quiz.correctIndex) {
                style = 'border border-green-500 bg-green-500/20 text-green-300';
              } else if (idx === selected && selected !== quiz.correctIndex) {
                style = 'border border-red-500 bg-red-500/20 text-red-300';
              } else {
                style = 'border border-slate-700 bg-slate-900/40 text-slate-500';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => selected === null && setSelected(idx)}
                disabled={selected !== null}
                className={`
                  w-full text-left px-5 py-4 rounded-xl transition-all text-sm sm:text-base font-medium
                  ${style}
                  ${selected === null ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                <span className="font-bold mr-3 text-slate-400">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Result */}
        {selected !== null && (
          <div
            className={`rounded-xl p-4 border ${
              isCorrect
                ? 'bg-green-500/10 border-green-500/40 text-green-300'
                : 'bg-red-500/10 border-red-500/40 text-red-300'
            }`}
          >
            <p className="font-bold mb-1">{isCorrect ? '✅ Correct!' : '❌ Not quite.'}</p>
            <p className="text-sm leading-relaxed opacity-90">{quiz.explanation}</p>
          </div>
        )}
      </div>

      {/* Teacher hint */}
      {teacher && selected === null && (
        <div className="flex items-start gap-3 bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <div className={`w-9 h-9 flex-shrink-0 ${teacher.color} rounded-full flex items-center justify-center text-lg shadow`}>
            <span role="img" aria-label={teacher.name}>{teacher.avatar}</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1 font-medium">{teacher.name} says</p>
            <p className="text-slate-300 text-sm italic">
              "Take your time — read every option carefully before choosing."
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizScene;
