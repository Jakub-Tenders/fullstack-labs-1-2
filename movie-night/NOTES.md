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

## Lab 3

1. **`NavLink` uses `usePathname`, yet the page source of `/movies/2` already contains `aria-current="true"`. How?**
   A Client Component is not only run in the browser: it is also rendered on the server to produce the first HTML. During that render, Next.js gives `usePathname` the path of the request (or of the prerendered page), so `NavLink` computes `aria-current` on the server and the attribute is in the HTML. In the browser, it hydrates and then updates the attribute when the path changes.

2. **Why does `generateStaticParams` return `String(movie.id)`, and why is `/movies/42` a 404 without running the page?**
   Params come from the URL, and URL segments are always strings, so the params must be strings (`{ id: "2" }`). `getMovie` compares with `String(movie.id) === id` for the same reason. With `dynamicParams = false`, only the ids returned by `generateStaticParams` exist. Any other id is rejected by the router as a 404 before the page code runs.

3. **Why is the note kept between `/movies` and `/movies/2`, and lost through `/about`?**
   `app/movies/layout.tsx` wraps both `/movies` and `/movies/2`. When you navigate between them with links, only the page below the layout changes, so the layout and the state of its input stay mounted. `/about` is outside that layout, so going there unmounts the movies layout. Coming back mounts a new one, with an empty input.

4. **Where is the real message of the error in Part E step 4, and why is it not sent to the browser?**
   Under `npm start`, the browser shows a generic message ("An error occurred in the Server Components render…") with a digest. The real message, "Movie database unavailable", is only printed in the terminal of the server, with the same digest. In production, Next.js hides the messages of server errors, because they can leak internal details (queries, paths, secrets) to visitors.

5. **Why does "Loading the movies..." appear on `/movies/2` under `npm run dev`, but not under `npm start`, while it still appears on `/movies`?**
   `npm run dev` renders every page on every request, so `/movies/2` waits for `getMovie` and the loading state is shown meanwhile. Under `npm start`, `/movies/2` is prerendered at build time (●), so its HTML is ready at once and there is nothing to wait for. `/movies` is still dynamic (`force-dynamic`, ƒ): it waits one second for `getMovies` on each request, so `loading.tsx` is shown.

## Lab 4, part 1

1. **Which are the 7 calls of the build, and why does the API receive only one call per movie?**
   The first call is `GET /api/movies`, from `generateStaticParams`, which needs the list of ids. The next six are `GET /api/movies/1` to `GET /api/movies/6`, one for each prerendered movie page. `/movies` is `force-dynamic`, so it does not call the API during the build. `generateMetadata` and the page both call `getMovie(id)` with the same URL and the same options in the same render. Next.js memoizes `fetch` calls (request memoization): the second call reuses the result of the first one, so the API receives only one request per movie.

2. **In break 3, where did the value of `MOVIES_API_KEY` end up, who can read it, and where should it be used instead?**
   It was not in the JavaScript of `.next/static`, but it was in the HTML of the six prerendered movie pages (`.next/server/app/movies/*.html`). The Client Component is also rendered on the server, where every variable of `.env.local` exists, so the value was written into the HTML. Anyone who opens a movie page and views its source can read it. A secret must only be used in server code, for example in `lib/movies.ts` (which is `server-only`) when it calls the API, and never rendered or passed as a prop to a Client Component.

3. **Why does Next.js refuse a function as a prop (break 1) and a `server-only` import in a Client Component (break 2)?**
   The props of a Client Component that come from a Server Component are serialized into the RSC payload, which is data sent to the browser. A function is code with its closure: it cannot be turned into data and rebuilt in the browser, so Next.js refuses it. The browser can only receive values such as strings, numbers, arrays and plain objects. A Client Component is bundled into the JavaScript sent to the browser. `lib/movies.ts` imports `server-only` to say that this code must never be sent there, because it reads server variables and calls a private API. So the build fails when a Client Component uses it. If the import is not used, it is removed from the bundle and the build passes.
