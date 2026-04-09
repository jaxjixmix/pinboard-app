# Pinboard - Location Bookmarker

A map application for bookmarking locations. Click anywhere on the map to drop a pin, save it, and build a collection of your favourite places.

## Features

- **Interactive Map** -- Full-screen OpenStreetMap powered by Leaflet
- **Click to Pin** -- Click anywhere on the map to place a pin; the address is automatically resolved via reverse geocoding
- **Search** -- Search for addresses or places with autocomplete and fly-to animation
- **Save Locations** -- Persist pinned locations to a SQLite database
- **Sidebar** -- Collapsible sidebar listing all saved locations, sorted newest first
- **Delete** -- Remove saved locations individually

## Tech Stack

| Layer  | Tech                          |
| ------ | ----------------------------- |
| Client | Vue 3, Vuex, Leaflet, Vite    |
| Server | Node.js, Express, better-sqlite3 |

No external API keys are required. The app uses free OpenStreetMap tiles and the Nominatim geocoding service.

## Prerequisites

- **Node.js** >= 18

## Getting Started

### 1. Install all dependencies

From the project root:

```bash
npm run install:all
```

This installs dependencies for the root, `client/`, and `server/` directories in one command.

### 2. Run in development mode

```bash
npm run dev
```

This starts both the server and client concurrently:

- **Client** -- `http://localhost:5173`
- **Server** -- `http://localhost:3001`

The Vite dev server proxies `/api` requests to the Express backend, so open `http://localhost:5173` in your browser.

### 3. Production build

```bash
npm run build
npm start
```

`build` compiles the Vue client into `client/dist/`. `start` runs the Express server which can serve the built files.

## Project Structure

```
pinboard-app/
├── client/               # Vue 3 + Vite frontend
│   ├── src/
│   │   ├── components/   # MapView, LocationList, SearchBar, SaveToast
│   │   ├── store/        # Vuex store (state, actions, mutations)
│   │   ├── styles/       # Global CSS
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   └── vite.config.js
├── server/               # Express + SQLite backend
│   ├── index.js          # API routes
│   └── db.js             # Database setup
├── docs/
│   └── task.md           # Project requirements
└── package.json          # Root scripts (dev, build, install:all)
```

## API Endpoints

| Method   | Endpoint             | Description              |
| -------- | -------------------- | ------------------------ |
| `GET`    | `/api/locations`     | List all saved locations |
| `POST`   | `/api/locations`     | Save a new location      |
| `DELETE`  | `/api/locations/:id` | Delete a location        |

## Available Scripts

| Script           | Description                                      |
| ---------------- | ------------------------------------------------ |
| `npm run install:all` | Install deps for root, client, and server   |
| `npm run dev`    | Start client and server concurrently             |
| `npm run dev:client` | Start Vite dev server only                  |
| `npm run dev:server` | Start Express server only                   |
| `npm run build`  | Build the client for production                  |
| `npm start`      | Start the production server                      |

## Notes

- The SQLite database (`server/pinboard.db`) is created automatically on first server start. No migrations needed.
- The server port defaults to `3001` and can be changed via the `PORT` environment variable.
