# DigiKon Solutions

React, TypeScript, Vite, and Tailwind CSS v4 foundation for DigiKon Solutions.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4 via `@tailwindcss/vite`
- React Router, React Helmet Async, Three / React Three Fiber / Drei, and GSAP
- Self-hosted Manrope and DM Serif Display font packages
- ESLint and Prettier (including `prettier-plugin-tailwindcss`)

## Scripts

- `npm run dev` — start the development server
- `npm run build` — type-check and create a production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm run format` — format the project with Prettier
- `npm run typecheck` — run TypeScript checks without emitting files

## Structure

- `src/app` — application shell and router
- `src/assets` — local fonts, images, and future 3D models
- `src/components` — reserved for future UI primitives, layout, and sections
- `src/features/three` — reserved for future React Three Fiber scenes
- `src/hooks` — browser capability and preference hooks
- `src/lib` — small shared utilities and motion/GSAP setup
- `src/pages` — reserved for page modules
- `src/styles` — Tailwind theme tokens and global styles
- `src/types` — shared TypeScript types

## Tokens

The source of truth is `src/styles/index.css`. It defines Tailwind v4 theme tokens and semantic CSS aliases. Components must use semantic color tokens (for example, `text-text-primary` and `bg-bg-canvas`) instead of raw hexadecimal values. Raw brand values belong only in the token definition layer.

The `container-page` utility provides the standard max-width and responsive horizontal padding. Tailwind’s default breakpoints cover 640, 768, 1024, 1280, and 1536px; the project also exposes `--breakpoint-xs: 30rem` (480px) for the additional small breakpoint.
