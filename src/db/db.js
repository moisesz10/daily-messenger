// db.js
import sqlite3 from 'sqlite3';
import { logger } from '../utils/logger.js';

const verboseSqlite = sqlite3.verbose();
const db = new verboseSqlite.Database('./data.db');

export function init() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sent_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT,
      info TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `, (err) => {
        if (err) logger.error('DB init error:', err);
        else logger.info('DB initialized');
    });
}

export function addUser(name, email) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
        stmt.run(name, email, function (err) {
            if (err) {
                logger.error('Error adding user:', err);
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
        stmt.finalize();
    });
}

export function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

export function getUsersActive() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM users WHERE active = 1', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

export function deactivateUser(email) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE users SET active = 0 WHERE email = ?', [email], function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

export function logSent(userId, status, info) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO sent_logs (user_id, status, info) VALUES (?, ?, ?)`, [userId, status, info], function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

export function getMessageLogs(limit = 50) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT l.id, l.status, l.info, l.sent_at, u.name, u.email 
            FROM sent_logs l
            JOIN users u ON l.user_id = u.id
            ORDER BY l.sent_at DESC
            LIMIT ?
        `, [limit], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}
