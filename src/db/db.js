import sqlite3 from 'sqlite3';
import { logger } from '../utils/logger.js';

const verboseSqlite = sqlite3.verbose();
const db = new verboseSqlite.Database('./data.db');

export function init() {
    db.serialize(() => {
        // Users table update
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password_hash TEXT,
            bio TEXT,
            avatar_url TEXT,
            active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Messages table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Follows table
        db.run(`CREATE TABLE IF NOT EXISTS follows (
            follower_id INTEGER,
            following_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(follower_id, following_id),
            FOREIGN KEY(follower_id) REFERENCES users(id),
            FOREIGN KEY(following_id) REFERENCES users(id)
        )`);

        // Likes table
        db.run(`CREATE TABLE IF NOT EXISTS likes (
            user_id INTEGER,
            message_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY(user_id, message_id),
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(message_id) REFERENCES messages(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS sent_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            status TEXT,
            info TEXT,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Add columns if they don't exist (migration for existing DB)
        const columnsToAdd = ['password_hash', 'bio', 'avatar_url'];
        columnsToAdd.forEach(col => {
            db.run(`ALTER TABLE users ADD COLUMN ${col} TEXT`, (err) => {
                // Ignore error if column exists
            });
        });

        logger.info('DB initialized with Social Schema');
    });
}

// User Functions
export function addUser(name, email, passwordHash = null) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`, [name, email, passwordHash], function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

export function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT id, name, email, active, bio, avatar_url FROM users WHERE email = ?`, [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

export function getUserByEmailWithPassword(email) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

export function getUserById(id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT id, name, email, active, bio, avatar_url, created_at FROM users WHERE id = ?`, [id], (err, row) => {
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

// Social Functions
export function createMessage(userId, content) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO messages (user_id, content) VALUES (?, ?)`, [userId, content], function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

export function getFeed(userId) {
    return new Promise((resolve, reject) => {
        // Feed: messages from people I follow + my own messages
        const sql = `
            SELECT m.id, m.content, m.created_at, u.name as user_name, u.id as user_id,
            (SELECT COUNT(*) FROM likes WHERE message_id = m.id) as likes_count,
            (SELECT COUNT(*) FROM likes WHERE message_id = m.id AND user_id = ?) as liked_by_me
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.user_id = ? OR m.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
            ORDER BY m.created_at DESC
            LIMIT 50
        `;
        db.all(sql, [userId, userId, userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

export function followUser(followerId, followingId) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)`, [followerId, followingId], function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

export function likeMessage(userId, messageId) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR IGNORE INTO likes (user_id, message_id) VALUES (?, ?)`, [userId, messageId], function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

// Logs
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
