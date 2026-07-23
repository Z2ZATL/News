# Domain Docs

This repository uses a single-context domain documentation layout.

## Before exploring

- Read `CONTEXT.md` at the repository root when it exists.
- Read ADRs under `docs/adr/` that affect the area being changed.
- If these files do not exist, proceed silently. Domain-modeling work creates them when real terminology or architectural decisions are resolved.

## Expected layout

```text
/
├── CONTEXT.md
├── docs/
│   ├── agents/
│   └── adr/
└── src/
```

## Vocabulary

Use terms as defined in `CONTEXT.md` in issue titles, implementation plans, tests, and code. Do not drift to synonyms the glossary explicitly rejects.

If a needed concept is missing, first check whether the project already has a more precise term. If it is genuinely absent, record the gap for domain-modeling work.

## ADR conflicts

If a proposal conflicts with an accepted ADR, surface the conflict explicitly. Do not silently override the decision.
