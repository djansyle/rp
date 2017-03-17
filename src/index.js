import pool from 'generic-pool';
import redis from 'redis';
import Promise from 'bluebird';
import debug from 'debug';
import assert from 'assert';

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

let Pool = null;

/**
 * Initialize the generic pool.
 * @param config
 */
export function initializePool(config) {
  const defaultConfig = Object.assign(
    {}, { host: 'localhost', port: 6379, max: 50, min: 5 }, config,
  );

  Pool = pool.createPool({
    create() {
      return Promise.resolve(redis.createClient(defaultConfig));
    },
    destroy(client) {
      return new Promise((resolve) => {
        client.on('end', resolve);
      });
    },
  }, defaultConfig);
}

/**
 * RPCache Class
 */
export class RPCache {
  /**
   * RPCache Constructor
   * Will initialize the pool whenever the Pool object is not been initialized yet.
   * @param config
   */
  constructor(config) {
    this.logger = debug('rp:cache');
    if (Pool) {
      this.logger('Pool already been initialized, Ignoring new redis config.');
      return;
    }

    initializePool(config);
    this.logger('Pool has been initialized.');

    this.pool = Pool;
  }

  /**
   * Borrows a single connection from the pool.
   * @returns {Promise.<*>}
   */
  async borrow() {
    return this.pool.acquire();
  }

  /**
   * Execute a single command.
   * @param args
   * @returns {Promise.<*>}
   */
  async single(...args) {
    assert(args.length >= 1, 'Expecting number of arguments to be greater than 1.');

    const methodName = `${args.shift()}Async`;
    const conn = await this.borrow();

    if (!conn[methodName]) {
      const err = new TypeError(`Function ${methodName} does not exists in redis client method.`);
      return Promise.reject(err);
    }

    return conn[methodName].call(conn, ...args)
      .catch(this.logger)
      .finally(() => this.pool.release(conn));
  }

  /**
   * Executes the commands as multi.
   * @returns {Promise.<void>}
   */
  async multi(...args) {
    const client = await this.borrow();
    return client.multi(args).execAsync()
      .catch(this.logger)
      .finally(() => this.pool.release(client));
  }
}
