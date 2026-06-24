import { $api } from '@/shared/api/apiInstance';

export const jobQueryOptions = {
  list: () => $api.queryOptions('get', '/api/jobs'),
  detail: (id: string) =>
    $api.queryOptions('get', '/api/jobs/{id}', {
      params: { path: { id } },
    }),
};

export const jobQueryKeys = {
  list: () => jobQueryOptions.list().queryKey,
  detail: (id: string) => jobQueryOptions.detail(id).queryKey,
};
