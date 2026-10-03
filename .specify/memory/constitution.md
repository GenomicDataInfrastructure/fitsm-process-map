# FitSM Process Map Constitution

This project builds an interactive process map of FitSM, the lightweight IT service management
standard published by ITEMO e.V. It is governed by the same four principles that FitSM applies
to itself, as stated in the foreword of every FitSM document: practicality, consistency,
sufficiency and extendibility. It also applies FitSM's own management approach (clear
responsibilities, documented content and continual improvement) to how the project is run.

## Core Principles

### I. Practicality

FitSM is meant to be usable without a heavy toolset, and so is this map.

- The site MUST run as static files in a current browser. It MUST NOT need a build step,
  bundler, server-side code or account.
- Each part of the standard (process, requirement, role, record, activity, interface) MUST be
  reachable within two clicks from the map. Each process MUST be linkable by its FitSM code
  (for example `#ISRM`).
- Content MUST be written in plain language for people learning FitSM. Jargon that FitSM does
  not itself define MUST be avoided or explained.
- The page MUST be usable with a keyboard and on a phone-width screen.

Rationale: a learning aid that is hard to open, run or read fails its purpose.

### II. Consistency with the Standard

The map MUST say what FitSM says. The source documents are FitSM-0, FitSM-1, FitSM-2 and FitSM-3
(v3), and the latest edition published at fitsm.eu is the reference.

- Every item of FitSM content MUST be traceable to a named FitSM document and section, such as
  a requirement ID (PR1–PR14), an activity or a role.
- FitSM terms MUST be used with their FitSM-0 meanings, and quoted text MUST NOT be reworded.
- The map MUST show exactly the 14 FitSM processes. It MUST NOT add processes, roles or
  requirements that FitSM does not define.
- Anything that is interpretation rather than quotation MUST be labelled on the page. That
  includes derived databases, reconciling conflicting tables and colour groupings.
- When FitSM documents disagree, both versions MUST be shown with a note. The map MUST NOT
  silently pick one.

Rationale: users rely on the map to learn the standard. An unlabelled deviation teaches
something FitSM does not say.

### III. Sufficiency

FitSM includes only what is necessary, and the map follows the same rule.

- A feature MUST serve understanding of the standard. Decoration, tracking and features not
  tied to FitSM content MUST NOT be added.
- The project MUST NOT add package-managed dependencies (npm, pip and similar) or container
  images unless a spec justifies the need and the plan records it. If one is added, a
  dependency licence scan and, for images, an image scan MUST be added to CI.
- Each bundled third-party resource (such as a font) MUST be listed in the README with its
  licence.

Rationale: each addition is something to maintain, review and license. The smallest map that
teaches FitSM fully is the right size.

### IV. Extendibility

FitSM is designed to be extended, and the map MUST be easy to extend without rework.

- All FitSM content MUST live in a content store separate from presentation and behaviour.
  Correcting or adding content MUST NOT require changes to page code.
- The content model MUST let a later FitSM edition, a translation, or further content (such
  as FitSM-4 templates) be added alongside the current content, not on top of it.
- Each item MUST have a stable identifier based on FitSM's own codes, so that links and
  cross-references keep working when content is extended.

Rationale: FitSM evolves, and organisations adapt it. A map that can only show one fixed
edition has a short life.

### V. Openness and Attribution

FitSM is free and openly licensed under CC BY 4.0, and the map is distributed under the same
licence.

- The whole project (code, documentation and FitSM content) is licensed under Creative Commons
  Attribution 4.0 International (CC BY 4.0). No other licence MAY be used for the project's
  own work. A bundled third-party resource keeps its own open licence and is listed as such.
- FitSM content MUST be credited to ITEMO e.V. under CC BY 4.0 with a link to fitsm.eu, both on
  the page and in the content store.
- Every file MUST carry SPDX copyright and licence information, and the repository MUST pass
  `reuse lint`.

Rationale: openness is what lets the map exist and be reused. Using FitSM's own licence for
everything keeps reuse simple and attribution is a licence condition, not a courtesy.

### VI. Continual Improvement

FitSM is built on continual improvement (Plan, Do, Check, Act), and the project MUST apply it to
itself.

- Every change MUST pass the automated consistency checks: all references resolve, no required
  content is missing, and the page script parses. New kinds of content MUST come with new
  checks.
- Error reports and suggested corrections to FitSM content MUST be handled through GitHub
  issues, citing the FitSM source.
- Releases MUST be tagged with a version (`v*`) and recorded in a changelog.

Rationale: a process map of a quality standard should show the same discipline it describes.

## Content and Technical Constraints

- Technology: HTML, CSS and JavaScript without frameworks, served as static files on GitHub
  Pages. Node.js is used only for CI checks and is not needed to view the site.
- Content scope: FitSM v3 (FitSM-0 to FitSM-3). Adding another FitSM part or edition needs a
  spec of its own.
- Labelling: the page MUST visibly separate quoted FitSM content from interpretation and study
  aids.
- Accessibility: text and diagram colours MUST meet WCAG 2.1 AA contrast. Information MUST NOT be
  shown by colour alone.
- Supply chain: GitHub Actions MUST be pinned to commit SHAs.

## Development Workflow and Quality Gates

- Spec-driven: new features follow the Spec Kit flow (specify, plan, tasks, implement). Each plan
  MUST include a Constitution Check against Principles I–VI.
- Content changes MUST cite the FitSM document and section they come from in the pull request.
- Every pull request MUST pass CI (REUSE compliance and the consistency checks) before it is
  merged. Only `main` is deployed.
- Reviewers MUST check that interpretation is labelled (Principle II) and that no unnecessary
  dependency is added (Principle III).
- Commit messages follow the conventions in `CONTRIBUTING.md`.

## Governance

- This constitution takes precedence over other project practices. If guidance conflicts with
  it, the constitution applies until it is amended.
- Amendments are made by pull request that changes this file. The pull request MUST state the
  reason and the version bump, and it needs maintainer approval.
- Versioning follows semantic versioning:
  - MAJOR: a principle is removed or redefined in a way that is not backward compatible.
  - MINOR: a principle or section is added, or guidance is materially expanded.
  - PATCH: wording is clarified without changing meaning.
- Compliance is reviewed in every pull request, and in full when a new FitSM edition is
  published.
- Day-to-day guidance for contributors is in `README.md` and `CONTRIBUTING.md`.

**Version**: 2.0.1 | **Ratified**: 2026-10-03 | **Last Amended**: 2026-10-03
