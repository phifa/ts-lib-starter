import {
  ApiVersion,
  LATEST_API_VERSION,
  LogSeverity,
  shopifyApi,
} from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import { restResources } from '@shopify/shopify-api/rest/admin/2023-07';
import { Product } from '@shopify/shopify-api/rest/admin/2023-01/product';
import 'dotenv/config';
import { constants } from './constants';

export const gql = String.raw;

const shopName = constants.SHOPIFY_SHOP_NAME;

// 1. try first to use the node api
export const shopifyAPI = shopifyApi({
  apiKey: constants.SHOPIFY_API_KEY,
  apiSecretKey: constants.SHOPIFY_API_SECRET,
  adminApiAccessToken: constants.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
  scopes: [],
  isCustomStoreApp: true,
  hostName: shopName,
  apiVersion: ApiVersion.July23,
  isEmbeddedApp: false,
  restResources,
  logger: {
    httpRequests: true,
    timestamps: true,
    level: LogSeverity.Info,
    // level: LogSeverity.Debug,
  },
});

export const shopifySession = shopifyAPI.session.customAppSession(shopName);

// 2. use graphql
export const shopifyGraphqlClient = new shopifyAPI.clients.Graphql({
  session: shopifySession,
  apiVersion: LATEST_API_VERSION,
});

// 3. alternative rest call
export const shopifyRestClient = new shopifyAPI.clients.Rest({
  session: shopifySession,
});

export async function testGraphql() {
  const query = gql`
    query ($amount: Int!) {
      products(first: $amount) {
        edges {
          node {
            id
            description
            title
          }
        }
      }
    }
  `;

  const variables = {
    amount: 2,
  };

  type TestQuery = {
    data: {
      products: {
        edges: [
          {
            node: Product;
          }
        ];
      };
    };
  };

  const res = await shopifyGraphqlClient.query<TestQuery>({
    data: {
      query,
      variables,
    },
  });

  return res.body.data.products.edges.length;
}
