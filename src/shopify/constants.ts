import 'dotenv/config';

/* -------------------------------------------------------------------------- */

export const getEnvVar = (varName: string): string => {
  const envVar = process.env[varName];
  if (!envVar && !optionalConstants.includes(varName)) {
    throw new Error(`ENV Var "${varName}" is not defined.`);
  }
  return envVar!;
};

/* ------------------------ Server private variables ------------------------ */
// Access server side via constants.DATABASE_URL etc.

type ConstantsMap<K extends string> = { [key in K]: string };
class ConstantsManager<K extends string> {
  constants: ConstantsMap<K>;

  constructor(constantNames: K[]) {
    this.constants = {} as ConstantsMap<K>;
    constantNames.forEach((c) => {
      getEnvVar(c);
      Object.defineProperty(this.constants, c, {
        get: () => getEnvVar(c),
      });
    });

    Object.freeze(this.constants);
  }
}

const optionalConstants = [
  'TEMPORAL_CRT',
  'TEMPORAL_KEY',
  'TEMPORAL_HOST',
  'TEMPORAL_NAMESPACE',
];

export const { constants } = new ConstantsManager([
  'SHOPIFY_API_KEY',
  'SHOPIFY_API_SECRET',
  'SHOPIFY_ADMIN_API_ACCESS_TOKEN',
  'SHOPIFY_SHOP_NAME',
]);
