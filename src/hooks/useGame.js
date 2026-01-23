/**
 * Optimized SnakrX Game State Management Hook - COMPLETELY REWRITTEN
 * Fixed Issues:
 * 1. Responsive key input
 * 2. Correct timer display and pause functionality  
 * 3. Proper game state management
 * 4. Optimized performance
 * 5. Clean restart functionality
 */

import { useState, useEffect, useCallback, useContext, createContext, useRef, useMemo } from 'react';
import { 
  DIRECTIONS, 
  GAME_MODES, 
  AI_DIFFICULTIES, 
  GAME_STATES,
  SPEED_CONFIGS,
  getBoardSize,
  calculatePoints,
  calculateSpeed,
  getSpeedMultiplier,
  getSpeedLevel,
  getNextSpeedMilestone,
  generateFoodPosition,
  getStartingPositions,
  getStartingDirections,
  isMobile,
  generateGameId
} from '../utils/gameUtils.js';
import { updateSnakesPosition } from './game/gameLogic.js';
import { AIController } from '../utils/aiPathfinding.js';
import { playFoodEat, playDeath, playVictory } from '../utils/sound.js';
import { useAuth, useAuthOperations } from './useAuth';
import { useAchievementOperations } from './useAchievements';
import { gameOperations } from '../services/firebase/index.js';
import toast from 'react-hot-toast';
import logger from '../utils/logger.js';

const GameContext = createContext({});

// Game configuration constants
const GAME_CONFIG = {
  QUICK_DEATH_THRESHOLD: 5, // seconds - defines a "quick death" for achievements
  PROFILE_REFRESH_DELAY: 1000, // ms - delay before refreshing profile after stat update
  ACHIEVEMENT_CHECK_DELAY: 500, // ms - delay for Firestore consistency
  AUTO_START_DELAY: 3000 // ms - auto-start delay in ready state
};

// Enhanced initial state with tracking fields
const createInitialGameState = () => ({
  gameState: GAME_STATES.MENU,
  gameMode: GAME_MODES.CLASSIC,
  difficulty: AI_DIFFICULTIES.MEDIUM,
  playerCount: 1,
  boardSize: getBoardSize('classic', 1, isMobile()),
  snakes: [],
  food: [], 
  score: 0,
  gameTime: 0,
  speed: SPEED_CONFIGS.INITIAL,
  foodEaten: 0,
  isPaused: false,
  aiController: null,
  deadPlayers: new Set(),
  gameId: null,
  startTime: null,
  winnerId: null, // Track winner ID
  
  // Additional tracking fields
  moves: 0,
  wallHits: 0,
  selfHits: 0,
  timeToFirstFood: null,
  timeToMaxLength: null,
  maxLengthReached: 1
});

