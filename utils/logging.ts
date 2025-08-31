export const logError = (error: unknown, info?: unknown) => {
  if (typeof fetch === 'function') {
    // Placeholder for sending error to monitoring endpoint
    // fetch('/monitoring', { method: 'POST', body: JSON.stringify({ error, info }) }).catch(() => {});
  }
  console.error(error, info);
};
