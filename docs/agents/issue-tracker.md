# Issue tracker: GitHub

Issues and PRDs for this repository live in GitHub Issues at `Z2ZATL/News`. Use the `gh` CLI for issue operations.

## Conventions

- Create an issue: `gh issue create --title "..." --body "..."`
- Read an issue: `gh issue view <number> --comments`
- List issues: `gh issue list --state open --json number,title,body,labels,comments`
- Comment: `gh issue comment <number> --body "..."`
- Apply or remove labels: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`
- Close an issue: `gh issue close <number> --comment "..."`

Infer the repository from `git remote -v`; `gh` resolves it automatically when run inside this checkout.

Use a file for multi-line issue bodies so Markdown is preserved correctly.

## Pull requests as a triage surface

**PRs as a request surface: no.**

Normal implementation pull requests remain part of the development workflow, but external pull requests are not treated as feature-request tickets by the triage skill.

GitHub shares one number space across issues and pull requests. Resolve an ambiguous `#<number>` with `gh pr view <number>` and fall back to `gh issue view <number>`.

## Skill terminology

- When a skill says “publish to the issue tracker,” create a GitHub issue.
- When a skill says “fetch the relevant ticket,” read the corresponding GitHub issue and its comments.
