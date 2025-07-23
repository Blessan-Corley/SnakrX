/**
 * SnakrX Game State Management Hook
 * Manages game state, logic, and real-time updates
 */

import { useState, useEffect, useCallback, useContext, createContext, useRef } from 'react';
import { 
  DIRECTIONS, 
  GAME_MODES, 
  AI_DIFFICULTIES, 
  GAME_STATES,
  getBoardSize,
  calculatePoints,
  calculateSpeed,
  getSpeedMultiplier,
  positionsEqual,
  isWithinBounds,
  checkSelfCollision,
  checkHeadCollision,
  checkSnakeCollision,
  generateFoodPosition,
  isValidDirectionChange,
  getStartingPositions,
  getStartingDirections,
  isMobile,
  generateGameId
} from '@/utils/gameUtils';
import { AIController } from '@/utils/aiPathfinding';
import { playFoodEat, playDeath, playVictory } from '@/utils/sound';
import { useAuth, useAuthOperations } from './useAuth';
import { useAchievements } from './useAchievements';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  db 
} from '@/services/firebase';

// Game Context
const GameContext = createContext({});

/**
 * Game Provider Component
 */
export const GameProvider = ({ children }) => {
  // Game State
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [gameMode, setGameMode] = useState(GAME_MODES.CLASSIC);
  const [difficulty, setDifficulty] = useState(AI_DIFFICULTIES.MEDIUM);
  const [playerCount, setPlayerCount] = useState(1);
  
  // Board and Snakes
  const [boardSize, setBoardSize] = useState({ width: 20, height: 20 });
  const [snakes, setSnakes] = useState([]);
  const [food, setFood] = useState({ x: 10, y: 10 });
  const [currentPlayer, setCurrentPlayer] = useState(0);
  
  // Game Stats
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [speed, setSpeed] = useState(150);
  const [foodEaten, setFoodEaten] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // AI and Multiplayer
  const [aiController, setAiController] = useState(null);
  const [deadPlayers, setDeadPlayers] = useState(new Set());
  
  // Game Session
  const [gameId, setGameId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  
  // Refs for game loop
  const gameLoopRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const directionsQueueRef = useRef([]);

  const value = {
    // State
    gameState,
    gameMode,
    difficulty,
    playerCount,
    boardSize,
    snakes,
    food,
    currentPlayer,
    score,
    gameTime,
    speed,
    foodEaten,
    isPaused,
    aiController,
    deadPlayers,
    gameId,
    startTime,
    endTime,
    
    // Setters
    setGameState,
    setGameMode,
    setDifficulty,
    setPlayerCount,
    setBoardSize,
    setSnakes,
    setFood,
    setCurrentPlayer,
    setScore,
    setGameTime,
    setSpeed,
    setFoodEaten,
    setIsPaused,
    setAiController,
    setDeadPlayers,
    setGameId,
    setStartTime,
    setEndTime
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * Custom hook to use game context
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

/**
 * Custom hook for game operations
 */
export const useGameOperations = () => {
  const {
    gameState,
    gameMode,
    difficulty,
    playerCount,
    boardSize,
    snakes,
    food,
    score,
    gameTime,
    speed,
    foodEaten,
    isPaused,
    aiController,
    deadPlayers,
    gameId,
    setGameState,
    setGameMode,
    setDifficulty,
    setPlayerCount,
    setBoardSize,
    setSnakes,
    setFood,
    setScore,
    setGameTime,
    setSpeed,
    setFoodEaten,
    setIsPaused,
    setAiController,
    setDeadPlayers,
    setGameId,
    setStartTime,
    setEndTime
  } = useGame();

  const { user } = useAuth();
  const { updateUserStats } = useAuthOperations();
  const { checkAndUnlockAchievements } = useAchievements();
  
  const gameLoopRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const directionsQueueRef = useRef([]);
  const gameStatsRef = useRef({
    wallHits: 0,
    selfHits: 0,
    maxSpeed: 1,
    survivalTime: 0
  });

  /**
   * Initialize a new game
   */
  const initializeGame = useCallback((mode, diff = AI_DIFFICULTIES.MEDIUM, players = 1) => {
    const mobile = isMobile();
    const newBoardSize = getBoardSize(mode, players, mobile);
    const newGameId = generateGameId();
    
    // Prevent multiplayer on mobile
    if (mode === GAME_MODES.MULTIPLAYER && mobile) {
      throw new Error('Multiplayer mode is not available on mobile devices. Please use a desktop or laptop for the full experience.');
    }
    
    setBoardSize(newBoardSize);
    setGameMode(mode);
    setDifficulty(diff);
    setPlayerCount(players);
    setGameId(newGameId);
    setScore(0);
    setGameTime(0);
    setSpeed(150);
    setFoodEaten(0);
    setIsPaused(false);
    setDeadPlayers(new Set());
    setStartTime(Date.now());
    setEndTime(null);
    
    // Reset game stats
    gameStatsRef.current = {
      wallHits: 0,
      selfHits: 0,
      maxSpeed: 1,
      survivalTime: 0
    };
    
    // Initialize snakes
    const startingPositions = getStartingPositions(players, newBoardSize.width, newBoardSize.height);
    const startingDirections = getStartingDirections(players);
    
    const newSnakes = startingPositions.map((position, index) => ({
      id: index,
      body: [position],
      direction: startingDirections[index],
      isAI: mode === GAME_MODES.VS_AI && index === 1,
      isAlive: true,
      color: index === 0 ? '#10b981' : index === 1 ? '#6b7280' : index === 2 ? '#3b82f6' : '#f59e0b'
    }));
    
    setSnakes(newSnakes);
    
    // Initialize AI if needed
    if (mode === GAME_MODES.VS_AI) {
      const ai = new AIController(newBoardSize.width, newBoardSize.height, diff);
      setAiController(ai);
    } else {
      setAiController(null);
    }
    
    // Generate initial food
    const newFood = generateFoodPosition(newBoardSize.width, newBoardSize.height, newSnakes.map(s => s.body));
    setFood(newFood);
    
    setGameState(GAME_STATES.PLAYING);
  }, [setBoardSize, setGameMode, setDifficulty, setPlayerCount, setGameId, setScore, setGameTime, setSpeed, setFoodEaten, setIsPaused, setDeadPlayers, setStartTime, setEndTime, setSnakes, setAiController, setFood, setGameState]);

  /**
   * Update snake direction
   */
  const updateSnakeDirection = useCallback((playerId, newDirection) => {
    if (gameState !== GAME_STATES.PLAYING || isPaused) return;
    
    setSnakes(prevSnakes => {
      const newSnakes = [...prevSnakes];
      const snake = newSnakes[playerId];
      
      if (snake && snake.isAlive && isValidDirectionChange(snake.direction, newDirection)) {
        snake.direction = newDirection;
      }
      
      return newSnakes;
    });
  }, [gameState, isPaused, setSnakes]);

  /**
   * Game loop update function
   */
  const updateGame = useCallback(() => {
    if (gameState !== GAME_STATES.PLAYING || isPaused) return;
    
    const currentTime = Date.now();
    
    setSnakes(prevSnakes => {
      const newSnakes = prevSnakes.map(snake => ({ ...snake, body: [...snake.body] }));
      let newScore = score;
      let newFoodEaten = foodEaten;
      let newFood = food;
      let newSpeed = speed;
      let gameEnded = false;
      let winner = null;
      
      // Update each snake
      newSnakes.forEach((snake, index) => {
        if (!snake.isAlive) return;
        
        let direction = snake.direction;
        
        // AI decision making
        if (snake.isAI && aiController) {
          const obstacles = newSnakes
            .filter((_, i) => i !== index)
            .flatMap(s => s.body);
          
          const otherSnakes = newSnakes
            .filter((_, i) => i !== index && !deadPlayers.has(i))
            .map(s => s.body);
          
          direction = aiController.getNextMove(snake.body, newFood, obstacles, otherSnakes);
        }
        
        // Calculate new head position
        const head = snake.body[0];
        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y
        };
        
        // Check collisions
        let died = false;
        let deathCause = 'wall';
        
        // Wall collision
        if (!isWithinBounds(newHead, boardSize.width, boardSize.height)) {
          died = true;
          deathCause = 'wall';
          gameStatsRef.current.wallHits++;
        }
        
        // Self collision
        if (!died && checkSelfCollision(newHead, snake.body)) {
          died = true;
          deathCause = 'self';
          gameStatsRef.current.selfHits++;
        }
        
        // Other snake collisions
        if (!died) {
          for (let i = 0; i < newSnakes.length; i++) {
            if (i === index) continue;
            
            const otherSnake = newSnakes[i];
            if (!otherSnake.isAlive) continue;
            
            // Head to head collision
            const otherHead = otherSnake.body[0];
            const otherNewHead = {
              x: otherHead.x + otherSnake.direction.x,
              y: otherHead.y + otherSnake.direction.y
            };
            
            if (positionsEqual(newHead, otherNewHead)) {
              // Both snakes die in head-to-head collision
              died = true;
              otherSnake.isAlive = false;
              deathCause = 'opponent';
              break;
            }
            
            // Body collision
            if (checkSnakeCollision(newHead, otherSnake.body)) {
              died = true;
              deathCause = 'opponent';
              break;
            }
          }
        }
        
        if (died) {
          snake.isAlive = false;
          setDeadPlayers(prev => new Set([...prev, index]));
          playDeath(deathCause);
          return;
        }
        
        // Move snake
        snake.body.unshift(newHead);
        snake.direction = direction;
        
        // Check food collision
        if (positionsEqual(newHead, newFood)) {
          // Food eaten
          const points = calculatePoints(gameMode, difficulty);
          newScore += points;
          newFoodEaten++;
          
          // Update speed
          newSpeed = calculateSpeed(newFoodEaten);
          gameStatsRef.current.maxSpeed = Math.max(
            gameStatsRef.current.maxSpeed, 
            getSpeedMultiplier(newSpeed)
          );
          
          // Generate new food
          const allSnakeBodies = newSnakes.flatMap(s => s.body);
          newFood = generateFoodPosition(boardSize.width, boardSize.height, allSnakeBodies);
          
          playFoodEat(getSpeedMultiplier(newSpeed));
        } else {
          // Remove tail if no food eaten
          snake.body.pop();
        }
      });
      
      // Check game end conditions
      const aliveSnakes = newSnakes.filter(snake => snake.isAlive);
      
      if (gameMode === GAME_MODES.CLASSIC && aliveSnakes.length === 0) {
        gameEnded = true;
      } else if (gameMode === GAME_MODES.VS_AI || gameMode === GAME_MODES.MULTIPLAYER) {
        if (aliveSnakes.length <= 1) {
          gameEnded = true;
          winner = aliveSnakes[0]?.id;
        }
      }
      
      // Update state
      setScore(newScore);
      setFoodEaten(newFoodEaten);
      setFood(newFood);
      setSpeed(newSpeed);
      
      if (gameEnded) {
        endGame(winner !== undefined ? winner === 0 : false);
      }
      
      return newSnakes;
    });
  }, [gameState, isPaused, score, foodEaten, food, speed, aiController, deadPlayers, boardSize, gameMode, difficulty, setSnakes, setScore, setFoodEaten, setFood, setSpeed, setDeadPlayers]);

  /**
   * End the current game
   */
  const endGame = useCallback(async (victory = false) => {
    setGameState(victory ? GAME_STATES.VICTORY : GAME_STATES.GAME_OVER);
    setIsPaused(true);
    setEndTime(Date.now());
    
    // Stop game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Calculate final stats
    const finalStats = {
      ...gameStatsRef.current,
      survivalTime: Math.floor(gameTime / 1000)
    };
    
    // Play appropriate sound
    if (victory) {
      playVictory(gameMode);
    }
    
    // Save match to database
    if (user) {
      await saveMatchToDatabase(victory, finalStats);
      await updatePlayerStats(victory, finalStats);
      await checkAndUnlockAchievements({
        score,
        gameTime: Math.floor(gameTime / 1000),
        gameMode,
        difficulty,
        victory,
        ...finalStats
      });
    }
  }, [gameTime, score, gameMode, difficulty, user, setGameState, setIsPaused, setEndTime, updateUserStats, checkAndUnlockAchievements]);

  /**
   * Save match to database
   */
  const saveMatchToDatabase = useCallback(async (victory, stats) => {
    if (!user || !gameId) return;
    
    try {
      const matchData = {
        gameId,
        userId: user.uid,
        username: user.displayName || 'Unknown',
        mode: gameMode,
        difficulty: gameMode === GAME_MODES.VS_AI ? difficulty : null,
        playerCount: gameMode === GAME_MODES.MULTIPLAYER ? playerCount : 1,
        score,
        gameTime: Math.floor(gameTime / 1000),
        foodEaten,
        maxSpeed: getSpeedMultiplier(speed),
        victory,
        deathCause: victory ? null : 'collision',
        stats,
        playedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      // Save to matches collection
      await setDoc(doc(db, 'matches', gameId), matchData);
      
      // Add to user's match history
      const userMatchHistoryRef = doc(db, 'matchHistory', user.uid);
      await updateDoc(userMatchHistoryRef, {
        matches: arrayUnion({
          gameId,
          mode: gameMode,
          score,
          gameTime: Math.floor(gameTime / 1000),
          victory,
          playedAt: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      });
      
    } catch (error) {
      console.error('Error saving match:', error);
    }
  }, [user, gameId, gameMode, difficulty, playerCount, score, gameTime, foodEaten, speed]);

  /**
   * Update player statistics
   */
  const updatePlayerStats = useCallback(async (victory, stats) => {
    if (!user) return;
    
    const statUpdates = {
      totalGames: 1,
      totalScore: score,
      bestScore: score,
      totalPlayTime: Math.floor(gameTime / 1000),
      foodEaten: foodEaten,
      wallHits: stats.wallHits,
      selfHits: stats.selfHits,
      maxSpeed: Math.max(stats.maxSpeed, 1),
      maxSurvivalTime: Math.max(stats.survivalTime, 0)
    };
    
    if (victory) {
      statUpdates.totalWins = 1;
      statUpdates.currentWinStreak = 1;
      statUpdates.bestWinStreak = 1;
    } else {
      statUpdates.currentWinStreak = 0;
    }
    
    // Mode specific stats
    if (gameMode === GAME_MODES.CLASSIC) {
      statUpdates.classicGames = 1;
      if (victory) statUpdates.classicWins = 1;
      if (score > 0) statUpdates.classicBestScore = score;
    } else if (gameMode === GAME_MODES.VS_AI) {
      statUpdates.vsAIGames = 1;
      if (victory) {
        statUpdates.vsAIWins = 1;
        statUpdates[`ai${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}Wins`] = 1;
      }
    } else if (gameMode === GAME_MODES.MULTIPLAYER) {
      statUpdates.multiplayerGames = 1;
      if (victory) statUpdates.multiplayerWins = 1;
    }
    
    await updateUserStats(statUpdates);
  }, [user, score, gameTime, foodEaten, gameMode, difficulty, updateUserStats]);

  /**
   * Pause/Resume game
   */
  const togglePause = useCallback(() => {
    if (gameState === GAME_STATES.PLAYING) {
      setIsPaused(prev => !prev);
    }
  }, [gameState, setIsPaused]);

  /**
   * Restart current game
   */
  const restartGame = useCallback(() => {
    initializeGame(gameMode, difficulty, playerCount);
  }, [initializeGame, gameMode, difficulty, playerCount]);

  /**
   * Quit to menu
   */
  const quitToMenu = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    setGameState(GAME_STATES.MENU);
    setIsPaused(false);
  }, [setGameState, setIsPaused]);

  // Game loop effect
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING && !isPaused) {
      gameLoopRef.current = setInterval(updateGame, speed);
      
      // Update game time
      const timeInterval = setInterval(() => {
        setGameTime(prev => prev + 100);
      }, 100);
      
      return () => {
        clearInterval(gameLoopRef.current);
        clearInterval(timeInterval);
      };
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, [gameState, isPaused, speed, updateGame, setGameTime]);

  return {
    // Game Actions
    initializeGame,
    updateSnakeDirection,
    endGame,
    togglePause,
    restartGame,
    quitToMenu,
    
    // Computed Values
    speedMultiplier: getSpeedMultiplier(speed),
    isGameActive: gameState === GAME_STATES.PLAYING,
    isGameOver: gameState === GAME_STATES.GAME_OVER,
    isVictory: gameState === GAME_STATES.VICTORY,
    formattedTime: Math.floor(gameTime / 1000),
    
    // Game Stats Reference
    gameStatsRef
  };
};

export default useGame;