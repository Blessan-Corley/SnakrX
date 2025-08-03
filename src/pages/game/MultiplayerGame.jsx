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
  Users,
  Crown,
  Skull,
  AlertTriangle
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
import { formatScore, formatTime, getSpeedMultiplier, isMobile, DIRECTIONS, GAME_STATES, SNAKE_COLORS } from '@/utils/gameUtils';
import { useGameInput } from '@/hooks/useGameInput';

/**
 * Local Multiplayer Game Page
 * Up to 4 players on one screen with different control schemes
 */
const MultiplayerGame = () => {
  const navigate = useNavigate();
  const { playerCount } = useParams();
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
    deadPlayers
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
  const [rankings, setRankings] = useState([]);

  const mobile = isMobile();
  
  // Validate and parse player count
  const numPlayers = Math.min(Math.max(parseInt(playerCount) || 2, 2), 4);

  // Player control schemes
  const controlSchemes = [
    { // Player 1 - WASD
      up: ['KeyW'],
      down: ['KeyS'],
      left: ['KeyA'],
      right: ['KeyD'],
      name: 'WASD'
    },
    { // Player 2 - Arrow Keys
      up: ['ArrowUp'],
      down: ['ArrowDown'],
      left: ['ArrowLeft'],
      right: ['ArrowRight'],
      name: 'Arrows'
    },
    { // Player 3 - IJKL
      up: ['KeyI'],
      down: ['KeyK'],
      left: ['KeyJ'],
      right: ['KeyL'],
      name: 'IJKL'
    },
    { // Player 4 - Numpad
      up: ['Numpad8'],
      down: ['Numpad5'],
      left: ['Numpad4'],
      right: ['Numpad6'],
      name: 'Numpad'
    }
  ];

  // Player colors and info
  const playerInfo = [
    { name: 'Player 1', color: SNAKE_COLORS.player, emoji: '🟢' },
    { name: 'Player 2', color: SNAKE_COLORS.player2, emoji: '🔵' },
    { name: 'Player 3', color: SNAKE_COLORS.player3, emoji: '🟡' },
    { name: 'Player 4', color: SNAKE_COLORS.player4, emoji: '🔴' }
  ];

  // Block mobile users
  useEffect(() => {
    if (mobile) {
      navigate('/game', { 
        state: { 
          error: 'Multiplayer mode requires a desktop or laptop for the best experience with multiple players and proper controls.' 
        }
      });
    }
  }, [mobile, navigate]);

  // Initialize game on mount
  useEffect(() => {
    if (mobile) return;
    
    const startGame = async () => {
      try {
        setLoading(true);
        await initializeGame('multiplayer', 'medium', numPlayers);
      } catch (error) {
        console.error('Failed to start multiplayer game:', error);
        navigate('/game');
      } finally {
        setLoading(false);
      }
    };

    startGame();
  }, [initializeGame, navigate, numPlayers, mobile]);

  // ENHANCED: Use ultra-responsive input system for multiplayer
  const gameInput = useGameInput({
    playerCount: numPlayers,
    isPlaying: isGameActive,
    isPaused: isPaused,
    onDirectionChange: updateSnakeDirection,
    onPauseToggle: togglePause,
    onRestart: handleRestart,
    onQuit: handleQuit
  });

  // Calculate winner and rankings when game ends
  useEffect(() => {
    if (isGameOver && snakes.length >= 2) {
      const alivePlayers = [];
      const deadPlayersList = [];
      
      snakes.forEach((snake, index) => {
        const playerData = {
          index,
          name: playerInfo[index]?.name || `Player ${index + 1}`,
          color: playerInfo[index]?.color || SNAKE_COLORS.player,
          emoji: playerInfo[index]?.emoji || '⚪',
          length: snake.body?.length || 0,
          alive: !deadPlayers.has(index)
        };
        
        if (deadPlayers.has(index)) {
          deadPlayersList.push(playerData);
        } else {
          alivePlayers.push(playerData);
        }
      });
      
      // Sort alive players by length (descending), dead players by length (descending)
      alivePlayers.sort((a, b) => b.length - a.length);
      deadPlayersList.sort((a, b) => b.length - a.length);
      
      // Create final rankings (alive players first, then dead players)
      const finalRankings = [...alivePlayers, ...deadPlayersList];
      setRankings(finalRankings);
      
      // Set winner (first alive player, or longest snake if all dead)
      setWinner(finalRankings[0]);
    }
  }, [isGameOver, snakes, deadPlayers, playerInfo]);

  // Handle game over
  useEffect(() => {
    if (isGameOver) {
      const finalStats = {
        mode: `Multiplayer (${numPlayers}P)`,
        playerCount: numPlayers,
        time: Math.floor(gameTime / 1000),
        speedReached: speedMultiplier,
        rankings: rankings,
        totalFood: foodEaten
      };
      
      setGameStats(finalStats);
      setShowGameOverModal(true);
    }
  }, [isGameOver, gameTime, speedMultiplier, rankings, numPlayers, foodEaten]);

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
    setRankings([]);
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
    const winnerText = winner ? `${winner.name} won` : 'Epic battle';
    const shareText = `🐍 ${winnerText} our ${numPlayers}-player SnakrX battle! 👥\n\nGame time: ${formatTime(Math.floor(gameTime / 1000))}\nTotal food eaten: ${foodEaten}\n\nJoin the multiplayer mayhem!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'SnakrX Multiplayer Battle',
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
        <LoadingSpinner fullScreen text={`Loading ${numPlayers}-Player Battle...`} />
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
              'radial-gradient(circle at 25% 25%, rgba(147, 51, 234, 0.1) 0%, transparent 60%)',
              'radial-gradient(circle at 75% 75%, rgba(219, 39, 119, 0.1) 0%, transparent 60%)',
              'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 60%)'
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Game Board */}
          <div className="lg:col-span-3 relative">
            {/* Multiplayer Banner */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
              <Card variant="glass" padding="sm" className="bg-purple-500/10 border-purple-500/20 backdrop-blur-md">
                <div className="flex items-center space-x-2">
                  <Users size={20} className="text-purple-400" />
                  <span className="font-bold text-purple-400">
                    {numPlayers}-Player Battle
                  </span>
                  <span className="text-white/60 text-sm">
                    Local Multiplayer
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
              {/* Players Status */}
              <Card variant="glass" padding="sm">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Users className="mr-2" size={18} />
                  Players ({numPlayers})
                </h3>
                <div className="space-y-2">
                  {snakes.slice(0, numPlayers).map((snake, index) => {
                    const player = playerInfo[index];
                    const isDead = deadPlayers.has(index);
                    const controls = controlSchemes[index];
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          isDead 
                            ? 'bg-red-500/10 border-red-500/20 opacity-60' 
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: isDead ? SNAKE_COLORS.dead : player.color }}
                            />
                            <span className={`font-medium ${isDead ? 'text-white/50' : 'text-white'}`}>
                              {player.name}
                            </span>
                            {isDead && <Skull size={14} className="ml-2 text-red-400" />}
                          </div>
                          <span className="text-xs text-white/60">
                            {controls?.name}
                          </span>
                        </div>
                        <div className="text-sm text-white/70">
                          Length: {snake.body?.length || 0}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Controls Help */}
              <Card variant="glass" padding="sm">
                <h3 className="text-lg font-semibold text-white mb-3">Controls</h3>
                <div className="space-y-3 text-sm">
                  {controlSchemes.slice(0, numPlayers).map((controls, index) => {
                    const player = playerInfo[index];
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: player.color }}
                          />
                          <span className="text-white/70">{player.name}:</span>
                        </div>
                        <span className="font-mono text-white bg-white/10 px-2 py-1 rounded text-xs">
                          {controls.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60">
                  <div>• Space: Pause</div>
                  <div>• R: Restart</div>
                  <div>• ESC: Quit</div>
                </div>
              </Card>

              {/* Game Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Card variant="glass" padding="sm" className="text-center">
                  <Clock size={16} className="mx-auto mb-1 text-blue-400" />
                  <div className="text-sm text-white/60">Time</div>
                  <div className="font-bold text-white text-sm">{formatTime(Math.floor(gameTime / 1000))}</div>
                </Card>
                
                <Card variant="glass" padding="sm" className="text-center">
                  <Target size={16} className="mx-auto mb-1 text-green-400" />
                  <div className="text-sm text-white/60">Food</div>
                  <div className="font-bold text-white text-sm">{foodEaten}</div>
                </Card>
              </div>

              {/* Game Controls */}
              <Card variant="glass" padding="sm">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="ghost"
                    onClick={togglePause}
                    disabled={isGameOver}
                    fullWidth
                    size="sm"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={handleRestart}
                    icon={<RotateCcw size={16} />}
                    fullWidth
                    size="sm"
                  >
                    Restart
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  onClick={handleQuit}
                  icon={<Home size={16} />}
                  fullWidth
                  size="sm"
                  className="mt-3"
                >
                  Main Menu
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <Modal
        isOpen={showGameOverModal}
        onClose={() => setShowGameOverModal(false)}
        title="🏁 Battle Complete!"
        size="md"
        showCloseButton={false}
        closeOnBackdrop={false}
        closeOnEscape={false}
      >
        <div className="text-center space-y-6">
          {/* Winner Banner */}
          {winner && (
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
              <div className="text-4xl mb-2">👑</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {winner.name} Wins!
              </h3>
              <p className="text-white/70">
                Victory achieved with a length of {winner.length}!
              </p>
            </div>
          )}

          {/* Final Rankings */}
          {rankings.length > 0 && (
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-white mb-4">Final Rankings</h4>
              
              <div className="space-y-3">
                {rankings.map((player, index) => (
                  <motion.div
                    key={player.index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 
                        ? 'bg-amber-500/10 border border-amber-500/20' 
                        : player.alive
                          ? 'bg-white/5 border border-white/10'
                          : 'bg-red-500/5 border border-red-500/10'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                        {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: player.alive ? player.color : SNAKE_COLORS.dead }}
                      />
                      <div>
                        <div className={`font-medium ${player.alive ? 'text-white' : 'text-white/50'}`}>
                          {player.name}
                        </div>
                        <div className="text-xs text-white/60">
                          {player.alive ? 'Survived' : 'Eliminated'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">Length: {player.length}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Battle Stats */}
          {gameStats && (
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Battle Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{formatTime(gameStats.time)}</div>
                  <div className="text-white/60">Battle Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{gameStats.totalFood}</div>
                  <div className="text-white/60">Total Food Eaten</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              icon={<RotateCcw size={18} />}
              onClick={handleRestart}
              fullWidth
            >
              Battle Again
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

          {/* Share Result */}
          <Button
            variant="ghost-primary"
            icon={<Share2 size={18} />}
            onClick={handleShareScore}
            fullWidth
          >
            Share Battle Result
          </Button>

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

export default MultiplayerGame;