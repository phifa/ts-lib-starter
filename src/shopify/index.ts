import { shopifyGraphqlClient } from './connectShopify';
import { sleep } from './helper';

const gql = String.raw;

export async function getOrderIdByOrderNumber(
  on: string
): Promise<string | undefined> {
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
            id: string;
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

export async function addTagsToOrder(id: string, tags: string[]) {
  const query = gql`
    mutation tagsAdd($id: ID!, $tags: [String!]!) {
      tagsAdd(id: $id, tags: $tags) {
        node {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables = {
    id,
    tags,
  };
  try {
    const res = await shopifyGraphqlClient.query<{
      data: {
        tagsAdd: {
          node: {
            id: string;
          };
        };
      };
    }>({
      data: {
        query,
        variables,
      },
    });

    if (res?.body?.data?.tagsAdd?.node?.id)
      return res.body.data.tagsAdd.node.id;
  } catch (error) {
    console.error(
      `could not update order ${variables.id} with tag ${JSON.stringify(
        variables.tags
      )}`
    );
    console.error(error);
  }
}

export async function addTagsToOrderByOrderNumber(
  orderNumber: string,
  tags: string[]
) {
  const id = await getOrderIdByOrderNumber(orderNumber);
  if (!id) throw new Error(`could not get order id from ${orderNumber}`);
  const res = await addTagsToOrder(id, tags);
  if (!res)
    throw new Error(
      `could not update order: ${orderNumber} with tags: ${JSON.stringify(
        tags
      )}`
    );
  return res;
}

export async function getProducts() {
  const variantsFromShop = await getAllVariantProducts();
  // const csv = await json2csv(variantsFromShop, {});
  return variantsFromShop;
}

export async function getAllVariantProducts() {
  const variants = [];
  let hasNextPage = true;
  let startCursor = '';
  const amount = 100;

  while (hasNextPage) {
    const node = `
              sku
              barcode
              price
              title
              product {
                description
                handle
                onlineStoreUrl
                featuredImage {
                  url
                }
              }

    `;
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
              ${node}
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
              ${node}
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
                price: string;
                title: string;
                product: {
                  handle: string;
                  description: string;
                  onlineStoreUrl: string;
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
    barcode: node.barcode,
    price: node.price,
    title: node.title,
    url: node.product.onlineStoreUrl,
    handle: node.product.handle,
    desciption: node.product.description,
    image_url: node.product.featuredImage.url,
  }));
}
