<!-- Generated: 2026-07-12 | Files scanned: 1 (package.json) | Token estimate: ~300 -->

# Dependencies

## External services
- **Supabase** (Postgres + Auth) — `@supabase/ssr`, `@supabase/supabase-js`. Only
  external backend; no other third-party APIs integrated.

## Core framework
next 14.2.35, react/react-dom ^18, typescript ^5

## UI
@radix-ui/react-{accordion,dialog,label,select,slot,tabs}, lucide-react, recharts
(dashboard charts), class-variance-authority, clsx, tailwind-merge, tailwindcss ^3.4.1

## Forms & validation
react-hook-form, @hookform/resolvers, zod ^4.4.3

## Dates
date-fns ^4.4.0 (always parse `yyyy-MM-dd` with `parse()`, never `new Date()`, to avoid
UTC/Peru UTC-5 timezone shift)

## Testing
vitest ^4.1.9, @testing-library/react + jest-dom, jsdom — used for `lib/utils` and
`lib/validations` tests only (no component tests yet as of this scan)

## Dev tooling
eslint 8 + eslint-config-next, postcss, shadcn (CLI for adding/regenerating
`components/ui/*`, not imported at runtime)

## Recently removed (2026-07-12 refactor-clean pass)
`@base-ui/react`, `@dnd-kit/{core,sortable,utilities}`, `tw-animate-css` — installed
but never referenced in source or CSS; removed as confirmed-dead dependencies.
