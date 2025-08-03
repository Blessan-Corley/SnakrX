import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  RotateCcw, 
  Trophy, 
  Clock, 
  Target,
  Share2,
  ArrowRight
} from 'lucide-react';
import { useGame, useGameOperations } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { useAchievementOperations } from '@/hooks/useAchievements';
import { GameBoardWithOverlay } from '@/components/game/GameBoard';
import GameControls, { FloatingGameHUD } from '@/components/game/GameControls';
import GameLegend from '@/components/game/GameLegend';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import GameModeModal from '@/components/ui/GameModeModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import GameTest from '@/components/game/GameTest';
import { playClick } from '@/utils/sound';
import { formatScore, formatTime, getSpeedMultiplier, isMobile, DIRECTIONS, GAME_STATES } from '@/utils/gameUtils';

/**
 * Classic Mode Game Page
 * Single-player endless snake gameplay
 */
const ClassicGame = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { recentUnlocks } = useAchievementOperations();
  
  // Game state
  const {
    gameState,
    snakes,
    food,
    boardSize,
    score,
    gameTime,
    speed,
    foodEaten,
    isPaused
  } = useGame();

  // Game operations
  const {
    initializeGame,
    updateSnakeDirection,
    togglePause,
    restartGame,
    quitToMenu,
    isGameActive,
    isGameOver,
    isVictory,
    speedMultiplier
  } = useGameOperations();

  // Local state
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [gameStats, setGameStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const mobile = isMobile();

  // State for mode selection
  const [showModeSelect, setShowModeSelect] = useState(true);

  // Initialize game on mount or mode selection
  const initializeClassicGame = async (mode = 'classic') => {
    try {
      console.log('Starting classic game with mode:', mode);
      setLoading(true);
      await initializeGame(mode);
      console.log('Classic game initialized successfully');
      
      // Game is ready - user must click or press key to start
      
    } catch (error) {
      console.error('Failed to start classic game:', error);
      navigate('/game');
    } finally {
      setLoading(false);
    }
  };

  // Handle mode selection
  const handleModeSelect = (mode) => {
    console.log('Mode selected:', mode);
    setShowModeSelect(false);
    initializeClassicGame(mode);
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      const key = e.code;
      
      // Always handle game controls
      if (key === 'Space') {
        e.preventDefault();
        togglePause();
        return;
      } else if (key === 'KeyR') {
        handleRestart();
        return;
      } else if (key === 'Escape') {
        handleQuit();
        return;
      }
      
      // Only handle movement when game is active
      if (!isGameActive || isPaused) return;

      // Movement controls
      if (key === 'ArrowUp' || key === 'KeyW') {
        e.preventDefault();
        updateSnakeDirection(0, DIRECTIONS.UP);
      } else if (key === 'ArrowDown' || key === 'KeyS') {
        e.preventDefault();
        updateSnakeDirection(0, DIRECTIONS.DOWN);
      } else if (key === 'ArrowLeft' || key === 'KeyA') {
        e.preventDefault();
        updateSnakeDirection(0, DIRECTIONS.LEFT);
      } else if (key === 'ArrowRight' || key === 'KeyD') {
        e.preventDefault();
        updateSnakeDirection(0, DIRECTIONS.RIGHT);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGameActive, isPaused, updateSnakeDirection, togglePause, handleRestart, handleQuit]);

  // Add ready overlay and start logic
  useEffect(() => {
    if (gameState !== GAME_STATES.READY) return;
    
    console.log('Game is ready, waiting for user input...');
    
    const handleReadyKey = (e) => {
      e.preventDefault();
      console.log('Ready key pressed, starting game...');
      startGame();
      playClick();
    };
    
    const handleReadyClick = () => {
      console.log('Ready clicked, starting game...');
      startGame();
      playClick();
    };

    window.addEventListener('keydown', handleReadyKey);
    document.addEventListener('click', handleReadyClick);
    
    // No auto-start - user must click or press key

    return () => {
      window.removeEventListener('keydown', handleReadyKey);
      document.removeEventListener('click', handleReadyClick);
    };
  }, [gameState, startGame]);

  // Handle mobile touch controls
  const handleMobileControl = useCallback((direction) => {
    if (isGameActive) {
      updateSnakeDirection(0, direction);
    }
  }, [isGameActive, updateSnakeDirection]);

  // Handle game over
  useEffect(() => {
    if (isGameOver || isVictory) {
      const finalStats = {
        mode: 'Classic',
        score: score,
        time: Math.floor(gameTime / 1000),
        foodEaten: foodEaten,
        speedReached: speedMultiplier,
        survived: Math.floor(gameTime / 1000)
      };
      
      setGameStats(finalStats);
      setShowGameOverModal(true);
    }
  }, [isGameOver, isVictory, score, gameTime, foodEaten, speedMultiplier]);

  // Handle recent achievements
  useEffect(() => {
    if (recentUnlocks.length > 0) {
      const latestAchievement = recentUnlocks[0];
      setNewAchievement(latestAchievement);
      setShowAchievementModal(true);
    }
  }, [recentUnlocks]);

  // Game actions
  const handleRestart = () => {
    setGameStats(null); // Clear game stats to hide match summary
    setShowGameOverModal(false);
    setShowAchievementModal(false);
    setNewAchievement(null);
    restartGame();
    playClick();
  };

  const handleQuit = () => {
    playClick();
    quitToMenu();
    navigate('/');
  };

  const handleContinue = () => {
    playClick();
    navigate('/game');
  };

  const handleShareScore = () => {
    const shareText = `🐍 Just scored ${formatScore(score)} points in SnakrX Classic Mode! 🎮\n\nTime: ${formatTime(Math.floor(gameTime / 1000))}\nFood eaten: ${foodEaten}\nMax speed: ${speedMultiplier.toFixed(1)}x\n\nCan you beat my score?`;
    
    if (navigator.share) {
      navigator.share({
        title: 'SnakrX Score',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard?.writeText(shareText);
      playClick();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner fullScreen text="Loading Classic Mode..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ready overlay */}
      {gameState === GAME_STATES.READY && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center">
            <div className="text-6xl mb-6 animate-bounce">🐍</div>
            <h2 className="text-3xl font-bold text-white mb-4">Get Ready!</h2>
            <p className="text-lg text-white/80 mb-8">Press any key or click to start</p>
            <button 
              onClick={() => {
                console.log('Start button clicked');
                startGame();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
            >
              Start Game
            </button>
          </div>
        </div>
      )}
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(74, 222, 128, 0.1) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Game Board */}
          <div className="lg:col-span-3 relative">
            {/* Floating HUD for mobile */}
            {mobile && (
              <FloatingGameHUD
                score={score}
                gameTime={gameTime}
                isPaused={isPaused}
                onPause={togglePause}
                onResume={togglePause}
              />
            )}

            {/* Main Game Board */}
            <div className="space-y-4">
              <div className="h-full flex items-center justify-center">
                <GameBoardWithOverlay
                  boardSize={boardSize}
                  snakes={snakes}
                  food={food}
                  isPaused={isPaused}
                  isGameOver={isGameOver}
                  showGrid={true}
                  className="shadow-2xl"
                />
              </div>
              
              {/* Game Legend */}
              <GameLegend gameMode={gameMode} className="mx-auto max-w-2xl" />
            </div>
          </div>

          {/* Game Controls Sidebar */}
          <div className="lg:col-span-1">
            <GameControls
              isPlaying={isGameActive}
              isPaused={isPaused}
              isGameOver={isGameOver}
              score={score}
              gameTime={gameTime}
              speed={speed}
              foodEaten={foodEaten}
              gameMode="classic"
              showMobileControls={mobile}
              onMobileControl={handleMobileControl}
              onPause={togglePause}
              onResume={togglePause}
              onRestart={handleRestart}
              onQuit={handleQuit}
            />
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <Modal
        isOpen={showGameOverModal}
        onClose={() => setShowGameOverModal(false)}
        title={isVictory ? "🎉 Victory!" : "💀 Game Over"}
        size="md"
        showCloseButton={false}
        closeOnBackdrop={false}
        closeOnEscape={false}
      >
        <div className="text-center space-y-6">
          {/* Final Score */}
          <div className="bg-gradient-sunset/10 rounded-xl p-6 border border-primary-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Final Score</h3>
            <div className="text-4xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-4">
              {formatScore(score)}
            </div>
            
            {/* Game Stats */}
            {gameStats && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/60">Time Survived</div>
                  <div className="text-white font-bold">{formatTime(gameStats.time)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/60">Food Eaten</div>
                  <div className="text-white font-bold">{gameStats.foodEaten}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/60">Max Speed</div>
                  <div className="text-white font-bold">{gameStats.speedReached.toFixed(1)}x</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/60">Snake Length</div>
                  <div className="text-white font-bold">{(snakes[0]?.body?.length || 0)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Personal Best Check */}
          {score > (userProfile?.stats?.classicBestScore || 0) && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
            >
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-amber-400 font-bold">NEW PERSONAL BEST!</div>
              <div className="text-white/70 text-sm">You beat your previous record!</div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              icon={<RotateCcw size={18} />}
              onClick={handleRestart}
              fullWidth
            >
              Play Again
            </Button>
            <Button
              variant="primary"
              icon={<ArrowRight size={18} />}
              onClick={handleContinue}
              fullWidth
            >
              Continue
            </Button>
          </div>

          {/* Share Score */}
          <Button
            variant="ghost-primary"
            icon={<Share2 size={18} />}
            onClick={handleShareScore}
            fullWidth
          >
            Share Score
          </Button>

          {/* Quick Actions */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-white/10">
            <Button variant="minimal" icon={<Home size={16} />} onClick={handleQuit}>
              Main Menu
            </Button>
          </div>
        </div>
      </Modal>

      {/* Mode Selection Modal */}
      <AnimatePresence>
        {showModeSelect && (
          <GameModeModal
            onSelect={handleModeSelect}
            onClose={() => navigate('/')}
          />
        )}
      </AnimatePresence>

      {/* Game Debug Panel */}
      <GameTest />

      {/* Achievement Modal */}
      <Modal
        isOpen={showAchievementModal}
        onClose={() => setShowAchievementModal(false)}
        title="🏆 Achievement Unlocked!"
        size="sm"
      >
        {newAchievement && (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              {newAchievement.icon}
            </motion.div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {newAchievement.title}
              </h3>
              <p className="text-white/70 mb-4">
                {newAchievement.description}
              </p>
              <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                newAchievement.tier === 'legendary' ? 'bg-amber-500/20 text-amber-300' :
                newAchievement.tier === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                newAchievement.tier === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                newAchievement.tier === 'uncommon' ? 'bg-emerald-500/20 text-emerald-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {newAchievement.tier} • +{newAchievement.points} points
              </div>
            </div>
            
            <Button
              variant="primary"
              onClick={() => setShowAchievementModal(false)}
              fullWidth
            >
              Awesome!
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClassicGame;