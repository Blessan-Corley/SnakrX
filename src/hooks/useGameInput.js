/**
 * ENHANCED Game Input System - HIGH RESPONSIVENESS WITH STABILITY
 * This version provides instant key response while preventing input conflicts
 */

import { useEffect, useCallback, useRef } from 'react';
import { DIRECTIONS } from '@/utils/gameUtils';
import { playClick } from '@/utils/sound';

/**
 * INSTANT key mapping - no processing delays
 */
const INSTANT_KEY_MAP = {
  // Arrow Keys
  'ArrowUp': DIRECTIONS.UP,
  'ArrowDown': DIRECTIONS.DOWN,
  'ArrowLeft': DIRECTIONS.LEFT,
  'ArrowRight': DIRECTIONS.RIGHT,
  
  // WASD
  'KeyW': DIRECTIONS.UP,
  'KeyS': DIRECTIONS.DOWN,
  'KeyA': DIRECTIONS.LEFT,
  'KeyD': DIRECTIONS.RIGHT,
  'w': DIRECTIONS.UP,
  's': DIRECTIONS.DOWN,
  'a': DIRECTIONS.LEFT,
  'd': DIRECTIONS.RIGHT,
  'W': DIRECTIONS.UP,
  'S': DIRECTIONS.DOWN,
  'A': DIRECTIONS.LEFT,
  'D': DIRECTIONS.RIGHT,
  
  // IJKL (Player 3)
  'KeyI': DIRECTIONS.UP,
  'KeyK': DIRECTIONS.DOWN,
  'KeyJ': DIRECTIONS.LEFT,
  'KeyL': DIRECTIONS.RIGHT,
  'i': DIRECTIONS.UP,
  'k': DIRECTIONS.DOWN,
  'j': DIRECTIONS.LEFT,
  'l': DIRECTIONS.RIGHT,
  'I': DIRECTIONS.UP,
  'K': DIRECTIONS.DOWN,
  'J': DIRECTIONS.LEFT,
  'L': DIRECTIONS.RIGHT,
  
  // Numpad
  'Numpad8': DIRECTIONS.UP,
  'Numpad5': DIRECTIONS.DOWN,
  'Numpad4': DIRECTIONS.LEFT,
  'Numpad6': DIRECTIONS.RIGHT
};

/**
 * Control keys
 */
const CONTROL_KEYS = {
  'Space': 'pause',
  ' ': 'pause',
  'KeyR': 'restart',
  'r': 'restart',
  'R': 'restart',
  'Escape': 'quit'
};

/**
 * ENHANCED Input Hook with stability improvements
 */
