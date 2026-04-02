import React, { useState, useEffect } from 'react';
import { LearningPath, LearningPathNode } from '../types';
import { MapIcon, ClipboardIcon, CheckIcon, LinkIcon, StarIcon, UserGroupIcon } from './Icons';
import { sanitizeUrl } from './sanitizeUrl';

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_PATHS: LearningPath[] = [
  {
    id: 'path-fe',
    title: '前端开发从零到就业',
    description: '从 HTML/CSS 基础出发，逐步掌握 JavaScript、React，最终具备独立开发项目的能力',
    author: '官方编辑团队',
    isOfficial: true,
    copiedCount: 3420,
    nodes: [
      {
        id: 'n1', week: 1, title: 'HTML & CSS 基础',
        description: '学习网页结构与样式，完成第一个静态页面',
        resourceUrl: 'https://www.freecodecamp.org/learn/responsive-web-design/',
        resourceLabel: 'freeCodeCamp - 响应式网页设计',
        completed: false,
      },
      {
        id: 'n2', week: 2, title: 'JavaScript 入门',
        description: '掌握变量、函数、DOM 操作等核心概念',
        resourceUrl: 'https://javascript.info',
        resourceLabel: 'javascript.info - 现代 JS 教程',
        completed: false,
      },
      {
        id: 'n3', week: 4, title: 'JS 算法与数据结构',
        description: '刷 LeetCode Easy 题，培养编程思维',
        resourceUrl: 'https://leetcode.com/problemset/?difficulty=EASY',
        resourceLabel: 'LeetCode - Easy 题库',
        completed: false,
      },
      {
        id: 'n4', week: 6, title: 'React 框架',
        description: '学习组件化开发、状态管理、Hooks',
        resourceUrl: 'https://react.dev/learn',
        resourceLabel: 'React 官方文档',
        completed: false,
      },
      {
        id: 'n5', week: 8, title: '项目实战',
        description: '独立完成一个全栈 Todo 应用并部署上线',
        resourceUrl: 'https://roadmap.sh/projects',
        resourceLabel: 'Roadmap.sh - 项目挑战',
        completed: false,
      },
    ],
  },
  {
    id: 'path-algo',
    title: '算法面试突击计划（6 周）',
    description: '针对大厂技术面试的算法强化训练，覆盖高频考点',
    author: '社区高级用户 @codeMaster',
    isOfficial: false,
    copiedCount: 1180,
    nodes: [
      {
        id: 'a1', week: 1, title: '数组与双指针',
        description: '掌握滑动窗口、双指针经典模式',
        resourceUrl: 'https://leetcode.com/tag/two-pointers/',
        resourceLabel: 'LeetCode - 双指针专题',
        completed: false,
      },
      {
        id: 'a2', week: 2, title: '链表',
        description: '反转、合并、环检测等链表核心题型',
        resourceUrl: 'https://leetcode.com/tag/linked-list/',
        resourceLabel: 'LeetCode - 链表专题',
        completed: false,
      },
      {
        id: 'a3', week: 3, title: '树与递归',
        description: 'BFS/DFS、二叉搜索树、路径问题',
        resourceUrl: 'https://leetcode.com/tag/binary-tree/',
        resourceLabel: 'LeetCode - 二叉树专题',
        completed: false,
      },
      {
        id: 'a4', week: 4, title: '动态规划',
        description: '背包问题、最长公共子序列等经典 DP',
        resourceUrl: 'https://www.youtube.com/watch?v=oBt53YbR9Kk',
        resourceLabel: 'B站/YouTube - DP 入门视频',
        completed: false,
      },
      {
        id: 'a5', week: 5, title: '图论基础',
        description: 'Dijkstra、拓扑排序、并查集',
        resourceUrl: 'https://leetcode.com/tag/graph/',
        resourceLabel: 'LeetCode - 图论专题',
        completed: false,
      },
      {
        id: 'a6', week: 6, title: '模拟面试',
        description: '计时完成真题，模拟白板面试场景',
        resourceUrl: 'https://www.pramp.com',
        resourceLabel: 'Pramp - 免费模拟面试平台',
        completed: false,
      },
    ],
  },
];

const LS_PATHS = 'nc_learning_paths';
const LS_USER_PATHS = 'nc_user_paths';

function loadPaths(): LearningPath[] {
  try {
    const raw = localStorage.getItem(LS_PATHS);
    return raw ? (JSON.parse(raw) as LearningPath[]) : SEED_PATHS;
  } catch {
    return SEED_PATHS;
  }
}

