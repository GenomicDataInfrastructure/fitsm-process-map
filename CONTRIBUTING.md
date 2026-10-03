<!--
SPDX-FileCopyrightText: 2026 PNED G.I.E.

SPDX-License-Identifier: CC-BY-4.0
-->

# Contributing to FitSM Process Map

Thank you for taking the time to contribute. This project is a learning aid for FitSM, so the
most valuable contributions are corrections that bring the map closer to what FitSM says.

## Code of Conduct

This project and everyone participating in it is governed by the
[Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold it.

## Reporting an error in the content

Open an issue and cite the FitSM document, version and section that shows the error, for
example "FitSM-2 v3.0.2, §4.9.3, second bullet". Every item on the page shows its source, so
you can copy it from there. Say what the page shows and what FitSM says.

## Suggesting a change

Open an issue first for anything beyond a small correction. The project deliberately shows
only what FitSM defines, plus a few labelled study aids; a new feature needs to help people
learn FitSM to be accepted (see the project constitution in `.specify/memory/constitution.md`).

## Making a change

1. Fork and branch from `main`.
2. For content, edit only the files under `content/<edition>/`. Quote FitSM text unchanged.
   The README's "Updating the content" section explains the files.
3. Run the checks before you push:

   ```bash
   node scripts/check.js
   node --test
   ```

   Both must pass. If you add a new kind of content, add a check for it too.
4. Every new file needs an SPDX header naming the copyright holder and the licence
   (CC-BY-4.0), like the one at the top of this file; JSON files are covered by `REUSE.toml`.
   Check with `reuse lint` if you have it installed; CI runs it anyway.
5. Open a pull request. For content changes, cite the FitSM document and section for each
   change in the description. The `Run Tests` workflow must be green before a merge.

## Commit messages

- Subject line in the imperative, at most 72 characters: "Add CAPM interfaces", not "Added".
- Body (optional) explains why, and for content names the FitSM source.

## Licence

By contributing you agree that your contribution is licensed under
[CC BY 4.0](LICENSES/CC-BY-4.0.txt), like the rest of the project.
