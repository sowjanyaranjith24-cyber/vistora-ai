import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 0 // processing can take a while
});

/**
 * Upload files with progress callback.
 * @param {File[]} files
 * @param {(pct:number)=>void} onProgress
 */
export async function uploadFiles(files, onProgress) {
  const form = new FormData();
  files.forEach(f => form.append('files', f));

  const res = await api.post('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => {
      if (!e.total) return;
      const pct = Math.round((e.loaded * 100) / e.total);
      if (onProgress) onProgress(pct);
    }
  });
  return res.data;
}

export async function processFiles(filenames, useCase) {
  const res = await api.post('/api/process', { filenames, useCase });
  return res.data;
}

export async function listUploads() {
  const res = await api.get('/api/upload/list');
  return res.data;
}

export function absoluteUrl(p) {
  if (!p) return '';
  if (p.startsWith('http')) return p;
  return `${API_URL}${p}`;
}

// ---------- small localStorage helpers for passing state between pages ----------

const KEY_UPLOADED = 'vistora.uploaded';
const KEY_USECASE  = 'vistora.usecase';
const KEY_RESULT   = 'vistora.result';

export const store = {
  setUploaded: (files) => typeof window !== 'undefined' && localStorage.setItem(KEY_UPLOADED, JSON.stringify(files)),
  getUploaded: () => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(KEY_UPLOADED) || '[]'); } catch { return []; }
  },
  setUseCase: (u) => typeof window !== 'undefined' && localStorage.setItem(KEY_USECASE, u),
  getUseCase: () => (typeof window !== 'undefined' ? (localStorage.getItem(KEY_USECASE) || 'general') : 'general'),
  setResult: (r) => typeof window !== 'undefined' && localStorage.setItem(KEY_RESULT, JSON.stringify(r)),
  getResult: () => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem(KEY_RESULT) || 'null'); } catch { return null; }
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY_UPLOADED);
    localStorage.removeItem(KEY_USECASE);
    localStorage.removeItem(KEY_RESULT);
  }
};
