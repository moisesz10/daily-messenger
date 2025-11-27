import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false, // true se usar 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// envia e-mail simples (retorna Promise)
export async function sendDailyEmail(toEmail, toName, subject, htmlBody, textBody) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: subject,
        text: textBody,
        html: htmlBody
    };
    const info = await transporter.sendMail(mailOptions);
    return info;
}

export async function sendWelcomeEmail(to, name) {
    const subject = 'Bem-vindo ao Daily Messenger!';
    const text = `Olá ${name},\n\nObrigado por se inscrever no Daily Messenger. Você receberá mensagens diárias inspiradoras.\n\nAtenciosamente,\nEquipe Daily Messenger`;
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Olá ${name},</h2>
            <p>Obrigado por se inscrever no <strong>Daily Messenger</strong>.</p>
            <p>Você receberá mensagens diárias inspiradoras diretamente na sua caixa de entrada.</p>
            <br>
            <p>Atenciosamente,<br>Equipe Daily Messenger</p>
        </div>
    `;
    return sendDailyEmail(to, name, subject, html, text);
}