function loadUserPaths(): LearningPath[] {
  try {
    const raw = localStorage.getItem(LS_USER_PATHS);
    return raw ? (JSON.parse(raw) as LearningPath[]) : [];
  } catch {
    return [];
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

const LearningPathsSection: React.FC = () => {
  const [paths] = useState<LearningPath[]>(loadPaths);
  const [userPaths, setUserPaths] = useState<LearningPath[]>(loadUserPaths);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'discover' | 'mine'>('discover');

  useEffect(() => { localStorage.setItem(LS_USER_PATHS, JSON.stringify(userPaths)); }, [userPaths]);

  function copyPath(path: LearningPath) {
    const copy: LearningPath = {
      ...path,
      id: `copy-${path.id}-${Date.now()}`,
      title: `${path.title}（我的副本）`,
      isOfficial: false,
      author: '我',
      copiedCount: 0,
      nodes: path.nodes.map(n => ({ ...n, id: `${n.id}-copy`, completed: false })),
    };
    setUserPaths(prev => [...prev, copy]);
    setCopiedId(path.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function toggleNodeComplete(pathId: string, nodeId: string) {
    setUserPaths(prev =>
      prev.map(p =>
        p.id === pathId
          ? { ...p, nodes: p.nodes.map(n => n.id === nodeId ? { ...n, completed: !n.completed } : n) }
          : p
      )
    );
  }

  function deletePath(pathId: string) {
    setUserPaths(prev => prev.filter(p => p.id !== pathId));
  }

  const alreadyCopiedIds = new Set(
    userPaths.map(p => p.id.replace(/^copy-/, '').replace(/-\d+$/, ''))
  );

  const renderPathCard = (path: LearningPath, isUserCopy = false) => {
    const isExpanded = expandedPath === path.id;
    const completedCount = path.nodes.filter(n => n.completed).length;
    const progress = path.nodes.length > 0 ? (completedCount / path.nodes.length) * 100 : 0;

    return (
      <div key={path.id} className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
        {/* Card header */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold text-slate-100 text-base">{path.title}</h3>
                {path.isOfficial && (
                  <span className="text-xs bg-brand-500/20 text-brand-400 border border-brand-500/30 px-2 py-0.5 rounded-full">
                    ✅ 官方认证
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 line-clamp-2">{path.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <UserGroupIcon className="w-3.5 h-3.5" />
                  {isUserCopy ? `作者: ${path.author}` : `${path.copiedCount.toLocaleString()} 人复制`}
                </span>
                <span>{path.nodes.length} 个节点 · {path.nodes[path.nodes.length - 1]?.week ?? 0} 周</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              {!isUserCopy ? (
                <button
                  className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors ${
                    copiedId === path.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-600 hover:bg-brand-500 text-white'
                  }`}
                  onClick={() => copyPath(path)}
                  disabled={copiedId === path.id}
                >
                  {copiedId === path.id ? (
                    <><CheckIcon className="w-4 h-4" />已复制</>
                  ) : (
                    <><ClipboardIcon className="w-4 h-4" />一键复制</>
                  )}
                </button>
              ) : (
                <button
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                  onClick={() => deletePath(path.id)}
                >
                  删除
                </button>
              )}
              <button
                className="text-xs text-slate-400 hover:text-slate-200 text-center"
                onClick={() => setExpandedPath(isExpanded ? null : path.id)}
              >
                {isExpanded ? '收起 ▲' : '展开 ▼'}
              </button>
            </div>
          </div>

          {/* Progress bar (only for user copies) */}
          {isUserCopy && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>进度</span>
                <span>{completedCount}/{path.nodes.length}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Expanded nodes */}
        {isExpanded && (
          <div className="border-t border-slate-700 p-4">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-700" />
              <div className="space-y-4">
                {path.nodes.map((node: LearningPathNode) => (
                  <div key={node.id} className="flex gap-4 relative">
                    {/* Node dot */}
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 ${
                      node.completed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-400 border-2 border-slate-600'
                    }`}>
                      {node.completed ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{node.week}</span>
                      )}
                    </div>
                    {/* Node content */}
                    <div className="flex-1 bg-slate-800 rounded-lg p-3 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">第 {node.week} 周</p>
                          <h4 className="font-semibold text-slate-200 text-sm">{node.title}</h4>
                          <p className="text-xs text-slate-400 mt-1">{node.description}</p>
                          <a
                            href={sanitizeUrl(node.resourceUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 mt-2 transition-colors"
                          >
                            <LinkIcon className="w-3 h-3" />
                            {node.resourceLabel}
                          </a>
                        </div>
                        {isUserCopy && (
                          <button
                            className={`flex-shrink-0 w-6 h-6 rounded border-2 transition-colors ${
                              node.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-600 hover:border-brand-500'
                            } flex items-center justify-center`}
                            title={node.completed ? '标记未完成' : '标记完成'}
                            onClick={() => toggleNodeComplete(path.id, node.id)}
                          >
                            {node.completed && <CheckIcon className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <MapIcon className="w-6 h-6 text-brand-400" />
          学习路线
        </h2>
        <p className="text-sm text-slate-400 mt-1">从零到就业的结构化路线图，每个节点关联具体学习资源</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {(['discover', 'mine'] as const).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'discover' ? `发现路线 (${paths.length})` : `我的计划 (${userPaths.length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'discover' && (
        <div className="space-y-4">
          {paths.map(p => renderPathCard(p, false))}
        </div>
      )}

      {activeTab === 'mine' && (
        <div className="space-y-4">
          {userPaths.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <MapIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">还没有学习计划</p>
              <p className="text-sm mt-1">
                在「发现路线」中点击「一键复制」即可将路线加入你的计划
              </p>
              <button
                className="mt-4 text-sm text-brand-400 hover:text-brand-300"
                onClick={() => setActiveTab('discover')}
              >
                去发现路线 →
              </button>
            </div>
          ) : (
            userPaths.map(p => renderPathCard(p, true))
          )}
        </div>
      )}
    </div>
  );
};

export default LearningPathsSection;
