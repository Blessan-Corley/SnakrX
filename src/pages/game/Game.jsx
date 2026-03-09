import AchievementUnlockModal from '../../components/game/AchievementUnlockModal.jsx';
import GameDeveloperHud from '../../components/game/GameDeveloperHud.jsx';
import GameResultModal from '../../components/game/GameResultModal.jsx';
import GameSessionBackground from '../../components/game/GameSessionBackground.jsx';
import GameStage from '../../components/game/GameStage.jsx';
import { ConfirmModal } from '../../components/ui/Modal.jsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner.jsx';
import { GAME_STATES, MODE_DESCRIPTIONS } from '../../utils/gameUtils.js';
import { useGamePageController } from './useGamePageController.js';

const Game = () => {
  const controller = useGamePageController();

  if (controller.loading) {
    return <LoadingSpinner fullScreen text={`Loading ${controller.resolvedMode} mode...`} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <GameSessionBackground />

      <GameStage
        boardSize={controller.boardSize}
        currentKeyMappings={controller.getCurrentKeyMappings()}
        deadPlayers={controller.deadPlayers}
        food={controller.food}
        foodEaten={controller.foodEaten}
        gameState={controller.gameStatus}
        gameStates={GAME_STATES}
        gameTime={controller.gameTime}
        highlightCollision={controller.highlightCollision}
        isGameActive={controller.isGameActive}
        isGameOver={controller.isGameOver}
        isMultiplayerMode={controller.isMultiplayerMode}
        isPaused={controller.isPaused}
        mobile={controller.mobile}
        modeDescriptions={MODE_DESCRIPTIONS}
        multiplayerReadyPlayers={controller.multiplayerReadyPlayers}
        navigate={controller.navigate}
        numPlayers={controller.numPlayers}
        onQuit={controller.handleQuit}
        onRestart={controller.handleRestart}
        onTogglePause={controller.togglePause}
        onTouchControl={controller.handleTouchControl}
        onTouchEnd={controller.onTouchEnd}
        onTouchMove={controller.onTouchMove}
        onTouchStart={controller.onTouchStart}
        readyPlayersCount={controller.readyPlayersCount}
        resolvedDifficulty={controller.resolvedDifficulty}
        resolvedMode={controller.resolvedMode}
        score={controller.score}
        showCollisionHighlight={controller.showCollisionHighlight}
        snakes={controller.snakes}
        speedMultiplier={controller.speedMultiplier}
      />

      <GameResultModal
        isOpen={controller.showGameOverModal}
        onClose={() => controller.setShowGameOverModal(false)}
        modalTitle={controller.modalTitle}
        isVictory={controller.isVictory}
        isVsAiMode={controller.isVsAiMode}
        isMultiplayerMode={controller.isMultiplayerMode}
        userFinalScore={controller.userFinalScore}
        aiFinalScore={controller.aiFinalScore}
        vsAiResultLabel={controller.vsAiResultLabel}
        multiplayerWinner={controller.multiplayerWinner}
        multiplayerScoreRows={controller.multiplayerScoreRows}
        score={controller.score}
        onRestart={controller.handleRestart}
        onContinue={controller.handleContinue}
        onShareScore={controller.handleShareScore}
        onQuit={controller.handleQuit}
      />

      <AchievementUnlockModal
        isOpen={controller.showAchievementModal}
        onClose={() => controller.setShowAchievementModal(false)}
        achievement={controller.newAchievement}
        AchievementIcon={controller.AchievementIcon}
      />

      <ConfirmModal
        isOpen={controller.leaveConfirmState.isOpen}
        onClose={controller.handleLeaveCancel}
        onConfirm={controller.handleLeaveConfirm}
        title="Quit Current Game?"
        message="Your current run will end if you leave this page."
        confirmText="Quit Game"
        cancelText="Stay Here"
        variant="danger"
      />

      <GameDeveloperHud
        getInputPerformance={controller.getInputPerformance}
        inputWarning={controller.inputWarning}
        showPerformanceMonitor={controller.showPerformanceMonitor}
      />
    </div>
  );
};

export default Game;
