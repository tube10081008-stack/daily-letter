import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || '오늘의 편지';

if (!SENDGRID_API_KEY) {
  console.warn('⚠️  SENDGRID_API_KEY is not set');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid API initialized');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    if (!SENDGRID_API_KEY) {
      console.error('❌ SendGrid API Key is missing');
      return false;
    }

    const msg = {
      to,
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: SENDGRID_FROM_NAME
      },
      subject,
      html
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${to}`);
    return true;

  } catch (error: any) {
    console.error('❌ SendGrid error:', error.response?.body || error.message);
    return false;
  }
}

export async function sendDailyLetter(
  recipientEmail: string,
  recipientName: string,
  letterContent: any
): Promise<boolean> {
  const { generateEmailHTML } = await import('../templates/email.js');
  
  const subject = `${new Date().toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  })} - 오늘의 편지가 도착했습니다 💌`;

  const html = generateEmailHTML(recipientName, letterContent);

  return await sendEmail({ to: recipientEmail, subject, html });
}