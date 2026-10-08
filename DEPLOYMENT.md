# Deployment

Every push to `main` runs `.github/workflows/ci-cd.yml`:

1. **API**: `dotnet build` and `dotnet test`.
2. **Client**: production build and Playwright end-to-end tests.
3. **Image**: builds the root `Dockerfile` and pushes `ghcr.io/anasserekysy/melodify:latest` and `:<commit sha>`. On pull requests the image is built but not pushed.
4. **Deploy**: copies `deploy/docker-compose.prod.yml` and `deploy/deploy.sh` to `~/melodify` on the VM and runs `deploy.sh`.

## What runs on the VM

One container, still named `melodify`, still published on port `5204` (container port 5001) and attached to the `web` network. It serves the Angular app and the API (`/api/...`) from the same origin, so there is no separate API domain and no CORS in production.

`deploy.sh`:

- saves the settings to `~/melodify/.env` (mode 600). A setting that is not provided keeps its saved value;
- logs in to GHCR and pulls the new image first (the old version keeps running if the pull fails);
- removes the old `docker run` container once (the previous pipeline did not use compose), then `docker compose up -d`;
- waits for `http://127.0.0.1:5204/api/health`, then runs `nginx -t` and reloads the `reverse-proxy` container.

## GitHub settings

Secrets (Settings > Secrets and variables > Actions), already used by the old pipeline:

| Secret | Value |
| --- | --- |
| `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | From the Spotify developer dashboard |
| `SPOTIFY_REDIRECT_URI` | `https://melodify.anasserekysy.com/api/spotify-auth/callback` (must match the dashboard exactly) |
| `GHCR_TOKEN` | Token with `read:packages`, used by the VM to pull the image |
| `OVH_HOST`, `OVH_USER`, `SSH_PRIVATE_KEY` | SSH access to the VM |

Optional variables:

| Variable | Default | Use |
| --- | --- | --- |
| `MELODIFY_FRONTEND_URL` | `https://melodify.anasserekysy.com` | Where Spotify sends the user back after sign-in |
| `MELODIFY_BIND` | `5204` | Host port, for example `127.0.0.1:5204` to stop exposing it publicly |

## Spotify dashboard

- The redirect URI must be `https://melodify.anasserekysy.com/api/spotify-auth/callback`.
- Melodify now asks for more scopes (playback control, top items, recently played, follow, library). Users who signed in before must sign in again; the old session in the browser is ignored.
- Since February 2026, a Spotify app in **development mode** only works if the **app owner has Spotify Premium**, and only for accounts listed under "Users and access" (5 users for new apps). Otherwise Spotify refuses the sign-in and Melodify says so on the login page.
- Development mode also hides some data: the songs of playlists you don't own or collaborate on, artist top tracks, popularity and follower counts, and your plan (free or Premium). Melodify adapts: other people's playlists can be played but not listed or merged, and artist pages show search results for that artist.
- "Play in this browser" and playback control need Spotify Premium. Stats, playlist tools and releases work with a free account.

## Reverse proxy

The container keeps its name and port, so the existing site in `/opt/nginx/conf.d` keeps working. `deploy/nginx/melodify.conf` is the recommended version: it resolves `melodify` through Docker's DNS at request time, so a redeploy never leaves the proxy pointing at an old IP.

```bash
cd /opt/nginx/conf.d
sudo cp melodify.conf melodify.conf.bak    # if a site for melodify already exists
sudo curl -fsSL https://raw.githubusercontent.com/AnassEREKYSY/Melodify/main/deploy/nginx/melodify.conf -o melodify.conf
docker exec reverse-proxy nginx -t && docker exec reverse-proxy nginx -s reload
curl -fsS https://melodify.anasserekysy.com/api/health
```

The conf uses the `anasserekysy.com` certificate. If that certificate does not list `melodify.anasserekysy.com`, keep the certificate lines from your current conf (or issue one with the webroot method, as for Skinet).

## Manual deploy or rollback

```bash
cd ~/melodify
IMAGE_TAG=<commit sha> ./deploy.sh   # a specific version
IMAGE_TAG=latest ./deploy.sh
docker compose -f docker-compose.prod.yml logs -f
```
