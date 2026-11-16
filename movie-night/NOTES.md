# Movie Night – Session 1 notes

## Lab 1 – Tour of the project

1. **In which file are the `<html>` and `<body>` tags?**
   In `app/layout.tsx`, the root layout. It is the only place where they are written; every page is rendered inside its `<body>` through the `children` prop.

2. **Which file renders the page at `/`?**
   `app/page.tsx`. In the App Router, a route only exists if its folder contains a `page.tsx`. When I renamed it to `app/home.tsx`, `/` returned a 404; renaming it back restored the page.

3. **Which folder is for images and other static files, and how do you reference them?**
   `public/`. Files are served as they are from the root URL, without the `public` prefix: `public/next.svg` is referenced as `/next.svg` (e.g. `<Image src="/next.svg" ... />` or `<img src="/next.svg">`).

4. **What is `tsconfig.json` doing in your project?**
   It configures the TypeScript compiler: strict mode, JSX handling (`react-jsx`), module resolution (`bundler`), `resolveJsonModule` (lets us `import movies from "@/data/movies.json"`), the `next` TypeScript plugin, which files to include, and the `@/*` path alias. Next.js uses it for type checking during `next build`; `noEmit: true` means TypeScript only checks types, the bundler (Turbopack) does the compilation.

5. **What does `@/*` mean in `tsconfig.json`? Write an import that uses it.**
   It is a path alias: `"@/*": ["./*"]` maps `@/` to the project root, so imports don't depend on how deep the current file is (no `../../`).
   ```ts
   import { getMovies } from "@/lib/movies"; // -> ./lib/movies.ts
   ```

6. **What does `app/layout.tsx` import from `next/font/google`, and what does Next.js do with it at build time?**
   It imports the `Geist` and `Geist_Mono` font functions. At build time Next.js downloads the font files and self-hosts them with the app's other static assets, so the browser never contacts Google at runtime (better privacy and performance). It also generates the `@font-face` CSS, preloads the fonts and adjusts a fallback font to avoid layout shift. Each call exposes a CSS variable (`--font-geist-sans`, `--font-geist-mono`) that is added as a class on `<html>`.

7. **What's the difference between `layout.tsx` and `page.tsx`?**
   `page.tsx` is the unique content of one route and is what makes the URL publicly accessible. `layout.tsx` is UI shared by a segment and all its children: it wraps the pages through `children`, persists across navigations between those pages (it is not re-mounted and keeps its state), and the root layout is required and holds `<html>`/`<body>`.

8. **Where would you put a navbar that appears on every page?**
   In the root layout `app/layout.tsx`, inside `<body>` before `{children}` (ideally as its own component, e.g. `components/navbar.tsx`, imported in the layout).

9. **What is `globals.css` for, and where is it imported?**
   It holds the global styles of the app: it imports Tailwind CSS (`@import "tailwindcss";`) and defines theme variables (background/foreground colours, light/dark, font variables). It is imported once, in `app/layout.tsx` (`import "./globals.css";`), so it applies to every page.

10. **What is `AGENTS.md`, and does your app need it to run?**
    It is an instructions file for AI coding agents (Claude Code, Copilot, Cursor…). It tells them to read the Next.js docs bundled with the installed version (`node_modules/next/dist/docs/`) instead of relying on possibly outdated training data. The app does not need it at all: Next.js ignores it, and deleting it changes nothing at build or run time.

### Step 6 – Breaking things on purpose

* Removing a closing tag in `app/page.tsx` shows the error overlay with a parsing error pointing to the file `app/page.tsx` and the exact line/column; fixing it removes the overlay automatically (fast refresh).
* `/nope` shows Next.js's built-in 404 page.
* After renaming `app/page.tsx` to `app/home.tsx`, `/` returns a 404: only files named `page.tsx` create routes. Renaming it back fixes it.

## Lab 2 – Questions

1. **In the page source, are the movie titles present for `/movies`? For `/movies-client`? Why?**
   For `/movies`: yes. It is a Server Component that awaits `getMovies()` on the server, so the HTML sent to the browser already contains the full list (it even works with JavaScript disabled).
   For `/movies-client`: no, the source only contains "Loading movies...". The Client Component is prerendered on the server too, but at that moment `movies` is still `null`. The data is fetched in `useEffect`, which only runs in the browser after hydration, so the titles are added to the DOM later by JavaScript and never appear in the server HTML.

2. **Without `force-dynamic`, you run `npm run build` again tomorrow, then `npm start`. What does the "Rendered at" timestamp show, and why?**
   It shows tomorrow's build time, i.e. the moment `/movies` was prerendered during that new build, and it stays frozen at that value for every request until the next build. The page is static (○): the HTML is generated once at build time and then served as is; `new Date()` is not evaluated per request.

3. **Give one situation where `force-dynamic` is still the right choice, and explain why.**
   When the content must be fresh or depends on the request, e.g. a live vote results page during the movie night, or a page personalised with cookies/headers (the current user's votes). A static or ISR page would show stale or wrong (another user's) data; correctness matters more than the extra second. In practice we would also make the query faster or stream the slow part with `loading.tsx`/`<Suspense>`.

4. **A classmate sees `[movies] rendered 6 movies` in the browser console and says: "So this code runs in the browser." What do you answer, and how can you prove it?**
   No: `app/movies/page.tsx` is a Server Component and runs only on the server. In development, Next.js forwards server logs to the browser console as a debugging aid (they are tagged "Server"). Proofs: the same line is printed in the terminal running `npm run dev` (by Node.js) on each request; under `npm run build` + `npm start` the log appears only in the server terminal (during the build for the static version, per request with `force-dynamic`) and never in the browser console; disabling JavaScript still shows the full list; and the component's code is not in the JS bundles downloaded in the Network tab.

5. **Which version would you choose for a public movie catalogue that changes once a week, and why?**
   The server-rendered static version, ideally with ISR (`export const revalidate = …`, e.g. one hour or one day) or an on-demand rebuild when the catalogue changes. The titles are in the HTML (good SEO and fast First/Largest Contentful Paint, works without JS), the HTML can be served from a cache/CDN instantly, and the slow query runs once per revalidation period instead of once per visitor. `force-dynamic` would make every visitor wait for data that almost never changes; the client version would hurt SEO and show a loading state first.

## Observations (verified)

| Setup | Route table | Timestamp under `npm start` | Response time | Server log |
|---|---|---|---|---|
| Default (Part D) | `○ /movies` | Frozen at build time | ~3 ms | Printed once, during `npm run build` |
| `force-dynamic` (Part E) | `ƒ /movies` | New on every request | ~1 s | Printed on every request |
| `/movies-client` (Part F) | – | – | – | HTML contains "Loading movies..." and no title; `/movies.json` fetched by the browser |
