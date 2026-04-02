import React, { useState, useEffect } from 'react';
import { Resource } from '../types';
import { FireIcon, StarIcon, BookmarkIcon, LinkIcon } from './Icons';
import { sanitizeUrl } from './sanitizeUrl';

// ── Seed data (shared via localStorage with FavoritesSection) ─────────────────

const SEED_RESOURCES: Resource[] = [
  {
    id: 'r1',
    title: 'LeetCode',
    url: 'https://leetcode.com',
    description: '全球最大的算法练习平台，支持多种编程语言',
    tags: ['算法', '面试', '刷题'],
    clickCount: 1240,
    bookmarkCount: 980,
    isEditorPick: true,
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'r2',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    description: '权威的 Web 技术文档，适合前端开发者查阅',
    tags: ['前端', '文档', 'Web'],
    clickCount: 2100,
    bookmarkCount: 1500,
    isEditorPick: true,
    createdAt: '2024-01-12T00:00:00Z',
  },
  {
    id: 'r3',
    title: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org',
    description: '免费编程学习平台，从基础到项目实战全覆盖',
    tags: ['免费', '全栈', '入门'],
    clickCount: 890,
    bookmarkCount: 720,
    isEditorPick: false,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'r4',
    title: 'Roadmap.sh',
    url: 'https://roadmap.sh',
    description: '可视化学习路线图，覆盖前端、后端、DevOps 等方向',
    tags: ['路线图', '规划', '职业'],
    clickCount: 670,
    bookmarkCount: 560,
    isEditorPick: true,
    createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'r5',
    title: 'CS50 Harvard',
    url: 'https://cs50.harvard.edu',
    description: '哈佛大学免费计算机科学入门课，口碑极佳',
    tags: ['课程', '免费', '计算机基础'],
    clickCount: 540,
    bookmarkCount: 480,
    isEditorPick: false,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'r6',
    title: 'Excalidraw',
    url: 'https://excalidraw.com',
    description: '极简风格在线白板工具，适合绘制系统设计图与学习笔记',
    tags: ['工具', '设计', '笔记'],
    clickCount: 310,
    bookmarkCount: 290,
    isEditorPick: true,
    createdAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'r7',
    title: 'Regex101',
    url: 'https://regex101.com',
    description: '在线正则表达式调试工具，支持多语言，带详细解释',
    tags: ['工具', '正则', '调试'],
    clickCount: 430,
    bookmarkCount: 380,
    isEditorPick: true,
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'r8',
    title: 'Visualgo',
    url: 'https://visualgo.net',
    description: '算法与数据结构可视化，帮助理解排序、图、树等抽象概念',
    tags: ['可视化', '算法', '学习'],
    clickCount: 260,
    bookmarkCount: 240,
    isEditorPick: true,
    createdAt: '2024-02-20T00:00:00Z',
  },
];

const LS_RESOURCES = 'nc_resources';
const LS_FAVORITES = 'nc_favorites';

interface UserFavoritesRaw {
  groups: { id: string; name: string; resourceIds: string[] }[];
  ungrouped: string[];
}

function loadResources(): Resource[] {
  try {
    const raw = localStorage.getItem(LS_RESOURCES);
    if (raw) return JSON.parse(raw) as Resource[];
  } catch { /* empty */ }
  return SEED_RESOURCES;
}

function saveResources(res: Resource[]) {
  localStorage.setItem(LS_RESOURCES, JSON.stringify(res));
}

function loadFavoritedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_FAVORITES);
    if (raw) {
      const fav = JSON.parse(raw) as UserFavoritesRaw;
      return new Set([...fav.ungrouped, ...fav.groups.flatMap(g => g.resourceIds)]);
    }
  } catch { /* empty */ }
  return new Set();
}

function toggleFavorite(resourceId: string) {
  try {
    const raw = localStorage.getItem(LS_FAVORITES);
    const fav: UserFavoritesRaw = raw ? JSON.parse(raw) : { groups: [], ungrouped: [] };
    const allIds = new Set([...fav.ungrouped, ...fav.groups.flatMap(g => g.resourceIds)]);
    if (allIds.has(resourceId)) {
      fav.groups = fav.groups.map(g => ({ ...g, resourceIds: g.resourceIds.filter(id => id !== resourceId) }));
      fav.ungrouped = fav.ungrouped.filter(id => id !== resourceId);
    } else {
      fav.ungrouped.push(resourceId);
    }
    localStorage.setItem(LS_FAVORITES, JSON.stringify(fav));
  } catch { /* empty */ }
}

