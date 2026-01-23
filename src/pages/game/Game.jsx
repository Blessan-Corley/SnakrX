import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, RotateCcw, Share2, ArrowRight, Gamepad2 } from 'lucide-react';
import { useGame } from '../../hooks/useGame.js';
import { useAchievementOperations } from '../../hooks/useAchievements.js';
import useGameInput from '../../hooks/useGameInput.js';
import { GameBoardWithOverlay } from '../../components/game/GameBoard.jsx';
import GameControls from '../../components/game/GameControls.jsx';
import InputPerformanceMonitor from '../../components/game/InputPerformanceMonitor.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import { playClick } from '../../utils/sound.js';
import { formatScore, isMobile, GAME_STATES } from '../../utils/gameUtils.js';

const Game = () => {
  const navigate = useNavigate();
  const { mode, difficulty, playerCount } = useParams();

  // ... (rest of hook calls)

  // ... (rest of logic)

  if (loading) return <LoadingSpinner fullScreen text={`Loading ${mode} mode...`} />;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ready overlay */}
      {gameState === GAME_STATES.READY && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center">
            <div className="flex justify-center mb-6 animate-bounce">
              <Gamepad2 size={64} className="text-primary-500" />
            </div>
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
      
      {/* ... rest of JSX */}
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
                deadPlayers={gameState.deadPlayers} 
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
              speedMultiplier={speedMultiplier}
              foodEaten={foodEaten} 
              gameMode={mode} 
              difficulty={difficulty}
              snakes={snakes}
              showMobileControls={mobile}
              onMobileControl={handleTouchControl}
              onPause={togglePause} 
              onResume={togglePause} 
              onRestart={handleRestart} 
              onQuit={handleQuit} 
              disabled={gameState !== GAME_STATES.PLAYING} 
            />
            
            {!mobile && (
              <div className="mt-4 p-4 bg-black/20 rounded-lg">
                <h4 className="text-sm font-semibold text-white mb-2">Controls</h4>
                <div className="space-y-1 text-xs text-white/70">
                  {numPlayers === 1 ? (
                    <div>
                      <span className="text-white">Player:</span> WASD or Arrow Keys
                    </div>
                  ) : (
                    getCurrentKeyMappings().map((mapping) => (
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

      <Modal isOpen={showGameOverModal} onClose={() => setShowGameOverModal(false)} title={modalTitle} size="md" showCloseButton={false} closeOnBackdrop={false} closeOnEscape={false}>
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

      {import.meta.env.DEV && (
        <InputPerformanceMonitor
          getInputPerformance={getInputPerformance}
          isVisible={showPerformanceMonitor}
          position="top-left"
        />
      )}

      {inputWarning && (
        <motion.div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="bg-yellow-500/90 text-black px-4 py-2 rounded-lg text-sm font-semibold">
            ⚠️ {inputWarning}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Game;