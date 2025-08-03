import React from 'react';
import { useGame, useGameOperations } from '@/hooks/useGame';

const GameTest = () => {
  const { gameState, snakes, food, boardSize, score, gameTime, isPaused } = useGame();
  const { initializeGame, startGame, updateSnakeDirection, togglePause } = useGameOperations();

  const testGame = async () => {
    console.log('Testing game initialization...');
    try {
      await initializeGame('classic');
      console.log('Game initialized, starting...');
      startGame();
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50">
      <h3 className="font-bold mb-2">Game Debug</h3>
      <div className="text-xs space-y-1">
        <div>State: {gameState}</div>
        <div>Snakes: {snakes?.length || 0}</div>
        <div>Food: {food ? `${food.x},${food.y}` : 'None'}</div>
        <div>Board: {boardSize?.width}x{boardSize?.height}</div>
        <div>Score: {score}</div>
        <div>Time: {Math.floor(gameTime / 1000)}s</div>
        <div>Paused: {isPaused ? 'Yes' : 'No'}</div>
      </div>
      <button 
        onClick={testGame}
        className="mt-2 bg-blue-600 px-2 py-1 rounded text-xs"
      >
        Test Game
      </button>
      <button 
        onClick={() => updateSnakeDirection(0, { x: 1, y: 0 })}
        className="mt-1 bg-green-600 px-2 py-1 rounded text-xs block"
      >
        Move Right
      </button>
      <button 
        onClick={() => {
          console.log('Manual start clicked');
          startGame();
        }}
        className="mt-1 bg-purple-600 px-2 py-1 rounded text-xs block"
      >
        Start Game
      </button>
    </div>
  );
};

export default GameTest; 