export const useGameInput = ({
  playerCount = 1,
  isPlaying = false,
  isPaused = false,
  onDirectionChange = () => {},
  onPauseToggle = () => {},
  onRestart = () => {},
  onQuit = () => {}
}) => {
  // Use refs to avoid stale closures and enable instant access
  const handlersRef = useRef({
    onDirectionChange,
    onPauseToggle,
    onRestart,
    onQuit
  });

  // Track last direction change per player to prevent rapid duplicates
  const lastDirectionChangeRef = useRef({});
  const keysDownRef = useRef(new Set());
  
  // Input buffer for high-frequency input handling
  const inputBufferRef = useRef({});

  // Update handlers ref whenever they change
  useEffect(() => {
    handlersRef.current = {
      onDirectionChange,
      onPauseToggle,
      onRestart,
      onQuit
    };
  }, [onDirectionChange, onPauseToggle, onRestart, onQuit]);

  /**
   * Get player ID for key - INSTANT LOOKUP
   */
  const getPlayerForKey = useCallback((code, key) => {
    if (playerCount === 1) {
      // Single player - any movement key goes to player 0
      return INSTANT_KEY_MAP[code] || INSTANT_KEY_MAP[key] ? 0 : -1;
    }
    
    // Multiplayer key assignments
    // Player 1 (0): WASD
    if (code === 'KeyW' || code === 'KeyS' || code === 'KeyA' || code === 'KeyD' ||
        key === 'w' || key === 's' || key === 'a' || key === 'd' ||
        key === 'W' || key === 'S' || key === 'A' || key === 'D') {
      return 0;
    }
    
    // Player 2 (1): Arrow Keys
    if (code === 'ArrowUp' || code === 'ArrowDown' || code === 'ArrowLeft' || code === 'ArrowRight') {
      return 1;
    }
    
    // Player 3 (2): IJKL
    if (code === 'KeyI' || code === 'KeyK' || code === 'KeyJ' || code === 'KeyL' ||
        key === 'i' || key === 'k' || key === 'j' || key === 'l' ||
        key === 'I' || key === 'K' || key === 'J' || key === 'L') {
      return 2;
    }
    
    // Player 4 (3): Numpad
    if (code === 'Numpad8' || code === 'Numpad5' || code === 'Numpad4' || code === 'Numpad6') {
      return 3;
    }
    
    return -1;
  }, [playerCount]);

  /**
   * ENHANCED key handler with stability improvements and multi-key protection
   */
  const handleKeyDown = useCallback((event) => {
    const { code, key } = event;
    
    // Prevent duplicate key events
    const keyIdentifier = code || key;
    if (keysDownRef.current.has(keyIdentifier)) {
      return;
    }
    keysDownRef.current.add(keyIdentifier);
    
    // Prevent any default browser behavior immediately
    event.preventDefault();
    event.stopImmediatePropagation();
    
    // INSTANT control key handling
    const controlAction = CONTROL_KEYS[code] || CONTROL_KEYS[key];
    if (controlAction) {
      const handlers = handlersRef.current;
      
      // Execute control actions IMMEDIATELY
      switch (controlAction) {
        case 'pause':
          handlers.onPauseToggle();
          playClick();
          return;
        case 'restart':
          handlers.onRestart();
          playClick();
          return;
        case 'quit':
          handlers.onQuit();
          playClick();
          return;
      }
    }

    // ENHANCED movement key handling with duplicate prevention and multi-key protection
    const direction = INSTANT_KEY_MAP[code] || INSTANT_KEY_MAP[key];
    if (direction) {
      // Get player ID instantly
      const playerId = getPlayerForKey(code, key);
      if (playerId === -1) return;
      
      // Enhanced input handling with smart buffering and multi-key protection
      const now = Date.now();
      const lastChange = lastDirectionChangeRef.current[playerId];
      const minInterval = 30; // Reduced to 30ms for better responsiveness
      
      // Check if too many keys are pressed simultaneously (prevent accidental deaths)
      const movementKeysPressed = Array.from(keysDownRef.current)
        .filter(k => INSTANT_KEY_MAP[k])
        .length;
      
      // If more than 2 movement keys are pressed, ignore the input to prevent accidents
      if (movementKeysPressed > 2) {
        console.log(`Too many keys pressed (${movementKeysPressed}), ignoring to prevent accident`);
        return;
      }
      
      // Always allow if no previous change or enough time has passed
      if (!lastChange || now - lastChange >= minInterval) {
        lastDirectionChangeRef.current[playerId] = now;
        
        // Clear any buffered input for this player
        delete inputBufferRef.current[playerId];
        
        // Call direction change with validation
        const handlers = handlersRef.current;
        try {
          handlers.onDirectionChange(playerId, direction);
          console.log(`Key pressed: ${code}/${key} -> Direction:`, direction, `Player: ${playerId}`);
        } catch (error) {
          console.error('Error processing direction change:', error);
        }
      } else {
        // Buffer the input for smooth gameplay
        inputBufferRef.current[playerId] = {
          direction,
          timestamp: now,
          key: `${code}/${key}`
        };
        console.log(`Direction buffered for player ${playerId}: ${code}/${key}`);
      }
    }
  }, [getPlayerForKey]);

  /**
   * Handle key up events to clear key tracking
   */
  const handleKeyUp = useCallback((event) => {
    const { code, key } = event;
    const keyIdentifier = code || key;
    keysDownRef.current.delete(keyIdentifier);
  }, []);

  /**
   * Process buffered inputs for smooth gameplay with improved timing
   */
  const processBufferedInputs = useCallback(() => {
    const now = Date.now();
    const handlers = handlersRef.current;
    
    for (const [playerId, bufferedInput] of Object.entries(inputBufferRef.current)) {
      const lastChange = lastDirectionChangeRef.current[playerId];
      const minInterval = 30; // Match the reduced interval for consistency
      
      // Check if enough time has passed to process the buffered input
      if (!lastChange || now - lastChange >= minInterval) {
        // Also check if the buffered input isn't too old (max 200ms buffer time)
        if (now - bufferedInput.timestamp <= 200) {
          lastDirectionChangeRef.current[playerId] = now;
          
          try {
            handlers.onDirectionChange(parseInt(playerId), bufferedInput.direction);
            console.log(`Buffered input processed: ${bufferedInput.key} -> Player: ${playerId}`);
          } catch (error) {
            console.error('Error processing buffered input:', error);
          }
        } else {
          console.log(`Buffered input expired for player ${playerId}`);
        }
        
        // Remove processed or expired input from buffer
        delete inputBufferRef.current[playerId];
      }
    }
  }, []);

  /**
   * Set up interval to process buffered inputs
   */
  useEffect(() => {
    const intervalId = setInterval(processBufferedInputs, 25); // Check every 25ms
    
    return () => {
      clearInterval(intervalId);
    };
  }, [processBufferedInputs]);

  /**
   * Touch controls for mobile - FIXED to ensure all directions work
   */
  const handleTouchControl = useCallback((direction) => {
    console.log('Touch control pressed:', direction);
    const handlers = handlersRef.current;
    handlers.onDirectionChange(0, direction);
    playClick();
  }, []);

  /**
   * Touch swipe handling
   */
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    handleTouchStart.startX = touch.clientX;
    handleTouchStart.startY = touch.clientY;
    handleTouchStart.startTime = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!handleTouchStart.startX || !handleTouchStart.startY) return;
    
    const touch = e.changedTouches[0];
    const deltaX = handleTouchStart.startX - touch.clientX;
    const deltaY = handleTouchStart.startY - touch.clientY;
    const deltaTime = Date.now() - handleTouchStart.startTime;
    
    // Require minimum swipe distance and speed
    const minDistance = 30;
    const maxTime = 300; // ms
    
    if (Math.abs(deltaX) < minDistance && Math.abs(deltaY) < minDistance) return;
    if (deltaTime > maxTime) return;
    
    let direction = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      direction = deltaX > 0 ? DIRECTIONS.LEFT : DIRECTIONS.RIGHT;
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? DIRECTIONS.UP : DIRECTIONS.DOWN;
    }
    
    if (direction) {
      handlersRef.current.onDirectionChange(0, direction);
      playClick();
    }
    
    // Reset
    handleTouchStart.startX = null;
    handleTouchStart.startY = null;
    handleTouchStart.startTime = null;
  }, []);

  /**
   * Set up ENHANCED event listeners with keyup tracking
   */
  useEffect(() => {
    // Use fast event handling with better options
    const options = { 
      capture: true,    // Capture phase for fastest response
      passive: false    // Allow preventDefault
    };
    
    // Attach to document for global key handling
    document.addEventListener('keydown', handleKeyDown, options);
    document.addEventListener('keyup', handleKeyUp, options);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, options);
      document.removeEventListener('keyup', handleKeyUp, options);
      // Clear all tracking on cleanup
      keysDownRef.current.clear();
      lastDirectionChangeRef.current = {};
      inputBufferRef.current = {};
    };
  }, [handleKeyDown, handleKeyUp]);

  /**
   * Get key mappings for display
   */
  const getCurrentKeyMappings = useCallback(() => {
    const mappings = [];
    for (let i = 0; i < playerCount; i++) {
      mappings.push({
        playerId: i,
        playerName: `Player ${i + 1}`,
        keys: playerCount === 1 ? 'WASD or Arrow Keys' : 
              i === 0 ? 'WASD' :
              i === 1 ? 'Arrow Keys' :
              i === 2 ? 'IJKL' : 'Numpad 8456'
      });
    }
    return mappings;
  }, [playerCount]);

  return {
    // Touch handlers
    onTouchStart: handleTouchStart,
    onTouchMove: () => {}, // Not needed for swipe detection
    onTouchEnd: handleTouchEnd,
    handleTouchControl,
    
    // Utilities
    getCurrentKeyMappings
  };
};

export default useGameInput;