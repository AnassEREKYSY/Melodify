import { Page, Route } from '@playwright/test';

export const API = 'http://localhost:5001/api';

const artist = (i: number) => ({ id: `ar${i}`, uri: `spotify:artist:ar${i}`, name: `Artist ${i}`, image: null, genres: i % 2 ? ['indie pop'] : ['jazz rap'], followers: 1000 * i, popularity: 50 });
const track = (i: number, extra: Partial<Record<string, unknown>> = {}) => ({
  id: `t${i}`, uri: `spotify:track:t${i}`, name: `Song ${i}`, artists: [{ id: `ar${i % 3}`, name: `Artist ${i % 3}` }],
  album: { id: `al${i % 4}`, name: `Album ${i % 4}`, image: null, releaseDate: '2021-05-01' }, durationMs: 200_000, explicit: false,
  popularity: 60, previewUrl: null, addedAt: null, playedAt: null, isLocal: false, ...extra,
});
const album = (i: number, type = 'album', date = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10)) =>
  ({ id: `al${i}`, uri: `spotify:album:al${i}`, name: `Record ${i}`, albumType: type, image: null, releaseDate: date, totalTracks: 8, artists: [{ id: 'ar1', name: 'Artist 1' }], tracks: null, label: null });
export const playlists = [
  { id: 'pl1', uri: 'spotify:playlist:pl1', name: 'Sunday coffee', description: null, image: null, owner: { id: 'me', name: 'Anass' }, trackCount: 4, public: false, collaborative: false, snapshotId: 's', isOwn: true },
  { id: 'pl2', uri: 'spotify:playlist:pl2', name: 'Gym', description: null, image: null, owner: { id: 'me', name: 'Anass' }, trackCount: 3, public: false, collaborative: false, snapshotId: 's', isOwn: true },
  { id: 'pl3', uri: 'spotify:playlist:pl3', name: 'Shared with Aya', description: null, image: null, owner: { id: 'aya', name: 'Aya' }, trackCount: 2, public: true, collaborative: false, snapshotId: 's', isOwn: false },
];
export const user = { id: 'me', displayName: 'Anass Test', email: 'a@example.com', image: null, country: 'FR', product: 'premium', followers: 3 };
const stats = (range: string) => ({
  range, artistCount: 20, trackCount: 50, topGenres: [{ name: range === 'medium' ? 'Neo Soul' : 'Jazz Rap', count: 6 }, { name: 'Indie Pop', count: 4 }],
  decades: [{ name: '2010s', count: 20 }, { name: '2020s', count: 30 }], playsByHour: Array.from({ length: 24 }, (_, h) => (h === 21 ? 9 : h % 3)),
  recentPlays: 50, recentMinutes: 160, averagePopularity: 61.4, explicitPercent: 12, averageTrackSeconds: 212, firstPlayedAt: null,
});

export interface Calls { method: string; path: string; search: URLSearchParams; body: any; }

/** Fulfils every /api call with fixtures; `overrides` win (key: "METHOD /path"). Returns the call log. */
export async function mockApi(page: Page, overrides: Record<string, (r: Route, c: Calls) => unknown> = {}) {
  const calls: Calls[] = [];
  const json = (r: Route, body: unknown, status = 200) => r.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route(`${API}/**`, async route => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^\/api/, '');
    const c: Calls = { method: req.method(), path, search: url.searchParams, body: req.postDataJSON?.() ?? null };
    calls.push(c);
    const o = overrides[`${c.method} ${path}`];
    if (o) return o(route, c);
    if (c.method === 'OPTIONS') return route.fulfill({ status: 204 });
    const r = route;
    switch (`${c.method} ${path}`) {
      case 'GET /spotify-auth/exchange': return json(r, { user, accessToken: 'tok', expiresIn: 3600, refreshToken: 'ref' });
      case 'GET /me': return json(r, user);
      case 'GET /me/recent': return json(r, [1, 2, 3].map(i => track(i, { playedAt: new Date().toISOString() })));
      case 'GET /me/top/artists': return json(r, [1, 2, 3, 4].map(artist));
      case 'GET /me/top/tracks': return json(r, [1, 2, 3, 4, 5].map(i => track(i)));
      case 'GET /me/stats': return json(r, stats(c.search.get('range') ?? 'short'));
      case 'GET /me/tracks': return json(r, { items: [1, 2].map(i => track(i)), total: 2, offset: 0, limit: 50 });
      case 'GET /me/tracks/contains': return json(r, (c.search.get('ids') ?? '').split(',').map(() => false));
      case 'GET /playlists': return json(r, playlists);
      case 'GET /releases': return json(r, [album(1), album(3, 'single'), album(10)]);
      case 'GET /player': return r.fulfill({ status: 204 });
      case 'GET /player/devices': return json(r, [{ id: 'd1', name: 'Kitchen speaker', type: 'Speaker', isActive: false, isRestricted: false, volumePercent: 40 }]);
      case 'POST /playlists/from-top':
      case 'POST /playlists/merge':
      case 'POST /playlists': return json(r, { ...playlists[0], id: 'new1', uri: 'spotify:playlist:new1', name: c.body?.name ?? 'Your top tracks', trackCount: 30 }, 201);
    }
    if (c.method === 'GET' && /^\/playlists\/[a-z0-9]+$/.test(path)) {
      const p = playlists.find(x => path.endsWith('/' + x.id)) ?? { ...playlists[0], id: path.split('/').pop()!, name: 'Your top tracks' };
      return json(r, { playlist: p, tracks: [1, 2, 3, 4].map(i => track(i)), skippedLocal: 0 });
    }
    if (c.method === 'GET' && /^\/artists\/[a-z0-9]+$/.test(path)) return json(r, { artist: artist(1), topTracks: [1, 2].map(i => track(i)), albums: [album(1), album(2, 'single')], following: false });
    if (c.method === 'GET' && /^\/albums\//.test(path)) return json(r, { ...album(1), tracks: [1, 2].map(i => ({ ...track(i), album: null })) });
    return json(r, {});
  });
  return calls;
}

/** Starts the app with a stored Spotify session (skips the OAuth redirect). */
export async function signIn(page: Page) {
  await page.addInitScript(() => {
    if (!localStorage.getItem('melodify_session')) localStorage.setItem('melodify_session', JSON.stringify({ accessToken: 'tok', refreshToken: 'ref', expiresAt: Date.now() + 3_600_000 }));
  });
}
