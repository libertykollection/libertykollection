import { NextResponse } from 'next/server';
import { getTransporter, getMailUser } from '../../util/smtp';

export async function GET() {
    try {
        const transporter = getTransporter();
        if (!transporter) {
            return NextResponse.json({
                success: false,
                message: "Transporter could not be created. Check environment variables."
            }, { status: 500 });
        }

        const mailUser = getMailUser();

        console.log('[SMTP-TEST] Attempting to send test email...');

        const info = await transporter.sendMail({
            from: mailUser,
            to: mailUser, // Send to self for testing
            subject: "SMTP Test Email",
            text: "This is a test email to verify SMTP configuration.",
            html: "<b>This is a test email to verify SMTP configuration.</b>"
        });

        console.log('[SMTP-TEST] Success:', info.messageId);

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            response: info.response
        });
    } catch (error) {
        console.error('[SMTP-TEST] Failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            code: error.code,
            command: error.command,
            stack: error.stack
        }, { status: 500 });
    }
}
