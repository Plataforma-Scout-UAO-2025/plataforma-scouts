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

  const response = await api.post<T>(url, formData, {
    ...config,
    // Do not set Content-Type here — let the browser / axios set boundary
    headers: {
      ...(config?.headers || {}),
    },
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

// Convenience wrapper for the common storage upload endpoint
export const uploadToStorage = async <T = { objectId: string; url?: string }>(
  formData: FormData,
  options: PostFormDataOptions = {}
): Promise<T> => {
  return postFormData<T>('/storage/upload', formData, options);
};

export default postFormData;
