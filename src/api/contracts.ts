export interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

export function makeApiResponse<T>(data: T): ApiResponse<T> {
  return {
    ok: true,
    data,
  };
}
