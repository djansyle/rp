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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJuYW1lcyI6WyJpbml0aWFsaXplUG9vbCIsInByb21pc2lmeUFsbCIsIlJlZGlzQ2xpZW50IiwicHJvdG90eXBlIiwiTXVsdGkiLCJQb29sIiwiY29uZmlnIiwiZGVmYXVsdENvbmZpZyIsIk9iamVjdCIsImFzc2lnbiIsImhvc3QiLCJwb3J0IiwibWF4IiwibWluIiwiY3JlYXRlUG9vbCIsImNyZWF0ZSIsInJlc29sdmUiLCJjcmVhdGVDbGllbnQiLCJkZXN0cm95IiwiY2xpZW50Iiwib24iLCJSUENhY2hlIiwiY29uc3RydWN0b3IiLCJsb2dnZXIiLCJwb29sIiwiYm9ycm93IiwiYWNxdWlyZSIsInNpbmdsZSIsImFyZ3MiLCJsZW5ndGgiLCJtZXRob2ROYW1lIiwic2hpZnQiLCJjb25uIiwiZXJyIiwiVHlwZUVycm9yIiwicmVqZWN0IiwiY2FsbCIsImNhdGNoIiwiZmluYWxseSIsInJlbGVhc2UiLCJtdWx0aSIsImV4ZWNBc3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBZWdCQSxjLEdBQUFBLGMsQ0FmaEIsMkMseURBQ0EsOEIsNkNBQ0Esb0MsbURBQ0EsOEIsNkNBQ0EsZ0MsbWxCQUVBLG1CQUFRQyxZQUFSLENBQXFCLGdCQUFNQyxXQUFOLENBQWtCQyxTQUF2QyxFQUNBLG1CQUFRRixZQUFSLENBQXFCLGdCQUFNRyxLQUFOLENBQVlELFNBQWpDLEVBRUEsSUFBSUUsT0FBTyxJQUFYLEMsQ0FFQTs7O2dvQ0FJTyxTQUFTTCxjQUFULENBQXdCTSxNQUF4QixFQUFnQyxDQUNyQyxNQUFNQyxnQkFBZ0JDLE9BQU9DLE1BQVAsQ0FDcEIsRUFEb0IsRUFDaEIsRUFBRUMsTUFBTSxXQUFSLEVBQXFCQyxNQUFNLElBQTNCLEVBQWlDQyxLQUFLLEVBQXRDLEVBQTBDQyxLQUFLLENBQS9DLEVBRGdCLEVBQ29DUCxNQURwQyxDQUF0Qjs7QUFJQUQsU0FBTyxzQkFBS1MsVUFBTCxDQUFnQjtBQUNyQkMsYUFBUztBQUNQLGFBQU8sbUJBQVFDLE9BQVIsQ0FBZ0IsZ0JBQU1DLFlBQU4sQ0FBbUJWLGFBQW5CLENBQWhCLENBQVA7QUFDRCxLQUhvQjtBQUlyQlcsWUFBUUMsTUFBUixFQUFnQjtBQUNkLGFBQU8sdUJBQWFILE9BQUQsSUFBYTtBQUM5QkcsZUFBT0MsRUFBUCxDQUFVLEtBQVYsRUFBaUJKLE9BQWpCO0FBQ0QsT0FGTSxDQUFQO0FBR0QsS0FSb0IsRUFBaEI7QUFTSlQsZUFUSSxDQUFQO0FBVUQ7O0FBRUQ7OztBQUdPLE1BQU1jLE9BQU4sQ0FBYztBQUNuQjs7Ozs7QUFLQUMsY0FBWWhCLE1BQVosRUFBb0I7QUFDbEIsU0FBS2lCLE1BQUwsR0FBYyxxQkFBTSxVQUFOLENBQWQ7QUFDQSxRQUFJbEIsSUFBSixFQUFVO0FBQ1IsV0FBS2tCLE1BQUwsQ0FBWSwyREFBWjtBQUNBO0FBQ0Q7O0FBRUR2QixtQkFBZU0sTUFBZjtBQUNBLFNBQUtpQixNQUFMLENBQVksNEJBQVo7O0FBRUEsU0FBS0MsSUFBTCxHQUFZbkIsSUFBWjtBQUNEOztBQUVEOzs7O0FBSU1vQixRQUFOLEdBQWU7QUFDYixhQUFPLE1BQUtELElBQUwsQ0FBVUUsT0FBVixFQUFQLENBRGE7QUFFZDs7QUFFRDs7Ozs7QUFLTUMsUUFBTixDQUFhLEdBQUdDLElBQWhCLEVBQXNCO0FBQ3BCLDRCQUFPQSxLQUFLQyxNQUFMLElBQWUsQ0FBdEIsRUFBeUIscURBQXpCOztBQUVBLFlBQU1DLGFBQWMsR0FBRUYsS0FBS0csS0FBTCxFQUFhLE9BQW5DO0FBQ0EsWUFBTUMsT0FBTyxNQUFNLE9BQUtQLE1BQUwsRUFBbkI7O0FBRUEsVUFBSSxDQUFDTyxLQUFLRixVQUFMLENBQUwsRUFBdUI7QUFDckIsY0FBTUcsTUFBTSxJQUFJQyxTQUFKLENBQWUsWUFBV0osVUFBVywwQ0FBckMsQ0FBWjtBQUNBLGVBQU8sbUJBQVFLLE1BQVIsQ0FBZUYsR0FBZixDQUFQO0FBQ0Q7O0FBRUQsYUFBT0QsS0FBS0YsVUFBTCxFQUFpQk0sSUFBakIsQ0FBc0JKLElBQXRCLEVBQTRCLEdBQUdKLElBQS9CO0FBQ0pTLFdBREksQ0FDRSxPQUFLZCxNQURQO0FBRUplLGFBRkksQ0FFSSxvQkFBTSxPQUFLZCxJQUFMLENBQVVlLE9BQVYsQ0FBa0JQLElBQWxCLENBQU4sRUFGSixDQUFQLENBWG9CO0FBY3JCOztBQUVEOzs7O0FBSU1RLE9BQU4sQ0FBWSxHQUFHWixJQUFmLEVBQXFCO0FBQ25CLFlBQU1ULFNBQVMsTUFBTSxPQUFLTSxNQUFMLEVBQXJCO0FBQ0EsYUFBT04sT0FBT3FCLEtBQVAsQ0FBYVosSUFBYixFQUFtQmEsU0FBbkI7QUFDSkosV0FESSxDQUNFLE9BQUtkLE1BRFA7QUFFSmUsYUFGSSxDQUVJLG9CQUFNLE9BQUtkLElBQUwsQ0FBVWUsT0FBVixDQUFrQnBCLE1BQWxCLENBQU4sRUFGSixDQUFQLENBRm1CO0FBS3BCLEdBekRrQixDLFFBQVJFLE8sR0FBQUEsTyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwb29sIGZyb20gJ2dlbmVyaWMtcG9vbCc7XG5pbXBvcnQgcmVkaXMgZnJvbSAncmVkaXMnO1xuaW1wb3J0IFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuUHJvbWlzZS5wcm9taXNpZnlBbGwocmVkaXMuUmVkaXNDbGllbnQucHJvdG90eXBlKTtcblByb21pc2UucHJvbWlzaWZ5QWxsKHJlZGlzLk11bHRpLnByb3RvdHlwZSk7XG5cbmxldCBQb29sID0gbnVsbDtcblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBnZW5lcmljIHBvb2wuXG4gKiBAcGFyYW0gY29uZmlnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0aWFsaXplUG9vbChjb25maWcpIHtcbiAgY29uc3QgZGVmYXVsdENvbmZpZyA9IE9iamVjdC5hc3NpZ24oXG4gICAge30sIHsgaG9zdDogJ2xvY2FsaG9zdCcsIHBvcnQ6IDYzNzksIG1heDogNTAsIG1pbjogNSB9LCBjb25maWcsXG4gICk7XG5cbiAgUG9vbCA9IHBvb2wuY3JlYXRlUG9vbCh7XG4gICAgY3JlYXRlKCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZWRpcy5jcmVhdGVDbGllbnQoZGVmYXVsdENvbmZpZykpO1xuICAgIH0sXG4gICAgZGVzdHJveShjbGllbnQpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjbGllbnQub24oJ2VuZCcsIHJlc29sdmUpO1xuICAgICAgfSk7XG4gICAgfSxcbiAgfSwgZGVmYXVsdENvbmZpZyk7XG59XG5cbi8qKlxuICogUlBDYWNoZSBDbGFzc1xuICovXG5leHBvcnQgY2xhc3MgUlBDYWNoZSB7XG4gIC8qKlxuICAgKiBSUENhY2hlIENvbnN0cnVjdG9yXG4gICAqIFdpbGwgaW5pdGlhbGl6ZSB0aGUgcG9vbCB3aGVuZXZlciB0aGUgUG9vbCBvYmplY3QgaXMgbm90IGJlZW4gaW5pdGlhbGl6ZWQgeWV0LlxuICAgKiBAcGFyYW0gY29uZmlnXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICB0aGlzLmxvZ2dlciA9IGRlYnVnKCdycDpjYWNoZScpO1xuICAgIGlmIChQb29sKSB7XG4gICAgICB0aGlzLmxvZ2dlcignUG9vbCBhbHJlYWR5IGJlZW4gaW5pdGlhbGl6ZWQsIElnbm9yaW5nIG5ldyByZWRpcyBjb25maWcuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaW5pdGlhbGl6ZVBvb2woY29uZmlnKTtcbiAgICB0aGlzLmxvZ2dlcignUG9vbCBoYXMgYmVlbiBpbml0aWFsaXplZC4nKTtcblxuICAgIHRoaXMucG9vbCA9IFBvb2w7XG4gIH1cblxuICAvKipcbiAgICogQm9ycm93cyBhIHNpbmdsZSBjb25uZWN0aW9uIGZyb20gdGhlIHBvb2wuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlLjwqPn1cbiAgICovXG4gIGFzeW5jIGJvcnJvdygpIHtcbiAgICByZXR1cm4gdGhpcy5wb29sLmFjcXVpcmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIGEgc2luZ2xlIGNvbW1hbmQuXG4gICAqIEBwYXJhbSBhcmdzXG4gICAqIEByZXR1cm5zIHtQcm9taXNlLjwqPn1cbiAgICovXG4gIGFzeW5jIHNpbmdsZSguLi5hcmdzKSB7XG4gICAgYXNzZXJ0KGFyZ3MubGVuZ3RoID49IDEsICdFeHBlY3RpbmcgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byBiZSBncmVhdGVyIHRoYW4gMS4nKTtcblxuICAgIGNvbnN0IG1ldGhvZE5hbWUgPSBgJHthcmdzLnNoaWZ0KCl9QXN5bmNgO1xuICAgIGNvbnN0IGNvbm4gPSBhd2FpdCB0aGlzLmJvcnJvdygpO1xuXG4gICAgaWYgKCFjb25uW21ldGhvZE5hbWVdKSB7XG4gICAgICBjb25zdCBlcnIgPSBuZXcgVHlwZUVycm9yKGBGdW5jdGlvbiAke21ldGhvZE5hbWV9IGRvZXMgbm90IGV4aXN0cyBpbiByZWRpcyBjbGllbnQgbWV0aG9kLmApO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbm5bbWV0aG9kTmFtZV0uY2FsbChjb25uLCAuLi5hcmdzKVxuICAgICAgLmNhdGNoKHRoaXMubG9nZ2VyKVxuICAgICAgLmZpbmFsbHkoKCkgPT4gdGhpcy5wb29sLnJlbGVhc2UoY29ubikpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIHRoZSBjb21tYW5kcyBhcyBtdWx0aS5cbiAgICogQHJldHVybnMge1Byb21pc2UuPHZvaWQ+fVxuICAgKi9cbiAgYXN5bmMgbXVsdGkoLi4uYXJncykge1xuICAgIGNvbnN0IGNsaWVudCA9IGF3YWl0IHRoaXMuYm9ycm93KCk7XG4gICAgcmV0dXJuIGNsaWVudC5tdWx0aShhcmdzKS5leGVjQXN5bmMoKVxuICAgICAgLmNhdGNoKHRoaXMubG9nZ2VyKVxuICAgICAgLmZpbmFsbHkoKCkgPT4gdGhpcy5wb29sLnJlbGVhc2UoY2xpZW50KSk7XG4gIH1cbn1cbiJdfQ==