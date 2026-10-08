import { expect, test } from '@playwright/test';
import { mockApi, signIn } from './mock-api';

test('signed-out visitors land on the login page', async ({ page }) => {
  await mockApi(page);
  await page.goto('/stats');
  await expect(page).toHaveURL(/\/login\?next=%2Fstats/);
  await expect(page.getByTestId('login')).toBeVisible();
});

test('the Spotify callback code signs the user in', async ({ page }) => {
  const calls = await mockApi(page);
  await page.goto('/login?code=abc&state=xyz');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Anass');
  expect(calls.find(c => c.path === '/spotify-auth/exchange')?.search.get('code')).toBe('abc');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('melodify_session')!).accessToken)).toBe('tok');
});

test('a sign-in error is shown on the login page', async ({ page }) => {
  await mockApi(page);
  await page.goto('/login?error=access_denied');
  await expect(page.getByRole('alert')).toHaveText('Spotify sign-in was cancelled.');
});

test.describe('signed in', () => {
  test.beforeEach(async ({ page }) => signIn(page));

  test('home shows recent plays, top artists and new releases', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Recently played' })).toBeVisible();
    await expect(page.getByText('Song 1').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Artist 1' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Record 1' }).first()).toBeVisible();
  });

  test('stats switch period and save top tracks as a playlist', async ({ page }) => {
    const calls = await mockApi(page);
    await page.goto('/stats');
    await expect(page.getByTestId('tiles')).toContainText('Jazz Rap');
    await expect(page.getByTestId('tiles')).toContainText('2 h 40 min');
    await expect(page.getByTestId('hours')).toContainText('Busiest around 9');
    await page.getByTestId('range-medium').click();
    await expect(page.getByTestId('tiles')).toContainText('Neo Soul');
    expect(calls.some(c => c.path === '/me/stats' && c.search.get('range') === 'medium')).toBe(true);

    await page.getByRole('button', { name: 'Show table' }).click();
    await expect(page.getByRole('table')).toBeVisible();

    await page.getByTestId('make-playlist').click();
    await expect(page).toHaveURL(/\/playlist\/new1$/);
    const req = calls.find(c => c.path === '/playlists/from-top')!;
    expect(req.body).toMatchObject({ range: 'medium', limit: 30 });
  });

  test('remove duplicates and sort an own playlist', async ({ page }) => {
    const calls = await mockApi(page, {
      'POST /playlists/pl1/dedupe': r => r.fulfill({ json: { removed: 2, trackCount: 2 } }),
      'POST /playlists/pl1/sort': r => r.fulfill({ json: { trackCount: 4 } }),
    });
    await page.goto('/playlist/pl1');
    await expect(page.getByRole('heading', { name: 'Sunday coffee' })).toBeVisible();
    await page.getByTestId('pl-dedupe').click();
    await expect(page.getByText('Removed 2 duplicates')).toBeVisible();

    await page.getByTestId('pl-sort').click();
    await page.getByLabel('Sort by').selectOption('release');
    await page.getByLabel('Order').selectOption({ label: 'Descending' });
    await page.getByRole('button', { name: 'Sort playlist' }).click();
    await expect(page.getByText('Playlist sorted')).toBeVisible();
    expect(calls.find(c => c.path === '/playlists/pl1/sort')!.body).toEqual({ by: 'release', descending: true });
  });

  test('playlists owned by someone else explain that Spotify hides their songs', async ({ page }) => {
    await mockApi(page);
    await page.goto('/playlist/pl3');
    await expect(page.getByRole('heading', { name: 'Shared with Aya' })).toBeVisible();
    await expect(page.getByText('Spotify does not share the songs of this playlist')).toBeVisible();
    await expect(page.getByTestId('pl-stats')).toHaveCount(0);
    await expect(page.getByTestId('pl-dedupe')).toHaveCount(0);
    await expect(page.getByTestId('pl-sort')).toHaveCount(0);
  });

  test('merge two playlists from the library', async ({ page }) => {
    const calls = await mockApi(page);
    await page.goto('/library');
    await page.getByTestId('tool-merge').click();
    const form = page.getByTestId('tool-form');
    await form.getByLabel('Sunday coffee').check();
    await form.getByLabel('Gym').check();
    await form.getByLabel('Name').fill('Coffee and gym');
    await form.getByRole('button', { name: 'Merge 2 playlists' }).click();
    await expect(page).toHaveURL(/\/playlist\/new1$/);
    expect(calls.find(c => c.path === '/playlists/merge')!.body).toEqual({ playlistIds: ['pl1', 'pl2'], name: 'Coffee and gym', removeDuplicates: true });
  });

  test('new releases filter by type and period', async ({ page }) => {
    const calls = await mockApi(page);
    await page.goto('/releases');
    await expect(page.getByTestId('latest')).toContainText('Record 1');
    await page.getByRole('button', { name: 'Singles and EPs' }).click();
    await expect(page.getByTestId('latest')).toContainText('Record 3');
    await page.getByRole('button', { name: '3 months' }).click();
    await expect.poll(() => calls.some(c => c.path === '/releases' && c.search.get('days') === '90')).toBe(true);
  });

  test('playing with no active device opens the device picker', async ({ page }) => {
    const calls = await mockApi(page, {
      'PUT /player/play': r => r.fulfill({ status: 404, json: { error: 'No active Spotify device. Open Spotify on a device or play in this browser.' } }),
      'PUT /player/device': r => r.fulfill({ status: 204 }),
    });
    await page.goto('/album/al1');
    await page.getByRole('button', { name: 'Play album' }).click();
    const picker = page.getByRole('dialog', { name: 'Devices' });
    await expect(picker).toContainText('Pick a device to play on');
    await picker.getByText('Kitchen speaker').click();
    await expect(page.getByText('Playing on Kitchen speaker')).toBeVisible();
    expect(calls.find(c => c.path === '/player/device')!.body).toEqual({ deviceId: 'd1', play: true });
  });

  test('like a song from a track row', async ({ page }) => {
    const calls = await mockApi(page, { 'PUT /me/tracks/t1': r => r.fulfill({ status: 204 }) });
    await page.goto('/album/al1');
    await page.getByRole('listitem').filter({ hasText: 'Song 1' }).hover();
    await page.getByRole('button', { name: 'Save to Liked songs' }).first().click();
    await expect(page.getByText('Added to Liked songs')).toBeVisible();
    expect(calls.some(c => c.method === 'PUT' && c.path === '/me/tracks/t1')).toBe(true);
  });

  test('search shows grouped results', async ({ page }) => {
    await mockApi(page, {
      'GET /search': r => r.fulfill({ json: { tracks: [{ id: 't9', uri: 'spotify:track:t9', name: 'Found song', artists: [{ id: 'ar1', name: 'Artist 1' }], album: null, durationMs: 1000, explicit: false, popularity: 1, previewUrl: null, addedAt: null, playedAt: null, isLocal: false }], artists: [], albums: [], playlists: [] } }),
    });
    await page.goto('/search');
    await page.getByTestId('search').fill('found');
    await expect(page.getByText('Found song')).toBeVisible();
    await expect(page).toHaveURL(/q=found/);
  });

  test('unknown pages show a not found message', async ({ page }) => {
    await mockApi(page);
    await page.goto('/no-such-page');
    await expect(page.getByText('This page does not exist')).toBeVisible();
  });
});
