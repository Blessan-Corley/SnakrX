import React from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Home, 
  Trophy, 
  Clock, 
  Target,
  Zap,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatScore, formatTime, getSpeedMultiplier, DIRECTIONS } from '@/utils/gameUtils';
import { playClick } from '@/utils/sound';

/**
 * Main Game Controls Component
 * Shows score, controls, and game information
 */
const GameControls = ({
  isPlaying = false,
  isPaused = false,
  isGameOver = false,
  score = 0,
  gameTime = 0,
  speed = 150,
  speedMultiplier = 1.0,
  foodEaten = 0,
  gameMode = 'classic',
  difficulty = null,
  showMobileControls = true,
  onMobileControl = () => {},
  onPause = () => {},
  onResume = () => {},
  onRestart = () => {},
  onQuit = () => {}
}) => {
  
  const formattedTime = Math.floor(gameTime); // gameTime is already in seconds

  // Difficulty display configuration
  const difficultyConfig = {
    easy: { name: 'Easy', color: 'text-green-400', icon: '🟢' },
    medium: { name: 'Medium', color: 'text-yellow-400', icon: '🟡' },
    impossible: { name: 'Impossible', color: 'text-red-400', icon: '🔴' }
  };

  const currentDifficulty = difficulty ? difficultyConfig[difficulty] : null;

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <Card variant="glass" padding="md">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Trophy className="mr-2" size={18} />
          Game Stats
        </h3>
        
        <div className="space-y-4">
          {/* Score */}
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-1">
              {formatScore(score)}
            </div>
            <div className="text-white/60 text-sm">Score</div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Clock size={16} className="mx-auto mb-1 text-blue-400" />
              <div className="font-bold text-white">{formatTime(formattedTime)}</div>
              <div className="text-white/60 text-xs">Time</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Target size={16} className="mx-auto mb-1 text-green-400" />
              <div className="font-bold text-white">{foodEaten}</div>
              <div className="text-white/60 text-xs">Food</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <Zap size={16} className="mx-auto mb-1 text-yellow-400" />
              <div className="font-bold text-white">{speedMultiplier.toFixed(1)}x</div>
              <div className="text-white/60 text-xs">Speed</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg mb-1">🎮</div>
              <div className="font-bold text-white text-xs">{gameMode}</div>
              <div className="text-white/60 text-xs">Mode</div>
            </div>
          </div>

          {/* Difficulty Display for VS AI */}
          {currentDifficulty && (
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg mb-1">{currentDifficulty.icon}</div>
              <div className={`font-bold ${currentDifficulty.color}`}>
                {currentDifficulty.name}
              </div>
              <div className="text-white/60 text-xs">AI Difficulty</div>
            </div>
          )}
        </div>
      </Card>

      {/* Game Controls */}
      <Card variant="glass" padding="md">
        <h3 className="text-lg font-semibold text-white mb-4">Controls</h3>
        
        <div className="space-y-3">
          {/* Pause/Resume */}
          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              try {
                if (isPaused) {
                  onResume();
                } else {
                  onPause();
                }
              } catch (error) {
                console.error('Pause/Resume error:', error);
              }
            }}
            disabled={isGameOver}
            icon={isPaused ? <Play size={18} /> : <Pause size={18} />}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>

          {/* Restart */}
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              try {
                onRestart();
              } catch (error) {
                console.error('Restart error:', error);
              }
            }}
            icon={<RotateCcw size={18} />}
          >
            Restart
          </Button>

          {/* Quit */}
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              try {
                onQuit();
              } catch (error) {
                console.error('Quit error:', error);
              }
            }}
            icon={<Home size={18} />}
          >
            Main Menu
          </Button>
        </div>
      </Card>

      {/* Mobile Touch Controls */}
      {showMobileControls && (
        <Card variant="glass" padding="md">
          <h3 className="text-lg font-semibold text-white mb-4">Touch Controls</h3>
          
          <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
            <div />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                try {
                  onMobileControl(DIRECTIONS.UP);
                  playClick();
                } catch (error) {
                  console.error('Mobile control error:', error);
                }
              }}
              disabled={!isPlaying || isPaused}
              icon={<ArrowUp size={20} />}
              className="aspect-square"
              soundEnabled={false}
            />
            <div />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                try {
                  onMobileControl(DIRECTIONS.LEFT);
                  playClick();
                } catch (error) {
                  console.error('Mobile control error:', error);
                }
              }}
              disabled={!isPlaying || isPaused}
              icon={<ArrowLeft size={20} />}
              className="aspect-square"
              soundEnabled={false}
            />
            <div />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                try {
                  onMobileControl(DIRECTIONS.RIGHT);
                  playClick();
                } catch (error) {
                  console.error('Mobile control error:', error);
                }
              }}
              disabled={!isPlaying || isPaused}
              icon={<ArrowRight size={20} />}
              className="aspect-square"
              soundEnabled={false}
            />
            
            <div />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                try {
                  onMobileControl(DIRECTIONS.DOWN);
                  playClick();
                } catch (error) {
                  console.error('Mobile control error:', error);
                }
              }}
              disabled={!isPlaying || isPaused}
              icon={<ArrowDown size={20} />}
              className="aspect-square"
              soundEnabled={false}
            />
            <div />
          </div>
        </Card>
      )}

      {/* Keyboard Instructions */}
      <Card variant="glass" padding="sm">
        <h4 className="text-sm font-semibold text-white mb-3">Keyboard</h4>
        <div className="text-xs text-white/70 space-y-1">
          <div>• Arrow Keys or WASD: Move</div>
          <div>• Space: Pause/Resume</div>
          <div>• R: Restart Game</div>
          <div>• ESC: Quit to Menu</div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Floating HUD for Mobile
 * Minimal overlay showing essential info
 */
export const FloatingGameHUD = ({
  score = 0,
  gameTime = 0,
  isPaused = false,
  onPause = () => {},
  onResume = () => {}
}) => {
  const formattedTime = Math.floor(gameTime); // gameTime is already in seconds
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-4 right-4 z-20"
    >
      <Card variant="glass" padding="sm" className="backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{formatScore(score)}</div>
              <div className="text-xs text-white/60">Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{formatTime(formattedTime)}</div>
              <div className="text-xs text-white/60">Time</div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={isPaused ? onResume : onPause}
            icon={isPaused ? <Play size={16} /> : <Pause size={16} />}
          />
        </div>
      </Card>
    </motion.div>
  );
};

/**
 * Game Over Overlay
 */
export const GameOverOverlay = ({
  isVisible = false,
  score = 0,
  gameTime = 0,
  isVictory = false,
  onRestart = () => {},
  onQuit = () => {}
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-30"
    >
      <Card variant="glass" padding="lg" className="text-center max-w-sm mx-4">
        <div className="text-4xl mb-4">
          {isVictory ? '🎉' : '💀'}
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">
          {isVictory ? 'Victory!' : 'Game Over'}
        </h3>
        
        <div className="text-3xl font-bold bg-gradient-sunset bg-clip-text text-transparent mb-4">
          {formatScore(score)}
        </div>
        
        <p className="text-white/70 mb-6">
          Survived for {formatTime(Math.floor(gameTime))}
        </p>
        
        <div className="flex space-x-3">
          <Button
            variant="ghost"
            onClick={onRestart}
            icon={<RotateCcw size={18} />}
            fullWidth
          >
            Play Again
          </Button>
          <Button
            variant="primary"
            onClick={onQuit}
            icon={<Home size={18} />}
            fullWidth
          >
            Menu
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default GameControls;