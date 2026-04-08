import React from 'react';
import { Scene, Agent, AgentMessage } from '../types';
import AgentAvatar from './AgentAvatar';

interface DiscussionSceneProps {
  scene: Scene;
  agents: Agent[];
}

const DiscussionScene: React.FC<DiscussionSceneProps> = ({ scene, agents }) => {
  const getAgent = (id: string): Agent | undefined => agents.find(a => a.id === id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-700 mb-6">
        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-teal-400 to-cyan-500" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Open Discussion</h2>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1">
        {scene.messages.map((msg: AgentMessage, idx: number) => {
          const agent = getAgent(msg.agentId);
          if (!agent) return null;
          const isTeacher = agent.role === 'teacher';

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isTeacher ? '' : 'flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <AgentAvatar agent={agent} size="sm" />
              </div>

              {/* Bubble */}
              <div
                className={`
                  max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow
                  ${isTeacher
                    ? 'bg-violet-600/20 border border-violet-500/30 text-slate-200 rounded-tl-sm'
                    : 'bg-slate-700/60 border border-slate-600/40 text-slate-200 rounded-tr-sm'
                  }
                `}
              >
                <p className="text-xs font-semibold mb-1 opacity-70">{agent.name}</p>
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiscussionScene;
