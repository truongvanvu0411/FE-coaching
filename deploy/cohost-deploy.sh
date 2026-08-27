#!/usr/bin/env bash
# Runs ON the EC2 box, from the repo root (~/fe-coach).
#
# This box already hosts three other projects behind one shared Caddy, so this
# script brings up only postgres + app and then asks the existing Caddy to serve
# one more site. It is idempotent — safe to re-run for every redeploy.
#
#   bash deploy/cohost-deploy.sh
#
# Optional: put a pg_dump custom-format file at ./content.dump to seed question
# data on the first run.
set -euo pipefail

COMPOSE="docker compose -f docker-compose.cohost.yml"
CADDY_CONTAINER=proposal-management-caddy-1
CADDYFILE=/home/ubuntu/proposal-management/Caddyfile
APP_DOMAIN=fe-coach.cjp-demo.online
NETWORK=fe-coach_default

cd "$(dirname "$0")/.."

[ -f .env ] || { echo ".env is missing. Copy .env.production.example and fill it in first." >&2; exit 1; }

# The box has 2 GB and four stacks. beautician builds here fine, but more swap
# costs nothing and removes the chance that a build OOM takes a neighbour down.
if [ "$(free -m | awk '/^Swap:/{print $2}')" -lt 4000 ]; then
  echo "==> Growing swap to 4 GB"
  sudo swapoff /swapfile 2>/dev/null || true
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile >/dev/null
  sudo swapon /swapfile
fi

echo "==> Build and start"
$COMPOSE up -d --build

echo "==> Waiting for the app container to report healthy"
for _ in $(seq 1 60); do
  status=$(docker inspect fe-coach-app -f '{{.State.Health.Status}}' 2>/dev/null || echo starting)
  [ "$status" = healthy ] && break
  sleep 5
done
[ "${status:-}" = healthy ] || { echo "App did not become healthy. Logs:" >&2; $COMPOSE logs --tail 50 app >&2; exit 1; }

# Only on a fresh database — never clobber data that is already there.
DUMP=prisma/snapshot/content.dump
if [ -f "$DUMP" ] && [ "$($COMPOSE exec -T postgres psql -U fecoach -tAc 'select count(*) from "Question"' 2>/dev/null || echo 0)" = "0" ]; then
  echo "==> Restoring question data"
  $COMPOSE cp "$DUMP" postgres:/tmp/content.dump
  $COMPOSE exec -T postgres pg_restore -U fecoach -d fecoach --clean --if-exists /tmp/content.dump || true
  $COMPOSE exec -T postgres rm -f /tmp/content.dump
fi

if [ "$($COMPOSE exec -T postgres psql -U fecoach -tAc 'select count(*) from "User"' 2>/dev/null || echo 0)" = "0" ]; then
  echo "==> Seeding the admin account (password is the one in prisma/seed.ts — change it after first login)"
  $COMPOSE run --rm migrate npx prisma db seed
fi

# Caddy proxies by container name, so it has to share a network with the app.
if ! docker inspect "$CADDY_CONTAINER" -f '{{json .NetworkSettings.Networks}}' | grep -q "$NETWORK"; then
  echo "==> Joining $CADDY_CONTAINER to $NETWORK"
  docker network connect "$NETWORK" "$CADDY_CONTAINER"
fi

# The Caddyfile is shared with three other sites: back it up, and validate before
# reloading so a mistake here cannot take the other sites down.
if ! grep -q "$APP_DOMAIN" "$CADDYFILE"; then
  echo "==> Adding $APP_DOMAIN to the shared Caddyfile"
  sudo cp "$CADDYFILE" "$CADDYFILE.bak.$(date +%Y%m%d%H%M%S)"
  sudo tee -a "$CADDYFILE" >/dev/null <<EOF

$APP_DOMAIN {
  encode zstd gzip
  reverse_proxy fe-coach-app:3000
}
EOF
fi

echo "==> Validating the shared Caddy config"
docker exec "$CADDY_CONTAINER" caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

echo "==> Reloading Caddy"
docker exec -w /etc/caddy "$CADDY_CONTAINER" caddy reload --config /etc/caddy/Caddyfile

echo
echo "Done. https://$APP_DOMAIN"
echo "Other sites on this box are untouched: $(grep -cE '^[a-z*{].*\{$' "$CADDYFILE") site blocks in $CADDYFILE"
