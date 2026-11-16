# Project board review and manual movement / Scrum journal

Reviewed: 2026-11-15 UTC. Repository: moldovancsaba/moldovancsaba.com.

## Board access and verified scope

The associated board identity could not be resolved with this connection. The board is the owner's source of truth and remains read-only. Repository project discovery returned a null project node with FORBIDDEN: Resource not accessible by integration. This is an access failure, not evidence that no board exists. Card count, columns, placements, dependencies and consistency with issue states remain unverified. No board write or repeated access retry was attempted.

All 2 returned repository entries were read (0 issues, 0 open).

## Source observations and work clusters

This dependency-free static site has content JSON, section templates, shared style tokens and generated Pages artifacts; its issue collection has no issues (two pull requests). Project discovery was access-blocked, so current board scope and placement remain unverified.

Keep content changes in content/*.json and regenerate output through the existing build/check tools. A newer application framework or CMS is not warranted solely by technology age: evaluate actual content maintenance, accessibility, output determinism and publishing needs. Preserve system light/dark preference, no-JavaScript usability, reduced motion, image dimensions and CSP. The macOS sips image-generation path is a target-platform limitation, not a reason to invent replacement photographs.

No personal biography, testimonial, statistic, credential, photo, contact or legal fact was changed or fabricated. The review changes documentation only; it does not claim a current visual/accessibility audit or prove production acceptance. Sources inspected: README.md, scripts/build.mjs and scripts/check.mjs.

## Repository issue register

| Issue | State | Current column | Conditional proposal |
| --- | --- | --- | --- |

## Append-only Scrum notes

| UTC date | Issue/card | Observed column | Proposed destination | Evidence / unmet acceptance | Owner decision | Applied by owner / verification |
| --- | --- | --- | --- | --- | --- | --- |

Add actual observations when available and retain earlier entries. A proposal is never an applied board change.

Verification: the existing Node build and site checks passed. No content, templates or generated site assets changed.
