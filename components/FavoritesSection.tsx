import React, { useState, useEffect } from 'react';
import { Resource, FavoriteGroup, UserFavorites } from '../types';
import {
  BookmarkIcon,
  FolderPlusIcon,
  PlusIcon,
  TrashIcon,
  LinkIcon,
  XCircleIcon,
} from './Icons';
import { sanitizeUrl } from './sanitizeUrl';

// ── Seed data ─────────────────────────────────────────────────────────────────

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
];

const LS_FAVORITES = 'nc_favorites';
const LS_RESOURCES = 'nc_resources';

function loadResources(): Resource[] {
  try {
    const raw = localStorage.getItem(LS_RESOURCES);
    return raw ? (JSON.parse(raw) as Resource[]) : SEED_RESOURCES;
  } catch {
    return SEED_RESOURCES;
  }
}

function loadFavorites(): UserFavorites {
  try {
    const raw = localStorage.getItem(LS_FAVORITES);
    if (raw) return JSON.parse(raw) as UserFavorites;
  } catch {
    // ignore
  }
  return { groups: [], ungrouped: [] };
}

function saveFavorites(fav: UserFavorites) {
  localStorage.setItem(LS_FAVORITES, JSON.stringify(fav));
}

function saveResources(res: Resource[]) {
  localStorage.setItem(LS_RESOURCES, JSON.stringify(res));
}

// ── Component ─────────────────────────────────────────────────────────────────

