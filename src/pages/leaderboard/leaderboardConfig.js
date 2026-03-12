export const GAME_MODES_FILTERS = [
  { id: 'classic', name: 'Classic', icon: 'classic', mode: 'classic', difficulty: null, statKey: 'classicBestScore', source: 'game' },
  { id: 'classic_transparent', name: 'Transparent', icon: 'transparent', mode: 'classic_transparent', difficulty: null, statKey: 'transparentBestScore', source: 'game' },
  { id: 'vsai_easy', name: 'VS AI Easy', icon: 'vsai', mode: 'vsai', difficulty: 'easy', statKey: 'vsaiBestScore', source: 'game' },
  { id: 'vsai_medium', name: 'VS AI Medium', icon: 'vsai', mode: 'vsai', difficulty: 'medium', statKey: 'vsaiBestScore', source: 'game' },
  { id: 'vsai_impossible', name: 'VS AI Impossible', icon: 'vsai', mode: 'vsai', difficulty: 'impossible', statKey: 'vsaiBestScore', source: 'game' },
  { id: 'multiplayer', name: 'Multiplayer', icon: 'multiplayer', mode: 'multiplayer', difficulty: null, statKey: 'multiplayerBestScore', source: 'game' },
  { id: 'overall_total', name: 'Overall', icon: 'overall', mode: 'overall', difficulty: null, statKey: 'totalScore', source: 'overall' },
  { id: 'weekly_overall', name: 'Weekly', icon: 'weekly', mode: 'overall', difficulty: null, statKey: 'totalScore', source: 'weekly' },
  { id: 'achievement_rank', name: 'Achievements', icon: 'achievements', mode: 'achievements', difficulty: null, statKey: 'achievementPoints', source: 'achievement' }
];

export const resolveLeaderboardMode = (modeId) => {
  return GAME_MODES_FILTERS.find((mode) => mode.id === modeId) || GAME_MODES_FILTERS[0];
};

export const formatEntryTimestamp = (timestamp) => {
  if (!timestamp) return 'Recently';

  let date = null;
  if (typeof timestamp?.toDate === 'function') {
    date = timestamp.toDate();
  } else if (typeof timestamp?.seconds === 'number') {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === 'number' || typeof timestamp === 'string') {
    date = new Date(timestamp);
  }

  if (!date || Number.isNaN(date.getTime())) return 'Recently';
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};
