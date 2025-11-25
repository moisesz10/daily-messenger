// scheduler.js
import cron from 'node-cron';
import * as db from '../db/db.js';
import * as mailer from '../mail/mailer.js';
import { logger } from '../utils/logger.js';
import { buildMessage } from '../services/dailyMessage.js';
import dotenv from 'dotenv';
dotenv.config();

export function startScheduler() {
    const cronExpr = process.env.DAILY_CRON || '0 9 * * *'; // default 09:00
    logger.info(`[scheduler] agendado com cron: ${cronExpr}`);

    cron.schedule(cronExpr, async () => {
        logger.info(`[scheduler] Iniciando envio diário: ${new Date().toISOString()}`);
        try {
            const users = await db.getUsersActive();
            for (const user of users) {
                try {
                    const msg = buildMessage(user);
                    await mailer.sendDailyEmail(user.email, user.name, msg.subject, msg.html, msg.text);
                    await db.logSent(user.id, 'ok', 'sent via smtp');
                    logger.info(`[scheduler] Enviado para ${user.email}`);
                } catch (err) {
                    await db.logSent(user.id, 'error', err.message);
                    logger.error(`[scheduler] Erro ao enviar para ${user.email}:`, err.message);
                }
                // Se necessário, aqui você pode inserir um pequeno delay para respeitar limites do provedor
                await new Promise(r => setTimeout(r, 200)); // 200ms de pausa
            }
        } catch (err) {
            logger.error('[scheduler] Erro ao buscar usuários:', err);
        }
    }, {
        timezone: 'America/Sao_Paulo' // garante horário BR
    });
}
