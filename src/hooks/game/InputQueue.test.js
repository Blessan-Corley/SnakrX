import { describe, expect, it, vi } from 'vitest';
import { InputQueue } from './InputQueue.js';

describe('InputQueue', () => {
  it('keeps queue bounded by max size', () => {
    const queue = new InputQueue(2);
    queue.enqueue({ key: 'a' });
    queue.enqueue({ key: 'b' });
    queue.enqueue({ key: 'c' });

    expect(queue.size).toBe(2);
    expect(queue.dequeue().key).toBe('b');
    expect(queue.dequeue().key).toBe('c');
  });

  it('clears stale items by age', () => {
    const queue = new InputQueue(5);
    const perfSpy = vi.spyOn(performance, 'now');
    perfSpy.mockReturnValueOnce(100).mockReturnValueOnce(200).mockReturnValueOnce(800);

    queue.enqueue({ key: 'a' });
    queue.enqueue({ key: 'b' });
    queue.clearStale(300);

    expect(queue.size).toBe(0);
    perfSpy.mockRestore();
  });
});
