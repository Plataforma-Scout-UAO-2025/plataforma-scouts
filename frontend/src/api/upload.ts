import type { AxiosProgressEvent, AxiosRequestConfig } from 'axios';
import api from './axios';

export type PostFormDataOptions = {
  config?: AxiosRequestConfig;
  onUploadProgress?: (percent: number) => void;
  signal?: AbortSignal;
};

export const postFormData = async <T = unknown>(
  url: string,
  formData: FormData,
  options: PostFormDataOptions = {}
): Promise<T> => {
  const { config, onUploadProgress, signal } = options;
  const forwardProgress = config?.onUploadProgress;

  const providedHeaders = ((config?.headers as unknown) ?? {}) as Record<string, unknown>;
  const sanitizedHeaders: Record<string, unknown> = {};
  Object.keys(providedHeaders).forEach((k) => {
    if (k.toLowerCase() === 'content-type') return;
    sanitizedHeaders[k] = providedHeaders[k];
  });

  type NodeFormDataLike = { getHeaders: () => Record<string, string> };
  const maybeNodeForm = formData as unknown as NodeFormDataLike;
  if (typeof maybeNodeForm?.getHeaders === 'function') {
    const nodeHeaders = maybeNodeForm.getHeaders();
    Object.keys(nodeHeaders).forEach((k) => {
      sanitizedHeaders[k] = nodeHeaders[k];
    });
  }

  const response = await api.post<T>(url, formData, {
    ...config,
    headers: sanitizedHeaders as AxiosRequestConfig['headers'],
    
    transformRequest: [(data) => data] as AxiosRequestConfig['transformRequest'],
    signal: signal ?? config?.signal,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      forwardProgress?.(progressEvent);
      if (onUploadProgress) {
        const total = progressEvent.total ?? 0;
        const percent = total > 0 ? Math.round((progressEvent.loaded * 100) / total) : 0;
        onUploadProgress(percent);
      }
    },
  });

  return response.data;
};

export const uploadToStorage = async <T = { objectId: string; url?: string }>(
  formData: FormData,
  options: PostFormDataOptions = {}
): Promise<T> => {
  return postFormData<T>('/storage/upload', formData, options);
};

export default postFormData;
