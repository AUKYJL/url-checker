import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

import type { DeepOptionalKey } from '@/shared/types';

import type { paths } from './apiTypes';

export const fetchClient = createFetchClient<DeepOptionalKey<paths, 'header'>>({
  baseUrl: import.meta.env.VITE_API_URL,
});

export const $api = createClient(fetchClient);
