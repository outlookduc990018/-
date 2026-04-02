export interface EditImageParams {
  base64Image: string;
  mimeType: string;
  prompt: string;
}

export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export enum EditorState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  READY = 'READY',
  GENERATING = 'GENERATING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

// ── Personalization & Efficiency Tools ──────────────────────────────────────

export interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  clickCount: number;
  bookmarkCount: number;
  isEditorPick: boolean;
  createdAt: string; // ISO date string
}

export interface FavoriteGroup {
  id: string;
  name: string;
  resourceIds: string[];
}

export interface UserFavorites {
  groups: FavoriteGroup[];
  /** resource ids not assigned to any group */
  ungrouped: string[];
}

export interface LearningPathNode {
  id: string;
  week: number;
  title: string;
  description: string;
  resourceUrl: string;
  resourceLabel: string;
  completed: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  author: string;
  isOfficial: boolean;
  nodes: LearningPathNode[];
  copiedCount: number;
}

export type AppTab = 'editor' | 'favorites' | 'paths' | 'trending';