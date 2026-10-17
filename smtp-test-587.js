const nodemailer = require('nodemailer');

const mailHost = 'smtp.titan.email';
const mailPort = 587; // Trying 587 instead of 465
const mailUser = 'info@store2u.ca';
const mailPass = 'DildilPakistan786@786@tahir';

console.log('Testing SMTP with Port 587:');
console.log('Host:', mailHost);
console.log('Port:', mailPort);
console.log('User:', mailUser);

async function test() {
    const transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: false, // false for 587
        auth: {
            user: mailUser,
            pass: mailPass,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('Connection verified successfully!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: mailUser,
            to: mailUser,
            subject: "Diagnostic Test (Port 587)",
            text: "Diagnostic test success on port 587."
        });
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('SMTP Error:', error);
    }
}

test();
