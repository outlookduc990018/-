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

// ── OpenMAIC classroom types ─────────────────────────────────────────────────

export type AgentRole = 'teacher' | 'student';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  avatar: string;       // emoji
  color: string;        // tailwind bg class
  personality: string;
}

export interface SlideContent {
  title: string;
  points: string[];
  teacherNote: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AgentMessage {
  agentId: string;
  text: string;
}

export type SceneType = 'slide' | 'quiz' | 'discussion';

export interface Scene {
  id: string;
  type: SceneType;
  title: string;
  slideContent?: SlideContent;
  quiz?: QuizQuestion;
  messages: AgentMessage[];
}

export interface Classroom {
  id: string;
  topic: string;
  agents: Agent[];
  scenes: Scene[];
}

export enum AppView {
  HOME = 'HOME',
  GENERATING = 'GENERATING',
  CLASSROOM = 'CLASSROOM',
}