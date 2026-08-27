# Question-data snapshot

`content.dump` is a `pg_dump -Fc` snapshot of the question content only — no
users, attempts, bookmarks, chat logs, or flags. It carries `_prisma_migrations`
so restoring it leaves Prisma's migration state consistent.

`deploy/cohost-deploy.sh` restores it automatically on a fresh database.

## Why a binary dump lives in git

2,496 of the 3,134 questions are `IPA_EXEMPTION` rows produced by the OCR
pipeline in `scripts/ipa-exemption/` over ~114 MB of source PDFs under
`storage/`, which is deliberately not in this repository. The `prisma/import-*.ts`
scripts only reproduce the other 638 (`ORIGINAL_PRACTICE` + `IPA_PUBLIC`), so
without this file a fresh deployment gets a fifth of the question bank.

This is a pragmatic one-time snapshot, not a pattern — do not accumulate dumps
here. Refresh it in place when the question bank changes materially:

```bash
docker exec fecoaching-postgres-1 pg_dump -U fecoach -Fc \
  --exclude-table-data='public."User"' \
  --exclude-table-data='public."Attempt"' \
  --exclude-table-data='public."Bookmark"' \
  --exclude-table-data='public."AiChatLog"' \
  --exclude-table-data='public."QuestionFlag"' \
  fecoach > prisma/snapshot/content.dump
```

The source PDFs in `storage/` are the only irreplaceable artefact in this
project and exist on one machine — back them up separately.
