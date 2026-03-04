
export enum KnowledgeLevel {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
  Scholarly = 'Scholarly'
}

export enum StudyType {
  Comprehensive = 'Comprehensive Analysis',
  Devotional = 'Devotional Study',
  Academic = 'Academic Research',
  Sermon = 'Sermon Preparation',
  Discussion = 'Discussion Guide',
  SpiritualGuide = 'Text-Based Spiritual Guide',
  NarrativeSpiritual = 'Narrative-Theological Spiritual Guide',
  TorahPortion = 'Torah Portion Notes'
}

export enum Language {
  English = 'English',
  TraditionalChinese = 'Traditional Chinese'
}

export interface StudyConfig {
  passage: string;
  topic: string;
  knowledgeLevel: KnowledgeLevel;
  studyType: StudyType;
  duration: number; // minutes
  approaches: string[];
  customApproach: string;
  traditions: string[];
  language: Language;
  autoResearch: boolean;
  includeBackground: boolean;
}

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  sources: { uri: string; title: string }[];
  config: StudyConfig;
  timestamp: Date;
}

export type ViewType = 'new' | 'library' | 'settings' | 'dashboard';

export interface SelectableItem {
  id: string;
  label: {
    en: string;
    zh: string;
  };
  description: {
    en: string;
    zh: string;
  };
  category?: string;
}

export interface Translations {
  [key: string]: {
    en: string;
    zh: string;
  };
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  label: {
    en: string;
    zh: string;
  };
  detail?: string;
  status: 'pending' | 'processing' | 'success' | 'error';
}
