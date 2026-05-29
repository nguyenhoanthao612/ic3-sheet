export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'fill-blank'
  | 'matching'
  | 'drag-drop'
  | 'hotspot'
  | 'image-question'
  | 'video-question'
  | 'step-ordering'
  | 'multi-select';

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options: string[]; // Options array (ranges from simple selections to step items)
  correctAnswer: string; // Answer storage format depends on question type
  explanation: string;
  imageUrl?: string;
  videoUrl?: string; // Standard video link or mockup embedded URL
  domain: 'Computing Fundamentals' | 'Key Applications' | 'Living Online';
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  
  // Custom metadata for interactive types
  hotspotArea?: { x: number; y: number; w: number; h: number; label?: string };
  matchingPairs?: { left: string; right: string }[];
  dragDropCategories?: {
    categories: string[];
    items: { text: string; category: string }[];
  };
  orderingSteps?: string[];
}

export interface UserAnswer {
  questionId: string;
  answer: any; // e.g. index, string, list of ordered indices, string dictionary
  isCorrect: boolean;
  timeSpent?: number;
}

export interface QuizHistory {
  id: string;
  examDate: string;
  examType: 'practice' | 'mock-exam';
  score: number;
  totalQuestions: number;
  correctCount: number;
  domainScores: {
    'Computing Fundamentals': number;
    'Key Applications': number;
    'Living Online': number;
  };
  timeSpent: number; // in seconds
  passed: boolean;
}

export interface StudentProfile {
  xp: number;
  streak: number;
  lastActiveDate: string;
  badges: Badge[];
  level: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  level: number;
  isCurrentUser?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  domain: 'Computing Fundamentals' | 'Key Applications' | 'Living Online';
  duration: string;
  description: string;
  content: string; // Markdown summary of the content
  videoUrl?: string;
  flashcards: { front: string; back: string }[];
}
