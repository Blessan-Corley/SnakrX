/**
 * SnakrX Game Utilities
 * Backwards-compatible barrel around focused utility modules.
 */

export * from './game/constants.js';
export * from './game/mode.js';
export * from './game/speed.js';
export * from './game/position.js';
export * from './game/collision.js';
export * from './game/food.js';
export * from './game/direction.js';
export * from './game/formatters.js';
export * from './game/spawn.js';
export * from './game/deviceAndGeneral.js';

import * as constants from './game/constants.js';
import * as mode from './game/mode.js';
import * as speed from './game/speed.js';
import * as position from './game/position.js';
import * as collision from './game/collision.js';
import * as food from './game/food.js';
import * as direction from './game/direction.js';
import * as formatters from './game/formatters.js';
import * as spawn from './game/spawn.js';
import * as deviceAndGeneral from './game/deviceAndGeneral.js';

export default {
  ...constants,
  ...mode,
  ...speed,
  ...position,
  ...collision,
  ...food,
  ...direction,
  ...formatters,
  ...spawn,
  ...deviceAndGeneral
};
