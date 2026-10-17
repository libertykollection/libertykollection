import nodemailer from 'nodemailer';
import { getTransporter } from './smtp';

const transport = getTransporter();

type SendEmailDto = {
  sender: string; // Change from Mail.Address to string
  recipients: string | string[]; // Nodemailer accepts string or array of strings for multiple recipients
  subject: string; // Use lowercase `string` for TypeScript primitive types
  message: string; // Use lowercase `string` for TypeScript primitive types
};

export const sendEmail = async (dto: SendEmailDto) => {
  const { sender, recipients, subject, message } = dto;

  return await transport.sendMail({
    from: sender, // Sender's email address
    to: recipients, // Recipients' email address or array of addresses
    subject, // Email subject
    html: message, // HTML message body
    text: message, // Plain text message body (optional, fallback for non-HTML clients)
  });
};
