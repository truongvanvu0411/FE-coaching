# FE Coach QA checklist

## Learner flow

- [ ] Login and register work in both `ja` and `vi`.
- [ ] Dashboard primary CTA reaches practice setup.
- [ ] Practice filters update the available question count.
- [ ] Starting a session loads the expected number of questions.
- [ ] Refreshing a session restores the current question and submitted answers for 24 hours.
- [ ] Question navigator can revisit an answered question and preserves its feedback.
- [ ] Reset session clears local progress after confirmation.
- [ ] Mock exam timer reaches the completion state.
- [ ] Bookmark toggle and bookmark removal update optimistically or show a clear error.
- [ ] Tutor actions show loading and error feedback.

## Accessibility

- [ ] Keyboard can reach every action and visible focus is clear.
- [ ] All icon-only buttons have accessible labels.
- [ ] Contrast is readable in light and dark mode.
- [ ] Choice buttons remain at least 44px tall on mobile.
- [ ] `prefers-reduced-motion` removes non-essential animation.
- [ ] Layout works at 320px, 375px, 768px, and 1440px widths.

## Admin flow

- [ ] Review queue search, pagination, approve, reject, and duplicate checks work.
- [ ] Ingest queue filters and pagination work.
- [ ] Upload rejects unsupported/oversized files.
- [ ] Ingest detail shows loading, error, OCR, and save states.
- [ ] Form cannot submit without a topic, correct answer, and two choices.
- [ ] Unsaved form content is not lost accidentally during navigation.

## Commands

With the app running locally:

```bash
npm run audit:routes
npm run audit:performance
npm run build
npm run start -- --port 3101
npm run audit:production
```

`audit:production` expects a production server at `http://127.0.0.1:3101` and reports a warning when p95 exceeds 2.5 seconds.
