# react-crud

A small Create React App project demonstrating a simple CRUD-style task list.

## Features

- Add, list and remove tasks
- Small component structure for learning and quick prototyping

## Quick Start

Prerequisites: Node.js (>= 14) and npm installed.

Open a terminal in the project root and run:

```powershell
npm install
npm start
```

This launches the development server at `http://localhost:3000`.

Run tests:

```powershell
npm test
```

Build for production:

```powershell
npm run build
```

## Project Structure

Top-level files and folders:

- `public/` — static files and `index.html`
- `src/` — application source code
	- `App.js` — root React component
	- `index.js` — app entry
	- `components/` — React components (e.g. `tasklist.js`)
	- `utils/` — small utilities and constants (`constants.js`)

Example current workspace (trimmed):

```
package.json
public/
src/
	App.js
	index.js
	components/
		tasklist.js
	utils/
		constants.js
```

## Components

- `src/components/tasklist.js`: displays the list of tasks and contains UI to add/remove tasks. Edit here to change task behavior or layout.
- `src/App.js`: wires components together and manages top-level state (if used).

## Notes for Contributors

- The app was created with Create React App — most scripts are available via `npm run <script>`.
- Keep components small and focused; move reusable logic into `utils/`.

## Where to change data

- If you want to change default values, check `src/utils/constants.js`.

## License

This repository does not contain a license file. Add one if you plan to share the code publicly.

---

If you'd like, I can also:

- Add a `CONTRIBUTING.md` with contributor guidelines
- Create a short usage demo GIF and add it to `README.md`

Tell me which additions you want next.
