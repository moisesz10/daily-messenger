// mailer.js
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
export function sendDailyEmail(toEmail, toName, subject, htmlBody, textBody) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: subject,
        text: textBody,
        html: htmlBody
    };
    return transporter.sendMail(mailOptions);
}
