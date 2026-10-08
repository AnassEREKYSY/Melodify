#!/usr/bin/env bash
# Deploys (or updates) Melodify on the VM. Called by GitHub Actions over SSH; can also be run by hand:
#   cd ~/melodify && IMAGE_TAG=latest ./deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/melodify}"
cd "$APP_DIR"
COMPOSE="docker compose -f docker-compose.prod.yml"

green() { printf '\033[0;32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[1;33m%s\033[0m\n' "$*"; }
red() { printf '\033[0;31m%s\033[0m\n' "$*"; }

# 1. Settings -> .env (owner only). A value that is not provided keeps its previous value.
touch .env && chmod 600 .env
set_env() {
  local key="$1" value="${2:-}"
  [ -z "$value" ] && return 0
  { grep -v "^${key}=" .env || true; printf '%s=%s\n' "$key" "$value"; } > .env.tmp
  mv .env.tmp .env && chmod 600 .env
}
env_get() { grep "^$1=" .env | tail -n1 | cut -d= -f2- || true; }

set_env IMAGE_TAG "${IMAGE_TAG:-latest}"
set_env SPOTIFY_CLIENT_ID "${SPOTIFY_CLIENT_ID:-}"
set_env SPOTIFY_CLIENT_SECRET "${SPOTIFY_CLIENT_SECRET:-}"
set_env SPOTIFY_REDIRECT_URI "${SPOTIFY_REDIRECT_URI:-}"
set_env FRONTEND_URL "${FRONTEND_URL:-}"
set_env MELODIFY_BIND "${MELODIFY_BIND:-}"
for k in SPOTIFY_CLIENT_ID SPOTIFY_CLIENT_SECRET SPOTIFY_REDIRECT_URI; do
  [ -n "$(env_get $k)" ] || { red "$k is missing (GitHub secret)"; exit 1; }
done

# Compose gives shell variables priority over .env, and GitHub passes missing secrets as empty
# strings: drop them from the environment so the values saved in .env are the ones used.
unset IMAGE_TAG SPOTIFY_CLIENT_ID SPOTIFY_CLIENT_SECRET SPOTIFY_REDIRECT_URI FRONTEND_URL MELODIFY_BIND

# 2. Registry login and shared network
if [ -n "${GHCR_TOKEN:-}" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "${GHCR_USER:-anasserekysy}" --password-stdin >/dev/null
fi
docker network inspect web >/dev/null 2>&1 || { yellow "Creating Docker network web"; docker network create web >/dev/null; }

# 3. Pull first, so the old version keeps running if the pull fails.
green "Pulling image (tag: $(env_get IMAGE_TAG))"
$COMPOSE pull

# The old pipeline started the container with 'docker run'; compose cannot adopt it.
if docker inspect melodify >/dev/null 2>&1 \
   && [ "$(docker inspect -f '{{ index .Config.Labels "com.docker.compose.project" }}' melodify 2>/dev/null)" != "melodify" ]; then
  yellow "Removing the old 'docker run' container"
  docker rm -f melodify >/dev/null
fi

green "Starting Melodify"
$COMPOSE up -d --remove-orphans

# 4. Wait for the health endpoint, then reload the reverse proxy (picks up the new container IP).
PORT="$(env_get MELODIFY_BIND)"; PORT="${PORT##*:}"; PORT="${PORT:-5204}"
yellow "Waiting for http://127.0.0.1:${PORT}/api/health ..."
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
    green "Melodify is up (healthy after ~$((i * 3))s)"
    if docker inspect "${PROXY_CONTAINER:-reverse-proxy}" >/dev/null 2>&1; then
      docker exec "${PROXY_CONTAINER:-reverse-proxy}" nginx -t >/dev/null 2>&1 \
        && docker exec "${PROXY_CONTAINER:-reverse-proxy}" nginx -s reload >/dev/null 2>&1 \
        && green "Reverse proxy reloaded" || yellow "Could not reload the reverse proxy (check its config)"
    fi
    $COMPOSE ps
    docker image prune -f >/dev/null || true
    exit 0
  fi
  sleep 3
done

red "Melodify did not become healthy in time. Last logs:"
$COMPOSE logs --tail 80 melodify || true
exit 1
