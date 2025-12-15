import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || '';
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || '오늘의 편지';

if (!SENDGRID_API_KEY) {
  console.warn('⚠️ SENDGRID_API_KEY is not set');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid API initialized');
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }

    if (!SENDGRID_FROM_EMAIL) {
      throw new Error('SENDGRID_FROM_EMAIL is not configured');
    }

    const msg = {
      to: options.to,
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: SENDGRID_FROM_NAME
      },
      subject: options.subject,
      html: options.html
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${options.to}`);
  } catch (error: any) {
    console.error('❌ SendGrid error:', error.response?.body || error.message);
    throw error;
  }
}