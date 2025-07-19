import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Ensure nodemailer is installed: npm install nodemailer @types/nodemailer

export async function POST(req: NextRequest) {
  try {
    const { orderDetails, recipientEmail } = await req.json();

    // Configure your email transporter
    // Replace with your actual SMTP settings, ideally using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587', 10),
      secure: process.env.EMAIL_SERVER_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM, // Sender address
      to: recipientEmail, // Recipient address
      subject: 'Order Confirmation', // Subject line
      text: `Thank you for your order! Your order details: ${JSON.stringify(orderDetails, null, 2)}`, // Plain text body
      // html: '<b>Thank you for your order!</b>', // HTML body (optional)
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Error sending email' }, { status: 500 });
  }
}