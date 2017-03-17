'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.RPCache = undefined;exports.














initializePool = initializePool;var _genericPool = require('generic-pool');var _genericPool2 = _interopRequireDefault(_genericPool);var _redis = require('redis');var _redis2 = _interopRequireDefault(_redis);var _bluebird = require('bluebird');var _bluebird2 = _interopRequireDefault(_bluebird);var _debug = require('debug');var _debug2 = _interopRequireDefault(_debug);var _assert = require('assert');var _assert2 = _interopRequireDefault(_assert);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _asyncToGenerator(fn) {return function () {var gen = fn.apply(this, arguments);return new _bluebird2.default(function (resolve, reject) {function step(key, arg) {try {var info = gen[key](arg);var value = info.value;} catch (error) {reject(error);return;}if (info.done) {resolve(value);} else {return _bluebird2.default.resolve(value).then(function (value) {step("next", value);}, function (err) {step("throw", err);});}}return step("next");});};}_bluebird2.default.promisifyAll(_redis2.default.RedisClient.prototype);_bluebird2.default.promisifyAll(_redis2.default.Multi.prototype);let Pool = null; /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Initialize the generic pool.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @param config
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */function initializePool(config) {const defaultConfig = Object.assign({}, { host: 'localhost', port: 6379, max: 50, min: 5 }, config);

  Pool = _genericPool2.default.createPool({
    create() {
      return _bluebird2.default.resolve(_redis2.default.createClient(defaultConfig));
    },
    destroy(client) {
      return new _bluebird2.default(resolve => {
        client.on('end', resolve);
      });
    } },
  defaultConfig);
}

/**
   * RPCache Class
   */
class RPCache {
  /**
                * RPCache Constructor
                * Will initialize the pool whenever the Pool object is not been initialized yet.
                * @param config
                */
  constructor(config) {
    this.logger = (0, _debug2.default)('rp:cache');
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
  borrow() {var _this = this;return _asyncToGenerator(function* () {
      return _this.pool.acquire();})();
  }

  /**
     * Execute a single command.
     * @param args
     * @returns {Promise.<*>}
     */
  single(...args) {var _this2 = this;return _asyncToGenerator(function* () {
      (0, _assert2.default)(args.length >= 1, 'Expecting number of arguments to be greater than 1.');

      const methodName = `${args.shift()}Async`;
      const conn = yield _this2.borrow();

      if (!conn[methodName]) {
        const err = new TypeError(`Function ${methodName} does not exists in redis client method.`);
        return _bluebird2.default.reject(err);
      }

      return conn[methodName].call(conn, ...args).
      catch(_this2.logger).
      finally(function () {return _this2.pool.release(conn);});})();
  }

  /**
     * Executes the commands as multi.
     * @returns {Promise.<void>}
     */
  multi(...args) {var _this3 = this;return _asyncToGenerator(function* () {
      const client = yield _this3.borrow();
      return client.multi(args).execAsync().
      catch(_this3.logger).
      finally(function () {return _this3.pool.release(client);});})();
  }}exports.RPCache = RPCache;