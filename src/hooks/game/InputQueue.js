export class InputQueue {
  constructor(maxSize = 10) {
    this.queue = [];
    this.maxSize = maxSize;
    this.processing = false;
  }

  enqueue(input) {
    if (this.queue.length >= this.maxSize) {
      this.queue.shift();
    }

    this.queue.push({
      ...input,
      timestamp: performance.now(),
      id: Math.random().toString(36).substr(2, 9)
    });
  }

  dequeue() {
    return this.queue.shift();
  }

  peek() {
    return this.queue[0];
  }

  clear() {
    this.queue.length = 0;
  }

  get size() {
    return this.queue.length;
  }

  isEmpty() {
    return this.queue.length === 0;
  }

  clearStale(maxAge = 500) {
    const now = performance.now();
    this.queue = this.queue.filter((input) => (now - input.timestamp) <= maxAge);
  }
}
