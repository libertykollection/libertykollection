const nodemailer = require('nodemailer');

const mailHost = 'smtp.titan.email';
const mailPort = 465;
const mailUser = 'store2u@rapidtechpro.com';
const mailPass = 'DildilPakistan786@786@tahir';
const recipient = 'mahnoor.zahid.1296@gmail.com';

async function sendTestEmail() {
    console.log(`Testing SMTP with: ${mailHost}:${mailPort} (User: ${mailUser})`);

    const transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: true, // true for 465, false for 587
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
        console.log('Transporter is verified! Connection successful.');

        const mailOptions = {
            from: `"Store2U Test" <${mailUser}>`,
            to: recipient,
            subject: 'Test Email from Store2U',
            text: 'This is a test email to verify SMTP settings. If you received this, the email configuration is working correctly.',
            html: '<p>This is a <b>test email</b> to verify SMTP settings. If you received this, the email configuration is working correctly.</p>',
        };

        console.log(`Sending test email to ${recipient}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('SMTP Error:', error);
    } // End try-catch
}

sendTestEmail();
