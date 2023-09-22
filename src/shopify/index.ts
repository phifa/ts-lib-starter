import { json2csv } from 'json-2-csv';
import { shopifyGraphqlClient } from './connectShopify';
import { sleep } from './helper';

const gql = String.raw;

export async function getOrderIdByOrderNumber(on: string) {
  const query = gql`
    query ($searchQuery: String) {
      orders(first: 1, query: $searchQuery) {
        nodes {
          id
        }
      }
    }
  `;
  const variables = {
    searchQuery: `name:${on}`,
  };
  try {
    const res = await shopifyGraphqlClient.query<{
      data: {
        orders: {
          nodes: {
            id: String;
          }[];
        };
      };
    }>({
      data: {
        query,
        variables,
      },
    });
    if (res?.body?.data?.orders?.nodes?.[0]?.id)
      return res.body.data.orders.nodes[0].id;
  } catch (error) {
    console.error('could not get order from shopify');
    console.error(error);
  }
}

export async function getProducts() {
  const variantsFromShop = await getAllVariantProducts();
  const csv = await json2csv(variantsFromShop, {});
  return csv;
}

export async function getAllVariantProducts() {
  const variants = [];
  let hasNextPage = true;
  let startCursor = '';
  const amount = 100;

  while (hasNextPage) {
    const query1 = gql`
      query ($amount: Int!) {
        productVariants(first: $amount) {
          pageInfo {
            hasNextPage
            endCursor
            startCursor
          }
          edges {
            node {
              sku
              product {
                handle
                featuredImage {
                  url
                }
              }
            }
          }
        }
      }
    `;

    const query2 = gql`
      query ($amount: Int!, $startCursor: String!) {
        productVariants(first: $amount, after: $startCursor) {
          pageInfo {
            hasNextPage
            endCursor
            startCursor
          }
          edges {
            node {
              sku
              product {
                handle
                featuredImage {
                  url
                }
              }
            }
          }
        }
      }
    `;

    const variables1 = {
      amount,
    };

    const variables2 = {
      amount,
      startCursor,
    };

    type Q = {
      data: {
        productVariants: {
          pageInfo: {
            hasNextPage: boolean;
            startCursor: string;
            endCursor: string;
          };
          edges: [
            {
              node: {
                sku: string;
                barcode: string;
                product: {
                  handle: string;
                  featuredImage: {
                    url: string;
                  };
                };
              };
            }
          ];
        };
      };
    };

    const res = await shopifyGraphqlClient.query<Q>({
      data: {
        query: !startCursor ? query1 : query2,
        variables: !startCursor ? variables1 : variables2,
      },
    });

    variants.push(...res.body.data.productVariants.edges);

    if (res.body.data.productVariants.pageInfo.hasNextPage) {
      hasNextPage = true;
      startCursor = res.body.data.productVariants.pageInfo.endCursor;
      await sleep(100);
    } else {
      hasNextPage = false;
    }
  }

  return variants.map(({ node }) => ({
    sku: node.sku,
    url: `https://www.ehrenkind.de/products/${node.product.handle}`,
    image_url: node.product.featuredImage.url,
  }));
}
