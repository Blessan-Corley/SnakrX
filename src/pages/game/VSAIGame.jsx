import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  RotateCcw, 
  Trophy, 
  Clock, 
  Target,
  Share2,
  ArrowRight,
  Brain,
  Zap,
  Crown,
  Sword
} from 'lucide-react';
import { useGame, useGameOperations } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { useAchievementOperations } from '@/hooks/useAchievements';
import { GameBoardWithOverlay } from '@/components/game/GameBoard';
import GameControls, { FloatingGameHUD } from '@/components/game/GameControls';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { playClick } from '@/utils/sound';
import { formatScore, formatTime, getSpeedMultiplier, isMobile, DIRECTIONS, GAME_STATES, AI_DIFFICULTIES } from '@/utils/gameUtils';

/**
 * VS AI Mode Game Page
 * Player vs AI snake battle with different difficulty levels
 */
const VSAIGame = () => {
  const navigate = useNavigate();
  const { difficulty } = useParams();
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
    isPaused,
    deadPlayers,
    aiController
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
  const [winner, setWinner] = useState(null);

  const mobile = isMobile();

  // Validate difficulty parameter
  const validDifficulty = Object.values(AI_DIFFICULTIES).includes(difficulty) ? difficulty : AI_DIFFICULTIES.MEDIUM;

  // Difficulty configurations
  const difficultyConfig = {
    [AI_DIFFICULTIES.EASY]: {
      name: 'Easy',
      icon: '🟢',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      description: 'AI plays at 65% optimality',
      points: 5
    },
    [AI_DIFFICULTIES.MEDIUM]: {
      name: 'Medium', 
      icon: '🟡',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      description: 'AI plays at 80% optimality',
      points: 10
    },
    [AI_DIFFICULTIES.IMPOSSIBLE]: {
      name: 'Impossible',
      icon: '🔴', 
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      description: 'AI plays at 100% optimality with perfect pathfinding',
      points: 20
    }
  };

  const currentDifficulty = difficultyConfig[validDifficulty];

  // Initialize game on mount
  useEffect(() => {
    const startGame = async () => {
      try {
        setLoading(true);
        await initializeGame('vsai', validDifficulty, 2);
      } catch (error) {
        console.error('Failed to start VS AI game:', error);
        navigate('/game');
      } finally {
        setLoading(false);
      }
    };

    startGame();
  }, [initializeGame, navigate, validDifficulty]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isGameActive && !isPaused) return;

      const key = e.code;
      
      // Movement controls (only for player 1)
      if (key === 'ArrowUp' || key === 'KeyW') {
        updateSnakeDirection(0, DIRECTIONS.UP);
      } else if (key === 'ArrowDown' || key === 'KeyS') {
        updateSnakeDirection(0, DIRECTIONS.DOWN);
      } else if (key === 'ArrowLeft' || key === 'KeyA') {
        updateSnakeDirection(0, DIRECTIONS.LEFT);
      } else if (key === 'ArrowRight' || key === 'KeyD') {
        updateSnakeDirection(0, DIRECTIONS.RIGHT);
      }
      
      // Game controls
      else if (key === 'Space') {
        e.preventDefault();
        togglePause();
      } else if (key === 'KeyR') {
        handleRestart();
      } else if (key === 'Escape') {
        handleQuit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isGameActive, isPaused, updateSnakeDirection, togglePause]);

  // Handle mobile touch controls
  const handleMobileControl = useCallback((direction) => {
    if (isGameActive) {
      updateSnakeDirection(0, direction);
    }
  }, [isGameActive, updateSnakeDirection]);

  // Determine winner when game ends
  useEffect(() => {
    if (isGameOver && snakes.length >= 2) {
      const playerAlive = !deadPlayers.has(0);
      const aiAlive = !deadPlayers.has(1);
      
      if (playerAlive && !aiAlive) {
        setWinner('player');
      } else if (!playerAlive && aiAlive) {
        setWinner('ai');
      } else if (!playerAlive && !aiAlive) {
        // Both died - check who has higher score or longer snake
        const playerLength = snakes[0]?.body?.length || 0;
        const aiLength = snakes[1]?.body?.length || 0;
        setWinner(playerLength >= aiLength ? 'player' : 'ai');
      } else {
        setWinner('draw');
      }
    }
  }, [isGameOver, snakes, deadPlayers]);

  // Handle game over
  useEffect(() => {
    if (isGameOver) {
      const finalStats = {
        mode: `VS AI (${currentDifficulty.name})`,
        difficulty: validDifficulty,
        score: score,
        time: Math.floor(gameTime / 1000),
        foodEaten: foodEaten,
        speedReached: speedMultiplier,
        winner: winner,
        playerLength: snakes[0]?.body?.length || 0,
        aiLength: snakes[1]?.body?.length || 0
      };
      
      setGameStats(finalStats);
      setShowGameOverModal(true);
    }
  }, [isGameOver, score, gameTime, foodEaten, speedMultiplier, winner, snakes, currentDifficulty, validDifficulty]);

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
    playClick();
    setShowGameOverModal(false);
    setWinner(null);
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

  const handleChangeDifficulty = () => {
    playClick();
    navigate('/game');
  };

  const handleShareScore = () => {
    const result = winner === 'player' ? 'defeated' : winner === 'ai' ? 'lost to' : 'tied with';
    const shareText = `🐍 I just ${result} the AI on ${currentDifficulty.name} difficulty in SnakrX! 🤖\n\nScore: ${formatScore(score)}\nTime: ${formatTime(Math.floor(gameTime / 1000))}\nDifficulty: ${currentDifficulty.name}\n\nCan you beat the AI?`;
    
    if (navigator.share) {
      navigator.share({
        title: 'SnakrX VS AI Result',
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
        <LoadingSpinner fullScreen text={`Loading VS AI (${currentDifficulty.name})...`} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.1) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)'
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

            {/* Difficulty Banner */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
              <Card 
                variant="glass" 
                padding="sm" 
                className={`${currentDifficulty.bgColor} ${currentDifficulty.borderColor} backdrop-blur-md`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{currentDifficulty.icon}</span>
                  <span className={`font-bold ${currentDifficulty.color}`}>
                    VS AI ({currentDifficulty.name})
                  </span>
                  <span className="text-white/60 text-sm">
                    {currentDifficulty.points} pts/food
                  </span>
                </div>
              </Card>
            </div>

            {/* Main Game Board */}
            <div className="h-full flex items-center justify-center">
              <GameBoardWithOverlay
                boardSize={boardSize}
                snakes={snakes}
                food={food}
                deadPlayers={deadPlayers}
                isPaused={isPaused}
                isGameOver={isGameOver}
                showGrid={true}
                className="shadow-2xl"
              />
            </div>
          </div>

          {/* Game Controls Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* AI Status */}
              <Card variant="glass" padding="sm">
                <div className="text-center">
                  <div className="text-2xl mb-2">🤖</div>
                  <h3 className="font-bold text-white mb-2">AI Opponent</h3>
                  <p className="text-white/70 text-sm mb-3">{currentDifficulty.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">AI Status:</span>
                    <span className={deadPlayers.has(1) ? 'text-red-400' : 'text-green-400'}>
                      {deadPlayers.has(1) ? 'Defeated 💀' : 'Active 🧠'}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Player vs AI Stats */}
              <Card variant="glass" padding="sm">
                <h3 className="text-lg font-semibold text-white mb-3">Battle Stats</h3>
                <div className="space-y-3">
                  {/* Player */}
                  <div className={`flex items-center justify-between p-2 rounded-lg ${
                    deadPlayers.has(0) 
                      ? 'bg-red-500/10 border border-red-500/20' 
                      : 'bg-green-500/10 border border-green-500/20'
                  }`}>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-green-500 mr-3" />
                      <span className="font-medium text-white">You</span>
                    </div>
                    <div className="text-sm text-white/80">
                      Length: {snakes[0]?.body?.length || 0}
                    </div>
                  </div>

                  {/* AI */}
                  <div className={`flex items-center justify-between p-2 rounded-lg ${
                    deadPlayers.has(1) 
                      ? 'bg-red-500/10 border border-red-500/20' 
                      : 'bg-gray-500/10 border border-gray-500/20'
                  }`}>
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full bg-gray-500 mr-3" />
                      <span className="font-medium text-white">AI</span>
                    </div>
                    <div className="text-sm text-white/80">
                      Length: {snakes[1]?.body?.length || 0}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Regular Game Controls */}
              <GameControls
                isPlaying={isGameActive}
                isPaused={isPaused}
                isGameOver={isGameOver}
                score={score}
                gameTime={gameTime}
                speed={speed}
                foodEaten={foodEaten}
                gameMode="vsai"
                difficulty={validDifficulty}
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
      </div>

      {/* Game Over Modal */}
      <Modal
        isOpen={showGameOverModal}
        onClose={() => setShowGameOverModal(false)}
        title={winner === 'player' ? "🎉 Victory!" : winner === 'ai' ? "🤖 AI Wins!" : "🤝 Draw!"}
        size="md"
        showCloseButton={false}
        closeOnBackdrop={false}
        closeOnEscape={false}
      >
        <div className="text-center space-y-6">
          {/* Result Banner */}
          <div className={`rounded-xl p-6 border ${
            winner === 'player' 
              ? 'bg-green-500/10 border-green-500/20' 
              : winner === 'ai' 
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-yellow-500/10 border-yellow-500/20'
          }`}>
            <div className="text-4xl mb-2">
              {winner === 'player' ? '👑' : winner === 'ai' ? '🤖' : '🤝'}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {winner === 'player' ? 'You Won!' : winner === 'ai' ? 'AI Wins!' : 'Draw!'}
            </h3>
            <p className="text-white/70">
              {winner === 'player' 
                ? `Congratulations! You defeated the AI on ${currentDifficulty.name} difficulty!`
                : winner === 'ai'
                  ? `The AI proved too smart this time. Try again!`
                  : 'Both players fought valiantly to a draw!'
              }
            </p>
          </div>

          {/* Battle Results */}
          {gameStats && (
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Battle Summary</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{gameStats.playerLength}</div>
                  <div className="text-white/60 text-sm">Your Length</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">{gameStats.aiLength}</div>
                  <div className="text-white/60 text-sm">AI Length</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/60">Your Score</div>
                  <div className="text-white font-bold">{formatScore(gameStats.score)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/60">Battle Time</div>
                  <div className="text-white font-bold">{formatTime(gameStats.time)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/60">Difficulty</div>
                  <div className={`font-bold ${currentDifficulty.color}`}>{currentDifficulty.name}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-white/60">Food Eaten</div>
                  <div className="text-white font-bold">{gameStats.foodEaten}</div>
                </div>
              </div>
            </div>
          )}

          {/* Achievement for beating impossible AI */}
          {winner === 'player' && validDifficulty === AI_DIFFICULTIES.IMPOSSIBLE && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4"
            >
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-purple-400 font-bold">IMPOSSIBLE CONQUERED!</div>
              <div className="text-white/70 text-sm">You defeated the AI on its hardest difficulty!</div>
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
              Rematch
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

          {/* Additional Actions */}
          <div className="space-y-3">
            <Button
              variant="ghost-primary"
              icon={<Share2 size={18} />}
              onClick={handleShareScore}
              fullWidth
            >
              Share Result
            </Button>
            
            <Button
              variant="ghost-primary"
              icon={<Brain size={18} />}
              onClick={handleChangeDifficulty}
              fullWidth
            >
              Try Different Difficulty
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-white/10">
            <Button variant="minimal" icon={<Home size={16} />} onClick={handleQuit}>
              Main Menu
            </Button>
          </div>
        </div>
      </Modal>

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

export default VSAIGame;