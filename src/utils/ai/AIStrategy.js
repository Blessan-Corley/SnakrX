import { AStarPathfinder } from './AStarPathfinder.js';
import { AI_STRATEGY_SETTINGS } from './strategySettings.js';
import {
  buildNavigationObstacles,
  calculateAdvancedSafety,
  calculateFutureSpace,
  checkSafetyDistance,
  getCandidateDirections,
  getDirectionFromPositions,
  getDirectionRank,
  getPathLength,
  getRandomDirection,
  getReachableSpace,
  isSafeMoveWithDistance,
  predictSnakeMovement
} from './strategyCore.js';
import {
  getDesperateMove,
  getImpossibleMove,
  getNextMoveDecision,
  getOptimalMove,
  getSafeMoves,
  getSuboptimalMove,
  getSurvivalMove
} from './strategyDecisions.js';

export class AIStrategy {
  constructor(boardWidth, boardHeight, difficulty = 'medium') {
    this.boardWidth = boardWidth;
    this.boardHeight = boardHeight;
    this.difficulty = difficulty;
    this.pathfinder = new AStarPathfinder(boardWidth, boardHeight);
    this.settings = AI_STRATEGY_SETTINGS;
  }

  getNextMove(aiSnake, food, obstacles = [], otherSnakes = [], gameMode = 'vsai') {
    return getNextMoveDecision(this, aiSnake, food, obstacles, otherSnakes, gameMode);
  }

  getSafeMoves(head, snake, obstacles, otherSnakes, settings, gameMode) {
    return getSafeMoves(this, head, snake, obstacles, otherSnakes, settings, gameMode);
  }

  getImpossibleMove(head, food, snake, obstacles, otherSnakes, gameMode, settings) {
    return getImpossibleMove(this, head, food, snake, obstacles, otherSnakes, gameMode, settings);
  }

  getCandidateDirections() {
    return getCandidateDirections();
  }

  getDirectionRank(direction) {
    return getDirectionRank(this, direction);
  }

  buildNavigationObstacles(snake, obstacles, otherSnakes, gameMode, settings) {
    return buildNavigationObstacles(this, snake, obstacles, otherSnakes, gameMode, settings);
  }

  getPathLength(start, target, obstacles) {
    return getPathLength(this, start, target, obstacles);
  }

  getReachableSpace(start, obstacles) {
    return getReachableSpace(this, start, obstacles);
  }

  isSafeMoveWithDistance(position, snake, obstacles, otherSnakes, minDistance = 1, gameMode, settings = {}) {
    return isSafeMoveWithDistance(
      this,
      position,
      snake,
      obstacles,
      otherSnakes,
      minDistance,
      gameMode,
      settings
    );
  }

  checkSafetyDistance(position, snake, obstacles, otherSnakes, minDistance, gameMode) {
    return checkSafetyDistance(this, position, snake, obstacles, otherSnakes, minDistance, gameMode);
  }

  calculateAdvancedSafety(position, snake, obstacles, otherSnakes, settings, gameMode) {
    return calculateAdvancedSafety(this, position, snake, obstacles, otherSnakes, settings, gameMode);
  }

  calculateFutureSpace(position, direction, snake, obstacles, otherSnakes, depth, gameMode) {
    return calculateFutureSpace(this, position, direction, snake, obstacles, otherSnakes, depth, gameMode);
  }

  getDesperateMove(head, snake, obstacles, otherSnakes, gameMode, settings = {}) {
    return getDesperateMove(this, head, snake, obstacles, otherSnakes, gameMode, settings);
  }

  getSuboptimalMove(safeMoves, settings) {
    return getSuboptimalMove(this, safeMoves, settings);
  }

  getOptimalMove(head, food, snake, obstacles, otherSnakes, settings, gameMode = 'vsai') {
    return getOptimalMove(this, head, food, snake, obstacles, otherSnakes, settings, gameMode);
  }

  getSurvivalMove(head, snake, obstacles, otherSnakes, settings, gameMode) {
    return getSurvivalMove(this, head, snake, obstacles, otherSnakes, settings, gameMode);
  }

  predictSnakeMovement(snake, steps) {
    return predictSnakeMovement(this, snake, steps);
  }

  getDirectionFromPositions(from, to) {
    return getDirectionFromPositions(this, from, to);
  }

  getRandomDirection() {
    return getRandomDirection();
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
  }
}
