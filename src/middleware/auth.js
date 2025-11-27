import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (token !== ADMIN_SECRET) {
        return res.status(403).json({ error: 'Invalid token' });
    }

    next();
}

export function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, email }
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}
