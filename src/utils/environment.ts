import { ENV_DEV, ENV_PROD, ENV_TEST } from '@/config/consts';

export const isDev = () => process.env.NODE_ENV === ENV_DEV || process.env.NODE_ENV === ENV_TEST;
export const isProd = () => process.env.NODE_ENV === ENV_PROD;
