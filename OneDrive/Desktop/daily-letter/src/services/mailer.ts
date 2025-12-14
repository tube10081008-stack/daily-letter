import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import { generateEmailHTML } from '../templates/email.js';
import type { LetterContent } from './gemini.js';

config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface EmailData {
  recipientEmail: string;
  recipientName: string;
  date: string;
  letterContent: LetterContent;
}

export async function sendDailyLetter(data: EmailData): Promise<boolean> {
  try {
    const htmlContent = generateEmailHTML(data);

    const mailOptions = {
      from: `"Daily Condition Letter" <${process.env.GMAIL_USER}>`,
      to: data.recipientEmail,
      subject: `${data.date} - 오늘의 편지가 도착했습니다 💌`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
}

export async function testMailerConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ Gmail SMTP connection failed:', error);
    return false;
  }
}