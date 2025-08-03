import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Share2, ArrowRight } from 'lucide-react';
import { useGame, useGameOperations } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { useAchievementOperations } from '@/hooks/useAchievements';
import useGameInput from '@/hooks/useGameInput';
import { GameBoardWithOverlay } from '@/components/game/GameBoard';
import GameControls from '@/components/game/GameControls';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { playClick } from '@/utils/sound';
import { formatScore, formatTime, isMobile, DIRECTIONS, GAME_STATES } from '@/utils/gameUtils';

const Game = () => {
  const navigate = useNavigate();
  const { mode, difficulty, playerCount } = useParams();
  const { userProfile } = useAuth();
  const { recentUnlocks } = useAchievementOperations();

  const { gameState, snakes, food, boardSize, score, gameTime, speed, foodEaten, isPaused, deadPlayers } = useGame();
  const { initializeGame, startGame, updateSnakeDirection, togglePause, restartGame, quitToMenu, isGameActive, isGameOver, isVictory, speedMultiplier } = useGameOperations();

  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [gameStats, setGameStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const mobile = isMobile();
  // Fix player count: VS AI always needs 2 players (human + AI)
  const numPlayers = mode === 'vsai' ? 2 : (parseInt(playerCount) || 1);

  // Enhanced input system
  const {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    handleTouchControl,
    getCurrentKeyMappings
  } = useGameInput({
    playerCount: numPlayers,
    isPlaying: isGameActive,
    isPaused,
    onDirectionChange: updateSnakeDirection,
    onPauseToggle: togglePause,
    onRestart: restartGame,
    onQuit: () => {
      playClick();
      quitToMenu();
    }
  });

  useEffect(() => {
    const startGame = async () => {
      try {
        setLoading(true);
        await initializeGame(mode, difficulty, numPlayers);
      } catch (error) {
        console.error(`Failed to start ${mode} game:`, error);
        navigate('/game');
      } finally {
        setLoading(false);
      }
    };
    startGame();
  }, [initializeGame, navigate, mode, difficulty, numPlayers]);

  // Add ready overlay and start logic
  useEffect(() => {
    if (gameState !== GAME_STATES.READY) return;
    
    const handleReadyKey = (e) => {
      e.preventDefault();
      startGame();
      playClick();
    };
    
    const handleReadyClick = () => {
      startGame();
      playClick();
    };

    window.addEventListener('keydown', handleReadyKey);
    document.addEventListener('click', handleReadyClick);
    
    // Auto-start after 3 seconds
    const autoStartTimer = setTimeout(() => {
      if (gameState === GAME_STATES.READY) {
        startGame();
      }
    }, 3000);

    return () => {
      window.removeEventListener('keydown', handleReadyKey);
      document.removeEventListener('click', handleReadyClick);
      clearTimeout(autoStartTimer);
    };
  }, [gameState, startGame]);

  // The new input system handles all keyboard controls

  useEffect(() => {
    if (isGameOver || isVictory) {
      const finalStats = { mode, score, time: Math.floor(gameTime / 1000), foodEaten, speedReached: speedMultiplier };
      setGameStats(finalStats);
      setShowGameOverModal(true);
    }
  }, [isGameOver, isVictory, mode, score, gameTime, foodEaten, speedMultiplier]);

  useEffect(() => {
    if (recentUnlocks.length > 0) {
      const latestAchievement = recentUnlocks[0];
      setNewAchievement(latestAchievement);
      setShowAchievementModal(true);
    }
  }, [recentUnlocks]);

  const handleRestart = () => {
    playClick();
    setShowGameOverModal(false);
    restartGame();
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
    const shareText = `I scored ${formatScore(score)} in SnakrX ${mode} mode! Can you beat my score?`;
    if (navigator.share) {
      navigator.share({ title: 'SnakrX Score', text: shareText, url: window.location.origin });
    } else {
      navigator.clipboard?.writeText(shareText);
      playClick();
    }
  };

  if (loading) return <LoadingSpinner fullScreen text={`Loading ${mode} mode...`} />;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ready overlay */}
      {gameState === GAME_STATES.READY && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center">
            <div className="text-6xl mb-6 animate-bounce">🐍</div>
            <h2 className="text-3xl font-bold text-white mb-4">Get Ready!</h2>
            <p className="text-lg text-white/80 mb-8">Press any key to start</p>
          </div>
        </div>
      )}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 60%)',
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          <div className="lg:col-span-3 relative">
            <div 
              className="h-full flex items-center justify-center"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
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
          </div>
          <div className="lg:col-span-1">
            <GameControls 
              isPlaying={isGameActive} 
              isPaused={isPaused} 
              isGameOver={isGameOver} 
              score={score} 
              gameTime={gameTime} 
              speed={speed} 
              foodEaten={foodEaten} 
              gameMode={mode} 
              difficulty={difficulty}
              showMobileControls={mobile}
              onMobileControl={handleTouchControl}
              onPause={togglePause} 
              onResume={togglePause} 
              onRestart={handleRestart} 
              onQuit={handleQuit} 
              disabled={gameState !== GAME_STATES.PLAYING} 
            />
            
            {/* Key mappings display */}
            {!mobile && (
              <div className="mt-4 p-4 bg-black/20 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Controls</h4>
                <div className="space-y-1 text-xs text-white/70">
                  {numPlayers === 1 ? (
                    <div>
                      <span className="text-white">Player:</span> WASD or Arrow Keys
                    </div>
                  ) : (
                    getCurrentKeyMappings().map((mapping, index) => (
                      <div key={mapping.playerId}>
                        <span className="text-white">{mapping.playerName}:</span> 
                        {mapping.playerId === 0 ? ' WASD' :
                         mapping.playerId === 1 ? ' Arrow Keys' :
                         mapping.playerId === 2 ? ' IJKL' : 
                         ' Numpad 8456'}
                      </div>
                    ))
                  )}
                  <div className="pt-1 border-t border-white/10 mt-2">
                    <span className="text-white/50">Space:</span> Pause | <span className="text-white/50">R:</span> Restart | <span className="text-white/50">Esc:</span> Quit
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={showGameOverModal} onClose={() => setShowGameOverModal(false)} title={isVictory ? "Victory!" : "Game Over"} size="md" showCloseButton={false} closeOnBackdrop={false} closeOnEscape={false}>
        <div className="text-center space-y-6">
          <div className="bg-gradient-sunset/10 rounded-xl p-6 border border-primary-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">Final Score</h3>
            <div className="text-4xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-4">{formatScore(score)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" icon={<RotateCcw size={18} />} onClick={handleRestart} fullWidth>Play Again</Button>
            <Button variant="primary" icon={<ArrowRight size={18} />} onClick={handleContinue} fullWidth>Continue</Button>
          </div>
          <Button variant="ghost-primary" icon={<Share2 size={18} />} onClick={handleShareScore} fullWidth>Share Score</Button>
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-white/10">
            <Button variant="minimal" icon={<Home size={16} />} onClick={handleQuit}>Main Menu</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAchievementModal} onClose={() => setShowAchievementModal(false)} title="Achievement Unlocked!" size="sm">
        {newAchievement && (
          <div className="text-center space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-6xl mb-4">{newAchievement.icon}</motion.div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{newAchievement.title}</h3>
              <p className="text-white/70 mb-4">{newAchievement.description}</p>
            </div>
            <Button variant="primary" onClick={() => setShowAchievementModal(false)} fullWidth>Awesome!</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Game;