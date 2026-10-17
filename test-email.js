const nodemailer = require('nodemailer');

// Hardcoded for diagnostic run (taken from .env)
const mailUser = 'info@store2u.ca';
const mailPass = 'DildilPakistan786@786@tahir';
const mailHost = 'smtp.hostinger.com';
const mailPort = 587;

async function testEmail() {
    console.log(`Testing SMTP with: ${mailHost}:${mailPort} (User: ${mailUser})`);

    const transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: false, // true for 465, false for other ports
        auth: {
            user: mailUser,
            pass: mailPass,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Verifying transporter...');
        await transporter.verify();
        console.log('Transporter is verified!');

        const mailOptions = {
            from: `"Store2U Test" <${mailUser}>`,
            to: mailUser,
            subject: 'SMTP Test - Store2U',
            text: 'If you see this, SMTP is working!',
        };

        console.log('Sending test email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('SMTP Error Output:', error);
    }
}

testEmail();
