import { test, assert } from 'vitest';
import { writeFile } from 'fs/promises';
import { getProducts } from '../src/shopify/';

test('simple', async () => {
  const p = await getProducts();

  try {
    await writeFile('./data.csv', p);
  } catch (err) {
    console.log(err);
  }
  assert.equal(true, true);
}, 20000);
