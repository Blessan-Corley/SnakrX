import { describe, expect, it } from 'vitest';
import { CONTROL_KEY_MAP, PLAYER_KEY_MAP, ULTRA_KEY_MAP } from './inputConfig.js';

describe('inputConfig', () => {
  it('maps movement and player keys', () => {
    expect(ULTRA_KEY_MAP.get('ArrowUp')).toEqual({ x: 0, y: -1 });
    expect(ULTRA_KEY_MAP.get('KeyD')).toEqual({ x: 1, y: 0 });
    expect(PLAYER_KEY_MAP.get('ArrowLeft')).toBe(1);
    expect(PLAYER_KEY_MAP.get('KeyL')).toBe(2);
    expect(PLAYER_KEY_MAP.get('Numpad6')).toBe(3);
  });

  it('maps control actions', () => {
    expect(CONTROL_KEY_MAP.get('Space')).toBe('pause');
    expect(CONTROL_KEY_MAP.get('KeyR')).toBe('restart');
    expect(CONTROL_KEY_MAP.get('Escape')).toBe('quit');
  });
});
