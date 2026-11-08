## Summary

- Describe the problem and resulting behavior.

## Traceability and compatibility

- Issue: link an existing issue, or explain why this small change has none.
- Scope: frontend / native / data / docs / CI.
- Business rules or ADR affected:
- Release impact: none / patch / minor / breaking (explain migration).

## Validation

- List only checks actually executed, with results and unavailable checks.
- Distinguish browser fixtures, native SQLite and Windows WebView2 evidence.
- Update TASK.md and affected contracts/system state for substantial work.

## UI changes

- [ ] Reuse the shared page structure and existing UI primitives.
- [ ] Cover loading, success, empty, error and retry where applicable.
- [ ] Verify light/dark contrast, keyboard focus and reduced motion.
- [ ] Verify first visit and repeated navigation at 800×600 and a larger window.
- [ ] Review visual snapshot differences; do not accept them automatically.
- [ ] For a Windows release, record native WebView2 validation and actual display scale.

See `docs/ui-quality.md` for acceptance criteria and the Windows release checklist.
