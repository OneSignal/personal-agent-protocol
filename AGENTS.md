# Personal Agent Protocol site

## Editing the docs

Each docs page is an MDX file in `content/`, listed in `content/docs.ts` with its URL, title,
description, and outline settings. The page, its metadata, the sitemap, the header tabs, the left
outline, and the page's `.md` version, which also goes in the agent kit, all come from these two
places. A new page also needs a one-line `app/docs/<page>.md/route.ts`; the build fails without it.

Write plain Markdown. On top of it:

- `## Principles {#principles}` gives a heading an id. Headings without one get none, and only
  headings with ids appear in the outline, down to the page's `outlineDepth`.
- `## 3. Discovery {#discovery}` numbers a section, and `### 3.1 Fields {#fields}` a subsection. The
  build fails if the numbers don't count up.
- Requirement words such as MUST and SHOULD NOT, in capitals, are styled automatically.
- Tables stack on phones. A row like `| **Parties** | |` starts a group of rows.
- A code block names its language and can have a label:
  ` ```http label="Request: Personal Agent → Company" `.
- Links to other sites open in a new tab.

`outlineLabels` in `content/docs.ts` gives an outline label that differs from its heading.

After editing, run `npx prettier --write` and `npx tsc --noEmit`. `pnpm build` checks section
numbering, heading ids, and `.md` routes.