// ── Component ─────────────────────────────────────────────────────────────────

const TrendingSection: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>(loadResources);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(loadFavoritedIds);
  const [activeTab, setActiveTab] = useState<'trending' | 'editor'>('trending');

  useEffect(() => { saveResources(resources); }, [resources]);

  function handleBookmark(resourceId: string) {
    const isFav = favoritedIds.has(resourceId);
    toggleFavorite(resourceId);
    setFavoritedIds(prev => {
      const next = new Set(prev);
      isFav ? next.delete(resourceId) : next.add(resourceId);
      return next;
    });
    setResources(prev =>
      prev.map(r =>
        r.id === resourceId
          ? { ...r, bookmarkCount: r.bookmarkCount + (isFav ? -1 : 1) }
          : r
      )
    );
  }

  function handleClick(resourceId: string) {
    setResources(prev =>
      prev.map(r => r.id === resourceId ? { ...r, clickCount: r.clickCount + 1 } : r)
    );
  }

  const trending = [...resources]
    .sort((a, b) => b.bookmarkCount + b.clickCount - (a.bookmarkCount + a.clickCount))
    .slice(0, 6);

  const editorPicks = resources.filter(r => r.isEditorPick);

  const renderCard = (r: Resource, rank?: number) => (
    <div key={r.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex gap-3 hover:border-slate-600 transition-colors group">
      {rank !== undefined && (
        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-sm ${
          rank === 1 ? 'bg-amber-400 text-amber-900' :
          rank === 2 ? 'bg-slate-400 text-slate-900' :
          rank === 3 ? 'bg-orange-600 text-white' :
          'bg-slate-700 text-slate-400'
        }`}>
          {rank}
        </div>
      )}
      {rank === undefined && (
        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-brand-500/20">
          <StarIcon className="w-4 h-4 text-brand-400" filled />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <a
              href={sanitizeUrl(r.url)}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-100 hover:text-brand-400 transition-colors flex items-center gap-1.5 text-sm"
              onClick={() => handleClick(r.id)}
            >
              {r.title}
              <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
            </a>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.description}</p>
          </div>
          <button
            className={`flex-shrink-0 transition-colors ${
              favoritedIds.has(r.id) ? 'text-brand-400' : 'text-slate-500 hover:text-brand-400'
            }`}
            title={favoritedIds.has(r.id) ? '取消收藏' : '收藏'}
            onClick={() => handleBookmark(r.id)}
          >
            <BookmarkIcon className="w-5 h-5" filled={favoritedIds.has(r.id)} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-wrap gap-1">
            {r.tags.map(tag => (
              <span key={tag} className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0 ml-2">
            <span title="收藏数">🔖 {r.bookmarkCount.toLocaleString()}</span>
            <span title="点击数">👆 {r.clickCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <FireIcon className="w-6 h-6 text-orange-400" />
          热门与精选
        </h2>
        <p className="text-sm text-slate-400 mt-1">近期最受欢迎的资源，以及编辑精心挑选的高质量小众网站</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {(['trending', 'editor'] as const).map(tab => (
          <button
            key={tab}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === tab
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'trending' ? (
              <><FireIcon className="w-4 h-4 text-orange-400" />近期热门</>
            ) : (
              <><StarIcon className="w-4 h-4 text-amber-400" filled />编辑精选</>
            )}
          </button>
        ))}
      </div>

      {/* Trending */}
      {activeTab === 'trending' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">按收藏数 + 点击数综合排名</p>
          {trending.map((r, i) => renderCard(r, i + 1))}
        </div>
      )}

      {/* Editor picks */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-amber-400/10 border border-amber-400/20 rounded-xl p-4">
            <StarIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" filled />
            <div>
              <p className="text-sm font-medium text-amber-300">编辑推荐</p>
              <p className="text-xs text-slate-400 mt-0.5">
                由编辑团队精心挑选的高质量、小众但极具价值的学习资源
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {editorPicks.map(r => renderCard(r))}
          </div>
          {editorPicks.length === 0 && (
            <p className="text-center text-slate-500 py-8">暂无编辑精选</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TrendingSection;
