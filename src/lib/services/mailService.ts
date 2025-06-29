import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendVerificationEmail(to: string, token: string) {
    const url = `${process.env.APP_URL}/verify-email?token=${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject: "Confirme ton adresse chez Dresss",
        html: `
        <p>Bienvenue chez Dresss ! Pour vérifier ton e-mail, clique <a href="${url}">ici</a>.</p>
        <p>Ce lien expirera dans 24 heures.</p>
    `,
    });
}
