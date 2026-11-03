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

Latest changes
- Review step = the View page (shared component src/features/hr/MemberOverview.tsx). Save Record returns to /people.
- Save button on every form step (first save creates the record, later saves update it - no duplicates).
- HR type badge colours live in HR_TYPE_TONE (hrFormConfig.ts): Strategic = solid blue, Contractual = outlined.
- Text/inputs/buttons enlarged (html font-size 112.5% in styles/theme.css + bigger inputs). Change the 112.5% to resize everything.
- vercel.json added so refreshing /people (or any route) works on Vercel.
