import { D1DatabaseSettings, R2StorageSettings } from '../types';
import { API_BASE_URL } from '../config/api';

const jsonFetch = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
};

export const getD1Settings = async (): Promise<Omit<D1DatabaseSettings, 'authToken'>> => {
  return jsonFetch('/api/settings/database');
};

export const saveD1Settings = async (settings: D1DatabaseSettings): Promise<{ message: string }> => {
  return jsonFetch('/api/settings/database', { method: 'POST', body: JSON.stringify(settings) });
};

export const testD1Connection = async (): Promise<{ success: boolean; message: string }> => {
  return jsonFetch('/api/settings/database/test', { method: 'POST' });
};

export const seedInitialDataToD1 = async (): Promise<{ success: boolean; message: string }> => {
  return jsonFetch('/api/database/seed', { method: 'POST' });
};

export const getR2Settings = async (): Promise<Omit<R2StorageSettings, 'accessKeyId' | 'secretAccessKey'>> => {
  return jsonFetch('/api/settings/storage');
};

export const saveR2Settings = async (settings: R2StorageSettings): Promise<{ message: string }> => {
  return jsonFetch('/api/settings/storage', { method: 'POST', body: JSON.stringify(settings) });
};

export const testR2Connection = async (): Promise<{ success: boolean; message: string }> => {
  return jsonFetch('/api/settings/storage/test', { method: 'POST' });
};

export const generatePresignedUrl = async (
  fileName: string,
  contentType: string
): Promise<{ success: boolean; uploadUrl?: string; finalUrl?: string; message: string }> => {
  return jsonFetch('/api/storage/generate-upload-url', {
    method: 'POST',
    body: JSON.stringify({ fileName, contentType }),
  });
};

export const uploadFileWithPresignedUrl = async (
  uploadUrl: string,
  file: File
): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!res.ok) {
    return { success: false, message: 'File upload failed.' };
  }
  return { success: true, message: 'File berhasil diunggah.' };
};
