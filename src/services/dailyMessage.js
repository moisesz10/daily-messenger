// src/services/dailyMessage.js
export function buildMessage(user) {
    const subject = 'Sua mensagem diária';
    const html = `<p>Olá ${user.name},</p><p>Esta é sua mensagem diária — tenha um excelente dia!</p>`;
    const text = `Olá ${user.name},\n\nEsta é sua mensagem diária — tenha um excelente dia!`;
    return { subject, html, text };
}
