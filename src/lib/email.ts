import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Read config
const configPath = path.join(process.cwd(), 'email_config.json');
let emailUser = process.env.EMAIL_USER || '';
let emailPass = process.env.EMAIL_PASS || '';

if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.profiles) {
      const keys = Object.keys(config.profiles);
      if (keys.length > 0) {
        emailUser = keys[0];
        emailPass = config.profiles[keys[0]];
      }
    }
  } catch (err) {
    console.error('Failed to read email_config.json', err);
  }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export async function sendNotificationEmail(to: string, subject: string, text: string) {
  if (!emailUser || !emailPass) {
    console.warn('Email credentials not configured. Skipping email sent to', to);
    return;
  }
  
  // Non-blocking background process approach
  transporter.sendMail({
    from: emailUser,
    to,
    subject,
    text,
  }).catch((err) => console.error('Failed to send email:', err));
}
