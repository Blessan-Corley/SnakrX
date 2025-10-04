import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  ArrowLeft, 
  Gamepad2, 
  Target, 
  Users, 
  Settings,
  Trophy,
  Clock,
  Star,
  Zap,
  Brain,
  Sword,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGameOperations } from '@/hooks/useGame';
import Button from '@/components/ui/Button';
import Card, { GameModeCard, StatsCard } from '@/components/ui/Card';
import { playClick } from '@/utils/sound';
import { isMobile, formatScore, formatTime } from '@/utils/gameUtils';

/**
 * Game Mode Selection Hub
 * Central page for choosing and configuring game modes
 */
const GamePage = () => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [playerCount, setPlayerCount] = useState(2);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  
  const { userProfile } = useAuth();
  const { initializeGame } = useGameOperations();
  const navigate = useNavigate();
  
  const mobile = isMobile();

  // Get user stats for quick display
  const userStats = userProfile?.stats || {};

  // Game mode configurations
  const gameModes = [
    {
      id: 'classic',
      title: 'Classic Mode',
      description: 'The timeless snake experience with endless gameplay and increasing speed.',
      icon: '🎮',
      gradient: 'from-green-400 to-emerald-600',
      features: ['Endless gameplay', 'Progressive difficulty', 'Personal best tracking'],
      stats: {
        played: userStats.classicGames || 0,
        bestScore: userStats.classicBestScore || 0,
        wins: userStats.classicWins || 0
      }
    },
    {
      id: 'vsai',
      title: 'VS AI Mode',
      description: 'Challenge intelligent AI opponents with advanced pathfinding algorithms.',
      icon: '🤖',
      gradient: 'from-blue-400 to-cyan-600',
      features: ['3 Difficulty levels', 'Smart AI opponents', 'Strategy-based gameplay'],
      stats: {
        played: userStats.vsAIGames || 0,
        bestScore: Math.max(userStats.aiEasyWins || 0, userStats.aiMediumWins || 0, userStats.aiImpossibleWins || 0) * 100,
        wins: userStats.vsAIWins || 0
      }
    },
    {
      id: 'multiplayer',
      title: 'Multiplayer Mode',
      description: mobile ? 'Available on desktop only for the best experience.' : 'Local multiplayer battles with friends on one screen.',
      icon: '👥',
      gradient: 'from-purple-400 to-pink-600',
      features: mobile ? ['Desktop only', 'Better controls', 'Full experience'] : ['Up to 4 players', 'Local multiplayer', 'Competitive gameplay'],
      stats: {
        played: userStats.multiplayerGames || 0,
        bestScore: 0,
        wins: userStats.multiplayerWins || 0
      },
      disabled: mobile
    }
  ];

  // AI difficulty levels
  const aiDifficulties = [
    {
      id: 'easy',
      name: 'Easy',
      description: 'AI plays at 65% optimality - Good for beginners',
      icon: '🟢',
      points: '5 points per food',
      color: 'text-green-400'
    },
    {
      id: 'medium',
      name: 'Medium',
      description: 'AI plays at 80% optimality - Balanced challenge',
      icon: '🟡',
      points: '10 points per food',
      color: 'text-yellow-400'
    },
    {
      id: 'impossible',
      name: 'Impossible',
      description: 'AI plays at 100% optimality - Ultimate challenge',
      icon: '🔴',
      points: '20 points per food',
      color: 'text-red-400'
    }
  ];

  // Player count options for multiplayer
  const playerCounts = [2, 3, 4];

  /**
   * Handle game mode selection
   */
  const handleModeSelect = (mode) => {
    if (mode.disabled) {
      setShowMobileWarning(true);
      return;
    }
    
    setSelectedMode(mode);
    playClick();
  };

  /**
   * Start the selected game
   */
  const startGame = () => {
    if (!selectedMode) return;

    try {
      if (selectedMode.id === 'classic') {
        navigate('/game/classic');
      } else if (selectedMode.id === 'vsai') {
        navigate(`/game/vsai/${aiDifficulty}`);
      } else if (selectedMode.id === 'multiplayer') {
        navigate(`/game/multiplayer/${playerCount}`);
      }
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  /**
   * Go back to main selection
   */
  const goBack = () => {
    setSelectedMode(null);
    playClick();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 25% 25%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your <span className="bg-gradient-sunset bg-clip-text text-transparent">Game Mode</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Select your preferred way to play and dive into the action
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedMode ? (
            /* Game Mode Selection */
            <motion.div
              key="selection"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-8"
            >
              {/* Game Modes Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gameModes.map((mode, index) => (
                  <motion.div
                    key={mode.id}
                    variants={itemVariants}
                    whileHover={{ scale: mode.disabled ? 1 : 1.02 }}
                    whileTap={{ scale: mode.disabled ? 1 : 0.98 }}
                  >
                    <Card
                      variant="glass"
                      clickable={!mode.disabled}
                      onClick={() => handleModeSelect(mode)}
                      className={`h-full transition-all duration-300 ${
                        mode.disabled 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:shadow-glow cursor-pointer'
                      }`}
                    >
                      <div className="text-center p-6">
                        <div className="text-6xl mb-4">{mode.icon}</div>
                        <h3 className="text-xl font-bold text-white mb-3">{mode.title}</h3>
                        <p className="text-white/70 mb-4 leading-relaxed">{mode.description}</p>
                        
                        {/* Features */}
                        <div className="space-y-2 mb-6">
                          {mode.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center justify-center text-sm text-white/60">
                              <div className="w-1 h-1 bg-primary-500 rounded-full mr-2" />
                              {feature}
                            </div>
                          ))}
                        </div>

                        {/* Stats */}
                        <div className="bg-white/5 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Games Played:</span>
                            <span className="text-white">{mode.stats.played}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Best Score:</span>
                            <span className="text-white">{formatScore(mode.stats.bestScore)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Wins:</span>
                            <span className="text-white">{mode.stats.wins}</span>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="mt-4">
                          {mode.disabled ? (
                            <div className="flex items-center justify-center text-orange-400 text-sm">
                              <AlertTriangle size={14} className="mr-1" />
                              Desktop Only
                            </div>
                          ) : (
                            <div className={`h-1 rounded-full bg-gradient-to-r ${mode.gradient} animate-pulse`} />
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Quick Stats */}
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-bold text-white text-center mb-6">Your Gaming Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatsCard
                    title="Total Games"
                    value={userStats.totalGames || 0}
                    icon={<Gamepad2 size={20} />}
                    subtitle="All modes"
                  />
                  <StatsCard
                    title="Best Score"
                    value={formatScore(userStats.bestScore || 0)}
                    icon={<Trophy size={20} />}
                    subtitle="Personal record"
                  />
                  <StatsCard
                    title="Play Time"
                    value={`${Math.floor((userStats.totalPlayTime || 0) / 60)}m`}
                    icon={<Clock size={20} />}
                    subtitle="Total minutes"
                  />
                  <StatsCard
                    title="Win Rate"
                    value={`${userStats.totalGames > 0 ? Math.round((userStats.totalWins || 0) / userStats.totalGames * 100) : 0}%`}
                    icon={<Star size={20} />}
                    subtitle="Success rate"
                  />
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* Mode Configuration */
            <motion.div
              key="configuration"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl mx-auto"
            >
              {/* Header */}
              <div className="flex items-center mb-8">
                <Button
                  variant="minimal"
                  icon={<ArrowLeft size={18} />}
                  onClick={goBack}
                  className="mr-4"
                />
                <div className="flex items-center">
                  <div className="text-3xl mr-3">{selectedMode.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedMode.title}</h2>
                    <p className="text-white/70">Configure your game settings</p>
                  </div>
                </div>
              </div>

              {/* VS AI Configuration */}
              {selectedMode.id === 'vsai' && (
                <div className="space-y-6 mb-8">
                  <h3 className="text-xl font-semibold text-white">Select Difficulty</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {aiDifficulties.map((difficulty) => (
                      <motion.div
                        key={difficulty.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          variant={aiDifficulty === difficulty.id ? "gradient" : "glass"}
                          clickable
                          onClick={() => {
                            setAiDifficulty(difficulty.id);
                            playClick();
                          }}
                          className="transition-all duration-200"
                        >
                          <div className="flex items-center p-4">
                            <div className="text-2xl mr-4">{difficulty.icon}</div>
                            <div className="flex-1">
                              <h4 className={`font-semibold ${difficulty.color}`}>{difficulty.name}</h4>
                              <p className="text-white/70 text-sm">{difficulty.description}</p>
                              <p className="text-primary-400 text-sm mt-1">{difficulty.points}</p>
                            </div>
                            {aiDifficulty === difficulty.id && (
                              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multiplayer Configuration */}
              {selectedMode.id === 'multiplayer' && (
                <div className="space-y-6 mb-8">
                  <h3 className="text-xl font-semibold text-white">Number of Players</h3>
                  <div className="flex space-x-4 justify-center">
                    {playerCounts.map((count) => (
                      <motion.button
                        key={count}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setPlayerCount(count);
                          playClick();
                        }}
                        className={`
                          w-16 h-16 rounded-xl border-2 transition-all duration-200
                          ${playerCount === count
                            ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                            : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                          }
                        `}
                      >
                        <div className="text-xl font-bold">{count}</div>
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-center text-white/60 text-sm">
                    Each player will need different keys: WASD, Arrow Keys, IJKL, and Numpad
                  </p>
                </div>
              )}

              {/* Classic Mode Info */}
              {selectedMode.id === 'classic' && (
                <div className="bg-white/5 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Game Rules</h3>
                  <div className="space-y-3 text-white/70">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <p>Eat food to grow longer and increase your score</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <p>Speed increases progressively as you eat more food</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <p>Avoid hitting walls or your own body</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <p>Use WASD or Arrow Keys to control your snake</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Start Game Button */}
              <div className="text-center">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Play size={20} />}
                  onClick={startGame}
                  className="px-12 py-4"
                >
                  Start Game
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Warning Modal */}
        <AnimatePresence>
          {showMobileWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowMobileWarning(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-card backdrop-blur-md border border-white/20 rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">💻</div>
                  <h3 className="text-xl font-bold text-white mb-3">Desktop Experience Required</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">
                    Multiplayer mode requires a desktop or laptop for the best experience with multiple players and proper controls.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowMobileWarning(false)}
                    fullWidth
                  >
                    Got it!
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GamePage;