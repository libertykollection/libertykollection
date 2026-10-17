import nodemailer from 'nodemailer';

/**
 * Creates a standard nodemailer transporter for Titan (Hostinger) global use.
 * Falls back to EMAIL_USERNAME/PASSWORD if MAIL_USER/PASSWORD is missing.
 */
export const getTransporter = () => {
    const mailUser = process.env.MAIL_USER || process.env.EMAIL_USERNAME;
    const mailPass = process.env.MAIL_PASSWORD || process.env.EMAIL_PASSWORD;
    const mailHost = process.env.MAIL_HOST || 'smtp.titan.email';
    const mailPort = parseInt(process.env.MAIL_PORT || '465', 10);

    if (!mailUser || !mailPass) {
        console.error('[SMTP] Missing credentials! MAIL_USER/EMAIL_USERNAME or MAIL_PASSWORD/EMAIL_PASSWORD not set.');
        return null;
    }

    const transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailPort === 465, // true for 465, false for 587
        auth: {
            user: mailUser,
            pass: mailPass,
        },
        tls: {
            // Essential for some hosting environments to skip strict cert checks
            rejectUnauthorized: false
        }
    });

    // Test the connection immediately
    transporter.verify((error, success) => {
        if (error) {
            console.error('[SMTP] Verification failed:', error);
        } else {
            console.log('[SMTP] Server is ready to take our messages');
        }
    });

    return transporter;
};

export const getMailUser = () => process.env.MAIL_USER || process.env.EMAIL_USERNAME;
