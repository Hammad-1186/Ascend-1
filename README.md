# ASCEND HR – Directory, View & Multi-step Form (TypeScript)

    npm install
    npm run dev          # http://localhost:5173/people
    npm run typecheck
    npm run build

Routes: /people (directory), /people/new, /people/:id (view), /people/:id/edit

Key files:
- src/types/hr.ts – types + "active project" rule (initiated / in-progress only)
- src/features/hr/hrFormConfig.ts – single source of truth: Step > Group (heading) > Field. Drives the form, review step and view page. Add `required: true` to a field to enforce it later.
- src/features/hr/useHrMemberForm.ts – state, Theme > Lab > Project cascade, step navigation
- src/mocks/hrData.ts – themes, labs (3.1-3.5 ...), projects, members. Set VITE_USE_MOCK=false to call the real API.

- src/features/hr/HrDirectoryPage.tsx - directory with Table View / Grid View toggle (table 5 per page, grid 6 per page). No floor filter.
- src/features/hr/HrMemberCard.tsx - grid card (avatar, HR type badge, phone / lab / theme or organization / joining date, View + Edit).
- src/components/ui/ViewToggle.tsx - reusable segmented switch.
