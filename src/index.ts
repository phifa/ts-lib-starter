import { getProducts } from './shopify';

(async () => {
  const products = await getProducts();
})();
