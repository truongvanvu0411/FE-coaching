# Deploy — co-hosted on the existing EC2 box

`https://fe-coach.cjp-demo.online` served from the instance that already runs
three other projects, so the incremental AWS cost is **zero**: same box, same
EBS volume, same Elastic IP, same on/off pattern.

| | |
|---|---|
| Instance | `i-0ebe4ead3640dee6b` (`proposal-management-demo`), t3.small, ap-northeast-1c |
| Volume | `vol-056db5237a5b3b85c`, 40 GB gp3 — 28 GB free |
| Public IP | `54.248.181.37` (existing Elastic IP) |
| TLS | the existing `proposal-management-caddy-1`, one more site block |
| Database | its own `fe-coach-postgres` container, no host port |
| DNS | `fe-coach.cjp-demo.online` A → `54.248.181.37`, zone `Z0509114EKAJXTEAFO5J` |

The box is normally **stopped** and started when needed — that is why it is
cheap. Standing cost is the 40 GB volume (~USD 3.84/month) plus the Elastic IP
(~USD 3.65/month), both already being paid for the other projects.

## What already lives on this box

| Stack | Containers | RAM |
|---|---|---|
| proposal-management | caddy, postgres, minio | ~197 MiB |
| beautician-diagnosis | app, postgres | ~151 MiB |
| pbasis-ba | app | ~66 MiB |
| **total of 1861 MiB** | | **~414 MiB** |

FE Coach adds roughly 200 MiB (`beautician-diagnosis`, the same Next + Prisma
shape, sits at 118 MiB). `mem_limit: 512m` on the app container in
`docker-compose.cohost.yml` bounds the worst case so this project cannot take a
neighbour down.

Building the image **on the box** is the established pattern here —
`beautician-diagnosis/deploy.sh` does exactly that on this same 2 GB instance —
and `deploy/cohost-deploy.sh` grows swap to 4 GB first.

## Blast radius, stated plainly

All four sites share `/home/ubuntu/proposal-management/Caddyfile`. A bad edit
there takes down **all of them**, not just FE Coach. `cohost-deploy.sh`
therefore backs the file up, appends rather than rewrites, and runs
`caddy validate` before `caddy reload`.

## Two things about this box that will bite you

`ubuntu` is **not** in the `docker` group (the group is empty), so every docker
command needs root — which is why `beautician-diagnosis/deploy.sh` calls `docker`
directly and still works: it is run under sudo. Drive the deploy as root:

```bash
aws ssm send-command --region ap-northeast-1 --instance-ids i-0ebe4ead3640dee6b   --document-name AWS-RunShellScript   --parameters 'commands=["cd /home/ubuntu/fe-coach && bash deploy/cohost-deploy.sh"]'
```

Run `git` as `ubuntu` (`sudo -u ubuntu`), or it refuses the repo for dubious
ownership.

## 1. Start the box

```bash
aws ec2 start-instances --region ap-northeast-1 --instance-ids i-0ebe4ead3640dee6b
aws ec2 wait instance-running --region ap-northeast-1 --instance-ids i-0ebe4ead3640dee6b
```

## 2. Get the source onto the box

This is the step that has no good answer yet — see "Open blockers" below. Once
the repo is in git, it is:

```bash
git clone <repo> ~/fe-coach && cd ~/fe-coach
```

Otherwise `rsync` with the instance key:

```bash
rsync -az --delete --exclude-from=.dockerignore -e "ssh -i <key>.pem" ./ ubuntu@54.248.181.37:~/fe-coach/
```

## 3. Environment

```bash
cd ~/fe-coach
cp .env.production.example .env
printf 'POSTGRES_PASSWORD=%s\n' "$(openssl rand -base64 24)" >> .env
printf 'AUTH_SECRET=%s\n' "$(openssl rand -base64 32)" >> .env
nano .env   # APP_DOMAIN, DEEPSEEK_API_KEY; delete the empty placeholder lines
```

Type `DEEPSEEK_API_KEY` in here by hand. Do not pass it through
`ssm send-command` — SSM command parameters are retained and readable.

## 4. Deploy

```bash
bash deploy/cohost-deploy.sh
```

