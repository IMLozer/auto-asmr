
export interface RestorationScene {
  stageNumber: number;
  stageTitle: string;
  visualPrompt: string;
  animationPrompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
}

export interface KeywordRanking {
  term: string;
  rank: number; // 1-100 score
  volume: 'High' | 'Medium' | 'Low';
}

export interface YouTubeMetadata {
  title: string;
  description: string;
  hashtags: string[];
  keywords: KeywordRanking[];
}

export interface StoryboardResponse {
  metadata: YouTubeMetadata;
  scenes: RestorationScene[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  data: StoryboardResponse;
}

export enum AppStep {
  TITLES = 'TITLES',
  STORYBOARD = 'STORYBOARD'
}
