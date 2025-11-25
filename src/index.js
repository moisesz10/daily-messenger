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
app.post('/subscribe', validateSubscribe, async (req, res) => {
    const { name, email } = req.body;
    try {
        const exists = await db.getUserByEmail(email);
        if (exists) return res.status(409).json({ error: 'email already subscribed' });

        const id = await db.addUser(name, email);
        logger.info(`New subscriber: ${email}`);
        res.json({ id, name, email });
    } catch (err) {
        logger.error('Subscribe error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/unsubscribe', validateUnsubscribe, async (req, res) => {
    const { email } = req.body;
    try {
        await db.deactivateUser(email);
        logger.info(`Unsubscribed: ${email}`);
        res.json({ ok: true });
    } catch (err) {
        logger.error('Unsubscribe error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await db.getUsersActive();
        res.json(users);
    } catch (err) {
        logger.error('Get users error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});
