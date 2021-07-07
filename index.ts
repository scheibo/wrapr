export class NonRetryableError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function retrying<A, B>(fn: (a: A) => Promise<B>, retries = 5, wait = 20) {
  const retry = async (args: A, attempt: number): Promise<B> => {
    try {
      return await fn(args);
    } catch (err) {
      if (err instanceof NonRetryableError) {
        return Promise.reject(err);
      } else {
        attempt++;
        if (attempt > retries) return Promise.reject(err);
        const timeout = Math.round(attempt * wait * (1 + Math.random() / 2));
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(retry(args, attempt++));
          }, timeout);
        });
      }
    }
  };
  return retry;
}

export function throttling<A, B>(fn: (a: A) => Promise<B>, limit = 10, interval = 50) {
  const queue = new Map();
  let currentTick = 0;
  let activeCount = 0;

  const throttled = (args: A): Promise<B> => {
    let timeout: number;
    return new Promise((resolve, reject) => {
      const execute = () => {
        resolve(fn(args))
        queue.delete(timeout);
      };

      const now = Date.now();

      if (now - currentTick > interval) {
        activeCount = 1;
        currentTick = now;
      } else if (activeCount < limit) {
        activeCount++;
      } else {
        currentTick += interval;
        activeCount = 1;
      }

      timeout = setTimeout(execute, currentTick - now);
      queue.set(timeout, reject);
    });
  };

  return throttled;
}
