import { test, assert } from 'vitest';
import { writeFile } from 'fs/promises';
import { getOrderIdByOrderNumber, getProducts } from '../src/shopify/';

test.skip('get all products', async () => {
  const p = await getProducts();

  try {
    await writeFile('./data.csv', p);
  } catch (err) {
    console.log(err);
  }
  assert.equal(true, true);
}, 20000);

test('get order id by order number', async () => {
  const id = await getOrderIdByOrderNumber('B13282');
  assert.equal(id, 'gid://shopify/Order/5755171635530');
}, 5000);