const FavoritesSection: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>(loadResources);
  const [favorites, setFavorites] = useState<UserFavorites>(loadFavorites);
  const [newGroupName, setNewGroupName] = useState('');
  const [showGroupInput, setShowGroupInput] = useState(false);
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null); // groupId or 'ungrouped'
  const [showAddResourceForm, setShowAddResourceForm] = useState(false);
  const [newRes, setNewRes] = useState({ title: '', url: '', description: '', tags: '' });
  const [moveTarget, setMoveTarget] = useState<{ resourceId: string; fromGroupId: string | 'ungrouped' } | null>(null);

  useEffect(() => { saveFavorites(favorites); }, [favorites]);
  useEffect(() => { saveResources(resources); }, [resources]);

  const favoritedIds = new Set([
    ...favorites.ungrouped,
    ...favorites.groups.flatMap(g => g.resourceIds),
  ]);

  const allFavoritedResources = resources.filter(r => favoritedIds.has(r.id));

  function toggleBookmark(resourceId: string) {
    setFavorites(prev => {
      if (favoritedIds.has(resourceId)) {
        return {
          groups: prev.groups.map(g => ({
            ...g,
            resourceIds: g.resourceIds.filter(id => id !== resourceId),
          })),
          ungrouped: prev.ungrouped.filter(id => id !== resourceId),
        };
      }
      return { ...prev, ungrouped: [...prev.ungrouped, resourceId] };
    });
    setResources(prev =>
      prev.map(r =>
        r.id === resourceId
          ? { ...r, bookmarkCount: r.bookmarkCount + (favoritedIds.has(r.id) ? -1 : 1) }
          : r
      )
    );
  }

  function createGroup() {
    const name = newGroupName.trim();
    if (!name) return;
    const group: FavoriteGroup = { id: `g-${Date.now()}`, name, resourceIds: [] };
    setFavorites(prev => ({ ...prev, groups: [...prev.groups, group] }));
    setNewGroupName('');
    setShowGroupInput(false);
  }

  function deleteGroup(groupId: string) {
    setFavorites(prev => {
      const group = prev.groups.find(g => g.id === groupId);
      return {
        groups: prev.groups.filter(g => g.id !== groupId),
        ungrouped: [...prev.ungrouped, ...(group?.resourceIds ?? [])],
      };
    });
  }

  function moveToGroup(resourceId: string, fromGroupId: string | 'ungrouped', toGroupId: string | 'ungrouped') {
    setFavorites(prev => {
      const removeFrom = (fav: UserFavorites): UserFavorites => {
        if (fromGroupId === 'ungrouped') {
          return { ...fav, ungrouped: fav.ungrouped.filter(id => id !== resourceId) };
        }
        return {
          ...fav,
          groups: fav.groups.map(g =>
            g.id === fromGroupId ? { ...g, resourceIds: g.resourceIds.filter(id => id !== resourceId) } : g
          ),
        };
      };
      const addTo = (fav: UserFavorites): UserFavorites => {
        if (toGroupId === 'ungrouped') {
          return { ...fav, ungrouped: [...fav.ungrouped, resourceId] };
        }
        return {
          ...fav,
          groups: fav.groups.map(g =>
            g.id === toGroupId ? { ...g, resourceIds: [...g.resourceIds, resourceId] } : g
          ),
        };
      };
      return addTo(removeFrom(prev));
    });
    setMoveTarget(null);
  }

  function addCustomResource() {
    const title = newRes.title.trim();
    const url = newRes.url.trim();
    if (!title || !url) return;
    const resource: Resource = {
      id: `user-${Date.now()}`,
      title,
      url,
      description: newRes.description.trim(),
      tags: newRes.tags.split(',').map(t => t.trim()).filter(Boolean),
      clickCount: 0,
      bookmarkCount: 1,
      isEditorPick: false,
      createdAt: new Date().toISOString(),
    };
    setResources(prev => [...prev, resource]);
    setFavorites(prev => ({ ...prev, ungrouped: [...prev.ungrouped, resource.id] }));
    setNewRes({ title: '', url: '', description: '', tags: '' });
    setShowAddResourceForm(false);
  }

  const resourceById = (id: string) => resources.find(r => r.id === id);

  const renderResourceCard = (resourceId: string, groupId: string | 'ungrouped') => {
    const r = resourceById(resourceId);
    if (!r) return null;
    return (
      <div key={r.id} className="flex items-start gap-3 bg-slate-800 rounded-lg p-3 group">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <a
              href={sanitizeUrl(r.url)}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-100 hover:text-brand-400 transition-colors truncate"
              onClick={() =>
                setResources(prev => prev.map(x => x.id === r.id ? { ...x, clickCount: x.clickCount + 1 } : x))
              }
            >
              {r.title}
            </a>
            <LinkIcon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">{r.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {r.tags.map(tag => (
              <span key={tag} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* Move dropdown */}
          <div className="relative">
            <button
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-1"
              title="移动到分组"
              onClick={() =>
                setMoveTarget(prev =>
                  prev?.resourceId === r.id ? null : { resourceId: r.id, fromGroupId: groupId }
                )
              }
            >
              移动
            </button>
            {moveTarget?.resourceId === r.id && (
              <div className="absolute right-0 top-6 z-10 bg-slate-700 border border-slate-600 rounded-lg shadow-xl min-w-36 py-1">
                {groupId !== 'ungrouped' && (
                  <button
                    className="w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-600"
                    onClick={() => moveToGroup(r.id, groupId, 'ungrouped')}
                  >
                    未分组
                  </button>
                )}
                {favorites.groups.filter(g => g.id !== groupId).map(g => (
                  <button
                    key={g.id}
                    className="w-full text-left px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-600"
                    onClick={() => moveToGroup(r.id, groupId, g.id)}
                  >
                    {g.name}
                  </button>
                ))}
                {favorites.groups.filter(g => g.id !== groupId).length === 0 && groupId === 'ungrouped' && (
                  <p className="px-3 py-1.5 text-xs text-slate-500">暂无其他分组</p>
                )}
              </div>
            )}
          </div>
          <button
            className="text-slate-500 hover:text-red-400 transition-colors"
            title="取消收藏"
            onClick={() => toggleBookmark(r.id)}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookmarkIcon className="w-6 h-6 text-brand-400" filled />
            我的收藏夹
          </h2>
          <p className="text-sm text-slate-400 mt-1">收藏感兴趣的网站，形成个人学习工具箱</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            className="flex items-center gap-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-lg transition-colors"
            onClick={() => setShowGroupInput(v => !v)}
          >
            <FolderPlusIcon className="w-4 h-4" />
            新建分组
          </button>
          <button
            className="flex items-center gap-1.5 text-sm bg-brand-600 hover:bg-brand-500 text-white px-3 py-2 rounded-lg transition-colors"
            onClick={() => setShowAddResourceForm(v => !v)}
          >
            <PlusIcon className="w-4 h-4" />
            添加网站
          </button>
        </div>
      </div>

      {/* New group input */}
      {showGroupInput && (
        <div className="flex gap-2">
          <input
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            placeholder='分组名称，如"每天练一题"'
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createGroup()}
            autoFocus
          />
          <button
            className="bg-brand-600 hover:bg-brand-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            onClick={createGroup}
          >
            创建
          </button>
          <button
            className="text-slate-400 hover:text-slate-200 px-2"
            onClick={() => setShowGroupInput(false)}
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Add resource form */}
      {showAddResourceForm && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200">添加网站到收藏</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              placeholder="网站名称 *"
              value={newRes.title}
              onChange={e => setNewRes(p => ({ ...p, title: e.target.value }))}
            />
            <input
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              placeholder="网址 URL *"
              value={newRes.url}
              onChange={e => setNewRes(p => ({ ...p, url: e.target.value }))}
            />
          </div>
          <input
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            placeholder="简介（可选）"
            value={newRes.description}
            onChange={e => setNewRes(p => ({ ...p, description: e.target.value }))}
          />
          <input
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            placeholder="标签（逗号分隔，可选）"
            value={newRes.tags}
            onChange={e => setNewRes(p => ({ ...p, tags: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <button
              className="text-sm text-slate-400 hover:text-slate-200 px-3 py-2"
              onClick={() => setShowAddResourceForm(false)}
            >
              取消
            </button>
            <button
              className="bg-brand-600 hover:bg-brand-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              onClick={addCustomResource}
            >
              添加收藏
            </button>
          </div>
        </div>
      )}

      {/* Groups */}
      {favorites.groups.map(group => (
        <div key={group.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <span className="text-brand-400">📁</span>
              {group.name}
              <span className="text-xs text-slate-500 font-normal">({group.resourceIds.length})</span>
            </h3>
            <button
              className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
              onClick={() => deleteGroup(group.id)}
            >
              <TrashIcon className="w-3.5 h-3.5" />
              删除分组
            </button>
          </div>
          {group.resourceIds.length === 0 ? (
            <p className="text-sm text-slate-500 italic pl-2">此分组暂无收藏，可将未分组内容移入</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {group.resourceIds.map(id => renderResourceCard(id, group.id))}
            </div>
          )}
        </div>
      ))}

      {/* Ungrouped */}
      <div className="space-y-2">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-slate-400">🗂️</span>
          未分组
          <span className="text-xs text-slate-500 font-normal">({favorites.ungrouped.length})</span>
        </h3>
        {favorites.ungrouped.length === 0 ? (
          <p className="text-sm text-slate-500 italic pl-2">暂无未分组收藏</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {favorites.ungrouped.map(id => renderResourceCard(id, 'ungrouped'))}
          </div>
        )}
      </div>

      {/* Discover section */}
      <div className="border-t border-slate-800 pt-6">
        <h3 className="font-semibold text-slate-300 mb-3">发现更多资源</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {resources.filter(r => !favoritedIds.has(r.id)).map(r => (
            <div key={r.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <a
                    href={sanitizeUrl(r.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-slate-200 hover:text-brand-400 transition-colors text-sm line-clamp-1"
                    onClick={() =>
                      setResources(prev => prev.map(x => x.id === r.id ? { ...x, clickCount: x.clickCount + 1 } : x))
                    }
                  >
                    {r.title}
                  </a>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{r.description}</p>
                </div>
                <button
                  className="text-slate-500 hover:text-brand-400 transition-colors flex-shrink-0"
                  title="收藏"
                  onClick={() => toggleBookmark(r.id)}
                >
                  <BookmarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {r.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {resources.filter(r => !favoritedIds.has(r.id)).length === 0 && (
          <p className="text-sm text-slate-500 italic">所有资源均已收藏 🎉</p>
        )}
      </div>

      {/* Empty state */}
      {allFavoritedResources.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <BookmarkIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">收藏夹为空</p>
          <p className="text-sm mt-1">在下方"发现更多资源"中点击书签图标即可收藏</p>
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;
