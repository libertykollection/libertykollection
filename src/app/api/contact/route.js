import { getTransporter, getMailUser } from '../../util/smtp';

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    // Create a transporter
    const transporter = getTransporter();
    if (!transporter) {
      return new Response(JSON.stringify({ message: 'SMTP Configuration Error' }), { status: 500 });
    }
    const mailUser = getMailUser();

    // Send the email
    await transporter.sendMail({
      from: mailUser, // sender address
      to: 'mrafybasra2020@gmail.com', // recipient email
      subject: `New message from ${name}`, // Subject line
      html: `
        <p>You have a new message from your contact form:</p>
        <h3>Contact Details</h3>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
        </ul>
        <h3>Message:</h3>
        <p>${message}</p>
      `,
    });

    return new Response(JSON.stringify({ message: 'Email sent successfully!' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ message: 'Error sending email', error }), {
      status: 500,
    });
  }
}
