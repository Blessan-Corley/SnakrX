import React, { useEffect, useCallback, useState, useMemo } from 'react';
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
import { GameBoardWithOverlay } from '@/components/game/GameBoard';
import GameControls, { FloatingGameHUD } from '@/components/game/GameControls';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { playClick } from '@/utils/sound';
import { formatScore, formatTime, isMobile, DIRECTIONS, AI_DIFFICULTIES } from '@/utils/gameUtils';
import { useGameInput } from '@/hooks/useGameInput';

/**
 * VS AI Mode Game Page - COMPLETELY FIXED
 * No more infinite re-renders or state issues
 */
const VSAIGame = () => {
  const navigate = useNavigate();
  const { difficulty } = useParams();
  const { userProfile } = useAuth();
  
  // FIXED: Game state from context
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

  // FIXED: Game operations
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

  // FIXED: Local state with stable initial values
  const [gameOverModal, setGameOverModal] = useState(false);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameInitialized, setGameInitialized] = useState(false);

  const mobile = isMobile();

  // FIXED: Validate difficulty with useMemo to prevent re-computation
  const validDifficulty = useMemo(() => {
    return Object.values(AI_DIFFICULTIES).includes(difficulty) ? difficulty : AI_DIFFICULTIES.MEDIUM;
  }, [difficulty]);

  // FIXED: Difficulty config with useMemo
  const difficultyConfig = useMemo(() => ({
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
  }), []);

  const currentDifficulty = difficultyConfig[validDifficulty];

  // FIXED: Initialize game only once on mount
  useEffect(() => {
    let mounted = true;
    
    const startGame = async () => {
      if (gameInitialized) return; // Prevent multiple initializations
      
      try {
        setLoading(true);
        await initializeGame('vsai', validDifficulty, 2);
        
        if (mounted) {
          setGameInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to start VS AI game:', error);
        if (mounted) {
          navigate('/game');
        }
      }
    };

    startGame();
    
    return () => {
      mounted = false;
    };
  }, []); // FIXED: Empty dependency array to run only once

  // ENHANCED: Use ultra-responsive input system
  const gameInput = useGameInput({
    playerCount: 1,
    isPlaying: isGameActive,
    isPaused: isPaused,
    onDirectionChange: updateSnakeDirection,
    onPauseToggle: togglePause,
    onRestart: handleRestart,
    onQuit: handleQuit
  });

  // FIXED: Handle mobile controls with stable callback
  const handleMobileControl = useCallback((direction) => {
    if (isGameActive && !isPaused) {
      updateSnakeDirection(0, direction);
    }
  }, [isGameActive, isPaused, updateSnakeDirection]);

  // FIXED: Determine winner with proper dependency tracking
  useEffect(() => {
    if (isGameOver && Array.isArray(snakes) && snakes.length >= 2) {
      const playerAlive = !deadPlayers.has(0);
      const aiAlive = !deadPlayers.has(1);
      
      let gameWinner = null;
      if (playerAlive && !aiAlive) {
        gameWinner = 'player';
      } else if (!playerAlive && aiAlive) {
        gameWinner = 'ai';
      } else if (!playerAlive && !aiAlive) {
        // Both died - check who has higher score or longer snake
        const playerLength = snakes[0]?.body?.length || 0;
        const aiLength = snakes[1]?.body?.length || 0;
        gameWinner = playerLength >= aiLength ? 'player' : 'ai';
      } else {
        gameWinner = 'draw';
      }
      
      setWinner(gameWinner);
      setGameOverModal(true);
    }
  }, [isGameOver, snakes, deadPlayers]); // FIXED: Specific dependencies

  // FIXED: Game action handlers with stable callbacks
  const handleRestart = useCallback(() => {
    playClick();
    setGameOverModal(false);
    setWinner(null);
    restartGame();
  }, [restartGame]);

  const handleQuit = useCallback(() => {
    playClick();
    quitToMenu();
    navigate('/');
  }, [quitToMenu, navigate]);

  const handleContinue = useCallback(() => {
    playClick();
    navigate('/game');
  }, [navigate]);

  const handleChangeDifficulty = useCallback(() => {
    playClick();
    navigate('/game');
  }, [navigate]);

  const handleShareScore = useCallback(() => {
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
  }, [winner, currentDifficulty, score, gameTime]);

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

              {/* Game Controls */}
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
        isOpen={gameOverModal}
        onClose={() => setGameOverModal(false)}
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
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="text-lg font-semibold text-white mb-4">Battle Summary</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{snakes[0]?.body?.length || 0}</div>
                <div className="text-white/60 text-sm">Your Length</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{snakes[1]?.body?.length || 0}</div>
                <div className="text-white/60 text-sm">AI Length</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60">Your Score</div>
                <div className="text-white font-bold">{formatScore(score)}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60">Battle Time</div>
                <div className="text-white font-bold">{formatTime(Math.floor(gameTime / 1000))}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60">Difficulty</div>
                <div className={`font-bold ${currentDifficulty.color}`}>{currentDifficulty.name}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60">Food Eaten</div>
                <div className="text-white font-bold">{foodEaten}</div>
              </div>
            </div>
          </div>

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
    </div>
  );
};

export default VSAIGame;