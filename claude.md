# claude.md
## SEO Fix for Database-Loaded / Client-Rendered Pages

This document defines mandatory rules to fix SEO issues caused by
**content loading from the database after initial render**.

Search engines must see **complete HTML at first load**.

---

## ROOT CAUSE ANALYSIS

### Identified Problem
- Page content is loaded **client-side** (e.g. `useEffect`, API fetch)
- Initial HTML contains little or no content
- Crawlers detect:
  - Missing H1
  - Missing headings
  - Thin content
  - Low internal links

### SEO Impact
Search engines index the **initial HTML**, not post-hydration content.

---

## GLOBAL RULES (CRITICAL)

1. SEO content MUST be available on **first HTML response**
2. H1, title, and meta MUST NOT depend on client-side fetch
3. Database content MUST be rendered via SSR or SSG
4. Loading states must NOT replace SEO content
5. Metadata must be generated server-side

---

## PRIORITY 1 — RENDERING STRATEGY FIX

### 1. Move Database Content to Server Rendering
**Severity:** 🔴 Critical

#### Required Action
Use one of the following:
- **SSR** (Server-Side Rendering)
- **SSG** (Static Generation with revalidation)

❌ Do NOT rely only on:
- `useEffect`
- Client-only API calls
- Skeleton-only first paint

#### Validation
- View Page Source → content is visible
- Disable JS → content still exists

---

## PRIORITY 2 — SERVER-SIDE SEO METADATA

### 2. Server-Generated Page Title
**Severity:** 🔴 Critical

#### Required Action
- Generate `<title>` on the server
- Use DB data if needed
- Fallback to static title if DB fails

**Rule**
Title must exist even when DB is unavailable.

---

### 3. Server-Generated Meta Description
**Severity:** 🔴 Critical

#### Required Action
- Meta description must be rendered on server
- Use summary from DB or predefined text
- Never wait for client fetch

---

## PRIORITY 3 — H1 & HEADINGS FROM DATABASE

### 4. Server-Rendered H1
**Severity:** 🔴 Critical

#### Required Action
- H1 must be rendered from server data
- Use fallback text if DB result is empty

**Example Logic**
- If DB title exists → use it
- Else → use static H1

---

### 5. Heading Hierarchy from DB Content
**Severity:** 🟠 High

#### Required Action
- Convert DB content into semantic headings
- Enforce:
  - 1 H1
  - Multiple H2/H3 if content allows

---

## PRIORITY 4 — INTERNAL LINKS VISIBILITY

### 6. Server-Rendered Internal Links
**Severity:** 🟡 Medium

#### Required Action
- Internal links must exist in initial HTML
- Do not lazy-load navigation or links critical for SEO

---

## PRIORITY 5 — FALLBACK & EMPTY STATE HANDLING

### 7. SEO-Safe Fallback Content
**Severity:** 🟡 Medium

#### Required Action
When DB returns empty or slow:
- Show static SEO-safe content
- Do NOT show blank page

**Allowed**
- Generic description
- Static headings
- Basic internal links

**Not Allowed**
- Empty divs
- Only skeleton loaders

---

## ACCEPTANCE TESTS (MANDATORY)

All tests must pass before deployment:

- [ ] View Source shows full content
- [ ] Page works with JS disabled
- [ ] H1 exists in raw HTML
- [ ] Title & meta exist without hydration
- [ ] Internal links visible in HTML
- [ ] Lighthouse SEO score improves

---

## FINAL OUTCOME

After applying this guide:
- Search engines index real content
- SEO errors disappear
- Page ranks correctly
- Lighthouse SEO score increases
