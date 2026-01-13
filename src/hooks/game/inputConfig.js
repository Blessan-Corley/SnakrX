import { DIRECTIONS } from '../../utils/gameUtils.js';

export const ULTRA_KEY_MAP = new Map([
  ['ArrowUp', DIRECTIONS.UP],
  ['ArrowDown', DIRECTIONS.DOWN],
  ['ArrowLeft', DIRECTIONS.LEFT],
  ['ArrowRight', DIRECTIONS.RIGHT],
  ['Up', DIRECTIONS.UP],
  ['Down', DIRECTIONS.DOWN],
  ['Left', DIRECTIONS.LEFT],
  ['Right', DIRECTIONS.RIGHT],
  ['KeyW', DIRECTIONS.UP],
  ['KeyS', DIRECTIONS.DOWN],
  ['KeyA', DIRECTIONS.LEFT],
  ['KeyD', DIRECTIONS.RIGHT],
  ['w', DIRECTIONS.UP],
  ['s', DIRECTIONS.DOWN],
  ['a', DIRECTIONS.LEFT],
  ['d', DIRECTIONS.RIGHT],
  ['W', DIRECTIONS.UP],
  ['S', DIRECTIONS.DOWN],
  ['A', DIRECTIONS.LEFT],
  ['D', DIRECTIONS.RIGHT],
  ['KeyI', DIRECTIONS.UP],
  ['KeyK', DIRECTIONS.DOWN],
  ['KeyJ', DIRECTIONS.LEFT],
  ['KeyL', DIRECTIONS.RIGHT],
  ['i', DIRECTIONS.UP],
  ['k', DIRECTIONS.DOWN],
  ['j', DIRECTIONS.LEFT],
  ['l', DIRECTIONS.RIGHT],
  ['I', DIRECTIONS.UP],
  ['K', DIRECTIONS.DOWN],
  ['J', DIRECTIONS.LEFT],
  ['L', DIRECTIONS.RIGHT],
  ['Numpad8', DIRECTIONS.UP],
  ['Numpad5', DIRECTIONS.DOWN],
  ['Numpad4', DIRECTIONS.LEFT],
  ['Numpad6', DIRECTIONS.RIGHT]
]);

export const PLAYER_KEY_MAP = new Map([
  ['KeyW', 0], ['KeyS', 0], ['KeyA', 0], ['KeyD', 0],
  ['w', 0], ['s', 0], ['a', 0], ['d', 0],
  ['W', 0], ['S', 0], ['A', 0], ['D', 0],
  ['ArrowUp', 1], ['ArrowDown', 1], ['ArrowLeft', 1], ['ArrowRight', 1],
  ['Up', 1], ['Down', 1], ['Left', 1], ['Right', 1],
  ['KeyI', 2], ['KeyK', 2], ['KeyJ', 2], ['KeyL', 2],
  ['i', 2], ['k', 2], ['j', 2], ['l', 2],
  ['I', 2], ['K', 2], ['J', 2], ['L', 2],
  ['Numpad8', 3], ['Numpad5', 3], ['Numpad4', 3], ['Numpad6', 3]
]);

export const CONTROL_KEY_MAP = new Map([
  ['Space', 'pause'],
  [' ', 'pause'],
  ['KeyR', 'restart'],
  ['r', 'restart'],
  ['R', 'restart'],
  ['Escape', 'quit'],
  ['KeyP', 'pause'],
  ['p', 'pause'],
  ['P', 'pause']
]);