Grows swap, builds, waits for the app healthcheck, restores `./content.dump` if
present and the database is empty, seeds the admin if there is no user, joins
Caddy to the app network, appends the site block, validates, reloads. Idempotent
— the same command is also the redeploy.

Question data: take a content-only dump from the local database (no personal
data, but it carries `_prisma_migrations` so Prisma stays in sync):

```bash
docker exec fecoaching-postgres-1 pg_dump -U fecoach -Fc \
  --exclude-table-data='public."User"' \
  --exclude-table-data='public."Attempt"' \
  --exclude-table-data='public."Bookmark"' \
  --exclude-table-data='public."AiChatLog"' \
  --exclude-table-data='public."QuestionFlag"' \
  fecoach > content.dump
```

## 5. DNS — not in Route 53

**`cjp-demo.online` is not delegated to Route 53.** Its nameservers are
`aurora.dns-parking.com` and `nebula.dns-parking.com` (Hostinger), so the live
records are managed in the registrar's DNS panel. The Route 53 hosted zone
`Z0509114EKAJXTEAFO5J` exists and answers when queried directly, but nothing on
the internet asks it — writing a record there has no effect.

The giveaway: `pbasisba.cjp-demo.online` resolves publicly but does not appear in
the Route 53 zone at all.

Add the record where the real DNS lives:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `fe-coach` | `54.248.181.37` | 300 |

Caddy retries ACME on its own, so the certificate appears a minute or two after
the record propagates. To stop waiting and force it:

```bash
docker exec -w /etc/caddy proposal-management-caddy-1 caddy reload --config /etc/caddy/Caddyfile
```

Until then Caddy logs, correctly:

```
challenge failed ... DNS problem: NXDOMAIN looking up A for fe-coach.cjp-demo.online
```

## 6. Verify

```bash
curl -s https://fe-coach.cjp-demo.online/api/health   # {"status":"ok"}
# and confirm the neighbours still answer
curl -sI https://beautician.cjp-demo.online | head -1
curl -sI https://pbasisba.cjp-demo.online | head -1
```

## Access

The instance key `proposal-management-demo-key.pem` is not on the dev machine,
and the security group allows SSH only from `133.106.146.132/32` and
`133.106.33.242/32`. Read-only inspection works through
`aws ssm send-command` (the instance role already has
`AmazonSSMManagedInstanceCore`). For an interactive shell without opening
port 22, install the Session Manager plugin locally and use
`aws ssm start-session --target i-0ebe4ead3640dee6b`.

## Open blockers

1. **Source transport.** Nothing currently gets 580 KB of source onto the box:
   local Docker pulls fail (this network breaks on CloudFront blob downloads),
   `aws s3 presign` and `aws iam put-role-policy` are both blocked by the agent
   sandbox, and there is no SSH key or Session Manager plugin. Putting the repo
   in git resolves this permanently and gives the project version control it
   currently lacks.
2. **`DEEPSEEK_API_KEY`** has to be typed on the box by hand; the AI tutor is
   inert until then.
3. **No rate limit or timeout on `/api/tutor`** (`src/lib/deepseek.ts`). Low risk
   while yours is the only account — fix before anyone else gets a login.
4. **Seed admin password** is hardcoded in `prisma/seed.ts`. Change it at first
   login.
5. **No automated backups.** For a 17 MB database, pull a dump before risky
   changes.
6. **AWS root credentials.** The CLI on the dev machine is
   `arn:aws:iam::717827131233:root`. Create an IAM user.

## Deferred performance work

Measured, real, not urgent at current data volume (3,134 questions, one user):

- `progress/page.tsx` groups every attempt then re-queries questions by an
  unbounded `id IN (...)` — 78–110 ms at 2,600 ids. One grouped SQL would do it.
- Home and progress pull raw attempt rows only to derive a streak; a
  `SELECT DISTINCT date("createdAt")` is enough.
- `getReviewArtifact` does one `fs.stat` per call, so the admin risk filter makes
  ~3,134 syscalls per request.
- `scripts/performance-audit.mjs` and `production-audit.mjs` follow the 307 to
  `/login` and therefore measure the login page for every route — their PASS
  means nothing until they authenticate first.
