import sgMail from '@sendgrid/mail';
import { config } from 'dotenv';

config();

// SendGrid 초기화
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || '';
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || '오늘의 편지';

if (!SENDGRID_API_KEY) {
  console.warn('⚠️  SENDGRID_API_KEY not set');
}

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  try {
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key is not configured');
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

  } catch (error: any) {
    console.error('❌ SendGrid error:', error);
    if (error.response) {
      console.error('SendGrid response:', error.response.body);
    }
    throw error;
  }
}
