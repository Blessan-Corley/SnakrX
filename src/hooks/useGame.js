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

const GameContext = createContext({});

// Enhanced initial state with tracking fields
const createInitialGameState = () => ({
  gameState: GAME_STATES.MENU,
  gameMode: GAME_MODES.CLASSIC,
  difficulty: AI_DIFFICULTIES.MEDIUM,
  playerCount: 1,
  boardSize: getBoardSize('classic', 1, isMobile()),
  snakes: [],
  food: null,
  score: 0,
  gameTime: 0,
  speed: SPEED_CONFIGS.INITIAL,
  foodEaten: 0,
  isPaused: false,
  aiController: null,
  deadPlayers: new Set(),
  gameId: null,
  startTime: null,
  
  // Additional tracking fields
  moves: 0,
  wallHits: 0,
  selfHits: 0,
  timeToFirstFood: null,
  timeToMaxLength: null,
  maxLengthReached: 1
});

export const GameProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const { updateUserStats } = useAuthOperations();
  
  const [gameState, setGameState] = useState(createInitialGameState);
  
  // Game loop refs
  const gameLoopRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const gameStartTimeRef = useRef(0);
  const pausedTimeRef = useRef(0); // Total time spent paused
  const pauseStartRef = useRef(0); // When current pause started

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
    if (!isGameActive || gameState.isPaused || !gameStartTimeRef.current) {
      return;
    }
    
    const now = Date.now();
    const elapsed = Math.max(0, (now - gameStartTimeRef.current - pausedTimeRef.current) / 1000);
    
    setGameState(prev => ({
      ...prev,
      gameTime: elapsed
    }));
  }, [isGameActive, gameState.isPaused]);

  /**
   * FIXED: Simplified game update function 
   */
  const updateGame = useCallback(() => {
    if (!isGameActive || gameState.isPaused) {
      return;
    }

    const now = performance.now();
    
    // Control game speed
    if (now - lastUpdateTimeRef.current < gameState.speed) {
      gameLoopRef.current = requestAnimationFrame(updateGame);
      return;
    }
    
    lastUpdateTimeRef.current = now;

    // Update timer
    updateTimer();

    // Update snakes with enhanced validation
    const newSnakes = [...gameState.snakes];
    let foodConsumed = false;
    let newFood = gameState.food;
    let gameEnded = false;

    for (let i = 0; i < newSnakes.length; i++) {
      const snake = newSnakes[i];
      if (!snake || !snake.isAlive || !Array.isArray(snake.body) || snake.body.length === 0) continue;

      let direction = snake.direction;

      // Validate direction
      if (!direction || typeof direction.x !== 'number' || typeof direction.y !== 'number') {
        console.warn(`Invalid direction for snake ${i}:`, direction);
        direction = DIRECTIONS.RIGHT; // Fallback direction
      }

      // AI logic
      if (snake.isAI && gameState.aiController) {
        try {
          const obstacles = newSnakes
            .filter((s, idx) => idx !== i && s && s.isAlive && Array.isArray(s.body))
            .flatMap(s => s.body);
          
          const aiDirection = gameState.aiController.getNextMove(
            snake.body,
            newFood,
            obstacles,
            []
          );
          
          // Validate AI direction
          if (aiDirection && typeof aiDirection.x === 'number' && typeof aiDirection.y === 'number') {
            direction = aiDirection;
          }
        } catch (error) {
          console.error('AI error:', error);
        }
      }

      // Calculate new head position
      const head = snake.body[0];
      if (!head || typeof head.x !== 'number' || typeof head.y !== 'number') {
        console.error(`Invalid head position for snake ${i}:`, head);
        snake.isAlive = false;
        continue;
      }
      
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
      };

      // Wall collision check
      if (gameState.gameMode === GAME_MODES.CLASSIC_TRANSPARENT) {
        // Wrap around in transparent mode
        if (newHead.x < 0) newHead.x = gameState.boardSize.width - 1;
        if (newHead.x >= gameState.boardSize.width) newHead.x = 0;
        if (newHead.y < 0) newHead.y = gameState.boardSize.height - 1;
        if (newHead.y >= gameState.boardSize.height) newHead.y = 0;
      } else {
        // Normal collision with tracking
        if (newHead.x < 0 || newHead.x >= gameState.boardSize.width || 
            newHead.y < 0 || newHead.y >= gameState.boardSize.height) {
          newSnakes[i] = { ...snake, isAlive: false };
          playDeath();
          
          // Track wall hits for player
          if (i === 0) {
            setGameState(prev => ({
              ...prev,
              wallHits: prev.wallHits + 1
            }));
          }
          continue;
        }
      }

      // Enhanced self collision check with validation
      for (let j = 1; j < snake.body.length; j++) {
        const segment = snake.body[j];
        if (!segment || typeof segment.x !== 'number' || typeof segment.y !== 'number') {
          console.warn(`Invalid segment at position ${j} for snake ${i}:`, segment);
          continue;
        }
        
        if (newHead.x === segment.x && newHead.y === segment.y) {
          newSnakes[i] = { ...snake, isAlive: false };
          playDeath();
          console.log(`Snake ${i} died from self collision at:`, newHead);
          
          // Track self hits for player
          if (i === 0) {
            setGameState(prev => ({
              ...prev,
              selfHits: prev.selfHits + 1
            }));
          }
          break;
        }
      }

      // Check if snake died from self collision
      if (!newSnakes[i].isAlive) continue;

      // Check collision with other snakes (multiplayer)
      if (gameState.playerCount > 1) {
        for (let k = 0; k < newSnakes.length; k++) {
          if (k === i) continue; // Skip self
          const otherSnake = newSnakes[k];
          if (!otherSnake || !otherSnake.isAlive || !Array.isArray(otherSnake.body)) continue;
          
          // Check collision with other snake's body
          for (const segment of otherSnake.body) {
            if (segment && segment.x === newHead.x && segment.y === newHead.y) {
              newSnakes[i] = { ...snake, isAlive: false };
              playDeath();
              console.log(`Snake ${i} died from collision with snake ${k} at:`, newHead);
              break;
            }
          }
          
          if (!newSnakes[i].isAlive) break;
        }
      }

      // Check if snake is still alive after collision checks
      const currentSnake = newSnakes[i];
      if (!currentSnake.isAlive) continue;

      // Move snake - create new snake object and body array
      const newBody = [newHead, ...snake.body];
      newSnakes[i] = {
        ...snake,
        body: newBody,
        direction: direction
      };
      
      // Track moves for player
      if (i === 0) {
        setGameState(prev => ({
          ...prev,
          moves: prev.moves + 1
        }));
      }

      // Food collision with validation
      if (newFood && 
          typeof newFood.x === 'number' && 
          typeof newFood.y === 'number' && 
          newHead.x === newFood.x && 
          newHead.y === newFood.y) {
        foodConsumed = true;
        playFoodEat();
        console.log(`Snake ${i} ate food at:`, newFood);
        
        // Track timing stats for player
        if (i === 0) {
          const currentTime = (Date.now() - (gameStartTimeRef.current || Date.now())) / 1000;
          setGameState(prev => {
            const updates = {};
            
            // Track time to first food
            if (prev.foodEaten === 0 && prev.timeToFirstFood === null) {
              updates.timeToFirstFood = currentTime;
            }
            
            // Track max length and time to reach it
            const newLength = snake.body.length + 1; // +1 because we haven't popped yet
            if (newLength > prev.maxLengthReached) {
              updates.maxLengthReached = newLength;
              updates.timeToMaxLength = currentTime;
            }
            
            return { ...prev, ...updates };
          });
        }
      } else {
        // Remove tail if no food eaten - update the snake we just created
        const currentSnake = newSnakes[i];
        newSnakes[i] = {
          ...currentSnake,
          body: currentSnake.body.slice(0, -1) // Remove last segment
        };
      }
    }

    // Generate new food
    if (foodConsumed) {
      const allBodies = newSnakes
        .filter(s => s.isAlive)
        .flatMap(s => s.body);
      newFood = generateFoodPosition(gameState.boardSize.width, gameState.boardSize.height, allBodies);
      
      // Update score and speed - ENHANCED PROGRESSION
      const points = calculatePoints(gameState.gameMode, gameState.difficulty);
      const newFoodEaten = gameState.foodEaten + 1;
      const newSpeed = calculateSpeed(newFoodEaten);
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        foodEaten: newFoodEaten,
        speed: newSpeed
      }));
    }

    // Check end conditions with validation
    const aliveSnakes = newSnakes.filter(s => s && s.isAlive);
    console.log(`Alive snakes: ${aliveSnakes.length}, Game mode: ${gameState.gameMode}`);
    
    if (gameState.gameMode === GAME_MODES.CLASSIC && aliveSnakes.length === 0) {
      gameEnded = true;
      console.log('Game ended: No snakes alive in classic mode');
    } else if (gameState.gameMode === GAME_MODES.VS_AI && aliveSnakes.length <= 1) {
      const humanAlive = aliveSnakes.find(s => !s.isAI);
      const aiAlive = aliveSnakes.find(s => s.isAI);
      
      if (!humanAlive && !aiAlive) {
        gameEnded = true;
        console.log('Game ended: Both players dead in VS AI mode');
      } else if (aliveSnakes.length === 1) {
        gameEnded = true;
        console.log('Game ended: Only one player alive in VS AI mode');
      }
    } else if (gameState.gameMode === GAME_MODES.MULTIPLAYER && aliveSnakes.length <= 1) {
      gameEnded = true;
      console.log('Game ended: Only one or no players alive in multiplayer mode');
    }

    // Update state with validation
    try {
      setGameState(prev => ({
        ...prev,
        snakes: newSnakes.filter(s => s && s.body && Array.isArray(s.body)), // Filter out invalid snakes
        food: newFood
      }));

      if (gameEnded) {
        const victory = aliveSnakes.length > 0 && aliveSnakes[0].id === 0;
        console.log(`Ending game - Victory: ${victory}`);
        // Stop game loop
        if (gameLoopRef.current) {
          cancelAnimationFrame(gameLoopRef.current);
          gameLoopRef.current = null;
        }
        // Set end game state
        setGameState(prev => ({
          ...prev,
          gameState: victory ? GAME_STATES.VICTORY : GAME_STATES.GAME_OVER,
          isPaused: true
        }));
      } else {
        gameLoopRef.current = requestAnimationFrame(updateGame);
      }
    } catch (error) {
      console.error('Error updating game state:', error);
      // Force end game on critical error - stop loop and set game over state
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      setGameState(prev => ({
        ...prev,
        gameState: GAME_STATES.GAME_OVER,
        isPaused: true
      }));
    }
  }, [isGameActive, gameState, updateTimer]);

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
          color: i === 0 ? '#10b981' : '#ef4444'
        });
      }

      // Initialize AI
      let aiController = null;
      if (mode === GAME_MODES.VS_AI) {
        aiController = new AIController(boardSize.width, boardSize.height, difficulty);
      }

      // Generate food
      const food = generateFoodPosition(boardSize.width, boardSize.height, snakes.map(s => s.body));

      // FIXED: Complete state reset
      setGameState({
        gameState: GAME_STATES.READY,
        gameMode: mode,
        difficulty: difficulty,
        playerCount: playerCount,
        boardSize: boardSize,
        snakes: snakes,
        food: food,
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
      console.error('Error initializing game:', error);
      throw error;
    }
  }, []);

  /**
   * FIXED: Start game with proper timer initialization
   */
  const startGame = useCallback(() => {
    console.log('Starting game!');
    gameStartTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    pauseStartRef.current = 0;
    lastUpdateTimeRef.current = 0;
    
    setGameState(prev => {
      console.log('Game state changing from', prev.gameState, 'to PLAYING');
      return {
        ...prev,
        gameState: GAME_STATES.PLAYING,
        isPaused: false,
        startTime: Date.now()
      };
    });
  }, []);

  /**
   * ENHANCED: Safe direction update with improved 180-degree turn prevention
   */
  const updateSnakeDirection = useCallback((playerId, newDirection) => {
    console.log(`Direction change requested: Player ${playerId}, Direction:`, newDirection);
    
    // Validate input parameters
    if (typeof playerId !== 'number' || !newDirection || typeof newDirection.x !== 'number' || typeof newDirection.y !== 'number') {
      console.warn('Invalid direction change parameters:', { playerId, newDirection });
      return;
    }
    
    // Auto-start game if in READY state - INSTANT
    if (gameState.gameState === GAME_STATES.READY) {
      startGame();
      // Also immediately update direction for instant response
      setGameState(prev => {
        const newSnakes = [...prev.snakes];
        if (playerId >= 0 && playerId < newSnakes.length && newSnakes[playerId] && newSnakes[playerId].isAlive) {
          const snake = newSnakes[playerId];
          
          // IMPROVED 180-degree turn prevention - only check if snake has moved (length > 1)
          if (snake.body && snake.body.length > 1) {
            const currentDir = snake.direction;
            const isExactOpposite = (
              currentDir.x + newDirection.x === 0 && 
              currentDir.y + newDirection.y === 0 &&
              (currentDir.x !== 0 || currentDir.y !== 0) &&
              (newDirection.x !== 0 || newDirection.y !== 0)
            );
            
            if (!isExactOpposite) {
              newSnakes[playerId] = { ...snake, direction: newDirection };
              console.log(`Direction changed for player ${playerId}:`, newDirection);
            } else {
              console.log(`180-degree turn blocked for player ${playerId} - snake length: ${snake.body.length}`);
            }
          } else {
            // Allow any direction change for single-segment snakes
            newSnakes[playerId] = { ...snake, direction: newDirection };
            console.log(`Direction changed for player ${playerId} (single segment):`, newDirection);
          }
        }
        return { ...prev, snakes: newSnakes };
      });
      return;
    }
    
    // Only block if game is completely over
    if (gameState.gameState === GAME_STATES.GAME_OVER || gameState.gameState === GAME_STATES.VICTORY) {
      return;
    }

    // SAFE Direction change with IMPROVED validation to prevent 180-degree turns
    setGameState(prev => {
      const newSnakes = [...prev.snakes];
      if (playerId >= 0 && playerId < newSnakes.length && newSnakes[playerId] && newSnakes[playerId].isAlive) {
        const snake = newSnakes[playerId];
        
        // IMPROVED 180-degree turn prevention - only check if snake has moved (length > 1)
        if (snake.body && snake.body.length > 1) {
          const currentDir = snake.direction;
          
          // More precise opposite direction check
          const isExactOpposite = (
            currentDir.x + newDirection.x === 0 && 
            currentDir.y + newDirection.y === 0 &&
            (currentDir.x !== 0 || currentDir.y !== 0) &&
            (newDirection.x !== 0 || newDirection.y !== 0)
          );
          
          if (!isExactOpposite) {
            newSnakes[playerId] = { ...snake, direction: newDirection };
            console.log(`Direction changed for player ${playerId}:`, newDirection);
          } else {
            console.log(`180-degree turn blocked for player ${playerId} - current:`, currentDir, 'new:', newDirection);
          }
        } else {
          // Allow any direction change for single-segment snakes (game start)
          newSnakes[playerId] = { ...snake, direction: newDirection };
          console.log(`Direction changed for player ${playerId} (single segment):`, newDirection);
        }
      }
      return { ...prev, snakes: newSnakes };
    });
  }, [gameState.gameState, startGame]);

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
  const endGame = useCallback(async (victory = false) => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    setGameState(prev => ({
      ...prev,
      gameState: victory ? GAME_STATES.VICTORY : GAME_STATES.GAME_OVER,
      isPaused: true
    }));

    if (victory) {
      playVictory();
    }

    // Save game data if user is logged in
    if (user && gameState.score > 0) {
      try {
        await saveGameData(victory);
      } catch (error) {
        console.error('Error saving game:', error);
      }
    }
  }, [user, gameState.score]);

  /**
   * Save game data - PROPER Firebase integration with complete schema
   */
  const saveGameData = useCallback(async (victory) => {
    if (!user || !updateUserStats) {
      console.log('No user or updateUserStats - skipping save');
      return;
    }
    
    try {
      console.log('Saving game data to Firebase...');
      
      // Complete game session data
      const gameSessionData = {
        gameId: gameState.gameId,
        userId: user.uid,
        username: userProfile?.username || userProfile?.displayName || user.email.split('@')[0],
        mode: gameState.gameMode,
        difficulty: gameState.difficulty,
        playerCount: gameState.playerCount,
        score: gameState.score,
        duration: Math.max(0, Math.floor(gameState.gameTime)), // Ensure positive duration
        foodEaten: gameState.foodEaten,
        speedReached: getSpeedMultiplier(gameState.speed),
        result: victory ? 'won' : 'lost',
        startedAt: gameState.startTime || Date.now(), // Fallback to current time
        endedAt: Date.now(),
        stats: {
          moves: gameState.moves || 0,
          wallHits: gameState.wallHits || 0,
          selfHits: gameState.selfHits || 0,
          maxLength: gameState.snakes[0]?.body?.length || 1,
          averageSpeed: getSpeedMultiplier(gameState.speed),
          efficiency: gameState.gameTime > 0 ? gameState.score / gameState.gameTime : 0,
          timeToFirstFood: gameState.timeToFirstFood || 0,
          timeToMaxLength: gameState.timeToMaxLength || 0
        },
        performance: {
          fps: 60, // Could be tracked if needed
          inputLag: 0,
          renderTime: 0,
          memoryUsage: 0
        }
      };

      // Save game session to Firebase
      try {
        const { gameOperations } = await import('@/services/firebase');
        await gameOperations.saveGameSession(user.uid, gameSessionData);
        console.log('Game session saved to Firebase');
      } catch (error) {
        console.warn('Failed to save game session:', error);
      }

      // Update user statistics
      const statUpdates = {
        totalGames: 1,
        totalScore: gameState.score,
        totalPlayTime: Math.max(0, Math.floor(gameState.gameTime)), // Ensure positive time
        foodEaten: gameState.foodEaten,
        bestScore: gameState.score,
        maxSurvivalTime: Math.max(0, Math.floor(gameState.gameTime)), // Ensure positive time
        maxSpeed: getSpeedMultiplier(gameState.speed)
      };

      // Win-specific stats
      if (victory) {
        statUpdates.totalWins = 1;
        statUpdates.currentWinStreak = (userProfile?.stats?.currentWinStreak || 0) + 1;
        statUpdates.bestWinStreak = Math.max(statUpdates.currentWinStreak, userProfile?.stats?.bestWinStreak || 0);
      } else {
        statUpdates.currentWinStreak = 0;
      }

      // Mode-specific statistics  
      switch (gameState.gameMode) {
        case 'classic':
          statUpdates.classicGames = 1;
          statUpdates.classicBestScore = gameState.score;
          if (victory) statUpdates.classicWins = 1;
          break;
        case 'vsai':
          statUpdates.vsAIGames = 1;
          statUpdates.vsAIBestScore = gameState.score;
          if (victory) {
            statUpdates.vsAIWins = 1;
            switch (gameState.difficulty) {
              case 'easy': statUpdates.aiEasyWins = 1; break;
              case 'medium': statUpdates.aiMediumWins = 1; break;
              case 'impossible': statUpdates.aiImpossibleWins = 1; break;
            }
          }
          break;
        case 'multiplayer':
          statUpdates.multiplayerGames = 1;
          statUpdates.multiplayerBestScore = gameState.score;
          if (victory) statUpdates.multiplayerWins = 1;
          break;
      }

      console.log('Updating user stats:', statUpdates);
      const success = await updateUserStats(statUpdates);
      if (success) {
        console.log('User stats updated successfully');
      } else {
        console.warn('Failed to update user stats (offline mode)');
      }

      // Update leaderboard if score is significant
      if (gameState.score > 0) {
        try {
          const { gameOperations } = await import('@/services/firebase');
          await gameOperations.updateLeaderboard(user.uid, {
            ...gameSessionData,
            username: userProfile?.username || user.email.split('@')[0]
          });
          console.log('Leaderboard updated');
        } catch (error) {
          console.warn('Failed to update leaderboard:', error);
        }
      }

    } catch (error) {
      console.error('Error saving game data:', error);
    }
  }, [user, userProfile, gameState, updateUserStats, getSpeedMultiplier]);

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
    console.log('Game loop effect triggered:', { isGameActive, isPaused: gameState.isPaused, hasLoop: !!gameLoopRef.current });
    
    if (isGameActive && !gameState.isPaused) {
      if (!gameLoopRef.current) {
        console.log('Starting game loop...');
        gameLoopRef.current = requestAnimationFrame(updateGame);
      }
    } else {
      // Stop game loop if not active or paused
      if (gameLoopRef.current) {
        console.log('Stopping game loop due to pause/inactive...');
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }
    
    return () => {
      if (gameLoopRef.current) {
        console.log('Cleanup: Stopping game loop...');
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [isGameActive, gameState.isPaused, updateGame]);

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