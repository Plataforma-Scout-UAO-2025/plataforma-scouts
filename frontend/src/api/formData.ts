import type { AxiosProgressEvent, AxiosRequestConfig } from "axios";
import api from "./axios";

type PostFormDataOptions = {
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
    headers: {
      "Content-Type": "multipart/form-data",
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
