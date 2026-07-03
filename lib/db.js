// SQLite layer — zero external dependencies (node:sqlite, Node ≥23).
'use strict';

const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const DB_PATH = process.env.CHIAVI_DB || path.join(__dirname, '..', 'data', 'chiavi.db');

let db;

function open() {
  if (db) return db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true }); // data/ is gitignored — fresh clones need it created
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS owners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id INTEGER NOT NULL REFERENCES owners(id),
      title TEXT NOT NULL,
      make_model TEXT NOT NULL,
      year INTEGER NOT NULL,
      city TEXT NOT NULL,
      fuel TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'share' CHECK (mode IN ('share','licensed')),
      daily_price_eur REAL DEFAULT 0,
      seats INTEGER DEFAULT 5,
      description TEXT DEFAULT '',
      description_it TEXT DEFAULT '',
      rca_ok INTEGER NOT NULL DEFAULT 0,
      scia_number TEXT DEFAULT '',
      uso_terzi INTEGER NOT NULL DEFAULT 0,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      min_days INTEGER NOT NULL DEFAULT 1,
      vibe TEXT DEFAULT 'city',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id INTEGER NOT NULL REFERENCES cars(id),
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      km_total INTEGER DEFAULT 0,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      owner_amount_eur REAL NOT NULL,
      fees_eur REAL NOT NULL,
      status TEXT DEFAULT 'confirmed',
      created_at TEXT DEFAULT (datetime('now')),
      CHECK (check_in < check_out)
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      car_id INTEGER NOT NULL REFERENCES cars(id),
      author TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      body TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  return db;
}

function listCars({ city, date, mode } = {}) {
  const d = open();
  let sql = `SELECT c.*, o.name AS owner_name, o.verified AS owner_verified,
      (SELECT COUNT(*) FROM reviews r WHERE r.car_id = c.id) AS review_count,
      (SELECT AVG(rating) FROM reviews r WHERE r.car_id = c.id) AS rating
    FROM cars c JOIN owners o ON o.id = c.owner_id WHERE 1=1`;
  const params = [];
  if (city) { sql += ` AND c.city LIKE ?`; params.push(`%${city}%`); }
  if (date) { sql += ` AND c.start_date <= ? AND c.end_date > ?`; params.push(date, date); }
  if (mode === 'share' || mode === 'licensed') { sql += ` AND c.mode = ?`; params.push(mode); }
  sql += ` ORDER BY c.city, c.id`;
  return d.prepare(sql).all(...params);
}

function getCar(id) {
  const d = open();
  const car = d.prepare(`SELECT c.*, o.name AS owner_name, o.verified AS owner_verified
    FROM cars c JOIN owners o ON o.id = c.owner_id WHERE c.id = ?`).get(id);
  if (!car) return null;
  car.reviews = d.prepare(`SELECT * FROM reviews WHERE car_id = ? ORDER BY id DESC`).all(id);
  car.bookings = d.prepare(`SELECT * FROM bookings WHERE car_id = ? AND status = 'confirmed' ORDER BY check_in`).all(id);
  return car;
}

/** Insert a booking iff the range is free — transactional overlap check. */
function createBooking({ carId, checkIn, checkOut, kmTotal, guestName, guestEmail, ownerAmountEur, feesEur }) {
  const d = open();
  d.exec('BEGIN IMMEDIATE');
  try {
    const clash = d.prepare(`SELECT 1 FROM bookings WHERE car_id = ? AND status = 'confirmed'
      AND check_in < ? AND ? < check_out LIMIT 1`).get(carId, checkOut, checkIn);
    if (clash) { d.exec('ROLLBACK'); const e = new Error('RANGE_TAKEN'); e.code = 'RANGE_TAKEN'; throw e; }
    const r = d.prepare(`INSERT INTO bookings (car_id, check_in, check_out, km_total, guest_name, guest_email, owner_amount_eur, fees_eur)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(carId, checkIn, checkOut, kmTotal || 0, guestName, guestEmail, ownerAmountEur, feesEur);
    d.exec('COMMIT');
    return r;
  } catch (e) {
    if (e.code !== 'RANGE_TAKEN') { try { d.exec('ROLLBACK'); } catch {} }
    throw e;
  }
}

function createCar({ ownerName, ownerEmail, title, makeModel, year, city, fuel, mode, dailyPriceEur, seats, description, descriptionIt, rcaOk, sciaNumber, usoTerzi, startDate, endDate, minDays, vibe }) {
  const d = open();
  let owner = d.prepare(`SELECT * FROM owners WHERE email = ?`).get(ownerEmail);
  if (!owner) {
    const r = d.prepare(`INSERT INTO owners (name, email) VALUES (?, ?)`).run(ownerName, ownerEmail);
    owner = { id: r.lastInsertRowid };
  }
  const m = mode === 'licensed' ? 'licensed' : 'share';
  const r = d.prepare(`INSERT INTO cars (owner_id, title, make_model, year, city, fuel, mode, daily_price_eur, seats, description, description_it, rca_ok, scia_number, uso_terzi, start_date, end_date, min_days, vibe)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(owner.id, title, makeModel, year, city, fuel, m, dailyPriceEur || 0, seats || 5, description || '', descriptionIt || '', rcaOk ? 1 : 0, sciaNumber || '', usoTerzi ? 1 : 0, startDate, endDate, Math.max(1, minDays || 1), vibe || 'city');
  return { carId: Number(r.lastInsertRowid), mode: m };
}

function metrics() {
  const d = open();
  const m = d.prepare(`SELECT COUNT(*) AS bookings,
    COALESCE(SUM(owner_amount_eur + fees_eur),0) AS gmv,
    COALESCE(SUM(fees_eur),0) AS revenue,
    COALESCE(SUM(julianday(check_out) - julianday(check_in)),0) AS days
    FROM bookings WHERE status='confirmed'`).get();
  m.cars = d.prepare(`SELECT COUNT(*) AS n FROM cars`).get().n;
  m.owners = d.prepare(`SELECT COUNT(*) AS n FROM owners`).get().n;
  m.takeRate = m.gmv ? (m.revenue / m.gmv) * 100 : 0;
  m.byMode = d.prepare(`SELECT c.mode, COUNT(b.id) AS bookings, COALESCE(SUM(b.owner_amount_eur + b.fees_eur),0) AS gmv,
      COALESCE(SUM(b.fees_eur),0) AS revenue
    FROM bookings b JOIN cars c ON c.id = b.car_id WHERE b.status='confirmed' GROUP BY c.mode`).all();
  m.byCity = d.prepare(`SELECT c.city, COUNT(b.id) AS bookings, COALESCE(SUM(b.owner_amount_eur + b.fees_eur),0) AS gmv
    FROM bookings b JOIN cars c ON c.id = b.car_id WHERE b.status='confirmed' GROUP BY c.city ORDER BY gmv DESC`).all();
  return m;
}

module.exports = { open, listCars, getCar, createBooking, createCar, metrics, DB_PATH };
