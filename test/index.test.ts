import { test, assert, describe } from 'vitest';
import { writeFile } from 'fs/promises';
import {
  addTagsToOrder,
  getOrderIdByOrderNumber,
  getProducts,
} from '../src/shopify/';
import { transformLeak } from '../src/leak';
import {
  shopifyAPI,
  shopifyRestClient,
  shopifySession,
} from '../src/shopify/connectShopify';
import { readFile } from 'fs/promises';
import { reports } from '../missive_analytics.json';

// ! ARE YOU RUNNING TESTS ON PRODUCTION ? ?

test('check analytics data', async () => {
  // read file missive_analytics.json
  const { start, end } = reports;
  const metrics = reports.selected_period.users.totals.map((user) => ({
    user_id: user.id,
    reply_time_avg: user.metrics.reply_time_avg.v,
  }));
  console.log({ start, end, metrics });
});

test.skip('fetch', async () => {
  var myHeaders = new Headers();
  myHeaders.append(
    'Cookie',
    'CF_Authorization=eyJraWQiOiIyNzU3N2Q2Y2E5YTkyOGM3OGNhY2RlYTIzMDM3ZTdmNTAxZTA3M2Q3ZmZiZTI0NjI1ZTQwNTAxYTA2YTUzZGMwIiwiYWxnIjoiUlMyNTYiLCJ0eXAiOiJKV1QifQ.eyJ0eXBlIjoiYXBwIiwiYXVkIjoiODdmMmQwY2I4YzQyMGZiM2NiZjFkOWEwN2NjNTBiNmFkZWYwOWI1MWRmNDVjYjg1NjZiN2VlYTY5YzE1YWNjMCIsImV4cCI6MTcwMjM5MjM4OSwiaXNzIjoiaHR0cHM6XC9cL2Zvcm1iZW5jaC5jbG91ZGZsYXJlYWNjZXNzLmNvbSIsImNvbW1vbl9uYW1lIjoiMWJiZWUzNmI2NzRlOTBkMmRiZTJhYjFhMDcwOTM4YTUuYWNjZXNzIiwiaWF0IjoxNzAxNzg3NTg5LCJzdWIiOiIifQ.JHOFE-09NiJZ9ZXGtx8eHL4CEpDEJ1VTdvI8Zg2a9m6wqlwMPSNZkL037BmxPGZ44oglAw3BocQRNP5IneE5qBP7xmVboUDMnCHZOtskB8fDICXoSn3Y-MDGLWsjqUvzSO4P8tWGeyRuDToZ3yCOjUv-YIL-s3PX80zQtA08Vu6frcO6HGtT_Hnj9GiTQz_fIpKULivdVVVElDzMYGeTmFoFSCZ42R_xHjW73qYpvmJkYvSzKmnkNSe-nbuzg6uCxiggnzuzVXo9sE9o-XNi6YhtXFu6L-pLN_2dU9t4eT8p3HvjToShUIviAIWVNDDJC6pM1MPFL56pApm5nWM7sg; __session=eyJ1c2VySWQiOiJjbGc1YnFvdWkwMDAweHMzdXAzeDhodnVpIn0%3D.QoRPNVXd6MNWCnjhz4CAnDUxzqzOWlGcVdeLBzpqKrc'
  );

  var formdata = new FormData();
  formdata.append('email', 'tech@formbench.com');
  formdata.append('password', 'MiRHkemK2oTVvvsKVUPQ3ppC');
  formdata.append('remember', 'on');

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow',
  };

  fetch('https://shipping.formbench.com/login', requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log('error', error));
});

test.skip('get all products', async () => {
  const p = await getProducts();
  console.log('🚀 ~ file: index.test.ts:19 ~ test ~ p:', p);

  // try {
  //   await writeFile('./data.csv', p);
  // } catch (err) {
  //   console.log(err);
  // }
  assert.equal(true, true);
}, 20000);

describe.skip('add tag to order', async () => {
  const tag = 'serviceportal';
  test('get order id by order number', async () => {
    const orderId = await getOrderIdByOrderNumber('B13282');
    if (!orderId) throw new Error('💩');
    assert.equal(orderId, 'gid://shopify/Order/5755171635530');
    const resultUpdatedOrderId = await addTagsToOrder(orderId, [tag]);
    assert.equal(orderId, resultUpdatedOrderId);
  }, 5000);
});

test.skip('leak', async () => {
  await transformLeak();
  assert.equal(true, true);
}, 30000);

test.skip('deprecation', async () => {
  // const res = await shopifyRestClient.get({
  //   path: `/admin/api/2023-07/orders/${5755171635530}.json?fields=id,line_items,fulfillment`,
  // });
  // const res = await shopifyAPI.rest.Order.find({
  //   session: shopifySession,
  //   id: 5755171635530,
  // });
});
