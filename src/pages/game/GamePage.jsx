import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GameBonusFoodToggle from '@/components/game/GameBonusFoodToggle';
import GameClassicOptions from '@/components/game/GameClassicOptions';
import GameMobileWarningModal from '@/components/game/GameMobileWarningModal';
import GameModeConfigurationPanel from '@/components/game/GameModeConfigurationPanel';
import GameModeGrid from '@/components/game/GameModeGrid';
import GameModeQuickStats from '@/components/game/GameModeQuickStats';
import GamePageBackground from '@/components/game/GamePageBackground';
import GamePageHeader from '@/components/game/GamePageHeader';
import {
  GAME_PAGE_CONTAINER_VARIANTS,
  GAME_PAGE_ITEM_VARIANTS,
  getGameModes
} from '@/components/game/gamePageConfig';
import { useAuth } from '@/hooks/useAuth';
import { getGameRouteFromSelection, getLastPlayedMode, saveLastPlayedMode } from '@/utils/gamePreferences';
import { formatScore, isMobile } from '@/utils/gameUtils';
import logger from '@/utils/logger.js';
import { playClick } from '@/utils/sound';

const GamePage = () => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const preferredMode = searchParams.get('mode');
  const showClassicOptions = preferredMode === 'classic';
  const lastPlayed = getLastPlayedMode();
  const [aiDifficulty, setAiDifficulty] = useState(
    () => (lastPlayed?.mode === 'vsai' ? lastPlayed.difficulty || 'medium' : 'medium')
  );
  const [playerCount, setPlayerCount] = useState(
    () => (lastPlayed?.mode === 'multiplayer' ? lastPlayed.playerCount || 2 : 2)
  );
  const [bonusFoodEnabled, setBonusFoodEnabled] = useState(
    () => lastPlayed?.bonusFoodEnabled !== false
  );
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const mobile = isMobile();
  const userStats = userProfile?.stats || {};
  const competitiveGames =
    Number(userStats.competitiveGames) ||
    (Number(userStats.vsaiGames) || 0) + (Number(userStats.multiplayerGames) || 0);
  const competitiveWins = Number(userStats.competitiveWins) || Number(userStats.totalWins) || 0;
  const gameModes = getGameModes({ mobile, userStats });

  const launchSelection = (selection) => {
    const normalized = saveLastPlayedMode(selection);
    navigate(getGameRouteFromSelection(normalized));
  };

  const renderBonusFoodToggle = (description) => (
    <GameBonusFoodToggle
      bonusFoodEnabled={bonusFoodEnabled}
      description={description}
      onToggle={() => {
        setBonusFoodEnabled((previous) => !previous);
        playClick();
      }}
    />
  );

  const handleModeSelect = (mode, options = { configure: false }) => {
    if (mode.disabled) {
      setShowMobileWarning(true);
      return;
    }

    if (options.configure) {
      if (mode.id === 'classic') {
        setSearchParams({ mode: 'classic' });
        setSelectedMode(null);
        playClick();
        return;
      }

      setSelectedMode(mode);
      playClick();
      return;
    }

    if (mode.id === 'classic') {
      playClick();
      launchSelection({ mode: 'classic', bonusFoodEnabled });
      return;
    }

    if (mode.id === 'vsai') {
      playClick();
      launchSelection({ mode: 'vsai', difficulty: aiDifficulty, bonusFoodEnabled });
      return;
    }

    if (mode.id === 'multiplayer') {
      playClick();
      launchSelection({ mode: 'multiplayer', playerCount, bonusFoodEnabled });
      return;
    }

    playClick();
  };

  const startGame = () => {
    if (!selectedMode) {
      return;
    }

    try {
      if (selectedMode.id === 'classic') {
        launchSelection({ mode: 'classic', bonusFoodEnabled });
      } else if (selectedMode.id === 'vsai') {
        launchSelection({ mode: 'vsai', difficulty: aiDifficulty, bonusFoodEnabled });
      } else if (selectedMode.id === 'multiplayer') {
        launchSelection({ mode: 'multiplayer', playerCount, bonusFoodEnabled });
      }
    } catch (error) {
      logger.error('Failed to start game from mode selection:', error);
    }
  };

  const goBack = () => {
    setSelectedMode(null);
    playClick();
  };

  return (
    <div className="min-h-screen relative">
      <GamePageBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <GamePageHeader />

        <AnimatePresence mode="wait">
          {!selectedMode ? (
            <motion.div
              key="selection"
              variants={GAME_PAGE_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              {showClassicOptions ? (
                <motion.div variants={GAME_PAGE_ITEM_VARIANTS}>
                  <GameClassicOptions
                    bonusFoodToggle={renderBonusFoodToggle('Spawn a timed 2x2 bonus fruit after every 5 normal foods. Turn it off for a pure classic run.')}
                    onShowAllModes={() => setSearchParams({})}
                    onSelectMode={(modeId) => {
                      playClick();
                      launchSelection({ mode: modeId, bonusFoodEnabled });
                    }}
                  />
                </motion.div>
              ) : (
                <GameModeGrid
                  gameModes={gameModes}
                  itemVariants={GAME_PAGE_ITEM_VARIANTS}
                  onModeSelect={handleModeSelect}
                  onConfigureMode={(mode) => handleModeSelect(mode, { configure: true })}
                />
              )}

              <motion.div variants={GAME_PAGE_ITEM_VARIANTS}>
                <GameModeQuickStats
                  competitiveGames={competitiveGames}
                  competitiveWins={competitiveWins}
                  userStats={userStats}
                  formatScore={formatScore}
                />
              </motion.div>
            </motion.div>
          ) : (
            <GameModeConfigurationPanel
              aiDifficulty={aiDifficulty}
              bonusFoodToggle={renderBonusFoodToggle}
              onBack={goBack}
              onDifficultySelect={(difficultyId) => {
                setAiDifficulty(difficultyId);
                playClick();
              }}
              onPlayerCountChange={(count) => {
                setPlayerCount(count);
                playClick();
              }}
              onStartGame={startGame}
              playerCount={playerCount}
              selectedMode={selectedMode}
            />
          )}
        </AnimatePresence>
      </div>

      <GameMobileWarningModal
        isOpen={showMobileWarning}
        onClose={() => {
          setShowMobileWarning(false);
          playClick();
        }}
      />
    </div>
  );
};

export default GamePage;
