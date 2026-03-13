import { AIStrategy } from './AIStrategy.js';
import { getAntiStuckMove } from './strategyDecisions.js';

export class AIController {
  constructor(boardWidth, boardHeight, difficulty = 'medium') {
    this.strategy = new AIStrategy(boardWidth, boardHeight, difficulty);
    this.lastMove = null;
    this.moveHistory = [];
    this.stuckCounter = 0;
    this.moveDelay = 0;
    this.tickCounter = 0;
    this.lastHeadKey = null;
  }

  getNextMove(aiSnake, food, obstacles = [], otherSnakes = [], gameMode = 'vsai') {
    this.tickCounter++;

    const settings = this.strategy.settings[this.strategy.difficulty];

    if (this.moveDelay < settings.reactionTime) {
      this.moveDelay++;
      return this.lastMove || { x: 1, y: 0 };
    }

    this.moveDelay = 0;

    let move = this.strategy.getNextMove(aiSnake, food, obstacles, otherSnakes, gameMode);
    move = getAntiStuckMove(this, aiSnake, move, obstacles, otherSnakes, settings, gameMode);

    this.lastMove = move;
    this.moveHistory.push(move);

    if (this.moveHistory.length > 10) {
      this.moveHistory.shift();
    }

    return move;
  }

  setDifficulty(difficulty) {
    this.strategy.setDifficulty(difficulty);
  }

  reset() {
    this.lastMove = null;
    this.moveHistory = [];
    this.stuckCounter = 0;
    this.moveDelay = 0;
    this.tickCounter = 0;
    this.lastHeadKey = null;
  }
}
