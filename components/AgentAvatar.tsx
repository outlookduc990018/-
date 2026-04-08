import React from 'react';
import { Agent } from '../types';

interface AgentAvatarProps {
  agent: Agent;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({ agent, isSpeaking = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };
  const labelClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <div
          className={`
            ${sizeClasses[size]} ${agent.color}
            rounded-full flex items-center justify-center shadow-lg
            transition-all duration-300
            ${isSpeaking ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''}
          `}
        >
          <span role="img" aria-label={agent.name}>{agent.avatar}</span>
        </div>
        {isSpeaking && (
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse" />
        )}
      </div>
      <span className={`${labelClasses[size]} text-slate-300 font-medium text-center leading-tight max-w-[60px] truncate`}>
        {agent.name}
      </span>
      <span className={`${labelClasses[size]} text-slate-500 capitalize`}>
        {agent.role}
      </span>
    </div>
  );
};

export default AgentAvatar;
