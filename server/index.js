import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── GET all saved locations ──────────────────────────────────
app.get("/api/locations", (_req, res) => {
  const rows = db.prepare("SELECT * FROM locations ORDER BY created_at DESC").all();
  res.json(rows);
});

// ── POST save a new location ─────────────────────────────────
app.post("/api/locations", (req, res) => {
  const { latitude, longitude, address, label } = req.body;

  if (latitude == null || longitude == null || !address) {
    return res.status(400).json({ error: "latitude, longitude, and address are required" });
  }

  const stmt = db.prepare(
    "INSERT INTO locations (latitude, longitude, address, label) VALUES (?, ?, ?, ?)"
  );
  const info = stmt.run(latitude, longitude, address, label || null);

  const created = db.prepare("SELECT * FROM locations WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(created);
});

// ── DELETE a location ────────────────────────────────────────
app.delete("/api/locations/:id", (req, res) => {
  const { id } = req.params;
  const info = db.prepare("DELETE FROM locations WHERE id = ?").run(id);

  if (info.changes === 0) {
    return res.status(404).json({ error: "Location not found" });
  }
  res.status(204).end();
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[pinboard] server listening on http://localhost:${PORT}`);
});
