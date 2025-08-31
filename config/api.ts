const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (() => {
  if (!rawBaseUrl) {
    console.warn('VITE_API_BASE_URL is not set; using relative API paths.');
    return '';
  }
  try {
    return new URL(rawBaseUrl).toString().replace(/\/$/, '');
  } catch {
    console.error('VITE_API_BASE_URL is invalid:', rawBaseUrl);
    return '';
  }
})();
