# Community Tool Library MVP Recovery

## 1. MVP Identification
The minimum viable product for this app is:

- Users can add a tool with a name and description.
- Users can view all listed tools.
- Users can mark a tool as borrowed and returned.

Everything else is secondary to those flows.

## 2. Bug Fixes

### Bug 1: Repeated fetching caused an infinite render loop
- **Symptom**: The frontend kept refetching tools and re-rendering continuously.
- **Cause**: [`client/src/App.jsx`](./client/src/App.jsx) called `fetchTools()` inside `useEffect` without a dependency array.
- **Fix**: Added `[]` so the initial fetch runs once on mount. I also added basic fetch error handling so the UI can surface a load failure cleanly.

### Bug 2: Added tools were never saved to the database
- **Symptom**: Listing a new tool appeared to succeed, but refreshing the page removed it.
- **Cause**: [`server/routes/tools.js`](./server/routes/tools.js) returned a mock object from `POST /api/tools` instead of calling Prisma.
- **Fix**: Replaced the mock response with `prisma.tool.create(...)`, trimmed request fields, and returned validation errors for missing input.

### Bug 3: Tool cards used an invalid React key
- **Symptom**: Tool list rendering was unstable and React could not track items correctly.
- **Cause**: [`client/src/components/ToolList.jsx`](./client/src/components/ToolList.jsx) used `tool.index`, which does not exist.
- **Fix**: Switched the key to `tool.id`.

### Bug 4: Borrow/return requests called the wrong endpoint and ignored the server response
- **Symptom**: Clicking Borrow or Return failed, or the UI stayed out of sync with the backend.
- **Cause**: [`client/src/components/ToolCard.jsx`](./client/src/components/ToolCard.jsx) called `/api/tool/:id` instead of `/api/tools/:id`, then built a local object instead of using the updated Prisma record returned by the server.
- **Fix**: Corrected the route to `/api/tools/:id` and updated the card by using the JSON returned from the backend.

### Bug 5: Tool state was mutated directly in React
- **Symptom**: Borrow/return changes were not reflected reliably in the UI.
- **Cause**: [`client/src/App.jsx`](./client/src/App.jsx) mutated the existing `tools` array in place and never called `setTools` with a new array reference.
- **Fix**: Replaced mutation with immutable state updates using `map`, and added optimistic list insertion when a tool is created successfully.

### Bug 6: Prisma CLI and runtime configuration were conflicting
- **Symptom**: The backend could not generate Prisma Client, and the server failed because `server/prisma.config.js` was being treated as CLI config.
- **Cause**: The file name `prisma.config.js` is reserved by Prisma 7, but the project used it as an application singleton. In addition, Prisma 7 expects the datasource URL in config and requires an adapter-based client setup.
- **Fix**: Split runtime access into [`server/prismaClient.js`](./server/prismaClient.js), converted [`server/prisma.config.js`](./server/prisma.config.js) into actual Prisma CLI config, moved the datasource URL into that config, and instantiated Prisma with `@prisma/adapter-pg`.

## 3. Improvements
- Added [`server/.env.example`](./server/.env.example) so the backend setup is explicit.
- Added a `/health` endpoint in [`server/index.js`](./server/index.js) for quick startup checks.
- Updated form submission handling so newly created tools appear immediately without a second fetch.
- Cleaned up user-facing copy in the UI and removed broken encoded characters from edited components.
- Ordered tool results by newest first in the API to keep the newest listing visible at the top.

## 4. Verification
- `npm run build` succeeds in [`client`](./client).
- `npx prisma generate` succeeds in [`server`](./server).
- The backend starts successfully and responds on `GET /health`.

## 5. Deployment / Submission Notes
- **Frontend Deployment Link**: Not completed in this environment.
- **Backend Deployment Link**: Not completed in this environment.
- **Pull Request Notes**: The project is ready for commit and push once GitHub access is available for the target repository.
- **Video Link**: Not created in this environment.