export const GameProvider = ({ children }) => {
  const { user, userProfile, refreshProfile } = useAuth();
  const { updateUserStats } = useAuthOperations();
  const { checkAndUnlockAchievements } = useAchievementOperations();
  
  const [gameState, setGameState] = useState(createInitialGameState);
  const gameStateRef = useRef(gameState); // Keep current state in ref for animation loop
  
  // Game loop refs
  const gameLoopRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const gameStartTimeRef = useRef(0);
  const pausedTimeRef = useRef(0); // Total time spent paused
  const pauseStartRef = useRef(0); // When current pause started
  const updateGameRef = useRef(null); // Ref to avoid dependency issues
  
  // Update ref whenever state changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Computed values
  const isGameActive = gameState.gameState === GAME_STATES.PLAYING;
  const isGameOver = gameState.gameState === GAME_STATES.GAME_OVER;
  const isVictory = gameState.gameState === GAME_STATES.VICTORY;
  const speedMultiplier = getSpeedMultiplier(gameState.speed);
  const speedLevel = getSpeedLevel(gameState.foodEaten);
  const nextSpeedMilestone = getNextSpeedMilestone(gameState.foodEaten);

  /**
   * FIXED: Proper timer update that stops when paused
   */
  const updateTimer = useCallback(() => {
    const currentGameState = gameStateRef.current;
    if (currentGameState.gameState !== GAME_STATES.PLAYING || currentGameState.isPaused || !gameStartTimeRef.current) {
      return;
    }
    
    const now = Date.now();
    const elapsed = Math.max(0, (now - gameStartTimeRef.current - pausedTimeRef.current) / 1000);
    
    setGameState(prev => ({
      ...prev,
      gameTime: elapsed
    }));
  }, []);

  /**
    * FIXED: Simplified game update function
    */
  const updateGame = useCallback(() => {
    const currentGameState = gameStateRef.current;
    
    if (currentGameState.gameState !== GAME_STATES.PLAYING || currentGameState.isPaused) {
      // Stop the animation loop when not playing or paused to save CPU
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const now = performance.now();
    
    // Smooth game speed control with proper frame time management
    const deltaTime = now - lastUpdateTimeRef.current;
    if (deltaTime < currentGameState.speed) {
      gameLoopRef.current = requestAnimationFrame(updateGame);
      return;
    }
    
    // Set last update time to maintain consistent intervals
    lastUpdateTimeRef.current = now - (deltaTime % currentGameState.speed);

    // Multiplayer Food Spawning & Despawning Logic
    let currentFood = [...currentGameState.food];
    
    if (currentGameState.gameMode === GAME_MODES.MULTIPLAYER) {
        const now = Date.now();
        const playerCount = currentGameState.playerCount;
        
        // Despawn old food (lifespan 5-6s)
        // Keep at least 1 food always
        if (currentFood.length > 1) {
            currentFood = currentFood.filter(f => {
                const age = now - (f.createdAt || now);
                return age < 6000; // 6 seconds max
            });
        }
        
        // Calculate target food count based on players
        // 2p: 1-3, 3p: 2-5, 4p: 3-6
        const minFood = Math.max(1, playerCount - 1);
        const maxFood = Math.min(6, playerCount + 1);
        
        // Spawn new food if below minimum or randomly if below maximum
        // Chance to spawn increases if fewer foods
        if (currentFood.length < minFood || (currentFood.length < maxFood && Math.random() < 0.02)) {
             const allBodies = currentGameState.snakes.flatMap(s => s.body);
             const newPos = generateFoodPosition(currentGameState.boardSize.width, currentGameState.boardSize.height, allBodies);
             currentFood.push({ ...newPos, createdAt: now, id: Math.random() });
        }
    } else {
        // Classic/VS AI: Ensure strictly 1 food (handled by logic, but good to enforce)
        if (currentFood.length === 0) {
             const allBodies = currentGameState.snakes.flatMap(s => s.body);
             currentFood.push({ ...generateFoodPosition(currentGameState.boardSize.width, currentGameState.boardSize.height, allBodies), createdAt: Date.now() });
        }
    }

    // REFACTORED: Use modular game logic with updated food list
    const { 
      snakes: newSnakes, 
      food: nextFood, 
      foodConsumed, 
      events 
    } = updateSnakesPosition(
      currentGameState.snakes,
      currentFood, // Pass the processed food list
      currentGameState.boardSize,
      currentGameState.gameMode,
      { 1: currentGameState.aiController }
    );
    
    let gameEnded = false;
    let victory = false;

    // Check end conditions with validation
    const aliveSnakes = newSnakes.filter(s => s && s.isAlive && Array.isArray(s.body) && s.body.length > 0);
    let winnerId = null;
    
    if (currentGameState.gameMode === GAME_MODES.CLASSIC) {
      if (!aliveSnakes.find(s => s.id === 0)) gameEnded = true;
    } else if (currentGameState.gameMode === GAME_MODES.VS_AI) {
      if (aliveSnakes.length <= 1) {
          gameEnded = true;
          const humanAlive = aliveSnakes.find(s => !s.isAI && s.id === 0);
          const aiAlive = aliveSnakes.find(s => s.isAI && s.id === 1);
          victory = !!(humanAlive && !aiAlive);
      }
    } else if (currentGameState.gameMode === GAME_MODES.MULTIPLAYER && aliveSnakes.length <= 1) {
      gameEnded = true;
      if (aliveSnakes.length === 1) {
          victory = true;
          winnerId = aliveSnakes[0].id;
      }
    }

    // Single State Update for Performance and Consistency
    setGameState(prev => {
      const updates = { ...prev };
      updates.snakes = newSnakes;
      updates.food = nextFood;
      
      // Calculate points once per update to be efficient
      const points = calculatePoints(updates.gameMode, updates.difficulty);

      // Apply events stats
      if (events && events.length > 0) {
        events.forEach(event => {
          if (event.type === 'DEATH' && event.snakeId === 0) {
             if (event.cause === 'WALL') updates.wallHits = (updates.wallHits || 0) + 1;
             if (event.cause === 'SELF') updates.selfHits = (updates.selfHits || 0) + 1;
          }
          if (event.type === 'MOVE' && event.snakeId === 0) {
             updates.moves = (updates.moves || 0) + 1;
          }
          if (event.type === 'EAT') {
            // Update individual snake score
            if (updates.snakes[event.snakeId]) {
                updates.snakes[event.snakeId].score = (updates.snakes[event.snakeId].score || 0) + points;
            }
            
            // Track stats for Player 0 (User)
            if (event.snakeId === 0) {
                const currentTime = (Date.now() - (gameStartTimeRef.current || Date.now())) / 1000;
                if (updates.foodEaten === 0 && updates.timeToFirstFood === null) {
                  updates.timeToFirstFood = currentTime;
                }
                const snake = newSnakes[0];
                if (snake && snake.body.length > (updates.maxLengthReached || 0)) {
                  updates.maxLengthReached = snake.body.length;
                  updates.timeToMaxLength = currentTime;
                }
            }
          }
        });
      }
      
      if (foodConsumed) {
        // Global score (P1)
        if (updates.gameMode === GAME_MODES.CLASSIC || updates.gameMode === GAME_MODES.CLASSIC_TRANSPARENT) {
             updates.score += points;
        } else if (updates.gameMode === GAME_MODES.VS_AI) {
             // For VS AI, updates.score tracks P1 score
             updates.score = updates.snakes[0].score;
        } else if (updates.gameMode === GAME_MODES.MULTIPLAYER) {
             // For Multiplayer, global 'score' might display P1 or Highest? 
             // Let's keep 'score' as P1 score for consistency in "Game Stats" card if needed, 
             // but UI should use individual scores.
             updates.score = updates.snakes[0].score;
        }
        
        updates.foodEaten += 1;
        updates.speed = calculateSpeed(updates.foodEaten);
      }

      if (gameEnded) {
          updates.gameState = GAME_STATES.GAME_OVER; // Default to Game Over
          updates.isPaused = true;
          
          if (updates.gameMode === GAME_MODES.MULTIPLAYER) {
              // Determine winner by Highest Score
              // Sort by score descending
              const sortedSnakes = [...updates.snakes].sort((a, b) => b.score - a.score);
              const winner = sortedSnakes[0];
              // Check for draw? If top two have same score?
              // User said "higher points win". If draw, maybe handle?
              // For now, simple sort.
              updates.winnerId = winner.id;
              updates.gameState = GAME_STATES.VICTORY; // Someone always wins in multiplayer
          } else {
              // Classic/VS AI Victory condition
              updates.gameState = victory ? GAME_STATES.VICTORY : GAME_STATES.GAME_OVER;
          }
          
          // Populate dead players set for UI visualization
          const dead = new Set();
          currentGameState.snakes.forEach((s, i) => {
              if (!newSnakes[i].isAlive) dead.add(i);
          });
          updates.deadPlayers = dead;
      }
      
      return updates;
    });

    if (!gameEnded) {
        gameLoopRef.current = requestAnimationFrame(updateGame);
    }
  }, [updateTimer]);

  /**
   * Automatically trigger save when game state ends
   */
  useEffect(() => {
      const isEnded = gameState.gameState === GAME_STATES.GAME_OVER || gameState.gameState === GAME_STATES.VICTORY;
      if (isEnded && !gameLoopRef.current) {
          logger.log('🏁 Game ended detected in effect. Triggering save sequence...');
          const victory = gameState.gameState === GAME_STATES.VICTORY;
          if (victory) playVictory();
          
          if (user && gameState.score >= 0) {
              saveGameData(victory).catch(err => logger.error('Auto-save failed:', err));
          }
      }
  }, [gameState.gameState, user]); // Only trigger on state change or user change

  // Update ref to avoid useEffect dependency issues
  useEffect(() => {
    updateGameRef.current = updateGame;
  }, [updateGame]);

  /**
   * FIXED: Initialize game with proper state reset
   */
  const initializeGame = useCallback(async (mode, difficulty = AI_DIFFICULTIES.MEDIUM, playerCount = 1) => {
    try {
      // Stop any existing game loop
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }

      // Reset timing refs
      lastUpdateTimeRef.current = 0;
      gameStartTimeRef.current = 0;
      pausedTimeRef.current = 0;
      pauseStartRef.current = 0;

      const mobile = isMobile();
      const boardSize = getBoardSize(mode, playerCount, mobile);
      const gameId = generateGameId();

      // Initialize snakes
      const positions = getStartingPositions(playerCount, boardSize.width, boardSize.height);
      const directions = getStartingDirections(playerCount);
      
      const snakes = [];
      for (let i = 0; i < playerCount; i++) {
        const position = positions[i];
        const direction = directions[i];
        
        snakes.push({
          id: i,
          body: [position],
          direction: direction,
          isAI: mode === GAME_MODES.VS_AI && i === 1,
          isAlive: true,
          color: i === 0 ? '#10b981' : '#ef4444',
          score: 0 // Track individual score
        });
      }

      // Initialize AI
      let aiController = null;
      if (mode === GAME_MODES.VS_AI) {
        aiController = new AIController(boardSize.width, boardSize.height, difficulty);
      }

      // Generate food
      // Unified to array for all modes
      const initialFood = [generateFoodPosition(boardSize.width, boardSize.height, snakes.map(s => s.body))];

      // FIXED: Complete state reset
      setGameState({
        gameState: GAME_STATES.READY,
        gameMode: mode,
        difficulty: difficulty,
        playerCount: playerCount,
        boardSize: boardSize,
        snakes: snakes,
        food: initialFood,
        score: 0,
        gameTime: 0,
        speed: SPEED_CONFIGS.INITIAL,
        foodEaten: 0,
        isPaused: false,
        aiController: aiController,
        deadPlayers: new Set(),
        gameId: gameId,
        startTime: null,
        
        // Additional tracking fields
        moves: 0,
        wallHits: 0,
        selfHits: 0,
        timeToFirstFood: null,
        timeToMaxLength: null,
        maxLengthReached: 1
      });

    } catch (error) {
      logger.error('Error initializing game:', error);
      toast.error(`Failed to initialize game: ${error.message}`);
      throw error;
    }
  }, []);

  /**
   * FIXED: Start game with proper timer initialization
   */
  const startGame = useCallback(() => {
    logger.log('Starting game!');
    gameStartTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    pauseStartRef.current = 0;
    lastUpdateTimeRef.current = 0;

    setGameState(prev => {
      logger.log('Game state changing from', prev.gameState, 'to PLAYING');
      return {
        ...prev,
        gameState: GAME_STATES.PLAYING,
        isPaused: false,
        startTime: Date.now()
      };
    });
  }, []);

  /**
   * FIXED: Responsive direction update with simplified validation
   */
  const updateSnakeDirection = useCallback((playerId, newDirection) => {
    // Validate input parameters
    if (typeof playerId !== 'number' || !newDirection || typeof newDirection.x !== 'number' || typeof newDirection.y !== 'number') {
      logger.warn('Invalid direction change parameters:', { playerId, newDirection });
      return;
    }

    // Get current game state to avoid stale closure issues
    const currentState = gameStateRef.current;
    
    // Prevent player input from controlling AI snakes
    const targetSnake = currentState.snakes[playerId];
    if (targetSnake && targetSnake.isAI) {
      return;
    }
    
    // Auto-start game if in READY state - INSTANT
    if (currentState.gameState === GAME_STATES.READY) {
      startGame();
    }
    
    // Only block if game is completely over
    if (currentState.gameState === GAME_STATES.GAME_OVER || currentState.gameState === GAME_STATES.VICTORY) {
      return;
    }

    // IMPROVED Direction change with smart collision prevention
    setGameState(prev => {
      const newSnakes = [...prev.snakes];
      if (playerId >= 0 && playerId < newSnakes.length && newSnakes[playerId] && newSnakes[playerId].isAlive) {
        const snake = newSnakes[playerId];
        
        // Enhanced direction validation with better sharp turn handling
        let canChangeDirection = true;
        if (snake.body && snake.body.length > 1) {
          const currentDir = snake.direction;
          const head = snake.body[0];
          
          // Check for direct opposite (180-degree turn) - only block if snake length > 1
          const isDirectOpposite = (
            currentDir.x === -newDirection.x && 
            currentDir.y === -newDirection.y &&
            Math.abs(currentDir.x) + Math.abs(currentDir.y) === 1 && // Valid direction vectors
            Math.abs(newDirection.x) + Math.abs(newDirection.y) === 1
          );
          
          // Additional check: would this direction immediately collide with neck?
          let wouldCollideWithNeck = false;
          if (snake.body.length > 1 && head) {
            const neck = snake.body[1];
            const nextHead = {
              x: head.x + newDirection.x,
              y: head.y + newDirection.y
            };
            wouldCollideWithNeck = (neck && nextHead.x === neck.x && nextHead.y === neck.y);
          }
          
          // Block if it's a direct opposite OR would collide with neck
          if (isDirectOpposite || wouldCollideWithNeck) {
            canChangeDirection = false;
            logger.log(`Invalid direction blocked for player ${playerId}: opposite=${isDirectOpposite}, neckCollision=${wouldCollideWithNeck}`);
          }
        }

        // Allow all other direction changes (including sharp 90-degree turns)
        if (canChangeDirection) {
          newSnakes[playerId] = { ...snake, direction: newDirection };
          logger.log(`Direction changed for player ${playerId}:`, newDirection);
        }
      }
      return { ...prev, snakes: newSnakes };
    });
  }, [startGame]);

  /**
   * FIXED: Toggle pause with proper timer handling
   */
  const togglePause = useCallback(() => {
    if (gameState.gameState !== GAME_STATES.PLAYING) return;

    const now = Date.now();
    
    if (gameState.isPaused) {
      // Resume: add the time we were paused to the total paused time
      if (pauseStartRef.current > 0) {
        const pauseDuration = now - pauseStartRef.current;
        pausedTimeRef.current += pauseDuration;
        pauseStartRef.current = 0;
      }
      lastUpdateTimeRef.current = performance.now();
    } else {
      // Pause: record when we started pausing
      pauseStartRef.current = now;
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, [gameState.gameState, gameState.isPaused]);

  /**
   * FIXED: Complete restart functionality
   */
  const restartGame = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    // Reset all timing
    lastUpdateTimeRef.current = 0;
    gameStartTimeRef.current = 0;
    pausedTimeRef.current = 0;
    pauseStartRef.current = 0;

    // Restart with same settings
    initializeGame(gameState.gameMode, gameState.difficulty, gameState.playerCount);
  }, [gameState.gameMode, gameState.difficulty, gameState.playerCount, initializeGame]);

  /**
   * End game
   */
  const endGame = useCallback((victory = false) => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    setGameState(prev => ({
      ...prev,
      gameState: victory ? GAME_STATES.VICTORY : GAME_STATES.GAME_OVER,
      isPaused: true
    }));
  }, []);

  /**
   * Save game data - PROPER Firebase integration with complete schema
   */
  const saveGameData = useCallback(async (victory) => {
    if (!user || !updateUserStats) {
      logger.log('No user or updateUserStats - skipping save');
      return;
    }

    try {
      logger.log('Saving game data to Firebase...');
      
      // Complete game session data with proper mapping
      const gameSessionData = {
        gameId: gameState.gameId,
        userId: user.uid,
        username: userProfile?.username || userProfile?.displayName || user.email.split('@')[0],
        mode: gameState.gameMode,
        difficulty: gameState.difficulty || null,
        playerCount: gameState.playerCount || 1,
        score: gameState.score,
        duration: Math.max(0, Math.floor(gameState.gameTime)),
        foodEaten: gameState.foodEaten,
        speedReached: getSpeedMultiplier(gameState.speed),
        result: victory ? 'won' : 'lost',
        maxLength: gameState.snakes[0]?.body?.length || 1,
        stats: {
          moves: gameState.moves || 0,
          wallHits: gameState.wallHits || 0,
          selfHits: gameState.selfHits || 0,
          maxLength: gameState.snakes[0]?.body?.length || 1,
          averageSpeed: getSpeedMultiplier(gameState.speed),
          efficiency: gameState.score > 0 && gameState.moves > 0 ? gameState.score / gameState.moves : 0,
          timeToFirstFood: gameState.timeToFirstFood || 0,
          timeToMaxLength: gameState.timeToMaxLength || 0
        },
        startedAt: gameState.startTime || Date.now(),
        endedAt: Date.now()
      };

      // Save game session to Firebase
      try {
        logger.log('Attempting to save game session with data:', gameSessionData);
        const gameId = await gameOperations.saveGameSession(user.uid, gameSessionData);
        if (gameId) {
          logger.log('Game session saved to Firebase with ID:', gameId);
        } else {
          logger.error('Game session save returned null - save failed');
        }
      } catch (error) {
        logger.error('Failed to save game session:', error);
        logger.error('Error details:', error.message, error.code);
      }

      // Comprehensive user statistics with proper field mapping
      const statUpdates = {
        // Basic game stats
        totalGames: 1,
        totalScore: gameState.score,
        bestScore: gameState.score,
        foodEaten: gameState.foodEaten,
        maxSpeed: getSpeedMultiplier(gameState.speed),
        maxLength: gameState.snakes[0]?.body?.length || 1,
        
        // Advanced tracking stats
        wallHits: gameState.wallHits || 0,
        selfHits: gameState.selfHits || 0,
        moves: gameState.moves || 0,
        
        // Time and survival stats
        totalPlayTime: Math.max(0, Math.floor(gameState.gameTime)),
        maxSurvivalTime: Math.max(0, Math.floor(gameState.gameTime)),
        
        // Mode-specific stats
        [`${gameState.gameMode.replace('_', '')}Games`]: 1,
        [`${gameState.gameMode.replace('_', '')}BestScore`]: gameState.score
      };

      // Win tracking and streaks
      if (victory) {
        statUpdates.totalWins = 1;
        statUpdates[`${gameState.gameMode.replace('_', '')}Wins`] = 1;
        
        // Update win streak (this would need current streak from profile)
        const currentStreak = userProfile?.stats?.currentWinStreak || 0;
        statUpdates.currentWinStreak = currentStreak + 1;
        statUpdates.bestWinStreak = currentStreak + 1;
      } else {
        // Reset current win streak on loss
        statUpdates.currentWinStreak = 0;
      }

      // Special tracking for achievements
      if (gameState.gameTime < GAME_CONFIG.QUICK_DEATH_THRESHOLD) {
        statUpdates.quickDeaths = 1; // Track quick deaths for achievements
      }
      
      // Difficulty-specific AI wins
      if (gameState.gameMode === 'vsai' && victory && gameState.difficulty) {
        statUpdates[`ai${gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}Wins`] = 1;
      }

      logger.log('Updating user stats:', statUpdates);
      const success = await updateUserStats(statUpdates);
      if (success) {
        logger.log('User stats updated successfully');

        // Force refresh of user profile to update UI
        if (refreshProfile) {
          setTimeout(() => {
            logger.log('🔄 Forcing profile refresh after game save...');
            refreshProfile();
          }, GAME_CONFIG.PROFILE_REFRESH_DELAY);
        }
      } else {
        logger.warn('Failed to update user stats (offline mode)');
      }

      // Check and unlock achievements based on game performance
      try {
        const achievementGameStats = {
          // Map to achievement property names that match achievements.js requirements
          games: (userProfile?.stats?.totalGames || 0) + 1,
          wins: victory ? (userProfile?.stats?.totalWins || 0) + 1 : (userProfile?.stats?.totalWins || 0),
          totalScore: (userProfile?.stats?.totalScore || 0) + gameState.score,
          bestScore: Math.max(userProfile?.stats?.bestScore || 0, gameState.score),
          singleScore: gameState.score, // For achievements that check single game score
          maxSpeed: Math.max(userProfile?.stats?.maxSpeed || 1, getSpeedMultiplier(gameState.speed)),
          foodEaten: (userProfile?.stats?.foodEaten || 0) + gameState.foodEaten,
          singleGameFood: gameState.foodEaten, // For single game food achievements
          maxLength: Math.max(userProfile?.stats?.maxLength || 1, gameState.snakes[0]?.body?.length || 1),
          
          // Time and survival stats for achievements
          survivalTime: Math.max(0, Math.floor(gameState.gameTime)),
          maxSurvivalTime: Math.max(userProfile?.stats?.maxSurvivalTime || 0, Math.floor(gameState.gameTime)),
          
          // Streak tracking
          winStreak: victory ? (userProfile?.stats?.currentWinStreak || 0) + 1 : 0,
          bestWinStreak: victory ? Math.max(userProfile?.stats?.bestWinStreak || 0, (userProfile?.stats?.currentWinStreak || 0) + 1) : (userProfile?.stats?.bestWinStreak || 0),
          
          // Failure stats for funny achievements
          wallHits: (userProfile?.stats?.wallHits || 0) + (gameState.wallHits || 0),
          selfHits: (userProfile?.stats?.selfHits || 0) + (gameState.selfHits || 0),
          quickDeaths: gameState.gameTime < GAME_CONFIG.QUICK_DEATH_THRESHOLD ? (userProfile?.stats?.quickDeaths || 0) + 1 : (userProfile?.stats?.quickDeaths || 0),
          
          // AI specific achievements
          aiWins: gameState.gameMode === 'vsai' && victory ? (userProfile?.stats?.totalWins || 0) + 1 : (userProfile?.stats?.totalWins || 0),
          aiEasyWins: gameState.gameMode === 'vsai' && victory && gameState.difficulty === 'easy' ? (userProfile?.stats?.aiEasyWins || 0) + 1 : (userProfile?.stats?.aiEasyWins || 0),
          aiMediumWins: gameState.gameMode === 'vsai' && victory && gameState.difficulty === 'medium' ? (userProfile?.stats?.aiMediumWins || 0) + 1 : (userProfile?.stats?.aiMediumWins || 0),
          aiImpossibleWins: gameState.gameMode === 'vsai' && victory && gameState.difficulty === 'impossible' ? (userProfile?.stats?.aiImpossibleWins || 0) + 1 : (userProfile?.stats?.aiImpossibleWins || 0),
          
          // Multiplayer achievements  
          multiplayerGames: gameState.gameMode === 'multiplayer' ? (userProfile?.stats?.multiplayerGames || 0) + 1 : (userProfile?.stats?.multiplayerGames || 0),
          multiplayerWins: gameState.gameMode === 'multiplayer' && victory ? (userProfile?.stats?.multiplayerWins || 0) + 1 : (userProfile?.stats?.multiplayerWins || 0),
          
          // Special achievements
          transparentScore: gameState.gameMode === 'classictransparent' ? gameState.score : (userProfile?.stats?.transparentScore || 0),
          perfectGame: (gameState.wallHits || 0) === 0 && (gameState.selfHits || 0) === 0 && gameState.score > 0
        };
        
        logger.log('Checking achievements with stats:', achievementGameStats);
        await checkAndUnlockAchievements(achievementGameStats);
      } catch (error) {
        logger.error('Error checking achievements:', error);
      }

      // Update leaderboard if score is significant
      if (gameState.score > 0) {
        try {
          logger.log('Attempting to update leaderboard for user:', user.uid);
          const leaderboardData = {
            ...gameSessionData,
            username: userProfile?.username || userProfile?.displayName || user.email.split('@')[0]
          };
          logger.log('Leaderboard data being sent:', leaderboardData);
          await gameOperations.updateLeaderboard(user.uid, leaderboardData);
          logger.log('Leaderboard updated successfully');
        } catch (error) {
          logger.error('Failed to update leaderboard:', error);
          logger.error('Leaderboard error details:', error.message, error.code);
        }
      } else {
        logger.log('Score is 0, skipping leaderboard update');
      }

    } catch (error) {
      logger.error('Error saving game data:', error);
    }
  }, [user, userProfile, gameState, updateUserStats, checkAndUnlockAchievements, refreshProfile]);

  /**
   * Quit to menu
   */
  const quitToMenu = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    setGameState(createInitialGameState());
  }, []);

  /**
    * Start game loop when playing and not paused - FIXED DEPENDENCIES
    */
  useEffect(() => {
    logger.log('🔄 Game loop effect - isGameActive:', isGameActive, 'isPaused:', gameState.isPaused, 'hasLoop:', !!gameLoopRef.current);

    if (isGameActive && !gameState.isPaused) {
      if (!gameLoopRef.current && updateGameRef.current) {
        logger.log('🚀 Starting game loop...');
        gameLoopRef.current = requestAnimationFrame(updateGameRef.current);
      }
    } else {
      // Stop game loop if not active or paused
      if (gameLoopRef.current) {
        logger.log('⏹️ Stopping game loop...');
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [isGameActive, gameState.isPaused]);

  /**
   * Context value
   */
  const contextValue = useMemo(() => ({
    // State
    ...gameState,
    
    // Computed values
    isGameActive,
    isGameOver,
    isVictory,
    speedMultiplier,
    speedLevel,
    nextSpeedMilestone,
    
    // Operations
    initializeGame,
    startGame,
    updateSnakeDirection,
    togglePause,
    restartGame,
    quitToMenu,
    endGame
  }), [
    gameState,
    isGameActive,
    isGameOver,
    isVictory,
    speedMultiplier,
    speedLevel,
    nextSpeedMilestone,
    initializeGame,
    startGame,
    updateSnakeDirection,
    togglePause,
    restartGame,
    quitToMenu,
    endGame
  ]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * Hook to use game context
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

/**
 * Game operations hook
 */
export const useGameOperations = () => {
  const context = useGame();
  return context;
};

export default useGame;