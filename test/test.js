import test from 'ava';
import { RPCache } from './../src';

const cache = new RPCache({ min: 5 });

test.after(async () => {
  await cache.single('flushdb');
});

test('single', async (t) => {
  const key = 'single';
  const value = 'hello world';
  await cache.single('set', key, value);
  const reply = await cache.single('get', key);
  t.is(reply, value);
  t.is(cache.pool.available, 5);
});

test('multi', async (t) => {
  const key = 'multi';
  const value = 'hello';
  await cache.multi(['set', key, value]);
  const reply = await cache.multi(['get', key]);
  t.is(reply[0], value);
  t.is(cache.pool.available, 5);
});
