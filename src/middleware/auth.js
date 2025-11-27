import dotenv from 'dotenv';
dotenv.config();

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';

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
