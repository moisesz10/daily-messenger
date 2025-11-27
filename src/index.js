import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import * as db from './db/db.js';
import * as scheduler from './scheduler/scheduler.js';
import { logger } from './utils/logger.js';
import { validateSubscribe, validateUnsubscribe } from './middleware/validation.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Initialize DB and Scheduler
db.init();
scheduler.startScheduler();

// Endpoints
import { authenticateAdmin } from './middleware/auth.js';
import * as mailer from './mail/mailer.js'; // Ensure mailer is imported

// Endpoints
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ...

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Auth Routes
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    try {
        const exists = await db.getUserByEmail(email);
        if (exists) return res.status(409).json({ error: 'Email already registered' });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const id = await db.addUser(name, email, hash);

        // Auto-login (optional) or just return success
        const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' });

        // Send welcome email
        mailer.sendWelcomeEmail(email, name).catch(err => logger.error('Error sending welcome email:', err));

        res.json({ token, user: { id, name, email } });
    } catch (err) {
        logger.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login-user', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.getUserByEmailWithPassword(email);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        if (!user.password_hash) {
            // Legacy user without password
            return res.status(401).json({ error: 'Please reset your password' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        logger.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin Login (Legacy/Simple)
app.post('/login', (req, res) => {
    const { password } = req.body;
    const adminSecret = process.env.ADMIN_SECRET || 'admin123';

    if (password === adminSecret) {
        res.json({ token: adminSecret });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

app.post('/subscribe', validateSubscribe, async (req, res) => {
    const { name, email } = req.body;
    try {
        const exists = await db.getUserByEmail(email);
        if (exists) return res.status(409).json({ error: 'email already subscribed' });

        const id = await db.addUser(name, email);
        logger.info(`New subscriber: ${email}`);

        // Send welcome email asynchronously
        mailer.sendWelcomeEmail(email, name).catch(err => logger.error('Error sending welcome email:', err));

        res.json({ id, name, email });
    } catch (err) {
        logger.error('Subscribe error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/unsubscribe', authenticateAdmin, validateUnsubscribe, async (req, res) => {
    const { email } = req.body;
    try {
        await db.deactivateUser(email);
        logger.info(`Unsubscribed by admin: ${email}`);
        res.json({ ok: true });
    } catch (err) {
        logger.error('Unsubscribe error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/logs', authenticateAdmin, async (req, res) => {
    try {
        const logs = await db.getMessageLogs();
        res.json(logs);
    } catch (err) {
        logger.error('Get logs error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/users', authenticateAdmin, async (req, res) => {
    try {
        const users = await db.getUsersActive();
        res.json(users);
    } catch (err) {
        logger.error('Get users error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

import { authenticateUser } from './middleware/auth.js';

// ...

// Social Endpoints
app.post('/messages', authenticateUser, async (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    try {
        const id = await db.createMessage(req.user.id, content);
        res.json({ id, content, created_at: new Date() });
    } catch (err) {
        logger.error('Create message error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/feed', authenticateUser, async (req, res) => {
    try {
        const feed = await db.getFeed(req.user.id);
        res.json(feed);
    } catch (err) {
        logger.error('Get feed error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/users/:id/follow', authenticateUser, async (req, res) => {
    try {
        await db.followUser(req.user.id, req.params.id);
        res.json({ ok: true });
    } catch (err) {
        logger.error('Follow error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/messages/:id/like', authenticateUser, async (req, res) => {
    try {
        await db.likeMessage(req.user.id, req.params.id);
        res.json({ ok: true });
    } catch (err) {
        logger.error('Like error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
