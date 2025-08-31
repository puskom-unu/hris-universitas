import { describe, it, expect, vi } from 'vitest';
import { getD1Settings } from '../apiService';

describe('apiService', () => {
  it('fetches D1 settings from worker endpoint', async () => {
    const mockResponse = { enabled: true, accountId: 'acc', databaseId: 'db', authToken: 'token' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }) as any;

    const data = await getD1Settings();
    expect(global.fetch).toHaveBeenCalledWith('/api/settings/database', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(data).toEqual(mockResponse);
  });
});
