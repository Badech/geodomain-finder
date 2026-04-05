/**
 * Progress Tracker Utility
 * Phase 8: Better progress feedback for search operations
 */

export interface ProgressStage {
  name: string;
  message: string;
  emoji: string;
  startProgress: number;
  endProgress: number;
  estimatedDuration: number; // milliseconds
}

/**
 * Search progress stages with timing estimates
 */
export const SEARCH_STAGES: ProgressStage[] = [
  {
    name: 'validating',
    message: 'Validating search parameters',
    emoji: '🔍',
    startProgress: 0,
    endProgress: 5,
    estimatedDuration: 100,
  },
  {
    name: 'generating',
    message: 'Generating domain suggestions',
    emoji: '💡',
    startProgress: 5,
    endProgress: 15,
    estimatedDuration: 500,
  },
  {
    name: 'checking',
    message: 'Checking domain availability',
    emoji: '🌐',
    startProgress: 15,
    endProgress: 40,
    estimatedDuration: 3000,
  },
  {
    name: 'searching',
    message: 'Finding local businesses',
    emoji: '📍',
    startProgress: 40,
    endProgress: 60,
    estimatedDuration: 2000,
  },
  {
    name: 'enriching',
    message: 'Enriching prospect data',
    emoji: '✨',
    startProgress: 60,
    endProgress: 80,
    estimatedDuration: 2000,
  },
  {
    name: 'matching',
    message: 'Matching domains to businesses',
    emoji: '🎯',
    startProgress: 80,
    endProgress: 95,
    estimatedDuration: 1000,
  },
  {
    name: 'complete',
    message: 'Search complete!',
    emoji: '✅',
    startProgress: 95,
    endProgress: 100,
    estimatedDuration: 200,
  },
];

/**
 * Get stage information by name
 */
export function getStage(stageName: string): ProgressStage | undefined {
  return SEARCH_STAGES.find(s => s.name === stageName);
}

/**
 * Calculate overall estimated time
 */
export function getEstimatedTotalTime(): number {
  return SEARCH_STAGES.reduce((sum, stage) => sum + stage.estimatedDuration, 0);
}

/**
 * Get time remaining based on current stage
 */
export function getEstimatedTimeRemaining(currentStage: string): number {
  const stageIndex = SEARCH_STAGES.findIndex(s => s.name === currentStage);
  if (stageIndex === -1) return 0;
  
  return SEARCH_STAGES
    .slice(stageIndex + 1)
    .reduce((sum, stage) => sum + stage.estimatedDuration, 0);
}

/**
 * Format remaining time for display
 */
export function formatTimeRemaining(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);
  
  if (seconds < 1) return 'Almost done...';
  if (seconds === 1) return '1 second';
  if (seconds < 60) return `${seconds} seconds`;
  
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

/**
 * Create a progress update message
 */
export interface ProgressUpdate {
  stage: string;
  message: string;
  emoji: string;
  progress: number;
  timeRemaining: string;
  isComplete: boolean;
}

export function createProgressUpdate(
  stageName: string,
  customProgress?: number
): ProgressUpdate {
  const stage = getStage(stageName);
  
  if (!stage) {
    return {
      stage: stageName,
      message: 'Processing...',
      emoji: '⏳',
      progress: 50,
      timeRemaining: 'Calculating...',
      isComplete: false,
    };
  }
  
  const progress = customProgress ?? stage.startProgress;
  const timeRemaining = getEstimatedTimeRemaining(stageName);
  
  return {
    stage: stage.name,
    message: stage.message,
    emoji: stage.emoji,
    progress,
    timeRemaining: formatTimeRemaining(timeRemaining),
    isComplete: stage.name === 'complete',
  };
}

/**
 * Create a series of progress updates for smoother animation
 */
export function createProgressSequence(
  stageName: string,
  steps: number = 10
): ProgressUpdate[] {
  const stage = getStage(stageName);
  if (!stage) return [];
  
  const updates: ProgressUpdate[] = [];
  const progressRange = stage.endProgress - stage.startProgress;
  const stepSize = progressRange / steps;
  
  for (let i = 0; i <= steps; i++) {
    const progress = stage.startProgress + (stepSize * i);
    updates.push(createProgressUpdate(stageName, progress));
  }
  
  return updates;
}
